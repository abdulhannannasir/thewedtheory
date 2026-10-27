"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { INTRO } from "./content";
import { INTRO_SEEN_KEY } from "./intro";

type Phase = "playing" | "leaving" | "done";

/**
 * The opening animation: the logo reveal video, full screen, then a dissolve into the hero.
 *
 * Whether it plays is decided before first paint by the script in intro.ts, which sets
 * `data-intro="play"` on <html>; globals.css shows the overlay only then. This component runs the
 * video and ends the intro: at `INTRO.fadeAt` seconds, when the video ends, on skip (button, click,
 * tap or Escape), or if the video cannot start. It never makes a visitor wait on a failure.
 */
export function IntroSplash() {
  const pathname = usePathname();
  // Only a visit that opens on the home page can play the intro. This initial value is never
  // recomputed, so moving around the site and coming back to "/" does not replay it.
  const [phase, setPhase] = useState<Phase>(pathname === "/" ? "playing" : "done");
  const videoRef = useRef<HTMLVideoElement>(null);
  const ending = useRef(false);

  const finish = useCallback(() => {
    if (ending.current) return;
    ending.current = true;
    // Tells the hero (globals.css) to start its own reveal while the overlay dissolves.
    document.documentElement.dataset.intro = "done";
    setPhase("leaving");
    window.setTimeout(() => setPhase("done"), INTRO.fadeMs);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    // The guard script chose not to play (seen this session, or reduced motion): just step aside.
    if (document.documentElement.dataset.intro !== "play") {
      const skip = window.setTimeout(() => setPhase("done"), 0);
      return () => window.clearTimeout(skip);
    }

    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Private mode or blocked storage: the intro simply plays again next time.
    }

    const video = videoRef.current;
    // Autoplay can be refused (for example by iOS Low Power Mode): then skip rather than stall.
    void video?.play().catch(finish);

    const giveUp = window.setTimeout(() => {
      if (!video || video.paused || video.currentTime === 0) finish();
    }, INTRO.startTimeoutMs);
    const ceiling = window.setTimeout(finish, INTRO.maxMs);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(giveUp);
      window.clearTimeout(ceiling);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, finish]);

  if (phase === "done") return null;

  return (
    <div
      id="intro-splash"
      role="region"
      aria-label={INTRO.label}
      data-state={phase}
      onClick={finish}
      style={{ backgroundColor: INTRO.background, transitionDuration: `${INTRO.fadeMs}ms` }}
      className="fixed inset-0 z-[70] touch-none items-center justify-center overscroll-contain transition-opacity ease-out data-[state=leaving]:pointer-events-none data-[state=leaving]:opacity-0"
    >
      {/* Not fetched until the page is running and the intro really plays: see globals.css. */}
      <video
        ref={videoRef}
        src={INTRO.video.src}
        poster={INTRO.video.poster}
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= INTRO.fadeAt) finish();
        }}
        onEnded={finish}
        onError={finish}
        className="intro-video size-[min(92vw,80svh,640px)] object-contain select-none"
      />
      <button
        type="button"
        className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 min-h-11 -translate-x-1/2 px-5 text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase transition-colors outline-none hover:text-ink focus-visible:text-ink focus-visible:underline focus-visible:underline-offset-8"
      >
        {INTRO.skipLabel}
      </button>
    </div>
  );
}
