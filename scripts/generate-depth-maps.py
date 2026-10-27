#!/usr/bin/env python3
"""
Generates the depth maps behind the cinematic scenes on the front page.

Each venue photograph is shown in WebGL together with a grey-scale "depth map" of the same picture
(white = close to the camera, black = far away). As the visitor scrolls or moves the pointer, the
shader shifts every pixel by an amount that depends on its depth, so near things (flowers, plates)
slide across far things (the back wall): real parallax from a single photograph.

    python3 scripts/generate-depth-maps.py [--model path/to/model.onnx]

Needs `pip install onnxruntime numpy pillow` and an internet connection the first time, to fetch the
Depth Anything V2 (Small) model, an Apache-2.0 licensed monocular depth estimator, from Hugging Face
(`onnx-community/depth-anything-v2-small`, about 100 MB; it is cached next to this script's temp dir,
never committed). The model is only used to draw these images; nothing from it ships to visitors.

Re-run it whenever a scene photo in SCENES (src/components/sites/twt/journey-content.ts) is replaced.
When real event photography arrives, add its path to PHOTOS below and run the script again.

Writes public/depth/<name>.webp: small (640 px wide) soft grey-scale images, about 10-25 KB each.
Depth maps are meant to be soft; sharp edges would tear the picture when it is shifted.
"""

import argparse
import sys
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUT = PUBLIC / "depth"

# (photo under /public, name of the depth map). Keep names in step with journey-content.ts.
PHOTOS = [
    ("images/custom-table.jpg", "custom-table"),
    ("images/custom-table-mobile.jpg", "custom-table-mobile"),
    ("images/grand-entrance.jpg", "grand-entrance"),
    ("images/lighting-ambience.jpg", "lighting-ambience"),
    ("images/services/social-events/garden-table.jpg", "garden-table"),
    ("images/services/corporate-events/grand-hall.jpg", "grand-hall"),
]

MODEL_URL = (
    "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx"
)
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
OUT_WIDTH = 640
NETWORK_LONG_SIDE = 700  # must be a multiple of 14 (the model's patch size)


def fetch_model() -> Path:
    cache = Path(tempfile.gettempdir()) / "twt-depth-model"
    cache.mkdir(exist_ok=True)
    path = cache / "depth-anything-v2-small.onnx"
    if not path.exists():
        print(f"Downloading the depth model (about 100 MB) to {path} ...")
        urllib.request.urlretrieve(MODEL_URL, path)
    return path


def snap14(value: float) -> int:
    return max(14, int(round(value / 14)) * 14)


def estimate(session: ort.InferenceSession, image: Image.Image) -> np.ndarray:
    """Relative inverse depth in 0..1 for the whole picture (1 = nearest)."""
    w, h = image.size
    scale = NETWORK_LONG_SIDE / max(w, h)
    size = (snap14(w * scale), snap14(h * scale))
    resized = image.convert("RGB").resize(size, Image.BICUBIC)
    pixels = (np.asarray(resized, dtype=np.float32) / 255.0 - MEAN) / STD
    tensor = pixels.transpose(2, 0, 1)[None]
    output = session.run(None, {session.get_inputs()[0].name: tensor})[0]
    depth = np.squeeze(output).astype(np.float32)
    # Ignore the extremes so a few outlier pixels do not flatten everything else.
    low, high = np.percentile(depth, [2, 98])
    depth = np.clip((depth - low) / max(high - low, 1e-6), 0, 1)
    return depth


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, help="a local depth-anything-v2 ONNX file")
    args = parser.parse_args()

    model = args.model or fetch_model()
    session = ort.InferenceSession(str(model), providers=["CPUExecutionProvider"])
    OUT.mkdir(parents=True, exist_ok=True)

    for rel, name in PHOTOS:
        source = PUBLIC / rel
        if not source.exists():
            print(f"skip {rel}: not found", file=sys.stderr)
            continue
        photo = Image.open(source)
        depth = estimate(session, photo)
        grey = Image.fromarray((depth * 255).astype(np.uint8), "L")
        height = round(OUT_WIDTH * photo.height / photo.width)
        # Soft on purpose: a blurred map shifts the picture smoothly instead of tearing its edges.
        grey = grey.resize((OUT_WIDTH, height), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.6))
        target = OUT / f"{name}.webp"
        grey.save(target, "WEBP", quality=82, method=6)
        print(f"{target.relative_to(ROOT)}  {grey.size[0]}x{grey.size[1]}  {target.stat().st_size / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
