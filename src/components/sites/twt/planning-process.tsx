import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PROCESS } from "./home-content";
import { SiteLink } from "./site-link";

/**
 * Discover → Design → Plan → Celebrate: how an enquiry becomes a personalised event plan. Four
 * steps in a row on wide screens, joined by a hairline; a vertical timeline on phones. The wording is
 * in home-content.ts (PROCESS); the steps' descriptions are the About page's own.
 */
export function PlanningProcess() {
  return (
    <section
      id={PROCESS.id}
      aria-labelledby="process-heading"
      className="scroll-mt-16 bg-forest px-5 py-20 text-cream sm:px-8 lg:px-[6.56vw] lg:py-32"
    >
      <div className="mx-auto max-w-[1760px]">
        <Reveal>
          <p className="font-ui text-[11px] leading-none font-medium tracking-[0.3em] text-champagne uppercase">
            {PROCESS.kicker}
          </p>
          <h2
            id="process-heading"
            className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04] font-normal"
          >
            <span className="block">{PROCESS.headline[0]}</span>
            <span className="block italic">{PROCESS.headline[1]}</span>
          </h2>
          <p className="mt-6 max-w-[34rem] font-ui text-[16.5px] leading-[1.65] font-light text-cream/85">
            {PROCESS.intro}
          </p>
        </Reveal>

        <ol className="relative mt-16 grid gap-12 lg:mt-24 lg:grid-cols-4 lg:gap-10">
          {/* The thread joining the steps: vertical on phones, horizontal on wide screens. */}
          <span
            aria-hidden="true"
            className="absolute top-3 bottom-3 left-[1.05rem] w-px bg-cream/20 lg:top-[1.05rem] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-full"
          />
          {PROCESS.steps.map((step, position) => (
            <Reveal key={step.title} as="li" delay={position * 110} className="relative pl-14 lg:pt-14 lg:pl-0">
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 grid size-[2.1rem] place-items-center rounded-full border border-champagne bg-forest font-ui text-[12px] text-champagne"
              >
                {position + 1}
              </span>
              <h3 className="font-serif text-[clamp(1.9rem,2.6vw,2.6rem)] leading-none font-normal italic">
                {step.title}
                {position < PROCESS.steps.length - 1 && (
                  <span aria-hidden="true" className="ml-3 hidden text-champagne/70 lg:inline">
                    →
                  </span>
                )}
              </h3>
              <p className="mt-4 font-ui text-[15.5px] leading-[1.65] font-light text-cream/90">{step.body}</p>
              <p className="mt-3 border-l border-champagne/50 pl-4 font-ui text-[14px] leading-[1.6] text-cream/70">
                {step.detail}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-16 lg:mt-24">
          <SiteLink
            href={PROCESS.cta.href}
            data-magnetic=""
            className="group inline-flex h-12 items-center gap-3 bg-cream px-7 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-ink uppercase transition-colors duration-300 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-forest active:opacity-85"
          >
            {PROCESS.cta.label}
            <ArrowRight
              className="size-[14px] transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </SiteLink>
        </Reveal>
      </div>
    </section>
  );
}
