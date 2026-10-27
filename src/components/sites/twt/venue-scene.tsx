import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNEY, type JourneyScene, type SceneId } from "./journey-content";
import { SiteLink } from "./site-link";

/** A scene and its position on the journey (the hero is position 0, so the first venue is 1). */
export function sceneFor(id: SceneId) {
  const position = JOURNEY.scenes.findIndex((scene) => scene.id === id);
  if (position < 0) throw new Error(`No journey scene called ${id}`);
  return { scene: JOURNEY.scenes[position], index: position + 1 };
}

/**
 * A scene's photograph. It is what a visitor sees when 3D is not running (older or low-power
 * devices, reduced motion, no JavaScript), and the 3D scene replaces it when it is. It is lazy:
 * in the pinned layout it is not even on the page until the visitor is about to reach it.
 */
export function SceneMedia({ scene, index }: { scene: JourneyScene; index: number }) {
  const { photo } = scene;
  return (
    <div
      data-scene-media={index}
      data-scene={scene.id}
      style={{ gridRow: index + 1, "--origin": photo.focus } as CSSProperties}
      className="scene-media"
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="100vw"
        loading="lazy"
        style={{ "--focus": photo.focus, "--focus-mobile": photo.mobileFocus } as CSSProperties}
        className="size-full object-cover object-(--focus-mobile) md:object-(--focus)"
      />
    </div>
  );
}

/**
 * One venue scene's words: a kicker, a headline, a sentence and a call to action, over a dark wash.
 * It is a normal section of the page (with a real heading and a real link), so search engines and
 * screen readers read the story whether or not the pinned stage is running.
 */
export function VenueScene({
  scene,
  index,
  children,
}: {
  scene: JourneyScene;
  index: number;
  /** Extra actions after the main button (the finale adds a WhatsApp link). */
  children?: ReactNode;
}) {
  const headingId = `scene-${scene.id}-heading`;
  return (
    <section
      id={`scene-${scene.id}`}
      aria-labelledby={headingId}
      data-scene-panel={index}
      data-scene={scene.id}
      data-align={scene.align}
      style={{ gridRow: index + 1, "--accent": scene.accent } as CSSProperties}
      className="scene-panel text-[#fffaf0] [text-shadow:0_1px_20px_rgba(10,9,7,0.6)]"
    >
      <div aria-hidden="true" className="scene-scrim" />
      <div className="scene-copy">
        <p className="font-ui text-[12px] leading-none font-medium tracking-[0.3em] text-(--accent) uppercase">
          {scene.kicker}
        </p>
        <h2
          id={headingId}
          className="mt-4 font-serif text-[clamp(2.4rem,5.4vw,4.9rem)] max-[359px]:text-[2.1rem] leading-[1.04] font-normal"
        >
          {scene.headline.map((line, position) => (
            <span
              key={line}
              className={cn("block", position === scene.headline.length - 1 && "italic")}
            >
              {line}
            </span>
          ))}
        </h2>
        <p className="scene-desc mt-5 max-w-[28rem] font-ui text-[16px] leading-[1.6] font-normal text-[#fff6e8] sm:text-[17px] lg:max-w-[30rem]">
          {scene.description}
        </p>
        <SceneButton scene={scene} />
        {children}
      </div>
    </section>
  );
}

/** The scene's call to action, in the scene's own accent colour. */
function SceneButton({ scene }: { scene: JourneyScene }) {
  const solid = scene.id === "finale";
  return (
    <SiteLink
      href={scene.cta.href}
      data-magnetic=""
      className={cn(
        "group mt-8 inline-flex min-h-12 items-center gap-3 border border-(--accent) px-5 py-3 font-ui text-[11.5px] leading-[1.3] font-medium tracking-[0.1em] uppercase sm:px-7 sm:text-[12.5px] sm:tracking-[0.14em] [text-shadow:none] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:opacity-80",
        solid
          ? "bg-(--accent) text-charcoal hover:border-white hover:bg-white"
          : "bg-charcoal/55 text-(--accent) hover:bg-(--accent) hover:text-charcoal focus-visible:bg-(--accent) focus-visible:text-charcoal",
      )}
    >
      {scene.cta.label}
      <ArrowRight
        className="size-[14px] transition-transform duration-300 group-hover:translate-x-0.5"
        strokeWidth={1.4}
        aria-hidden="true"
      />
    </SiteLink>
  );
}
