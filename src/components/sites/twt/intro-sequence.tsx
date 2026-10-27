"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BRAND, INTRO } from "./content";
import { HeroBackdrop } from "./hero-backdrop";
import { INTRO_SEEN_KEY } from "./intro";

type Phase = "playing" | "leaving" | "done";

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * Phase two, on the clock that phase one (CSS, globals.css) started at first paint. Milliseconds from
 * first paint: the window onto the hero opens inside the arch, holds for a beat while the logo
 * plate dissolves behind it, then grows to fill the screen.
 */
const WINDOW_AT = 2300;
const WINDOW_FADE = 600;
const WINDOW_HOLD = 450;
const WINDOW_GROW = 1050;
/** If the page only gets going after this long, the story is over: skip straight to the hero. */
const TOO_LATE = 3200;

/**
 * The opening animation, a short film in the dark:
 *
 *   1. warm light gathers in a dark room and soft motes drift upward;
 *   2. an arch of ivory light rises and the logo appears in it, a champagne sheen crossing the arch
 *      behind it (the logo itself is never recoloured or moved);
 *   3. the brand line draws in beneath;
 *   4. the arch fills with the hero venue and opens until the venue fills the screen, which is
 *      pixel for pixel the page underneath, so the hand-over cannot be seen.
 *
 * Whether it plays is decided before first paint by the script in intro.ts (once per browser session,
 * never for reduced motion, Data Saver or slow connections). It is built with the Web Animations
 * API, so it needs no animation library, and it never makes a visitor wait: Skip intro, a click, a
 * tap or Escape ends it at once, and a ceiling ends it whatever happens. There is no sound.
 */
export function IntroSequence() {
  const pathname = usePathname();
  // Only a visit that opens on the home page can play the intro. This initial value is never
  // recomputed, so moving around the site and coming back to "/" does not replay it.
  const [phase, setPhase] = useState<Phase>(pathname === "/" ? "playing" : "done");
  const rootRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const ending = useRef(false);

  const finish = useCallback(() => {
    if (ending.current) return;
    ending.current = true;
    // Tells the hero (globals.css) to rise in while the overlay fades.
    document.documentElement.dataset.intro = "done";
    setPhase("leaving");
    window.setTimeout(() => setPhase("done"), 600);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const root = rootRef.current;
    if (!root) return;

    // The guard script chose not to play (seen this session, reduced motion, Data Saver): step aside.
    if (document.documentElement.dataset.intro !== "play") {
      const skip = window.setTimeout(() => setPhase("done"), 0);
      return () => window.clearTimeout(skip);
    }

    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Private mode or blocked storage: the intro simply plays again next time.
    }

    const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
    const plate = find(".intro-plate");
    const frame = find(".intro-window");
    const inner = find(".intro-window-inner");
    const brand = find(".intro-brand");
    const tagline = find(".intro-tagline");
    if (!plate || !frame || !inner || !brand || !tagline) {
      finish();
      return;
    }

    // The CSS in globals.css started its clock at first paint; so does this one.
    const paint = performance.getEntriesByName("first-paint")[0]?.startTime ?? 0;
    const elapsed = Math.max(0, performance.now() - paint);
    if (elapsed > TOO_LATE) {
      finish();
      return;
    }
    // Never open the arch sooner than this after the page gets going, however late that is, so the
    // logo is always on screen long enough to read.
    const MIN_BEAT = 250;
    const at = (ms: number) => Math.max(MIN_BEAT, ms - elapsed);

    const animations: Animation[] = [];
    const play = (
      element: HTMLElement,
      keyframes: Keyframe[],
      delay: number,
      duration: number,
      easing = EASE_OUT,
      fill: FillMode = "both",
    ) => {
      const animation = element.animate(keyframes, { delay, duration, easing, fill });
      animations.push(animation);
      return animation;
    };

    // The brand line leaves as the venue arrives.
    play(brand, [{ opacity: 1 }, { opacity: 0 }], at(WINDOW_AT + 150), 400, "ease-in", "forwards");
    play(tagline, [{ opacity: 1 }, { opacity: 0 }], at(WINDOW_AT + 150), 400, "ease-in", "forwards");

    // The venue appears inside the arch (exactly where the logo plate is), then the arch opens
    // until it fills the screen. Layout measurements, not bounding boxes, so the plate's own rise is ignored.
    const left = plate.offsetLeft;
    const top = plate.offsetTop;
    const radius = plate.offsetWidth / 2;
    const arch = `inset(${top}px ${root.clientWidth - left - plate.offsetWidth}px ${root.clientHeight - top - plate.offsetHeight}px ${left}px round ${radius}px ${radius}px 0px 0px)`;
    const open = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";
    const holdAt = WINDOW_HOLD / (WINDOW_HOLD + WINDOW_GROW);
    const duration = WINDOW_HOLD + WINDOW_GROW;
    play(frame, [{ opacity: 0 }, { opacity: 1 }], at(WINDOW_AT), WINDOW_FADE, "ease-out");
    const opening = play(
      frame,
      [
        { clipPath: arch, offset: 0, easing: "linear" },
        { clipPath: arch, offset: holdAt, easing: EASE_IN_OUT },
        { clipPath: open, offset: 1 },
      ],
      at(WINDOW_AT + WINDOW_FADE - 100),
      duration,
      "linear",
    );
    // The camera pulls back as the arch opens, and ends at exactly the hero's own framing.
    play(
      inner,
      [
        { transform: "scale(1.16)", offset: 0, easing: "linear" },
        { transform: "scale(1.16)", offset: holdAt, easing: EASE_IN_OUT },
        { transform: "scale(1)", offset: 1 },
      ],
      at(WINDOW_AT + WINDOW_FADE - 100),
      duration,
      "linear",
    );
    opening.finished.then(finish, () => {
      // Cancelled by the cleanup below, which is not an ending.
    });

    // Slowly rising motes of warm light.
    const stopParticles = startParticles(particlesRef.current);

    const ceiling = window.setTimeout(finish, INTRO.maxMs);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    // The page underneath must not scroll while the intro covers it.
    const blockScroll = (event: Event) => event.preventDefault();
    window.addEventListener("keydown", onKeyDown);
    root.addEventListener("wheel", blockScroll, { passive: false });

    return () => {
      animations.forEach((animation) => animation.cancel());
      stopParticles();
      window.clearTimeout(ceiling);
      window.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("wheel", blockScroll);
    };
  }, [phase, finish]);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      id="intro-sequence"
      role="region"
      aria-label={INTRO.label}
      data-state={phase}
      onClick={finish}
      style={{ backgroundColor: INTRO.background }}
      className="fixed inset-0 z-[70] touch-none overflow-hidden overscroll-contain transition-opacity duration-500 ease-out data-[state=leaving]:pointer-events-none data-[state=leaving]:opacity-0"
    >
      <canvas ref={particlesRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        aria-hidden="true"
        className="intro-glow absolute inset-0 bg-[radial-gradient(55%_48%_at_50%_44%,rgba(231,211,168,0.2),transparent_72%)]"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 pb-10">
        {/* The arch of light the logo appears in. The logo keeps its own colours on its own ivory. */}
        <div className="intro-plate relative aspect-[5/7] w-[min(66vw,19rem)] overflow-hidden rounded-t-full bg-ivory shadow-[0_0_0_1px_rgba(231,211,168,0.35)] sm:w-[min(36vw,20rem)]">
          <div
            aria-hidden="true"
            className="intro-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(100deg,transparent_0%,rgba(216,195,154,0.75)_50%,transparent_100%)]"
          />
          <div className="absolute inset-0 grid place-items-center">
            <Image
              src={BRAND.logo.src}
              alt={BRAND.logo.alt}
              width={BRAND.logo.width}
              height={BRAND.logo.height}
              sizes="280px"
              className="intro-logo h-auto w-[80%]"
            />
          </div>
        </div>

        <div className="text-center">
          <p className="intro-brand font-serif text-[clamp(15px,2.4vw,20px)] leading-none font-medium tracking-[0.34em] text-champagne-light uppercase">
            The Wed Theory
          </p>
          <p className="intro-tagline mt-3.5 font-ui text-[10.5px] leading-none font-normal tracking-[0.28em] text-champagne-light/75 uppercase">
            {INTRO.tagline}
          </p>
        </div>
      </div>

      {/* The hero venue, seen through the arch. It ends exactly where the real hero begins. */}
      <div aria-hidden="true" className="intro-window absolute inset-0">
        <div className="intro-window-inner absolute inset-0 origin-[50%_62%]">
          <HeroBackdrop />
        </div>
      </div>

      <button
        type="button"
        className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 min-h-11 -translate-x-1/2 px-5 font-ui text-[11px] leading-none font-medium tracking-[0.22em] text-champagne-light uppercase [text-shadow:0_1px_10px_rgba(20,18,14,0.6)] transition-colors outline-none hover:text-white focus-visible:text-white focus-visible:underline focus-visible:underline-offset-8"
      >
        {INTRO.skipLabel}
      </button>
    </div>
  );
}

