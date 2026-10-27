import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { HERO } from "./content";
import { HERO_SCRIM_CLASS } from "./hero-backdrop";
import { JOURNEY } from "./journey-content";
import { SiteLink } from "./site-link";

/**
 * The hero's words: the first scene of the journey. The venue itself (a layered 3D scene when the
 * device can run it, the plain photograph otherwise) is behind it, in the journey's media and 3D
 * layers. Everything here is real text and real links, so it reads the same with or without the 3D.
 *
 * Each piece rises in with a plain CSS animation (no JavaScript), after the opening animation if
 * there is one: see `hero-reveal` in globals.css. Copy and links are `HERO` in content.ts.
 */
export function CinematicHero() {
  return (
    <section
      id="scene-hero"
      aria-labelledby="hero-heading"
      data-scene-panel="0"
      data-scene="hero"
      data-align="start"
      style={{ gridRow: 1, "--accent": "#fff3df" } as CSSProperties}
      className="scene-panel text-[#fffaf0] [text-shadow:0_1px_18px_rgba(38,26,14,0.4)]"
    >
      <div aria-hidden="true" className={`${HERO_SCRIM_CLASS} -z-10`} />

      <div className="scene-copy">
        <p className="hero-reveal max-w-[22rem] font-ui text-[11.5px] leading-[1.7] font-medium tracking-[0.24em] text-[#fff3df] uppercase sm:max-w-none sm:text-[12px] sm:tracking-[0.28em] motion-safe:animate-rise">
          {HERO.eyebrow}
        </p>

        <h1
          id="hero-heading"
          className="hero-reveal mt-4 font-serif text-[clamp(3rem,7.4vw,6.6rem)] max-[359px]:text-[2.6rem] leading-[0.98] font-normal motion-safe:animate-rise motion-safe:[animation-delay:120ms]"
        >
          <span className="block">{HERO.headline[0]}</span>
          <span className="block tracking-[0.01em] italic">{HERO.headline[1]}</span>
        </h1>

        <p className="hero-reveal mt-5 font-serif text-[clamp(1.35rem,2.3vw,2rem)] leading-[1.2] text-[#fff3df] italic motion-safe:animate-rise motion-safe:[animation-delay:220ms]">
          {HERO.tagline}
        </p>

        <p className="hero-reveal mt-4 max-w-[31rem] font-ui text-[16px] leading-[1.6] font-light text-[#fff6e8]/90 sm:text-[17px] motion-safe:animate-rise motion-safe:[animation-delay:300ms]">
          {HERO.intro.map((line) => (
            <span key={line} className="sm:block">
              {line}{" "}
            </span>
          ))}
        </p>

        <div className="hero-reveal mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 motion-safe:animate-rise motion-safe:[animation-delay:400ms]">
          <SiteLink
            href={HERO.cta.href}
            data-magnetic=""
            className="group inline-flex h-12 items-center gap-3 bg-cream px-7 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-ink uppercase [text-shadow:none] transition-colors duration-300 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a1d11] active:opacity-85"
          >
            {HERO.cta.label}
            <ArrowRight
              className="size-[14px] transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </SiteLink>

          <SiteLink
            href={HERO.secondaryCta.href}
            data-journey-jump="1"
            className="group inline-flex min-h-12 items-center gap-2.5 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-[#fff3df] uppercase outline-none focus-visible:underline focus-visible:underline-offset-8"
          >
            <span className="border-b border-[#fff3df]/60 pb-[5px] transition-colors group-hover:border-white group-hover:text-white">
              {HERO.secondaryCta.label}
            </span>
            <ArrowDown
              className="size-[14px] transition-transform duration-300 group-hover:translate-y-0.5"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </SiteLink>
        </div>
      </div>

      {/* A hairline that keeps drawing downward: an understated cue that there is more below. */}
      <div
        aria-hidden="true"
        className="scene-hint absolute bottom-[max(1.1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 flex-col items-center gap-2.5 font-ui text-[9.5px] leading-none tracking-[0.32em] text-[#fff3df]/80 uppercase [text-shadow:none] max-sm:hidden"
      >
        {JOURNEY.scrollHint}
        <span className="scene-hint-line" />
      </div>
    </section>
  );
}
