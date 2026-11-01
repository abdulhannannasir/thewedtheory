/**
 * Decides, from how long the last frames took, whether the 3D scene should draw fewer pixels or
 * give up. It is plain arithmetic with no browser in it, so the rules can be tested.
 *
 * It looks at frames in windows (about half a second at 60 frames a second) rather than one at a
 * time, so a single slow frame (a photograph being uploaded, a garbage collection) changes nothing,
 * while a device that is really running below about 45 frames a second is noticed within a second.
 *
 * Only frames drawn while the visitor is scrolling count. When the page is still the 3D scene is
 * drawn at a lower rate on purpose, and those slow gaps say nothing about the device.
 */

export type GovernorDecision = "ok" | "lower" | "give-up";

/** The longest a single frame may count toward a window's average: four frames at 60 fps. */
const MOST_ONE_FRAME_COUNTS = 0.066;

export interface FrameGovernorOptions {
  /** Frames per window. */
  window?: number;
  /** A window whose frames average more than this many seconds is "slow" (0.022 is about 45 fps). */
  slowSeconds?: number;
  /** At the lowest resolution, windows averaging more than this are "struggling" (0.04 is 25 fps). */
  struggleSeconds?: number;
  /** How many struggling windows in a row, at the lowest resolution, before giving up. */
  struggleWindows?: number;
}

export interface FrameGovernor {
  /**
   * Feed one frame. `seconds` is the time since the previous frame, `scrolling` is whether the
   * visitor is scrolling, `atLowest` is whether the resolution is already as low as it goes.
   */
  record(seconds: number, scrolling: boolean, atLowest: boolean): GovernorDecision;
  /** Forget everything seen so far (after the resolution changed, say). */
  reset(): void;
}

export function createFrameGovernor(options: FrameGovernorOptions = {}): FrameGovernor {
  const windowSize = options.window ?? 24;
  const slowSeconds = options.slowSeconds ?? 0.022;
  const struggleSeconds = options.struggleSeconds ?? 0.04;
  const struggleWindows = options.struggleWindows ?? 2;

  let sum = 0;
  let count = 0;
  let strikes = 0;
  let wasScrolling = false;

  const reset = () => {
    sum = 0;
    count = 0;
    strikes = 0;
  };

  function record(seconds: number, scrolling: boolean, atLowest: boolean): GovernorDecision {
    if (!scrolling) {
      // Standing still: nothing to learn, and the gap before the next scroll must not count.
      wasScrolling = false;
      sum = 0;
      count = 0;
      return "ok";
    }
    // The first frame of a scroll measures the pause before it, not the device.
    const first = !wasScrolling;
    wasScrolling = true;
    if (first || !(seconds > 0) || seconds >= 0.5) return "ok";

    // One long stall (a garbage collection, a photograph arriving) may count for at most four frames'
    // worth, so it cannot tip a window on its own; a device that is really that slow is slow in every frame.
    sum += Math.min(seconds, MOST_ONE_FRAME_COUNTS);
    count += 1;
    if (count < windowSize) return "ok";

    const average = sum / count;
    sum = 0;
    count = 0;

    if (average <= slowSeconds) {
      strikes = 0;
      return "ok";
    }
    if (!atLowest) {
      strikes = 0;
      return "lower";
    }
    if (average > struggleSeconds) {
      strikes += 1;
      if (strikes >= struggleWindows) {
        strikes = 0;
        return "give-up";
      }
    } else {
      strikes = 0;
    }
    return "ok";
  }

  return { record, reset };
}
