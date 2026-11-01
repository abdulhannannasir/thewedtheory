import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFrameGovernor, type GovernorDecision } from "../src/lib/gl/frame-governor.ts";

/** Feeds `frames` frames of `seconds` each while scrolling; returns every decision that was not "ok". */
function run(
  governor: ReturnType<typeof createFrameGovernor>,
  frames: number,
  seconds: number,
  atLowest = false,
): GovernorDecision[] {
  const decisions: GovernorDecision[] = [];
  for (let i = 0; i < frames; i += 1) {
    const decision = governor.record(seconds, true, atLowest);
    if (decision !== "ok") decisions.push(decision);
  }
  return decisions;
}

describe("createFrameGovernor", () => {
  it("leaves a device that holds 60 fps alone", () => {
    assert.deepEqual(run(createFrameGovernor(), 400, 1 / 60), []);
  });

  it("lowers the resolution for a device stuck at 30 fps, within about a second", () => {
    const governor = createFrameGovernor();
    // 1 frame to start the scroll, then a 24-frame window: one decision, after 25 frames (0.8 s at 30 fps).
    assert.deepEqual(run(governor, 24, 1 / 30), []);
    assert.deepEqual(run(governor, 1, 1 / 30), ["lower"]);
  });

  it("is not moved by a single slow frame", () => {
    const governor = createFrameGovernor();
    governor.record(1 / 60, true, false);
    const decisions: GovernorDecision[] = [];
    for (let i = 0; i < 120; i += 1) {
      const decision = governor.record(i === 50 ? 0.2 : 1 / 60, true, false);
      if (decision !== "ok") decisions.push(decision);
    }
    assert.deepEqual(decisions, []);
  });

  it("ignores frames drawn while the page is still", () => {
    const governor = createFrameGovernor();
    for (let i = 0; i < 200; i += 1) assert.equal(governor.record(1 / 24, false, false), "ok");
  });

  it("does not count the pause before a scroll as a slow frame", () => {
    const governor = createFrameGovernor();
    for (let i = 0; i < 50; i += 1) governor.record(1 / 24, false, false);
    // The first scrolling frame spans the idle gap; if it counted, 24 such frames would not be needed to notice.
    assert.deepEqual(run(governor, 24, 1 / 60), []);
  });

  it("ignores gaps of half a second or more (a tab that was in the background)", () => {
    const governor = createFrameGovernor();
    governor.record(1 / 60, true, false);
    for (let i = 0; i < 100; i += 1) assert.equal(governor.record(2, true, false), "ok");
  });

  it("keeps a device at 30 fps in 3D once the resolution is as low as it goes", () => {
    // 30 fps is slow but not struggling: it is what a phone in low-power mode delivers.
    assert.deepEqual(run(createFrameGovernor(), 400, 1 / 30, true), []);
  });

  it("gives up only after two struggling windows in a row at the lowest resolution", () => {
    const governor = createFrameGovernor();
    assert.deepEqual(run(governor, 25, 0.05, true), []); // first window: a strike
    assert.deepEqual(run(governor, 24, 0.05, true), ["give-up"]); // second window
  });

  it("forgives a struggling window that is followed by a good one", () => {
    const governor = createFrameGovernor();
    run(governor, 25, 0.05, true);
    assert.deepEqual(run(governor, 24, 1 / 60, true), []);
    assert.deepEqual(run(governor, 24, 0.05, true), []); // a fresh first strike, not a second
  });

  it("keeps asking to lower the resolution while there is room, not to give up", () => {
    const governor = createFrameGovernor();
    assert.deepEqual(run(governor, 25, 0.05, false), ["lower"]);
    assert.deepEqual(run(governor, 24, 0.05, false), ["lower"]);
  });
});
