import type { CSSProperties } from "react";
import { CinematicHero } from "./cinematic-hero";
import { CorporateEventsSection } from "./corporate-events-section";
import { GrandFinale } from "./grand-finale";
import { HeroDrapes, HeroPhoto } from "./hero-backdrop";
import { HERO_GL, HERO_SCENE, JOURNEY } from "./journey-content";
import { JourneyController } from "./journey-controller";
import { SocialEventsSection } from "./social-events-section";
import { SceneMedia } from "./venue-scene";
import { WeddingSection } from "./wedding-section";

/**
 * The front page's scrolling story: the hero, three event environments (a wedding, a social
 * celebration, a corporate event) and a finale.
 *
 * This component only lays out the page: every scene's photograph and words are real, server-rendered
 * markup, so the story is readable by search engines and screen readers and works with JavaScript
 * off. The layers and the two layouts (plain and cinematic) are described in journey.css. All the
 * movement is in journey-controller.tsx, which finds the pieces below by their data attributes.
 */
export function CinematicJourney() {
  const scenes = [HERO_SCENE, ...JOURNEY.scenes];

  return (
    <section id={JOURNEY.id} aria-label={JOURNEY.label} className="journey">
      <div className="journey-stage">
        <div className="journey-media">
          <div
            data-scene-media="0"
            data-scene="hero"
            style={{ gridRow: 1 } as CSSProperties}
            className="scene-media"
          >
            <HeroPhoto />
          </div>
          {JOURNEY.scenes.map((scene, position) => (
            <SceneMedia key={scene.id} scene={scene} index={position + 1} />
          ))}
        </div>

        {/* Where the 3D canvas is added, when the device can run it. */}
        <div className="journey-gl" aria-hidden="true" />

        <div className="journey-overlay" aria-hidden="true">
          <div className="journey-drapes">
            <HeroDrapes />
          </div>
          <div className="journey-dim" />
        </div>

        <div className="journey-panels">
          <CinematicHero />
          <WeddingSection />
          <SocialEventsSection />
          <CorporateEventsSection />
          <GrandFinale />
        </div>

        <nav aria-label={JOURNEY.controlsLabel} className="journey-controls">
          <ol>
            {scenes.map((scene, position) => (
              <li key={scene.id}>
                <a
                  href={`#scene-${scene.id}`}
                  data-journey-jump={position}
                  aria-label={scene.label}
                  style={
                    {
                      "--accent-now": "accent" in scene ? scene.accent : "#fff3df",
                    } as CSSProperties
                  }
                />
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <JourneyController scenes={[HERO_GL, ...JOURNEY.scenes.map((scene) => scene.gl)]} />
    </section>
  );
}
