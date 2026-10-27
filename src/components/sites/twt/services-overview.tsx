import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICES_OVERVIEW, serviceOverview } from "./home-content";
import { SiteLink } from "./site-link";
import { Reveal } from "@/components/ui/reveal";

/**
 * The three service areas, presented as an editorial spread rather than a row of cards: an arched
 * photograph with a smaller detail overlapping its corner, beside the service's name, a sentence
 * about it, a few of the things the studio plans, and a link to its own page. The rows alternate
 * sides on wide screens and stack on phones. The words are the service pages' own (see
 * home-content.ts), so each is written once.
 */
export function ServicesOverview() {
  const { kicker, headline, intro, allServices } = SERVICES_OVERVIEW;

  return (
    <section
      id={SERVICES_OVERVIEW.id}
      aria-labelledby="services-heading"
      className="scroll-mt-16 bg-ivory px-5 py-20 sm:px-8 lg:px-[6.56vw] lg:py-32"
    >
      <div className="mx-auto max-w-[1760px]">
        <Reveal>
          <p className="font-ui text-[11px] leading-none font-medium tracking-[0.3em] text-ink-soft uppercase">
            {kicker}
          </p>
          <h2
            id="services-heading"
            className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04] font-normal text-ink"
          >
            <span className="block">{headline[0]}</span>
            <span className="block italic">{headline[1]}</span>
          </h2>
          <p className="mt-6 max-w-[34rem] font-ui text-[16.5px] leading-[1.65] font-light text-ink-soft">
            {intro}
          </p>
        </Reveal>

        <ol className="mt-16 flex flex-col gap-24 lg:mt-24 lg:gap-36">
          {SERVICES_OVERVIEW.items.map((item, position) => {
            const service = serviceOverview(item);
            const flip = position % 2 === 1;
            return (
              <li key={service.slug}>
                <article
                  aria-labelledby={`service-${service.slug}`}
                  className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
                >
                  {/* The composition: an arched photograph, a smaller detail overlapping its corner. */}
                  <Reveal className={cn("relative mb-8 lg:col-span-6 lg:mb-0", flip ? "lg:order-2 lg:col-start-7" : "lg:col-start-1")}>
                    <div className="relative mx-auto aspect-[4/5] w-[88%] max-w-[34rem] overflow-hidden rounded-t-full bg-cream lg:w-[82%]">
                      <Image
                        src={service.photo.src}
                        alt={service.photo.alt}
                        fill
                        sizes="(min-width: 1024px) 42vw, 90vw"
                        style={{ objectPosition: service.photo.focus }}
                        className="object-cover transition-transform duration-1000 ease-out can-hover:hover:scale-[1.03]"
                      />
                    </div>
                    <div
                      className={cn(
                        "absolute -bottom-8 aspect-[4/3] w-[44%] max-w-[15rem] overflow-hidden border-[6px] border-ivory bg-cream shadow-[0_18px_40px_-20px_rgba(53,52,42,0.45)]",
                        flip ? "left-[2%] lg:left-[6%]" : "right-[2%] lg:right-[6%]",
                      )}
                    >
                      <Image
                        src={service.detail.src}
                        alt={service.detail.alt}
                        fill
                        sizes="(min-width: 1024px) 16vw, 40vw"
                        style={{ objectPosition: service.detail.focus }}
                        className="object-cover"
                      />
                    </div>
                  </Reveal>

                  <Reveal delay={120} className={cn("lg:col-span-5", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8")}>
                    <p className="font-script text-[2.4rem] leading-none text-ink-soft/80" aria-hidden="true">
                      {String(position + 1).padStart(2, "0")}
                    </p>
                    <h3
                      id={`service-${service.slug}`}
                      className="mt-3 font-serif text-[clamp(1.9rem,3.1vw,3rem)] leading-[1.08] font-normal text-ink"
                    >
                      {service.title}
                    </h3>
                    <p className="mt-5 max-w-[30rem] font-ui text-[16px] leading-[1.7] font-light text-ink-soft">
                      {service.description}
                    </p>
                    <ul className="mt-7 max-w-[30rem] divide-y divide-line border-y border-line">
                      {service.highlights.map((highlight) => (
                        <li key={highlight} className="py-3 font-serif text-[1.15rem] leading-snug text-ink">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-1">
                      <SiteLink
                        href={service.href}
                        data-magnetic=""
                        className="group inline-flex min-h-12 items-center gap-3 border border-ink px-6 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-ink uppercase transition-colors duration-300 outline-none hover:bg-ink hover:text-cream focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory active:opacity-80"
                      >
                        {service.cta}
                        <ArrowRight
                          className="size-[14px] transition-transform duration-300 group-hover:translate-x-0.5"
                          strokeWidth={1.4}
                          aria-hidden="true"
                        />
                      </SiteLink>
                      {service.more.map((extra) => (
                        <SiteLink
                          key={extra.href}
                          href={extra.href}
                          className="inline-flex min-h-11 items-center font-ui text-[12px] font-medium tracking-[0.14em] text-ink-soft uppercase underline-offset-8 outline-none hover:text-ink hover:underline focus-visible:text-ink focus-visible:underline"
                        >
                          {extra.label}
                        </SiteLink>
                      ))}
                    </div>
                  </Reveal>
                </article>
              </li>
            );
          })}
        </ol>

        <Reveal className="mt-24 text-center lg:mt-36">
          <SiteLink
            href={allServices.href}
            className="inline-flex min-h-12 items-center gap-3 border-b border-ink-soft/70 pb-1 font-ui text-[12.5px] font-medium tracking-[0.16em] text-ink uppercase transition-colors outline-none hover:border-ink focus-visible:border-ink"
          >
            {allServices.label}
            <ArrowRight className="size-[14px]" strokeWidth={1.4} aria-hidden="true" />
          </SiteLink>
        </Reveal>
      </div>
    </section>
  );
}
