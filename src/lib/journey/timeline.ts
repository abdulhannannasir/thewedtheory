/**
 * The scroll journey as arithmetic: given how far the visitor has scrolled through the journey (0 to
 * 1), what is on screen? Pure functions with no DOM or WebGL, used by both renderers (the WebGL one
 * and the CSS one) so they always agree, and by the unit tests.
 *
 * The journey is a row of scenes. Scrolling moves a position along that row: 0 is the first scene,
 * 1 the second, and so on. Between two neighbouring scenes the position passes through a *segment*:
 *
 *   fraction in segment   0 ───────── HOLD ───────── 1
 *                         the scene    the doorway     the next scene
 *                         is shown     opens           is shown
 *
 * Text fades out early in the opening, and in again near the end, so the middle of every transition
 * is pure imagery.
 */

/** How much of a segment the current scene is simply shown before the doorway starts to open. */
export const HOLD = 0.55;
/** By this fraction of a segment the outgoing scene's text is gone. */
export const TEXT_OUT = 0.72;
/** From this fraction the incoming scene's text starts to appear. */
export const TEXT_IN = 0.84;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smoothstep = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export interface JourneyFrame {
  /** Position along the row of scenes: 0 at the first scene, count - 1 at the last. */
  position: number;
  /** The scene being left, or simply shown. */
  from: number;
  /** The scene being entered. The same as `from` when there is only one scene. */
  to: number;
  /** How open the doorway to `to` is: 0 closed, 1 fully open. Eased. */
  arch: number;
  /** Each scene's text opacity, 0 to 1. */
  text: number[];
  /** Each scene's camera push-in, 0 to 1: how far the camera has travelled into it. */
  dolly: number[];
}

/**
 * Everything on screen at `progress`.
 *
 * @param count How many scenes there are.
 * @param firstSpan How many scenes of scrolling the first scene's camera push lasts. The first
 * scene starts with no push at all, so the picture matches the plain hero photograph exactly (the
 * intro hands over to it without a visible jump). Every other scene's push lasts two scenes' worth.
 */
export function frameAt(progress: number, count: number, firstSpan = 1): JourneyFrame {
  const scenes = Math.max(1, Math.floor(count));
  const last = scenes - 1;
  const position = clamp01(progress) * last;
  const from = Math.min(Math.floor(position), Math.max(0, last - 1));
  const fraction = last === 0 ? 0 : position - from;
  const to = Math.min(from + 1, last);

  const text = Array.from({ length: scenes }, () => 0);
  if (last === 0) {
    text[0] = 1;
  } else {
    text[from] = 1 - smoothstep(HOLD, TEXT_OUT, fraction);
    text[to] = smoothstep(TEXT_IN, 1, fraction);
  }

  const dolly = Array.from({ length: scenes }, (_, scene) =>
    scene === 0 ? clamp01(position / firstSpan) : clamp01((position - (scene - 1)) / 2),
  );

  return {
    position,
    from,
    to,
    arch: last === 0 ? 0 : easeInOutCubic(clamp01((fraction - HOLD) / (1 - HOLD))),
    text,
    dolly,
  };
}

/** The scroll progress at which scene `index` is fully shown, for "jump to this scene" controls. */
export const progressForScene = (index: number, count: number) =>
  count <= 1 ? 0 : clamp01(index / (count - 1));

/** The scene whose text is most visible at `progress`: for highlighting the right scene control. */
export function activeScene(progress: number, count: number): number {
  const { text } = frameAt(progress, count);
  let best = 0;
  for (let scene = 1; scene < text.length; scene += 1) if (text[scene] > text[best]) best = scene;
  return best;
}
