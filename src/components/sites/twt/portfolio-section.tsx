import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PORTFOLIO_PREVIEW } from "./home-content";
import { PortfolioGallery } from "./portfolio-gallery";
import { FEATURED_ITEMS } from "./portfolio-gallery-data";
import { SiteLink } from "./site-link";

/** The front page's look at the work: a handful of pictures in the gallery, with a way to the whole portfolio. */
export function PortfolioSection() {
  const { kicker, headline, intro, all } = PORTFOLIO_PREVIEW;
  return (
    <section
      id={PORTFOLIO_PREVIEW.id}
      aria-labelledby="portfolio-heading"
      className="scroll-mt-16 bg-ivory px-5 py-20 sm:px-8 lg:px-[6.56vw] lg:py-32"
    >
      <div className="mx-auto max-w-[1760px]">
        <Reveal className="mb-10">
          <p className="font-ui text-[11px] leading-none font-medium tracking-[0.3em] text-ink-soft uppercase">
            {kicker}
          </p>
          <h2
            id="portfolio-heading"
            className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04] font-normal text-ink"
          >
            <span className="block">{headline[0]}</span>
            <span className="block italic">{headline[1]}</span>
          </h2>
          <p className="mt-6 max-w-[34rem] font-ui text-[16.5px] leading-[1.65] font-light text-ink-soft">
            {intro}
          </p>
        </Reveal>

        <PortfolioGallery
          items={FEATURED_ITEMS}
          footer={
            <SiteLink
              href={all.href}
              className="inline-flex min-h-12 items-center gap-3 border border-ink px-6 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-ink uppercase transition-colors duration-300 outline-none hover:bg-ink hover:text-cream focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory active:opacity-80"
            >
              {all.label}
              <ArrowRight className="size-[14px]" strokeWidth={1.4} aria-hidden="true" />
            </SiteLink>
          }
        />
      </div>
    </section>
  );
}
