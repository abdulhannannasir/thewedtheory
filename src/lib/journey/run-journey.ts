/**
 * The journey's motion: turns scroll position into everything that moves on the front page. It is
 * plain TypeScript with no React, so animation logic stays apart from the page's content and
 * business logic; journey-controller.tsx only starts and stops it.
 *
 * ONE LOOP, ONE NUMBER. The page scrolls natively (the stage is `position: sticky`, nothing hijacks
 * the wheel or a finger). On each frame this reads how far through the track the visitor is, eases
 * that toward the real value so wheel steps feel like camera moves, and from that single number
 * draws the 3D canvas, fades the text, turns the dots and, when 3D is not running, moves the
 * layered photographs with CSS. Because there is one number, the picture and the words never drift
 * apart.
 *
 * It does as little as it can: no loop while the journey is off screen or the tab is hidden, and the
 * CSS version stops its loop whenever the scroll settles. The 3D code is imported only on devices
 * that can run it, once the page has painted and the intro (if any) has finished.
 */

import type { GlScene } from "../gl/scene-types";
import type { VenueRenderer } from "../gl/venue-renderer";
import { detectTier, settingsFor } from "../gl/quality";
import { activeScene, clamp01, frameAt, progressForScene, smoothstep, type JourneyFrame } from "./timeline";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Runs the journey inside `track` (the `#journey` section). Returns a function that stops it and undoes everything. */
export function startJourney(track: HTMLElement, scenes: readonly GlScene[]): () => void {
  const html = document.documentElement;
  // The cinematic layout is switched on before first paint (intro.ts). Without it the journey is a
  // plain stack of scenes and there is nothing to move.
  if (html.dataset.motion !== "full") return () => {};

  const stage = track.querySelector<HTMLElement>(".journey-stage");
  const glSlot = track.querySelector<HTMLElement>(".journey-gl");
  const dim = track.querySelector<HTMLElement>(".journey-dim");
  const drapes = track.querySelector<HTMLElement>(".journey-drapes");
  const byIndex = (selector: string, attribute: string) =>
    [...track.querySelectorAll<HTMLElement>(selector)].sort(
      (a, b) => Number(a.getAttribute(attribute)) - Number(b.getAttribute(attribute)),
    );
  const media = byIndex("[data-scene-media]", "data-scene-media");
  const panels = byIndex("[data-scene-panel]", "data-scene-panel");
  const copies = panels.map((panel) => panel.querySelector<HTMLElement>(".scene-copy"));
  const dots = [...track.querySelectorAll<HTMLElement>(".journey-controls a")];
  const count = scenes.length;
  if (!stage || !glSlot || media.length !== count || panels.length !== count) return () => {};

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const tier = detectTier();
  const forced = new URLSearchParams(window.location.search).get("render");

  let disposed = false;
  let target = 0;
  let shown = 0;
  let visible = false;
  let rafId = 0;
  let lastNow = 0;
  let renderer: VenueRenderer | null = null;
  let mode: "css" | "gl" = "css";
  let stageWidth = stage.clientWidth;
  let stageHeight = stage.clientHeight;
  const pointer: [number, number] = [0, 0];
  let lastDot = -1;
  type StyleProperty = "opacity" | "transform" | "clipPath" | "visibility" | "zIndex";
  const written = new Map<HTMLElement, Partial<Record<StyleProperty, string>>>();

  /** Writes a style only if it changed, so a still frame costs nothing. */
  const setStyle = (element: HTMLElement | null, property: StyleProperty, value: string) => {
    if (!element) return;
    let cache = written.get(element);
    if (!cache) written.set(element, (cache = {}));
    if (cache[property] === value) return;
    cache[property] = value;
    element.style[property] = value;
  };

  // --- Reading the scroll ----------------------------------------------------------------------

  const readProgress = () => {
    const rect = track.getBoundingClientRect();
    const range = rect.height - stage.offsetHeight;
    return range > 0 ? clamp01(-rect.top / range) : 0;
  };

  /** Where, in page pixels, scene `index` is fully shown. */
  const scrollTopFor = (index: number) => {
    const range = track.offsetHeight - stage.offsetHeight;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    return trackTop + progressForScene(index, count) * range;
  };

  const scrollToScene = (index: number, behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({ top: scrollTopFor(Math.max(0, Math.min(count - 1, index))), behavior });
  };

  // --- Drawing a frame -------------------------------------------------------------------------

  /** An arch-shaped window onto a scene, as a CSS clip-path: the doorway of the layered fallback. */
  const archClip = (open: number) => {
    const minSide = Math.min(stageWidth * 0.62, stageHeight * 0.42);
    const width0 = minSide * 0.55;
    const height0 = 1.55 * width0;
    const side = ((stageWidth - width0) / 2) * (1 - open);
    const bottom = stageHeight * 0.28 * (1 - open);
    const top = (stageHeight - stageHeight * 0.28 - height0) * (1 - open);
    const width = stageWidth - side * 2;
    const radius = (width / 2) * (1 - smoothstep(0.55, 1, open));
    return `inset(${top.toFixed(1)}px ${side.toFixed(1)}px ${bottom.toFixed(1)}px ${side.toFixed(1)}px round ${radius.toFixed(1)}px ${radius.toFixed(1)}px 0 0)`;
  };

  const applyText = (frame: JourneyFrame) => {
    for (let index = 0; index < count; index += 1) {
      const opacity = frame.text[index];
      const panel = panels[index];
      setStyle(panel, "opacity", opacity.toFixed(3));
      const lift = index === frame.to && frame.to !== frame.from ? (1 - opacity) * 26 : -(1 - opacity) * 16;
      setStyle(copies[index], "transform", `translate3d(0, ${lift.toFixed(1)}px, 0)`);
      if (opacity > 0.6) panel.setAttribute("data-active", "");
      else panel.removeAttribute("data-active");
    }
    // The hero's drapes lift away as the first doorway starts to open.
    if (drapes) {
      const away = smoothstep(0.02, 0.42, frame.position);
      setStyle(drapes, "opacity", (1 - away).toFixed(3));
      setStyle(drapes, "transform", `translate3d(0, ${(-away * 7).toFixed(2)}%, 0)`);
    }
    const dot = activeScene(shown, count);
    if (dot !== lastDot) {
      lastDot = dot;
      dots.forEach((element, index) => {
        if (index === dot) element.setAttribute("aria-current", "true");
        else element.removeAttribute("aria-current");
      });
    }
  };

  /** The layered fallback: photographs that push in, with an arch-shaped doorway between them. */
  const applyLayers = (frame: JourneyFrame) => {
    for (let index = 0; index < count; index += 1) {
      const element = media[index];
      const current = index === frame.from;
      const incoming = index === frame.to && frame.to !== frame.from && frame.arch > 0.0005;
      // Photographs start loading when they are one scene away.
      const near = index >= frame.from - 1 && index <= frame.to + 1;
      if (near) element.setAttribute("data-near", "");
      else element.removeAttribute("data-near");

      if (!current && !incoming) {
        setStyle(element, "visibility", "hidden");
        continue;
      }
      setStyle(element, "visibility", "visible");
      let scale = 1 + scenes[index].zoom * 0.45 * frame.dolly[index];
      if (incoming) scale *= lerp(0.86, 1, frame.arch);
      setStyle(element, "transform", `scale(${scale.toFixed(4)})`);
      setStyle(element, "clipPath", incoming ? archClip(frame.arch) : "none");
      setStyle(element, "zIndex", incoming ? "2" : "1");
    }
    setStyle(dim, "opacity", (frame.arch * 0.4).toFixed(3));
  };

  const draw = (now: number) => {
    const frame = frameAt(shown, count);
    applyText(frame);
    if (mode === "gl" && renderer) renderer.render(frame, now / 1000, pointer);
    else applyLayers(frame);
  };

  // --- The loop --------------------------------------------------------------------------------

  const tick = (now: number) => {
    rafId = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(0.1, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;

    target = readProgress();
    const gap = target - shown;
    // A jump (an anchor link, a dragged scrollbar) lands at once rather than flying through every scene.
    if (Math.abs(gap) > 0.35) shown = target;
    else shown += gap * (1 - Math.exp(-(fine ? 8 : 12) * dt));
    const settled = Math.abs(target - shown) < 0.0001;
    if (settled) shown = target;

    draw(now);

    // The 3D scene always has light drifting, so it keeps going while visible. The layered one
    // needs a frame only while something is still moving.
    if (mode === "gl" || !settled) schedule();
  };

  function schedule() {
    if (rafId || disposed || !visible || document.hidden) return;
    lastNow = lastNow || performance.now();
    rafId = requestAnimationFrame(tick);
  }

  // --- Visibility, size, pointer, links ---------------------------------------------------------

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
              lastNow = performance.now();
              schedule();
            }
          },
          { rootMargin: "15% 0px 15% 0px" },
        )
      : null;
  if (observer) observer.observe(track);
  else visible = true;

  const onScroll = () => schedule();
  window.addEventListener("scroll", onScroll, { passive: true });

  const resizeObserver =
    "ResizeObserver" in window
      ? new ResizeObserver(() => {
          stageWidth = stage.clientWidth;
          stageHeight = stage.clientHeight;
          renderer?.resize();
          schedule();
        })
      : null;
  resizeObserver?.observe(stage);

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointer[0] = (event.clientX / window.innerWidth) * 2 - 1;
    pointer[1] = (event.clientY / window.innerHeight) * 2 - 1;
  };
  if (tier === "high") window.addEventListener("pointermove", onPointerMove, { passive: true });

  const onVisibility = () => {
    if (!document.hidden) {
      lastNow = performance.now();
      schedule();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  /** Scene dots, "Explore Our World" and any link to a scene: scroll to where that scene is fully shown. */
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-journey-jump]");
    if (!link) return;
    event.preventDefault();
    scrollToScene(Number(link.dataset.journeyJump));
  };
  track.addEventListener("click", onClick);

  /** Tabbing to a button in a scene that is not on screen brings that scene on screen first. */
  const onFocusIn = (event: FocusEvent) => {
    const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-scene-panel]");
    if (!panel) return;
    const index = Number(panel.dataset.scenePanel);
    if (frameAt(shown, count).text[index] < 0.5) scrollToScene(index, "auto");
  };
  track.addEventListener("focusin", onFocusIn);

  // --- The 3D scene, when the device can run it ------------------------------------------------

  const fallBackToLayers = () => {
    if (mode === "css" && !renderer) return;
    renderer?.dispose();
    renderer = null;
    mode = "css";
    track.dataset.render = "css";
    schedule();
  };

  const timers: number[] = [];
  const later = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timers.push(id);
  };

  const startRenderer = async () => {
    if (disposed || tier === "off") return;
    const { createVenueRenderer } = await import("../gl/venue-renderer");
    if (disposed) return;
    const created = createVenueRenderer(glSlot, {
      scenes,
      quality: settingsFor(tier),
      onReady: () => {
        if (disposed) return;
        mode = "gl";
        track.dataset.render = "gl";
        media.forEach((element) => element.removeAttribute("data-near"));
        schedule();
      },
      onLost: fallBackToLayers,
      // ?render=gl is for looking at the 3D scene on a machine without a GPU, so it never gives up.
      onStruggle: forced === "gl" ? () => {} : fallBackToLayers,
    });
    if (!created) return; // no WebGL: the layered scene it is
    renderer = created;
    schedule();
  };

  /** Waits for the page to finish loading and the intro (if any) to finish, then for an idle moment. */
  const whenQuiet = (callback: () => void) => {
    let started = false;
    const go = () => {
      if (started || disposed) return;
      started = true;
      // A beat after everything else has settled: the plain photograph looks identical to the 3D
      // scene's first frame, so nothing is lost by waiting, and the page's own start-up is never
      // competing with the 3D library for the processor.
      later(() => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(() => callback(), { timeout: 2000 });
        else callback();
      }, 1500);
    };
    const introDone = () => html.dataset.intro !== "play";
    const loaded = () => document.readyState === "complete";
    const check = () => {
      if (introDone() && loaded()) go();
    };
    const watcher = new MutationObserver(check);
    watcher.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
    window.addEventListener("load", check);
    check();
    return () => {
      watcher.disconnect();
      window.removeEventListener("load", check);
    };
  };
  const stopWaiting = whenQuiet(() => void startRenderer());

  // --- Start -----------------------------------------------------------------------------------

  track.dataset.render = "css";
  target = shown = readProgress();
  lastNow = performance.now();
  draw(lastNow);
  // Arriving on a link like /#scene-weddings: go straight to that scene.
  const arrived = /^#scene-(.+)$/.exec(window.location.hash);
  if (arrived) {
    const index = scenes.findIndex((scene) => scene.id === arrived[1]);
    if (index > 0) later(() => scrollToScene(index, "auto"), 0);
  }
  track.setAttribute("data-journey-ready", "");
  schedule();

  return () => {
    disposed = true;
    if (rafId) cancelAnimationFrame(rafId);
    stopWaiting();
    timers.forEach((id) => window.clearTimeout(id));
    observer?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibility);
    track.removeEventListener("click", onClick);
    track.removeEventListener("focusin", onFocusIn);
    renderer?.dispose();
    renderer = null;
    track.removeAttribute("data-journey-ready");
    track.removeAttribute("data-render");
    // Leave nothing behind for the next mount (React Strict Mode mounts twice in development).
    written.forEach((properties, element) => {
      for (const property of Object.keys(properties) as StyleProperty[]) element.style[property] = "";
    });
    written.clear();
    panels.forEach((panel) => panel.removeAttribute("data-active"));
    media.forEach((element) => element.removeAttribute("data-near"));
  };
}
