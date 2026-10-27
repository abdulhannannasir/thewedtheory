import type { CSSProperties } from "react";
import Image, { getImageProps } from "next/image";
import { HERO } from "./content";

/**
 * The hero's picture, in the layers the journey and the intro share, so the intro's arch window, the
 * pinned stage and the plain stacked layout all show exactly the same thing.
 *
 * The photo is art-directed: a landscape crop from 768px up and a portrait crop on phones, so the
 * browser downloads only the one it shows. It is the page's largest paint: eager, never lazy.
 */
export function HeroPhoto() {
  const { photo } = HERO;
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
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
      {/* Art direction through getImageProps needs a plain img. */}
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
  );
}

/**
 * Pale sheer drapes laid over the top of the photograph and faded out downward, so the dark logo
 * and navigation read at the top. In the journey they lift away as the visitor starts to scroll.
 */
export function HeroDrapes({ className = "" }: { className?: string }) {
  const { drapes } = HERO;
  return (
    <Image
      src={drapes.src}
      alt=""
      width={drapes.width}
      height={drapes.height}
      sizes="100vw"
      loading="eager"
      className={`absolute inset-x-0 top-0 h-[78%] w-full object-cover mask-[linear-gradient(to_bottom,#000_0%,rgba(0,0,0,0.9)_22%,rgba(0,0,0,0.35)_48%,transparent_78%)] ${className}`}
    />
  );
}

/** A warm dark scrim: on the left on wide screens and rising from the bottom on phones, so the ivory headline reads. */
export const HERO_SCRIM_CLASS =
  "absolute inset-0 bg-[linear-gradient(90deg,rgba(38,26,14,0.76)_0%,rgba(38,26,14,0.54)_42%,rgba(38,26,14,0.1)_72%)] max-md:bg-[linear-gradient(180deg,rgba(38,26,14,0)_20%,rgba(38,26,14,0.8)_50%,rgba(38,26,14,0.94)_100%)] md:mask-[linear-gradient(to_bottom,transparent_0%,transparent_12%,#000_36%)]";

/** Everything the intro shows through its arch: the photograph, the drapes and the scrim. */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[#2a1d11]">
      <HeroPhoto />
      <HeroDrapes />
      <div className={HERO_SCRIM_CLASS} />
    </div>
  );
}
