import { ArrowRight } from "lucide-react";
import { CLOSING } from "./content";
import { SiteLink } from "./site-link";

/** The deep-green call to action that ends the portfolio and about pages. */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-heading" className="bg-forest text-cream">
      <div className="mx-auto flex max-w-[1760px] flex-col items-center px-5 py-20 text-center sm:px-8 lg:px-[6.56vw] lg:py-28">
        <p className="text-[13px] leading-none font-medium tracking-[0.28em] text-cream/70 uppercase">
          {CLOSING.eyebrow}
        </p>
        <h2
          id="closing-heading"
          className="mt-4 text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.08] font-normal italic"
        >
          {CLOSING.headline}
        </h2>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.4] text-cream/85">{CLOSING.body}</p>
        <SiteLink
          href={CLOSING.button.href}
          className="group mt-9 inline-flex h-[42px] items-center gap-2.5 bg-cream px-[30px] text-[15px] leading-none tracking-[0.02em] text-ink transition-colors duration-300 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
        >
          {CLOSING.button.label}
          <ArrowRight
            className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </SiteLink>
      </div>
    </section>
  );
}
