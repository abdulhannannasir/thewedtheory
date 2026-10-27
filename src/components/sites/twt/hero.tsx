import type { CSSProperties } from "react";
import Image, { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import { HERO } from "./content";
import { SiteLink } from "./site-link";

/**
 * The photo is art-directed: a landscape crop from 768px up and a portrait crop on phones, so the
 * browser downloads only the one it shows. Over it go pale drapes fading out downward (so the dark
 * nav reads at the top) and a warm scrim on the left (so the ivory headline reads).
 */
function HeroBackdrop() {
  const { photo, drapes } = HERO;
  const common = { alt: "", sizes: "100vw" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: photo.src, width: photo.width, height: photo.height });
  const {
    props: { srcSet: mobileSrcSet, ...img },
  } = getImageProps({
    ...common,
    src: photo.mobileSrc,
    width: photo.mobileWidth,
    height: photo.mobileHeight,
  });

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#2a1d11]">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
        {/* Art direction through getImageProps needs a plain img. It is the page's LCP image: eager, never lazy. */}
        <img
          {...img}
          srcSet={mobileSrcSet}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={
            {
              "--focus": photo.focus,
              "--focus-mobile": photo.mobileFocus,
            } as CSSProperties
          }
          className="size-full object-cover object-(--focus-mobile) md:object-(--focus)"
        />
      </picture>

      <Image
        src={drapes.src}
        alt=""
        width={drapes.width}
        height={drapes.height}
        sizes="100vw"
        className="absolute inset-x-0 top-0 h-[78%] w-full object-cover mask-[linear-gradient(to_bottom,#000_0%,rgba(0,0,0,0.9)_22%,rgba(0,0,0,0.35)_48%,transparent_78%)]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(38,26,14,0.62)_0%,rgba(38,26,14,0.3)_42%,rgba(38,26,14,0)_72%)] max-md:bg-[linear-gradient(180deg,rgba(38,26,14,0)_26%,rgba(38,26,14,0.7)_58%,rgba(38,26,14,0.9)_100%)] md:mask-[linear-gradient(to_bottom,transparent_0%,transparent_12%,#000_36%)]" />
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[40rem] flex-1 flex-col justify-end overflow-hidden pt-32 pb-12 md:min-h-[36rem] md:justify-center md:pb-24 lg:min-h-[34rem] lg:pt-[8.25rem] lg:pb-[6.25rem]"
    >
      <HeroBackdrop />

      <div className="px-5 text-[#fffaf0] [text-shadow:0_1px_18px_rgba(38,26,14,0.35)] sm:px-8 lg:pl-[6.56vw]">
        <p className="text-[13px] leading-none font-medium tracking-[0.28em] text-[#fff3df] uppercase motion-safe:animate-rise">
          {HERO.eyebrow}
        </p>

        <h1
          id="hero-heading"
          className="mt-3.5 text-[clamp(2.25rem,4.3vw,4.5rem)] leading-[1.04] font-normal motion-safe:animate-rise motion-safe:[animation-delay:120ms]"
        >
          <span className="block">{HERO.headline[0]}</span>
          <span className="block text-[1.035em] tracking-[0.015em] italic">{HERO.headline[1]}</span>
        </h1>

        <p className="mt-6 max-w-[34rem] text-[16.6px] leading-[1.32] text-[#fff6e8] motion-safe:animate-rise motion-safe:[animation-delay:240ms]">
          {HERO.intro.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <SiteLink
          href={HERO.cta.href}
          className="group mt-[26px] inline-flex h-[37px] items-center gap-2.5 bg-cream px-[26px] text-[15px] leading-none tracking-[0.02em] text-ink [text-shadow:none] transition-colors duration-300 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a1d11] motion-safe:animate-rise motion-safe:[animation-delay:360ms]"
        >
          {HERO.cta.label}
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
