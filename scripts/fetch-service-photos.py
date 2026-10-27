#!/usr/bin/env python3
"""
Fetches and crops the photos for the service pages (birthdays, social events, corporate events).

    python3 scripts/fetch-service-photos.py

They are free-to-use stock photos from Unsplash (https://unsplash.com/license: free for commercial
use, no attribution required), standing in until the studio has its own event photography. Each
source is listed by its Unsplash id below; docs/photo-credits.md links every one to its photo page.
The finished files are committed under public/images/services/<service>/, so the site does not need
this script to build. Run it only to regenerate or re-crop them, then re-run
scripts/generate-brand-assets.py (the share cards use these photos).

To swap one for a real photo of your own, replace the file at the same path (keep its shape, or
update its `height` in src/components/sites/twt/services-content.ts).

Needs Pillow and an internet connection.
"""

import json
import sys
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images" / "services"

# Unsplash id -> the path of its file on images.unsplash.com.
SOURCES = {
    "-3pvRUfQc-c": "photo-1653821355736-0c2598d0a63e",
    "2T78SouopWY": "photo-1630845253085-71dbb7d9762e",
    "3ArfXaXxLCM": "photo-1755493872657-258e83e22279",
    "3nj-jsGwjVg": "photo-1758810743028-6b8e150ec98f",
    "45_VAB9qcAc": "photo-1774660811105-6021afca9aaf",
    "CL_HxkHaGtc": "photo-1791600158462-ab9a93c248d4",
    "D31ZvQgI9z8": "photo-1741969494307-55394e3e4071",
    "K4MfWxczeHY": "photo-1780586383023-102780a48b32",
    "KMNZgMsedE0": "photo-1643175816971-a463dee6ae61",
    "KjwadmwCMXs": "photo-1769812343285-ec0775437680",
    "OWEPHt9a-90": "photo-1653821355692-03666613499f",
    "Pf9Z5pL2ceY": "photo-1767070806009-152054f6edd5",
    "Q3PzwHKpEdc": "photo-1525772764200-be829a350797",
    "TVpMTnvJxlI": "photo-1768508950790-3bbdfe3973c1",
    "TfljWjE3iLo": "photo-1768508947825-0a63f7c46a2b",
    "UCHR7VqS8lk": "photo-1768508950243-16fd93e88d7f",
    "ULHxWq8reao": "photo-1527529482837-4698179dc6ce",
    "V-yhwaT6JrY": "photo-1758870041148-31d28fdf34d9",
    "Vev3io5WxUY": "photo-1755704282977-340323fa52df",
    "WIO1q3FJMpE": "photo-1767050302752-e46f3da297ed",
    "YFZRJ9rSYV8": "photo-1759124650162-00cb97c7db31",
    "YV8iEKnhzns": "photo-1774290687229-a725965554c6",
    "YW0PeaTGtlk": "photo-1774660811169-1174148a4880",
    "ZDN-G1xBWHY": "photo-1515169067868-5387ec356754",
    "ZODcBkEohk8": "photo-1492684223066-81342ee5ff30",
    "aWYUSWm_KEo": "photo-1647125613940-08928c9d6916",
    "ckI3n0LpgPI": "photo-1730406928890-99395b04c0db",
    "cuKJre3nyYc": "photo-1531058020387-3be344556be6",
    "gMsnXqILjp4": "photo-1542744173-8e7e53415bb0",
    "jPPmXm8iapY": "photo-1653821355226-6def361cc7ab",
    "mGNSYZrl1F0": "photo-1767050292710-8e5da59ec5d8",
    "mtR-7914Ufo": "photo-1777332546803-f2c43fa00906",
    "qaSVstp5e10": "photo-1782038523078-809d9185d7ee",
    "qulJcsLyIHM": "photo-1768776183122-95c7d3adbf3e",
    "teEo9K6sIwU": "photo-1672743822419-f51dda1d4223",
    "wrcGYRgGzmw": "photo-1560128411-79892dd93bf8",
    "y1UbwZS44v0": "photo-1768508950719-4d76978fdf44",
    "zZ4hsQfse7o": "photo-1757589227072-0dd17af42433",
}

