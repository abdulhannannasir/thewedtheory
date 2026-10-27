/**
 * The 3D renderer for the venue scenes. It is loaded with `import()` only on devices that can run
 * it, after the page has painted, so none of it counts against the first load.
 *
 * It draws one frame when asked (`render`) and has no loop of its own: the page controller
 * (journey-controller.tsx) owns timing, so the 3D picture and the text over it always come from the
 * same scroll position. It owns its canvas: it creates one inside `container` and removes it on
 * `dispose`, so mounting twice (React Strict Mode in development) never reuses a lost WebGL context.
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  UnsignedByteType,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { clamp01, type JourneyFrame } from "../journey/timeline";
import type { QualitySettings } from "./quality";
import type { GlScene, GlSource, ParticleKind } from "./scene-types";
import {
  PARTICLE_FRAGMENT,
  PARTICLE_VERTEX,
  QUAD_FRAGMENT,
  QUAD_VERTEX,
} from "./shaders";

export interface VenueRendererOptions {
  scenes: readonly GlScene[];
  quality: QualitySettings;
  /** Called once, after the first two scenes are on the GPU and a frame has been drawn. */
  onReady: () => void;
  /** The browser took the GPU away (tab backgrounded for long, driver reset). */
  onLost: () => void;
  /** Frames stayed slow even at the lowest resolution: the page should switch to the layered fallback. */
  onStruggle: () => void;
}

export interface VenueRenderer {
  /** Draws the scene for `frame`. `time` is in seconds; `pointer` is -1..1 on both axes. */
  render(frame: JourneyFrame, time: number, pointer: readonly [number, number]): void;
  /** Matches the canvas to its container; call when the container's size changes. */
  resize(): void;
  dispose(): void;
}

interface Particle {
  color: readonly [number, number, number];
  size: number;
  drift: readonly [number, number];
  twinkle: number;
  shape: number;
  alpha: number;
}

/** Drifting light: warm bokeh in the wedding, falling petals for social events, cool dust for corporate, twinkling sparks for the finale. */
const PARTICLES: Record<ParticleKind, Particle> = {
  bokeh: { color: [1.0, 0.8, 0.5], size: 1.0, drift: [0.004, 0.018], twinkle: 0.2, shape: 0, alpha: 0.55 },
  petals: { color: [0.98, 0.76, 0.8], size: 0.75, drift: [0.02, -0.03], twinkle: 0, shape: 1, alpha: 0.75 },
  dust: { color: [0.74, 0.86, 1.0], size: 0.55, drift: [0.03, 0.004], twinkle: 0.25, shape: 0, alpha: 0.5 },
  sparkle: { color: [1.0, 0.9, 0.68], size: 0.65, drift: [0.0, 0.012], twinkle: 1.0, shape: 0, alpha: 0.7 },
};

/** How far the camera "travels" (in world units, for the particles) across the whole journey. */
const TRAVEL_PER_SCENE = 14;

type Orientation = "landscape" | "portrait";

