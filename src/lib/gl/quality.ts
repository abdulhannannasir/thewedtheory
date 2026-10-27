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
  /** Extra passes that make the depth shift more accurate around edges (1 or 2). */
  depthPasses: 1 | 2;
  /** Film grain strength; 0 switches it off. */
  grain: number;
  /** Whether the picture follows the pointer. Off on touch screens, where there is no pointer to follow. */
  pointerParallax: boolean;
}

const SETTINGS: Record<Exclude<QualityTier, "off">, QualitySettings> = {
  high: { maxPixelRatio: 2, textureWidth: 1920, particles: 220, depthPasses: 2, grain: 0.035, pointerParallax: true },
  medium: { maxPixelRatio: 1.5, textureWidth: 1200, particles: 90, depthPasses: 2, grain: 0.02, pointerParallax: false },
  low: { maxPixelRatio: 1, textureWidth: 1080, particles: 40, depthPasses: 1, grain: 0, pointerParallax: false },
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