# service -> role -> (unsplash id, file name, shape or None for the nearest, focus or None).
# Shape is width : height; focus is where a crop is anchored, 0 to 1 across and down.
PLAN = {
    "birthdays": {
        "hero": [
            ("2T78SouopWY", "hero", None, (0.5, 0.4)),
        ],
        "feature": [
            ("D31ZvQgI9z8", "balloon-arch", None, (0.5, 0.5)),
            ("mtR-7914Ufo", "dessert-table", None, (0.5, 0.4)),
            ("V-yhwaT6JrY", "milestone", None, (0.5, 0.55)),
        ],
        "gallery": [
            ("wrcGYRgGzmw", "arch-drapes", None, None),
            ("YV8iEKnhzns", "balloon-twenty", None, None),
            ("K4MfWxczeHY", "bubble-centrepiece", (1, 1), (0.5, 0.5)),
            ("aWYUSWm_KEo", "garden-cake", None, None),
            ("KMNZgMsedE0", "gold-banner", None, None),
            ("Vev3io5WxUY", "party-hall", None, None),
            ("ckI3n0LpgPI", "candles", None, None),
            ("teEo9K6sIwU", "pink-table", (1, 1), (0.5, 0.5)),
            ("YFZRJ9rSYV8", "party-hat", None, None),
        ],
    },
    "social-events": {
        "hero": [
            ("3ArfXaXxLCM", "hero", None, (0.5, 0.45)),
        ],
        "feature": [
            ("qaSVstp5e10", "garden-table", None, (0.5, 0.55)),
            ("45_VAB9qcAc", "dessert-table", None, (0.5, 0.5)),
            ("CL_HxkHaGtc", "anniversary", None, (0.5, 0.5)),
        ],
        "gallery": [
            ("YW0PeaTGtlk", "desserts-florals", None, None),
            ("Pf9Z5pL2ceY", "pastel-table", None, None),
            ("WIO1q3FJMpE", "place-setting", None, None),
            ("qulJcsLyIHM", "baby-letters", None, None),
            ("mGNSYZrl1F0", "pink-plates", None, None),
            ("KjwadmwCMXs", "greenhouse-table", None, None),
            ("3nj-jsGwjVg", "table-runner", None, None),
            ("Q3PzwHKpEdc", "tapers-roses", None, None),
            ("zZ4hsQfse7o", "floral-archway", None, None),
        ],
    },
    "corporate-events": {
        "hero": [
            ("jPPmXm8iapY", "hero", None, (0.42, 0.5)),
        ],
        "feature": [
            ("cuKJre3nyYc", "grand-hall", None, (0.5, 0.5)),
            ("UCHR7VqS8lk", "gala-dinner", None, (0.5, 0.5)),
            ("ZODcBkEohk8", "launch", None, (0.5, 0.5)),
        ],
        "gallery": [
            ("TVpMTnvJxlI", "celebration", (1, 1), (0.5, 0.6)),
            ("gMsnXqILjp4", "workshop", (1, 1), (0.3, 0.5)),
            ("ZDN-G1xBWHY", "networking", (4, 5), (0.4, 0.5)),
            ("y1UbwZS44v0", "formal-dinner", None, None),
            ("ULHxWq8reao", "toast", (4, 5), (0.65, 0.5)),
            ("OWEPHt9a-90", "gala-tent", None, None),
            ("-3pvRUfQc-c", "evening-reception", None, None),
            ("TfljWjE3iLo", "applause", None, None),
        ],
    },
}

# The shapes a gallery photo is cropped to (width : height); each photo takes the nearest to its own.
GALLERY_SHAPES = [(3, 2), (4, 3), (1, 1), (4, 5), (2, 3)]
HERO = (4, 5, 1200)  # width : height, pixels wide
FEATURE = (4, 3, 1400)
GALLERY_WIDTH = 1000


def fetch(unsplash_id: str) -> Image.Image:
    url = f"https://images.unsplash.com/{SOURCES[unsplash_id]}?fm=jpg&q=85&w=2000&auto=format"
    with urllib.request.urlopen(url, timeout=60) as response:
        return Image.open(BytesIO(response.read())).convert("RGB")


def crop(im: Image.Image, ratio: tuple[int, int], width: int, focus=(0.5, 0.5)) -> Image.Image:
    tw, th = ratio
    target = tw / th
    w, h = im.size
    if w / h > target:  # too wide: trim the sides
        new_w = round(h * target)
        left = round((w - new_w) * focus[0])
        box = (left, 0, left + new_w, h)
    else:  # too tall: trim top and bottom
        new_h = round(w / target)
        top = round((h - new_h) * focus[1])
        box = (0, top, w, top + new_h)
    out = im.crop(box)
    return out.resize((width, round(width / target)), Image.LANCZOS)


def save(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, quality=80, optimize=True, progressive=True)
    print(f"  {path.relative_to(ROOT)}  {im.width}x{im.height}  {path.stat().st_size // 1024} KB")


def write_credits():
    """docs/photo-credits.md: where each stand-in photo came from."""
    lines = [
        "# Photo credits",
        "",
        "The photos on the service pages are stand-ins from [Unsplash](https://unsplash.com), used under the",
        "[Unsplash License](https://unsplash.com/license) (free for commercial use, no attribution required).",
        "Each is listed here with its Unsplash page, where the photographer is credited. Replace them with the",
        "studio's own event photography when it is ready (see the README).",
        "",
        "Generated by `scripts/fetch-service-photos.py`.",
    ]
    for service, roles in PLAN.items():
        lines += ["", f"## {service}", "", "| File | Role | Unsplash |", "| --- | --- | --- |"]
        for role, entries in roles.items():
            for unsplash_id, name, _shape, _focus in entries:
                path = f"public/images/services/{service}/{name}.jpg"
                lines.append(f"| `{path}` | {role} | [{unsplash_id}](https://unsplash.com/photos/{unsplash_id}) |")
    out = ROOT / "docs" / "photo-credits.md"
    out.parent.mkdir(exist_ok=True)
    out.write_text("\n".join(lines) + "\n")
    print(f"  {out.relative_to(ROOT)}")


def main():
    sizes = {}
    for service, roles in PLAN.items():
        print(service)
        for role, entries in roles.items():
            for unsplash_id, name, shape, focus in entries:
                im = fetch(unsplash_id)
                focus = focus or (0.5, 0.5)
                if role == "hero":
                    result = crop(im, HERO[:2], HERO[2], focus)
                elif role == "feature":
                    result = crop(im, FEATURE[:2], FEATURE[2], focus)
                else:
                    shape = shape or min(GALLERY_SHAPES, key=lambda s: abs(s[0] / s[1] - im.width / im.height))
                    result = crop(im, shape, GALLERY_WIDTH, focus)
                    # `height` for MasonryItem: 400 is a square.
                    sizes[f"{service}/{name}"] = round(400 * result.height / result.width)
                save(result, OUT / service / f"{name}.jpg")
    write_credits()
    print(json.dumps(sizes, indent=1))


if __name__ == "__main__":
    if not (ROOT / "public").exists():
        sys.exit("run this from the repository")
    main()