interface LoadedSource {
  color: Texture;
  depth: Texture;
  /** width / height of the photograph. */
  aspect: number;
  focus: readonly [number, number];
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Photographs go through the site's image optimiser, so a phone downloads a small AVIF or WebP and
 * not the original JPEG. The width must be one of Next's configured sizes.
 */
const imageUrl = (src: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

interface Picture {
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  /** An ImageBitmap decoded upside down already (a texture's origin is the bottom left). */
  flipped: boolean;
}

/**
 * Fetches and decodes a picture. Where the browser can (`createImageBitmap`), the decoding happens
 * on a worker thread and the page is never held up by it; a phone would otherwise stall for tens of
 * milliseconds per photograph. Older browsers fall back to an ordinary `<img>`.
 */
async function loadPicture(url: string): Promise<Picture> {
  if (typeof createImageBitmap === "function") {
    try {
      // Asking for modern formats by hand: a plain fetch would not, and the optimiser would send a JPEG.
      const response = await fetch(url, { headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" } });
      if (!response.ok) throw new Error(String(response.status));
      const bitmap = await createImageBitmap(await response.blob(), { imageOrientation: "flipY" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, flipped: true };
    } catch {
      // Fall through to the <img> route below.
    }
  }
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, flipped: false };
}

/** A 1x1 texture of one colour ("#rrggbb"), or of one grey level when `grey` is given. */
function solidTexture(hex: string, grey?: number): DataTexture {
  const value = Number.parseInt(hex.replace("#", ""), 16) || 0;
  const bytes =
    grey === undefined
      ? [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255]
      : [grey, grey, grey, 255];
  const texture = new DataTexture(new Uint8Array(bytes), 1, 1, RGBAFormat, UnsignedByteType);
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Builds the renderer, or returns null when the browser cannot give us WebGL. */
export function createVenueRenderer(
  container: HTMLElement,
  options: VenueRendererOptions,
): VenueRenderer | null {
  const { scenes, quality } = options;

  // Ask the browser quietly first: three.js logs a console error when it cannot get a context, and
  // "this device has no WebGL" is an ordinary, handled situation, not an error.
  const probe = document.createElement("canvas");
  const probeContext = probe.getContext("webgl2") ?? probe.getContext("webgl");
  if (!probeContext) return null;
  // Hand the probe's context back at once: browsers allow only a handful at a time.
  probeContext.getExtension("WEBGL_lose_context")?.loseContext();

  const canvas = document.createElement("canvas");
  canvas.className = "journey-canvas";
  canvas.setAttribute("aria-hidden", "true");

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "default",
    });
  } catch {
    return null;
  }
  container.appendChild(canvas);
  renderer.setClearColor(0x14120e, 1);

  const gl = renderer.getContext();
  const maxPoint = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array)[1] || 64;
  const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  let disposed = false;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
  const minPixelRatio = 0.75;

  // --- Scene: one full-screen quad (the venues) and one point cloud (the light) ---------------------

  const placeholders = scenes.map((scene) => ({
    color: solidTexture(scene.tone),
    depth: solidTexture("#000000", 90),
  }));

  const quadMaterial = new ShaderMaterial({
    vertexShader: QUAD_VERTEX,
    fragmentShader: QUAD_FRAGMENT.replace(/DEPTH_PASSES/g, String(quality.depthPasses)),
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uColA: { value: placeholders[0].color },
      uDepA: { value: placeholders[0].depth },
      uColB: { value: placeholders[0].color },
      uDepB: { value: placeholders[0].depth },
      uCoverA: { value: new Vector4(1, 1, 0, 0) },
      uCoverB: { value: new Vector4(1, 1, 0, 0) },
      uMotionA: { value: new Vector4() },
      uMotionB: { value: new Vector4() },
      uTintA: { value: new Vector4(1, 1, 1, 1) },
      uTintB: { value: new Vector4(1, 1, 1, 1) },
      uToneA: { value: new Vector4(1, 1, 0, 0) },
      uToneB: { value: new Vector4(1, 1, 0, 0) },
      uLiftA: { value: new Vector3() },
      uLiftB: { value: new Vector3() },
      uArch: { value: 0 },
      uPointer: { value: new Vector2() },
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uGrain: { value: quality.grain },
      uParallax: { value: quality.pointerParallax ? 1 : 0 },
    },
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), quadMaterial);
  quad.frustumCulled = false;
  quad.renderOrder = 0;