/**
 * Soft motes of warm light rising through the dark, drawn on a small 2D canvas: cheap enough for
 * any phone and far lighter than loading the 3D library for the intro. Returns a function that
 * stops it.
 */
function startParticles(canvas: HTMLCanvasElement | null): () => void {
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return () => {};

  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  let width = 0;
  let height = 0;
  const resize = () => {
    width = canvas.clientWidth * ratio;
    height = canvas.clientHeight * ratio;
    canvas.width = width;
    canvas.height = height;
  };
  resize();

  // One soft dot, drawn once and stamped many times.
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const spriteContext = sprite.getContext("2d");
  if (spriteContext) {
    const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,232,185,1)");
    gradient.addColorStop(0.35, "rgba(240,205,140,0.45)");
    gradient.addColorStop(1, "rgba(231,211,168,0)");
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, 64, 64);
  }

  const count = Math.min(46, Math.round((canvas.clientWidth * canvas.clientHeight) / 22000));
  const motes = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: (6 + Math.random() * 22) * ratio,
    speed: 0.004 + Math.random() * 0.012,
    sway: 0.01 + Math.random() * 0.03,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.12 + Math.random() * 0.4,
  }));

  let frameId = 0;
  const start = performance.now();
  let last = start;
  const draw = (now: number) => {
    frameId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const fade = Math.min(1, (now - start) / 1400);
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (const mote of motes) {
      mote.y -= mote.speed * dt * 8;
      if (mote.y < -0.05) mote.y = 1.05;
      const x = (mote.x + Math.sin(now / 1800 + mote.phase) * mote.sway) * width;
      const twinkle = 0.65 + 0.35 * Math.sin(now / 700 + mote.phase * 3);
      context.globalAlpha = mote.alpha * twinkle * fade;
      context.drawImage(sprite, x - mote.size, mote.y * height - mote.size, mote.size * 2, mote.size * 2);
    }
  };
  frameId = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
  };
}
