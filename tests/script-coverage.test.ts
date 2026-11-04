/** Source-script preservation: every prose paragraph ↔ exactly one narrated segment; every formula ↔ an overlay. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { parseScript } from "../tools/parse-script.ts";
import type { Timeline } from "../src/types.ts";

const ROOT = join(import.meta.dirname, "..");
const src = readFileSync(join(ROOT, "script/STAT251_Exam2_Soccer_Podcast_Script.md"), "utf8");
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
const tl: Timeline = JSON.parse(readFileSync(join(ROOT, "src/data/timeline.json"), "utf8"));

test("locked script checksum unchanged and root copy identical", () => {
  const recorded = readFileSync(join(ROOT, "script/STAT251_Exam2_Soccer_Podcast_Script.sha256"), "utf8").split(/\s+/)[0];
  const sha = createHash("sha256").update(src).digest("hex");
  assert.equal(sha, recorded);
  assert.equal(sha, "75f273b53dfbd62c1c898daf45d2ed903262048828fd5f41406b291749b3c22b");
  assert.equal(readFileSync(join(ROOT, "STAT251_Exam2_Soccer_Podcast_Script.md"), "utf8"), src);
  assert.equal(manifest.sourceSha256, sha);
});

test("manifest is a fresh parse of the locked script", () => {
  const fresh = parseScript(src);
  assert.deepEqual(
    fresh.segments.map((s) => [s.id, s.narration, s.mathOverlays]),
    manifest.segments.map((s: { id: string; narration: string; mathOverlays: string[] }) => [s.id, s.narration, s.mathOverlays]),
  );
});

test("every non-production prose paragraph maps to exactly one narrated segment (verbatim)", () => {
  const lines = src.split(/\r?\n/);
  const prose: { line: number; text: string }[] = [];
  let tail = false;
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (!l) return;
    if (l === "---") tail = true;
    if (tail || l.startsWith("#") || l.startsWith(">") || l.startsWith("\\[") || l.startsWith("**Production")) return;
    prose.push({ line: i + 1, text: l });
  });
  assert.equal(prose.length, manifest.segments.length, "no missing and no extra narration");
  for (const p of prose) {
    const hits = manifest.segments.filter((s: { sourceLine: number; narration: string }) => s.sourceLine === p.line);
    assert.equal(hits.length, 1, `line ${p.line}`);
    assert.equal(hits[0].narration, p.text, `verbatim line ${p.line}`);
  }
});

test("sentences and caption chunks reassemble the exact paragraph text", () => {
  for (const seg of manifest.segments) {
    const sentences = seg.sentences.map((s: { display: string }) => s.display);
    assert.equal(sentences.join(" "), seg.narration, seg.id);
    for (const s of seg.sentences) assert.equal(s.captionChunks.join(" "), s.display, s.id);
  }
});

test("captions in the timeline reproduce every paragraph exactly once, in order", () => {
  const bySeg = new Map<string, string[]>();
  for (const c of tl.captions) bySeg.set(c.segmentId, [...(bySeg.get(c.segmentId) ?? []), c.text]);
  for (const seg of manifest.segments) assert.equal((bySeg.get(seg.id) ?? []).join(" "), seg.narration, seg.id);
  assert.equal(bySeg.size, manifest.segments.length);
});

test("every display-math block maps to an on-screen overlay in the timeline", () => {
  const formulas: { line: number; tex: string }[] = [];
  src.split(/\r?\n/).forEach((raw, i) => {
    const l = raw.trim();
    if (l.startsWith("\\[")) formulas.push({ line: i + 1, tex: l.slice(2, -2) });
  });
  assert.equal(formulas.length, 59);
  const onScreen = tl.scenes.flatMap((s) => s.math);
  for (const f of formulas) {
    const hits = onScreen.filter((m) => m.sourceLine === f.line);
    assert.ok(hits.length >= 1, `formula line ${f.line} not on screen`);
    assert.equal(hits[0].tex, f.tex, `formula text line ${f.line}`);
  }
});

test("TTS input never contains LaTeX and keeps every content word in order", () => {
  for (const seg of manifest.segments)
    for (const s of seg.sentences) {
      assert.ok(!/\\(frac|sqrt|hat|bar|mu|sigma|int)\b/.test(s.spoken), s.id);
      assert.ok(s.spoken.length > 0, s.id);
    }
});
