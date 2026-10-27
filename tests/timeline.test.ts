import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HOLD, activeScene, frameAt, progressForScene } from "../src/lib/journey/timeline.ts";

const COUNT = 5;
const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not ${expected}`);

describe("frameAt", () => {
  it("starts on the first scene with no camera push, doorway shut, text fully visible", () => {
    const frame = frameAt(0, COUNT);
    assert.equal(frame.from, 0);
    assert.equal(frame.arch, 0);
    assert.equal(frame.dolly[0], 0);
    assert.equal(frame.text[0], 1);
    assert.equal(frame.text[1], 0);
  });

  it("ends on the last scene with its text fully visible", () => {
    const frame = frameAt(1, COUNT);
    assert.equal(frame.to, COUNT - 1);
    assert.equal(frame.arch, 1);
    close(frame.text[COUNT - 1], 1);
    close(frame.text[COUNT - 2], 0);
  });

  it("keeps the doorway shut for the whole hold, then opens it", () => {
    const segment = 1 / (COUNT - 1);
    assert.equal(frameAt(segment * (HOLD - 0.01), COUNT).arch, 0);
    assert.ok(frameAt(segment * 0.8, COUNT).arch > 0);
    assert.ok(frameAt(segment * 0.8, COUNT).arch < 1);
  });

  it("is continuous across the boundary between two segments", () => {
    const boundary = 2 / (COUNT - 1);
    const before = frameAt(boundary - 1e-6, COUNT);
    const after = frameAt(boundary + 1e-6, COUNT);
    for (let scene = 0; scene < COUNT; scene += 1) {
      close(before.text[scene], after.text[scene], 1e-3);
      close(before.dolly[scene], after.dolly[scene], 1e-3);
    }
  });

  it("never shows two scenes' text at full strength together", () => {
    for (let step = 0; step <= 1000; step += 1) {
      const { text } = frameAt(step / 1000, COUNT);
      const visible = text.filter((opacity) => opacity > 0.5).length;
      assert.ok(visible <= 1, `at ${step / 1000} ${visible} scenes are more than half visible`);
      for (const opacity of text) assert.ok(opacity >= 0 && opacity <= 1);
    }
  });

  it("pushes the camera forward steadily, never backward", () => {
    for (let scene = 0; scene < COUNT; scene += 1) {
      let previous = -1;
      for (let step = 0; step <= 200; step += 1) {
        const value = frameAt(step / 200, COUNT).dolly[scene];
        assert.ok(value >= previous);
        previous = value;
      }
    }
  });

  it("clamps progress outside 0..1 and copes with a single scene", () => {
    assert.deepEqual(frameAt(-3, COUNT), frameAt(0, COUNT));
    assert.deepEqual(frameAt(9, COUNT), frameAt(1, COUNT));
    const single = frameAt(0.5, 1);
    assert.equal(single.text[0], 1);
    assert.equal(single.arch, 0);
  });
});

describe("scene controls", () => {
  it("jumps to a scene's own progress and reads back the same scene", () => {
    for (let scene = 0; scene < COUNT; scene += 1) {
      assert.equal(activeScene(progressForScene(scene, COUNT), COUNT), scene);
    }
  });
});
