/**
 * The shape of a 3D scene, shared by the content file that describes the scenes
 * (journey-content.ts) and the renderer that draws them. Types only: importing this file never
 * loads the 3D library.
 */

/** The look of the drifting light in a scene. */
export type ParticleKind = "bokeh" | "petals" | "dust" | "sparkle";

/** A scene's colour treatment. The first scene is neutral, so it matches the plain photograph. */
export interface SceneGrade {
  /** Multiplies red, green and blue: above 1 warms or cools that channel. */
  tint: readonly [number, number, number];
  /** Brightness. 1 leaves the photograph as it is. */
  exposure: number;
  contrast: number;
  /** 0 is black and white, 1 the original colour. */
  saturation: number;
  /** Darkening toward the corners, 0 to 1. It grows as the camera moves in. */
  vignette: number;
  /** Colour added to the shadows only, for a cool or rosy cast. */
  lift: readonly [number, number, number];
}

/** One picture of a scene together with its depth map. */
export interface GlSource {
  /** The photograph, a path under /public. */
  src: string;
  /** Its grey-scale depth map (white is near), made by scripts/generate-depth-maps.py. */
  depth: string;
  /** The photograph's size in pixels. Only the shape matters. */
  width: number;
  height: number;
  /** Which part of the picture stays in view when it is cropped to the screen, like CSS object-position: 0 to 1. */
  focus: readonly [number, number];
}

export interface GlScene {
  id: string;
  landscape: GlSource;
  /** Used on screens taller than they are wide. Without it the landscape picture is cropped. */
  portrait?: GlSource;
  grade: SceneGrade;
  particles: ParticleKind;
  /** How far the camera pushes into the scene as the visitor scrolls: 0.3 enlarges the nearest things by 30%. */
  zoom: number;
  /** The point on screen the camera pushes toward, 0 to 1 from the top left. */
  focalPoint: readonly [number, number];
  /** The scene's average colour, shown for the instant before its photograph has loaded. */
  tone: string;
}