  const seeds = new Float32Array(quality.particles * 4);
  for (let i = 0; i < seeds.length; i += 1) seeds[i] = Math.random();
  const particleGeometry = new BufferGeometry();
  particleGeometry.setAttribute("position", new BufferAttribute(new Float32Array(quality.particles * 3), 3));
  particleGeometry.setAttribute("aSeed", new BufferAttribute(seeds, 4));
  const particleMaterial = new ShaderMaterial({
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uViewHeight: { value: 1 },
      uAspect: { value: 1 },
      uSize: { value: 1 },
      uMaxPoint: { value: maxPoint },
      uTwinkle: { value: 0 },
      uDrift: { value: new Vector2() },
      uCamera: { value: new Vector2() },
      uColor: { value: new Vector3(1, 0.8, 0.5) },
      uAlpha: { value: 0.5 },
      uShape: { value: 0 },
    },
  });
  const points = new Points(particleGeometry, particleMaterial);
  points.frustumCulled = false;
  points.renderOrder = 1;

  const scene = new Scene();
  scene.add(quad, points);
  const camera = new PerspectiveCamera(50, 1, 0.1, 40);

  // --- Pictures: loaded on demand, nearest scenes first --------------------------------------------

  const loaded = new Map<string, LoadedSource>();
  const loading = new Set<string>();
  // The same rule as the hero photograph's CSS (a portrait crop below 768px wide), so the canvas and
  // the picture beneath it always agree. Decided before the first request, so a phone never
  // downloads the landscape picture first.
  const PORTRAIT_BELOW = 768;
  let portraitScreen = container.clientWidth < PORTRAIT_BELOW;

  const sourceFor = (scene: GlScene, orientation: Orientation): GlSource =>
    orientation === "portrait" && scene.portrait ? scene.portrait : scene.landscape;

  const keyFor = (scene: GlScene, source: GlSource) => `${scene.id}:${source.src}`;
  // A picture made for portrait screens is already the right shape, so 1080 is plenty; a landscape
  // photograph cropped to a portrait screen shows only part of it, so it gets the tier's full width.
  const textureWidth = (source: GlSource, scene: GlScene) =>
    source === scene.portrait ? 1080 : quality.textureWidth;

  // Putting a texture on the GPU costs a few milliseconds on the main thread. Doing it for one
  // texture per frame, not all at once, keeps scrolling smooth while the later scenes arrive.
  const uploads: Array<() => void> = [];
  let pumping = false;
  function pump() {
    if (disposed) return;
    uploads.shift()?.();
    if (uploads.length > 0) requestAnimationFrame(pump);
    else pumping = false;
  }
  function enqueueUpload(job: () => void) {
    uploads.push(job);
    if (!pumping) {
      pumping = true;
      requestAnimationFrame(pump);
    }
  }

  function request(scene: GlScene) {
    const source = sourceFor(scene, portraitScreen ? "portrait" : "landscape");
    const key = keyFor(scene, source);
    if (loaded.has(key) || loading.has(key) || disposed) return;
    loading.add(key);
    Promise.all([
      loadPicture(imageUrl(source.src, textureWidth(source, scene))),
      loadPicture(source.depth),
    ])
      .then(([colorPicture, depthPicture]) => {
        if (disposed) {
          for (const picture of [colorPicture, depthPicture]) {
            if (picture.source instanceof ImageBitmap) picture.source.close();
          }
          return;
        }
        const color = new Texture(colorPicture.source);
        color.flipY = !colorPicture.flipped;
        color.colorSpace = NoColorSpace;
        color.generateMipmaps = true;
        color.minFilter = LinearMipmapLinearFilter;
        color.magFilter = LinearFilter;
        color.anisotropy = maxAnisotropy;
        const depth = new Texture(depthPicture.source);
        depth.flipY = !depthPicture.flipped;
        depth.colorSpace = NoColorSpace;
        depth.generateMipmaps = false;
        depth.minFilter = LinearFilter;
        depth.magFilter = LinearFilter;
        color.needsUpdate = true;
        depth.needsUpdate = true;
        // One upload per frame; the scene counts as loaded only when both are on the GPU. A bitmap's
        // memory is handed back as soon as it has been uploaded.
        const release = (picture: Picture) => {
          if (picture.source instanceof ImageBitmap) picture.source.close();
        };
        enqueueUpload(() => {
          renderer.initTexture(color);
          release(colorPicture);
        });
        enqueueUpload(() => {
          renderer.initTexture(depth);
          release(depthPicture);
          loaded.set(key, {
            color,
            depth,
            aspect: colorPicture.width / colorPicture.height,
            focus: source.focus,
          });
          announceWhenReady();
        });
      })
      .catch(() => {
        // A picture that fails to load leaves its scene on its plain colour; nothing else is affected.
      })
      .finally(() => loading.delete(key));
  }

  function current(index: number): { color: Texture; depth: Texture; aspect: number; focus: readonly [number, number] } {
    const scene = scenes[index];
    const preferred = sourceFor(scene, portraitScreen ? "portrait" : "landscape");
    const other = sourceFor(scene, portraitScreen ? "landscape" : "portrait");
    const found = loaded.get(keyFor(scene, preferred)) ?? loaded.get(keyFor(scene, other));
    if (found) return found;
    return { ...placeholders[index], aspect: 1, focus: [0.5, 0.5] };
  }

  let announced = false;
  let shadersReady = false;
  function announceWhenReady() {
    if (announced || disposed || !shadersReady) return;
    const first = scenes.slice(0, 2).every((scene) =>
      loaded.has(keyFor(scene, sourceFor(scene, portraitScreen ? "portrait" : "landscape"))),
    );
    if (!first) return;
    announced = true;
    // The caller fades the canvas in once a frame has really been drawn.
    requestAnimationFrame(() => {
      if (!disposed) options.onReady();
    });
  }

  // Compile the shaders without freezing the page (the browser does it on its own thread where it can).
  const markCompiled = () => {
    shadersReady = true;
    announceWhenReady();
  };
  renderer.compileAsync(scene, camera).then(markCompiled, markCompiled);

  // The first two scenes straight away; the rest one by one, so they never compete with the first paint.
  request(scenes[0]);
  if (scenes[1]) request(scenes[1]);
  scenes.slice(2).forEach((scene, i) => {
    window.setTimeout(() => request(scene), 1200 + i * 900);
  });

  // --- Drawing -----------------------------------------------------------------------------------

  const resolution = new Vector2();
  const pointerSmooth = new Vector2();
  const cameraSmooth = new Vector2();
  let lastTime = 0;
  let slowFrames = 0;

  function resize() {
    if (disposed) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(resolution);
    quadMaterial.uniforms.uRes.value.copy(resolution);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    particleMaterial.uniforms.uPixelRatio.value = pixelRatio;
    particleMaterial.uniforms.uViewHeight.value = resolution.y;
    particleMaterial.uniforms.uAspect.value = width / height;
    const nowPortrait = width < PORTRAIT_BELOW;
    if (nowPortrait !== portraitScreen) {
      portraitScreen = nowPortrait;
      scenes.slice(0, 2).forEach(request);
    }
  }
  resize();

  /** Where in the picture the screen looks: the picture is cropped to cover the screen, like CSS object-fit: cover. */
  function cover(target: Vector4, aspect: number, focus: readonly [number, number]) {
    const screen = resolution.x / resolution.y;
    const visibleX = Math.min(1, screen / aspect);
    const visibleY = Math.min(1, aspect / screen);
    target.set(visibleX, visibleY, (1 - visibleX) * focus[0], (1 - visibleY) * focus[1]);
  }

  function describe(
    index: number,
    push: number,
    slot: "A" | "B",
  ) {
    const scene = scenes[index];
    const picture = current(index);
    const u = quadMaterial.uniforms;
    u[`uCol${slot}`].value = picture.color;
    u[`uDep${slot}`].value = picture.depth;
    cover(u[`uCover${slot}`].value as Vector4, picture.aspect, picture.focus);
    (u[`uMotion${slot}`].value as Vector4).set(scene.zoom, scene.focalPoint[0], scene.focalPoint[1], push);
    const { grade } = scene;
    (u[`uTint${slot}`].value as Vector4).set(grade.tint[0], grade.tint[1], grade.tint[2], grade.exposure);
    (u[`uTone${slot}`].value as Vector4).set(grade.contrast, grade.saturation, grade.vignette, 0);
    (u[`uLift${slot}`].value as Vector3).set(grade.lift[0], grade.lift[1], grade.lift[2]);
  }

  function render(frame: JourneyFrame, time: number, pointer: readonly [number, number]) {
    if (disposed) return;

    // Frame pacing: if the device keeps missing its frames, draw fewer pixels; if even that is not enough, give up.
    const dt = lastTime ? time - lastTime : 0;
    lastTime = time;
    if (dt > 0.045 && dt < 0.5) slowFrames += 1;
    else slowFrames = Math.max(0, slowFrames - 2);
    if (slowFrames > 45) {
      slowFrames = 0;
      if (pixelRatio > minPixelRatio) {
        pixelRatio = Math.max(minPixelRatio, pixelRatio - 0.25);
        resize();
      } else {
        options.onStruggle();
        return;
      }
    }

    // Anything the visitor is about to reach starts loading in good time.
    request(scenes[frame.from]);
    if (frame.to !== frame.from) request(scenes[frame.to]);
    if (scenes[frame.to + 1]) request(scenes[frame.to + 1]);

    pointerSmooth.x += (pointer[0] - pointerSmooth.x) * 0.06;
    pointerSmooth.y += (pointer[1] - pointerSmooth.y) * 0.06;
    cameraSmooth.copy(pointerSmooth).multiplyScalar(0.22 * (quality.pointerParallax ? 1 : 0));

    describe(frame.from, frame.dolly[frame.from], "A");
    describe(frame.to, frame.dolly[frame.to], "B");

    const u = quadMaterial.uniforms;
    u.uArch.value = frame.to === frame.from ? 0 : frame.arch;
    u.uTime.value = time;
    u.uPointer.value.set(pointerSmooth.x, -pointerSmooth.y);

    // Blend the light from one scene's style into the next as the doorway opens.
    const from = PARTICLES[scenes[frame.from].particles];
    const to = PARTICLES[scenes[frame.to].particles];
    const t = clamp01(frame.arch);
    const p = particleMaterial.uniforms;
    p.uTime.value = time;
    p.uTravel.value = frame.position * TRAVEL_PER_SCENE;
    p.uSize.value = mix(from.size, to.size, t);
    p.uTwinkle.value = mix(from.twinkle, to.twinkle, t);
    p.uShape.value = mix(from.shape, to.shape, t);
    p.uAlpha.value = mix(from.alpha, to.alpha, t);
    p.uDrift.value.set(mix(from.drift[0], to.drift[0], t), mix(from.drift[1], to.drift[1], t));
    p.uColor.value.set(
      mix(from.color[0], to.color[0], t),
      mix(from.color[1], to.color[1], t),
      mix(from.color[2], to.color[2], t),
    );
    p.uCamera.value.copy(cameraSmooth);
    // The light fades in with the first scroll, so the hero is exactly the plain photograph when the page opens.
    particleMaterial.visible = frame.position > 0.02;

    renderer.render(scene, camera);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    loaded.forEach(({ color, depth }) => {
      color.dispose();
      depth.dispose();
    });
    loaded.clear();
    placeholders.forEach(({ color, depth }) => {
      color.dispose();
      depth.dispose();
    });
    quad.geometry.dispose();
    quadMaterial.dispose();
    particleGeometry.dispose();
    particleMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    if (!disposed) options.onLost();
  });

  return { render, resize, dispose };
}
