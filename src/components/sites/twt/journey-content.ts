/**
 * THE JOURNEY: the scrolling story on the front page. It opens on the hero and then moves through
 * three event environments and a finale. Everything a visitor reads, and the picture and look of each
 * scene, is in this file: to reword a scene, swap a photograph or change a button, edit it here.
 *
 * EACH SCENE HAS
 * - words: a small kicker, a headline, one sentence and a call to action;
 * - `photo`: the picture shown when 3D is not running (older or low-power devices, reduced motion,
 *   no JavaScript), cropped to cover the screen. `focus` and `mobileFocus` are CSS object-position
 *   values: where the crop is anchored on large screens and on phones;
 * - `gl`: the same picture for the 3D scene, with its depth map, how the camera moves, its colour
 *   treatment and its drifting light. The three event environments are deliberately different:
 *   warm candlelit amber for weddings, soft daylight blush for social events, cool blue-grey stage
 *   light for corporate events.
 *
 * PHOTOGRAPHS
 * The wedding scenes use the studio's portfolio photographs. The social events and corporate scenes
 * use stand-in stock photographs (credits in docs/photo-credits.md): replace them with the studio's
 * own event photography when it exists. To swap a photograph:
 *   1. put the new file in /public/images and point `photo.src` and `gl.landscape.src` at it;
 *   2. add its path to PHOTOS in scripts/generate-depth-maps.py and run the script, then point
 *      `gl.landscape.depth` at the depth map it writes to /public/depth;
 *   3. set `focus` so the subject stays in view when the picture is cropped, and update `width`,
 *      `height`, `alt` and `tone` (the picture's average colour).
 */

import type { GlScene } from "@/lib/gl/scene-types";
import type { Link } from "./content";

export type SceneId = "hero" | "weddings" | "social" | "corporate" | "finale";

export interface JourneyScene {
  id: SceneId;
  /** Short name for the scene controls and for screen readers. */
  label: string;
  kicker: string;
  /** One entry per line; the last line is set in italic. */
  headline: readonly string[];
  description: string;
  cta: Link;
  /** Where the text sits on large screens. On phones it always sits at the bottom. */
  align: "start" | "end" | "center";
  /** The scene's accent colour, used for its kicker and its controls. */
  accent: string;
  photo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    focus: string;
    mobileFocus: string;
  };
  gl: GlScene;
}

/** The hero is described in content.ts (HERO); its 3D scene is here. */
export const HERO_GL: GlScene = {
  id: "hero",
  landscape: {
    src: "/images/custom-table.jpg",
    depth: "/depth/custom-table.webp",
    width: 2400,
    height: 1350,
    focus: [0.5, 0.62],
  },
  portrait: {
    src: "/images/custom-table-mobile.jpg",
    depth: "/depth/custom-table-mobile.webp",
    width: 1152,
    height: 2064,
    focus: [0.62, 0.5],
  },
  // Neutral grade: at the start of the journey the 3D picture matches the plain photograph.
  grade: { tint: [1, 1, 1], exposure: 1, contrast: 1, saturation: 1, vignette: 0.26, lift: [0, 0, 0] },
  particles: "bokeh",
  zoom: 0.3,
  focalPoint: [0.62, 0.55],
  tone: "#53422d",
};

