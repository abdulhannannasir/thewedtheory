/**
 * How much the visitor's device can be asked to draw. Decided once, before any 3D code is fetched,
 * so a device that would struggle never downloads the renderer at all and gets the lighter layered
 * scene (CSS only) instead.
 */

export type QualityTier = "high" | "medium" | "low" | "off";

export interface QualitySettings {
  /** Highest device pixel ratio the canvas is drawn at. Fewer pixels is the biggest saving on phones. */
  maxPixelRatio: number;
  /** Width in pixels of the photographs sent to the GPU. One of Next's image sizes (1080, 1200, 1920). */
  textureWidth: 1080 | 1200 | 1920;
  /** How many drifting light particles are drawn. */
  particles: number;
  /**
   * The largest a particle may be drawn, in CSS pixels. Big soft sprites overlap a lot of the screen,
   * and every overlap is blended again, so on a phone this costs more than the count does.
   */
  maxParticleSize: number;
  /** Extra passes that make the depth shift more accurate around edges (1 or 2). */
  depthPasses: 1 | 2;
  /** Film grain strength; 0 switches it off. */
  grain: number;
  /** Whether the picture follows the pointer. Off on touch screens, where there is no pointer to follow. */
  pointerParallax: boolean;
}

// The phone profiles ("medium" and "low") are deliberately lean: the photographs are soft and the words
// over them are ordinary text, so a lower resolution, a single depth pass and a lighter dusting of
// particles are hard to see, while the saved work is the difference between a smooth scroll and a
// stuttering one. If a phone still cannot keep up, the page lowers the resolution further by itself
// (see frame-governor.ts) and, as a last resort, uses the layered scene.
const SETTINGS: Record<Exclude<QualityTier, "off">, QualitySettings> = {
  high: { maxPixelRatio: 2, textureWidth: 1920, particles: 220, maxParticleSize: 190, depthPasses: 2, grain: 0.035, pointerParallax: true },
  medium: { maxPixelRatio: 1.25, textureWidth: 1200, particles: 64, maxParticleSize: 110, depthPasses: 1, grain: 0.015, pointerParallax: false },
  low: { maxPixelRatio: 1, textureWidth: 1080, particles: 32, maxParticleSize: 80, depthPasses: 1, grain: 0, pointerParallax: false },
};

type NetworkInformation = { saveData?: boolean; effectiveType?: string };
type NavigatorHints = Navigator & { deviceMemory?: number; connection?: NetworkInformation };

/**
 * `?render=gl|css` in the address overrides the choice (gl forces the 3D scene, css forces the
 * layered fallback). It exists so the fallback can be looked at and tested on any machine.
 */
export function detectTier(search: string = window.location.search): QualityTier {
  const forced = new URLSearchParams(search).get("render");
  if (forced === "css") return "off";

  const nav = navigator as NavigatorHints;
  const connection = nav.connection;
  if (forced !== "gl") {
    if (connection?.saveData || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? "")) return "off";
    if ((nav.deviceMemory ?? 4) <= 1 || (nav.hardwareConcurrency ?? 4) <= 2) return "off";
  }

  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (!touch) return "high";
  const strong = (nav.deviceMemory ?? 4) >= 4 && (nav.hardwareConcurrency ?? 4) >= 6;
  return strong ? "medium" : "low";
}

export const settingsFor = (tier: Exclude<QualityTier, "off">): QualitySettings => SETTINGS[tier];
