import { ArrowRight } from "lucide-react";
import { ServiceGlyph } from "./icons";
import { SERVICES } from "./content";
import { SiteLink } from "./site-link";

/**
 * The ivory band under the hero, in three zones: the intro, the three services, and the handwritten
 * sign-off. From `lg` up they sit in one row split by hairlines; below that they stack.
 */
export function ServicesStrip() {
  return (
    <section
      id={SERVICES.id}
      aria-labelledby="services-kicker"
      className="relative overflow-x-clip bg-[linear-gradient(90deg,#f0ede2_0%,#f0ede2_55%,#eee8dc_100%)] pt-9 pb-10 lg:grid lg:grid-cols-[30.5fr_45.9fr_23.6fr] lg:pt-[33px] lg:pb-[38px]"
    >
      {/* Intro */}
      <div className="px-5 sm:px-8 lg:relative lg:pr-0 lg:pl-[6.56vw]">
        <p
          id="services-kicker"
          className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase"
        >
          {SERVICES.kicker}
        </p>
        <p className="mt-[11px] max-w-[15rem] text-[13.25px] leading-[17px] text-ink">
          {SERVICES.intro}
        </p>
        <SiteLink
          href={SERVICES.link.href}
          className="tap-target group mt-5 inline-flex items-center gap-2 text-[9.5px] leading-none font-medium tracking-[0.2em] text-ink-soft uppercase outline-none focus-visible:text-ink"
        >
          <span className="border-b border-ink-soft/70 pb-[3px] transition-colors group-hover:border-ink group-hover:text-ink">
            {SERVICES.link.label}
          </span>
          <ArrowRight
            className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </SiteLink>
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 hidden h-[104px] w-px bg-line lg:block"
        />
      </div>

      {/* Services */}
      <ul className="mt-7 grid grid-cols-1 px-5 sm:mt-9 sm:grid-cols-3 sm:px-8 lg:mt-0 lg:pr-[2.2vw] lg:pl-[0.4vw]">
        {SERVICES.items.map((item) => (
          <li
            key={item.id}
            className="border-t border-line first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0 lg:mt-[11px] lg:h-[80px]"
          >
            <SiteLink
              href={item.href}
              className="group flex h-full items-center gap-5 py-5 outline-none max-sm:text-left focus-visible:ring-2 focus-visible:ring-forest/40 sm:flex-col sm:gap-0 sm:px-3 sm:py-0 sm:text-center"
            >
              <ServiceGlyph
                name={item.icon}
                className="size-7 shrink-0 text-ink transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-0.5"
              />
              <div className="sm:contents">
                <h2 className="text-[15px] leading-none font-medium text-ink transition-colors duration-300 group-hover:text-ink-soft sm:mt-2 sm:text-[14px]">
                  {item.title}
                </h2>
                <p className="mt-2 text-[12px] leading-[14px] text-ink-soft sm:mt-1.5 sm:text-[11px] sm:leading-[13.5px]">
                  {item.blurb.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </SiteLink>
          </li>
        ))}
      </ul>

      {/* Sign-off */}
      <div className="relative mt-6 flex flex-col items-center justify-center px-5 sm:mt-9 lg:mt-0 lg:block lg:px-0">
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 hidden h-[104px] w-px bg-line lg:block"
        />
        <p className="font-script text-[28px] leading-[0.8] text-ink -rotate-[10deg] lg:mt-[17px] lg:text-center">
          {SERVICES.tagline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <span
          aria-hidden="true"
          className="mt-[18px] block h-px w-[33px] bg-ink/45 lg:mx-auto lg:mt-2"
        />
      </div>
    </section>
  );
}