export const JOURNEY = {
  id: "journey",
  /** Label for the region that holds the whole scrolling story. */
  label: "A journey through our event environments",
  controlsLabel: "Choose a scene",
  /** Jumps past the long scrolling story, for keyboard and screen-reader visitors. */
  skip: { label: "Skip the journey", href: "#services" },
  scrollHint: "Scroll",
  scenes: [
    {
      id: "weddings",
      label: "Weddings",
      kicker: "Weddings",
      headline: ["A day that", "feels like you."],
      description:
        "Thoughtfully designed weddings, from the first concept to the final celebration.",
      cta: { label: "Discover Wedding Planning", href: "/services/weddings" },
      align: "start",
      accent: "#e7d3a8",
      photo: {
        src: "/images/grand-entrance.jpg",
        alt: "A candlelit wedding aisle leading to an arch of white roses and a glowing curtain of lights",
        width: 2400,
        height: 1350,
        focus: "50% 55%",
        mobileFocus: "50% 55%",
      },
      gl: {
        id: "weddings",
        landscape: {
          src: "/images/grand-entrance.jpg",
          depth: "/depth/grand-entrance.webp",
          width: 2400,
          height: 1350,
          focus: [0.5, 0.55],
        },
        // Candlelit amber: warm tint, a little more contrast and colour, golden bokeh.
        grade: { tint: [1.04, 1, 0.93], exposure: 1, contrast: 1.06, saturation: 1.06, vignette: 0.3, lift: [0.015, 0.008, 0] },
        particles: "bokeh",
        zoom: 0.34,
        focalPoint: [0.5, 0.52],
        tone: "#57452e",
      },
    },
    {
      id: "social",
      label: "Social celebrations",
      kicker: "Social Celebrations",
      headline: ["Make every", "moment matter."],
      description:
        "Meaningful celebrations, designed around the people and moments that make them special.",
      cta: { label: "Explore Social Events", href: "/services/social-events" },
      align: "end",
      accent: "#f1c7c0",
      photo: {
        src: "/images/services/social-events/garden-table.jpg",
        alt: "A garden table with a white cloth, glass coupes and pink and white flowers in soft evening light",
        width: 1400,
        height: 1050,
        focus: "42% 60%",
        mobileFocus: "42% 60%",
      },
      gl: {
        id: "social",
        landscape: {
          src: "/images/services/social-events/garden-table.jpg",
          depth: "/depth/garden-table.webp",
          width: 1400,
          height: 1050,
          focus: [0.42, 0.6],
        },
        // Soft daylight: lifted, slightly desaturated, a rosy cast in the shadows, drifting petals.
        grade: { tint: [1.02, 1, 1], exposure: 1.06, contrast: 0.98, saturation: 0.96, vignette: 0.2, lift: [0.03, 0.012, 0.02] },
        particles: "petals",
        zoom: 0.28,
        focalPoint: [0.4, 0.6],
        tone: "#746d4f",
      },
    },
    {
      id: "corporate",
      label: "Corporate events",
      kicker: "Corporate Events",
      headline: ["Make an impression", "that lasts."],
      description:
        "Thoughtfully produced corporate experiences that bring people, ideas, and brands together.",
      cta: { label: "Plan a Corporate Event", href: "/services/corporate-events" },
      align: "start",
      accent: "#bcd3ea",
      photo: {
        src: "/images/services/corporate-events/grand-hall.jpg",
        alt: "A large hall with tall windows, stage lighting and a screen, filled with an attentive audience",
        width: 1400,
        height: 1050,
        focus: "50% 55%",
        mobileFocus: "50% 55%",
      },
      gl: {
        id: "corporate",
        landscape: {
          src: "/images/services/corporate-events/grand-hall.jpg",
          depth: "/depth/grand-hall.webp",
          width: 1400,
          height: 1050,
          focus: [0.5, 0.55],
        },
        // Cool stage light: blue-grey tint, crisper contrast, muted colour, fine drifting dust.
        grade: { tint: [0.93, 0.98, 1.07], exposure: 1, contrast: 1.12, saturation: 0.88, vignette: 0.36, lift: [0, 0.01, 0.03] },
        particles: "dust",
        zoom: 0.3,
        focalPoint: [0.5, 0.55],
        tone: "#595e5c",
      },
    },
    {
      id: "finale",
      label: "Begin",
      kicker: "Begin",
      headline: ["Let’s create something", "unforgettable."],
      description: "Tell us about your event and we’ll pick up the conversation from there.",
      cta: { label: "Start Planning Your Event", href: "#enquire" },
      align: "center",
      accent: "#e7d3a8",
      photo: {
        src: "/images/lighting-ambience.jpg",
        alt: "A crystal chandelier and a canopy of fairy lights above long candlelit banquet tables",
        width: 2400,
        height: 1350,
        focus: "50% 50%",
        mobileFocus: "50% 50%",
      },
      gl: {
        id: "finale",
        landscape: {
          src: "/images/lighting-ambience.jpg",
          depth: "/depth/lighting-ambience.webp",
          width: 2400,
          height: 1350,
          focus: [0.5, 0.5],
        },
        // Champagne: warm and rich, with twinkling light.
        grade: { tint: [1.05, 1, 0.9], exposure: 1, contrast: 1.05, saturation: 1.1, vignette: 0.32, lift: [0.02, 0.01, 0] },
        particles: "sparkle",
        zoom: 0.3,
        focalPoint: [0.5, 0.45],
        tone: "#644422",
      },
    },
  ],
} as const satisfies {
  id: string;
  label: string;
  controlsLabel: string;
  skip: Link;
  scrollHint: string;
  scenes: readonly JourneyScene[];
};

/** The hero's own entry in the scene controls; it is the first stop on the journey. */
export const HERO_SCENE = { id: "hero" as const, label: "Welcome" };
