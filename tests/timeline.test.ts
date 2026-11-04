/** Timeline / audio / caption integrity. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import type { Timeline } from "../src/types.ts";

const ROOT = join(import.meta.dirname, "..");
const tl: Timeline = JSON.parse(readFileSync(join(ROOT, "src/data/timeline.json"), "utf8"));
const timings = JSON.parse(readFileSync(join(ROOT, "public/audio/sentence_timings.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));

test("runtime derives from audio and lands near 45–50 minutes", () => {
  const min = tl.durationInFrames / tl.fps / 60;
  assert.ok(min > 44 && min < 51, `${min} min`);
  assert.equal(tl.fps, 30);
  assert.equal(tl.width, 1920);
  assert.equal(tl.height, 1080);
});

test("every sentence has non-empty audio", () => {
  for (const seg of manifest.segments)
    for (const s of seg.sentences) {
      assert.ok(timings[s.id], s.id);
      assert.ok(timings[s.id].duration > 0.3, s.id);
    }
});

test("no scene/segment ends before its narration ends", () => {
  for (const seg of tl.segments) {
    assert.ok(seg.end >= seg.audioEnd + 10, seg.id);
    assert.ok(seg.audioStart >= seg.start, seg.id);
  }
  for (const sc of tl.scenes) for (const id of sc.segmentIds) assert.ok(tl.segments.find((s) => s.id === id)!.end <= sc.end);
});

test("captions are ordered, non-overlapping, and inside the narration windows", () => {
  for (let i = 1; i < tl.captions.length; i++) {
    assert.ok(tl.captions[i].start >= tl.captions[i - 1].end, `overlap at caption ${i}`);
  }
  for (const c of tl.captions) {
    const seg = tl.segments.find((s) => s.id === c.segmentId)!;
    assert.ok(c.start >= seg.audioStart - 1 && c.start <= seg.audioEnd, `caption start outside narration: ${c.text}`);
  }
});

test("silent gaps longer than 2 s occur only at intentional chapter cards", () => {
  const segs = tl.segments;
  for (let i = 1; i < segs.length; i++) {
    const gap = (segs[i].audioStart - segs[i - 1].audioEnd) / tl.fps;
    if (gap > 2) {
      const card = tl.sections.find((s) => s.cardStart >= segs[i - 1].audioEnd && s.cardEnd <= segs[i].audioStart);
      assert.ok(card, `unexplained ${gap.toFixed(2)} s gap before ${segs[i].id}`);
    }
  }
});

test("narration track exists with exactly the composition length", () => {
  const buf = readFileSync(join(ROOT, "public/audio/narration.wav"));
  let off = 12;
  let samples = -1;
  while (off < buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "data") {
      samples = size / 2;
      break;
    }
    off += 8 + size + (size % 2);
  }
  assert.equal(samples, tl.durationInFrames * 800);
});

test("no duplicated narration segment", () => {
  const texts = tl.segments.map((s) => `${s.sourceLine}`);
  assert.equal(new Set(texts).size, texts.length);
});
