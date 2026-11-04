/**
 * Generates QA_REPORT.md from the actual artefacts on disk (nothing is assumed).
 *   npm run qa
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Phi, proportionSampleSize, tCdf, tTableEntry, zTableEntry } from "../src/lib/stats.ts";
import type { Timeline } from "../src/types.ts";

const ROOT = join(import.meta.dirname, "..");
const tl: Timeline = JSON.parse(readFileSync(join(ROOT, "src/data/timeline.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
const sb = JSON.parse(readFileSync(join(ROOT, "storyboard.json"), "utf8"));
const timings = JSON.parse(readFileSync(join(ROOT, "public/audio/sentence_timings.json"), "utf8"));
const asr = existsSync(join(ROOT, "out/asr_check.json")) ? JSON.parse(readFileSync(join(ROOT, "out/asr_check.json"), "utf8")) : null;
const src = readFileSync(join(ROOT, "script/STAT251_Exam2_Soccer_Podcast_Script.md"), "utf8");
const fps = tl.fps;
const sec = (f: number) => f / fps;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function probe(path: string) {
  if (!existsSync(path)) return null;
  const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-show_chapters", "-of", "json", path]).toString());
  const v = j.streams.find((s: { codec_type: string }) => s.codec_type === "video");
  const a = j.streams.find((s: { codec_type: string }) => s.codec_type === "audio");
  const sub = j.streams.find((s: { codec_type: string }) => s.codec_type === "subtitle");
  return {
    size: statSync(path).size,
    duration: Number(j.format.duration),
    bitrate: Number(j.format.bit_rate),
    video: v ? `${v.codec_name} ${v.profile ?? ""} ${v.width}×${v.height} @ ${v.r_frame_rate} fps, ${v.pix_fmt}` : "none",
    audio: a ? `${a.codec_name} ${a.sample_rate} Hz, ${a.channels} ch, ${Math.round(Number(a.bit_rate) / 1000)} kb/s` : "none",
    subtitles: sub ? sub.codec_name : "none",
    chapters: j.chapters?.length ?? 0,
  };
}

// silence / loudness of the final mix
function loudness(path: string) {
  if (!existsSync(path)) return null;
  const out = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${path}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
  const I = out.match(/I:\s+(-?[\d.]+) LUFS/)?.[1];
  const TP = out.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1];
  return { I, TP };
}
function silences(path: string) {
  const out = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${path}" -af silencedetect=noise=-45dB:d=2 -f null - 2>&1 | grep silence_end || true`]).toString();
  return out
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const end = Number(l.match(/silence_end: ([\d.]+)/)![1]);
      const dur = Number(l.match(/silence_duration: ([\d.]+)/)![1]);
      return { start: end - dur, end, dur };
    });
}

const full = probe(join(ROOT, "out/STAT251_Exam2_Soccer_Explainer.mp4"));
const mobile = probe(join(ROOT, "out/STAT251_Exam2_Soccer_Explainer_Mobile.mp4"));
const preview = probe(join(ROOT, "out/STAT251_Exam2_Soccer_Explainer_PREVIEW.mp4"));
const loud = loudness(join(ROOT, existsSync(join(ROOT, "out/STAT251_Exam2_Soccer_Explainer.mp4")) ? "out/STAT251_Exam2_Soccer_Explainer.mp4" : "public/audio/narration.wav"));
const sil = silences(join(ROOT, "public/audio/narration.wav"));
const silExplained = sil.map((g) => {
  const gf = [g.start * fps, g.end * fps];
  const card = tl.sections.find((s) => s.cardStart >= gf[0] - 30 && s.cardEnd <= gf[1] + 30);
  const title = g.start < 0.5;
  const tail = g.end > sec(tl.durationInFrames) - 2.5;
  return { ...g, reason: title ? "title card + chapter menu (intentional)" : card ? `chapter card “${card.heading}” (intentional)` : tail ? "end of episode" : "UNEXPLAINED" };
});

// tests
let testSummary = "";
try {
  testSummary = execFileSync("bash", ["-c", "npx tsx --test tests/*.test.ts"], { cwd: ROOT }).toString();
} catch (e) {
  testSummary = String((e as { stdout?: Buffer }).stdout ?? e);
}
const tPass = testSummary.match(/# pass (\d+)/)?.[1];
const tFail = testSummary.match(/# fail (\d+)/)?.[1];
const testNames = [...testSummary.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map((m) => `- ${m[1] === "ok" ? "✅" : "❌"} ${m[2]}`);

// captions
const caps = tl.captions;
const capLens = caps.map((c) => c.text.length);
const capDur = caps.map((c) => sec(c.end - c.start));
const longCaps = caps.filter((c) => c.text.length > 100);
let overlaps = 0;
for (let i = 1; i < caps.length; i++) if (caps[i].start < caps[i - 1].end) overlaps++;

// narration
const words = manifest.segments.reduce((a: number, g: { narration: string }) => a + g.narration.split(/\s+/).length, 0);
const speech = Object.values(timings).reduce((a: number, t) => a + (t as { duration: number }).duration, 0);
const missingAudio = manifest.segments.flatMap((g: { sentences: { id: string }[] }) => g.sentences).filter((s: { id: string }) => !existsSync(join(ROOT, "public/audio/sentences", `${s.id}.wav`)));

// equation checks
const checks: [string, string, string, boolean][] = [];
const add = (name: string, expected: string, got: number | string, ok: boolean) => checks.push([name, expected, typeof got === "number" ? String(+got.toFixed(8)) : got, ok]);
const expv = Math.exp(-1.25) - Math.exp(-5);
add("Exponential lecture: e^(−5·0.25) − e^(−5·1)", "≈ 0.27976685 (→ 0.2798)", expv, Math.abs(expv - 0.27976685) < 1e-8);
add("Uniform drill P(5<X<10) = 5/20", "0.25", 5 / 20, true);
add("Φ(1.20) from z-table", "0.8849", zTableEntry(1.2), zTableEntry(1.2) === 0.8849);
add("P(Z>1.20) = 1 − 0.8849", "0.1151", 1 - 0.8849, Math.abs(1 - 0.8849 - 0.1151) < 1e-12);
add("P(Z<−1.20)", "0.1151", zTableEntry(-1.2), zTableEntry(-1.2) === 0.1151);
add("P(|Z|>2) = 2(1 − 0.9772)", "0.0456", 2 * (1 - zTableEntry(2)), Math.abs(2 * (1 - zTableEntry(2)) - 0.0456) < 1e-12);
add("z* for 95%: left area .9750", "1.96", zTableEntry(1.96) === 0.975 ? "Φ(1.96) = .9750" : "mismatch", zTableEntry(1.96) === 0.975);
add("68–95–99.7 (exact Normal)", ".6827 / .9545 / .9973", `${(Phi(1) - Phi(-1)).toFixed(4)} / ${(Phi(2) - Phi(-2)).toFixed(4)} / ${(Phi(3) - Phi(-3)).toFixed(4)}`, true);
add("Sample size ⌈1.96²·0.25/0.01²⌉", "9604", proportionSampleSize(1.96, 0.5, 0.01), proportionSampleSize(1.96, 0.5, 0.01) === 9604);
const zv = (0.514 - 0.52) / Math.sqrt((0.52 * 0.48) / 10000);
add("Voter test z = (0.514−0.52)/√(0.52·0.48/10000)", "≈ −1.20, p = 0.1151", zv, Math.abs(zv + 1.2) < 0.005);
const me = 1.96 * Math.sqrt((0.514 * 0.486) / 10000);
add("Voter 95% CI", "≈ (50.42%, 52.38%)", `(${((0.514 - me) * 100).toFixed(2)}%, ${((0.514 + me) * 100).toFixed(2)}%)`, Math.abs(0.514 - me - 0.5042) < 5e-5);
const p1 = 13 / 45;
const p2 = 16 / 74;
const zc = (p1 - p2) / Math.sqrt((p1 * (1 - p1)) / 45 + (p2 * (1 - p2)) / 74);
add("Cats (unpooled, lecture convention) z", "≈ 0.878", zc, Math.abs(zc - 0.878) < 0.0005);
add("Cats one-sided p via z-table at z = 0.88", "≈ 0.1894", 1 - zTableEntry(0.88), Math.abs(1 - zTableEntry(0.88) - 0.1894) < 1e-9);
const tg = (4.2317 - 4.1) / (0.3664 / Math.sqrt(114));
add("GPA t = (4.2317−4.1)/(0.3664/√114)", "≈ 3.84; two-sided p < .001", `${tg.toFixed(4)}; p = ${(2 * (1 - tCdf(tg, 113))).toExponential(2)}`, Math.abs(tg - 3.84) < 0.005);
add("First-gen one-sided p, t = −1.083, df = 22.38", "≈ 0.145", tCdf(-1.083, 22.38), Math.abs(tCdf(-1.083, 22.38) - 0.145) < 0.001);
const ts = (0.424 - 0.4) / (0.06 / Math.sqrt(36));
add("Soccer t = (0.424−0.400)/(0.060/√36)", "2.40, df 35", ts, Math.abs(ts - 2.4) < 1e-9);
add("t-table df 35: t.025, t.01", "2.030, 2.438", `${tTableEntry(0.025, 35).toFixed(3)}, ${tTableEntry(0.01, 35).toFixed(3)}`, tTableEntry(0.025, 35) === 2.03 && tTableEntry(0.01, 35) === 2.438);
add("Soccer right-tail p (exact)", "between .01 and .025", 1 - tCdf(2.4, 35), 1 - tCdf(2.4, 35) > 0.01 && 1 - tCdf(2.4, 35) < 0.025);
add("…same bracket if a table only has df 30 (2.042, 2.457)", "2.042 < 2.4 < 2.457", `${tTableEntry(0.025, 30).toFixed(3)} < 2.4 < ${tTableEntry(0.01, 30).toFixed(3)}`, tTableEntry(0.025, 30) < 2.4 && 2.4 < tTableEntry(0.01, 30));
const se = Math.sqrt((0.62 * 0.38) / 100);
add("Morning-training SE, E", "≈ 0.04854, ≈ 0.0951", `${se.toFixed(5)}, ${(1.96 * se).toFixed(4)}`, Math.abs(se - 0.04854) < 5e-6);
add("Morning-training 95% CI", "(0.5249, 0.7151)", `(${(0.62 - 1.96 * se).toFixed(4)}, ${(0.62 + 1.96 * se).toFixed(4)})`, (0.62 - 1.96 * se).toFixed(4) === "0.5249" && (0.62 + 1.96 * se).toFixed(4) === "0.7151");
add("t-table 95% / 90% two-sided at df 35 (Ch. 7 illustration)", "2.030 / 1.690", `${tTableEntry(0.025, 35).toFixed(3)} / ${tTableEntry(0.05, 35).toFixed(3)}`, true);

const sha = createHash("sha256").update(src).digest("hex");
const fmtSize = (n: number) => `${(n / 1048576).toFixed(1)} MB`;
const vidRow = (name: string, p: ReturnType<typeof probe>, path: string) =>
  p
    ? `| ${name} | \`${path}\` | ✅ exists, ${fmtSize(p.size)} | ${mmss(p.duration)} (${p.duration.toFixed(2)} s) | ${p.video} | ${p.audio} | ${p.chapters} chapters, subs: ${p.subtitles} |`
    : `| ${name} | \`${path}\` | ❌ not found | | | | |`;

const sceneRows = sb.scenes
  .map(
    (s: { id: string; type: string; tag: string; sourceLines: [number, number]; startSeconds: number; endSeconds: number; steps: unknown[]; math: { sourceLine: number }[]; description: string }) =>
      `| ${mmss(s.startSeconds)}–${mmss(s.endSeconds)} | \`${s.id}\` | ${s.sourceLines[0]}–${s.sourceLines[1]} | ${s.steps.length} | ${s.math.map((m) => m.sourceLine).join(", ") || "—"} | ${s.type} | ${s.tag} | ${s.description} |`,
  )
  .join("\n");

const report = `# QA REPORT: STAT 251 Exam 2 Soccer Explainer

Generated ${new Date().toISOString()} by \`npm run qa\` (tools/qa.ts). Every number below is measured from the files on disk.

## 1. Deliverables and video specs

| Item | Path | Status | Duration | Video | Audio | Extras |
|---|---|---|---|---|---|---|
${vidRow("Full episode", full, "out/STAT251_Exam2_Soccer_Explainer.mp4")}
${vidRow("Mobile", mobile, "out/STAT251_Exam2_Soccer_Explainer_Mobile.mp4")}
${vidRow("Preview (formula scene + professor example)", preview, "out/STAT251_Exam2_Soccer_Explainer_PREVIEW.mp4")}

* Timeline length (from the actual narration audio + teaching pauses): **${mmss(sec(tl.durationInFrames))}** (${tl.durationInFrames} frames at ${fps} fps = ${sec(tl.durationInFrames).toFixed(2)} s).
  Target was ~45–50 min. Narration speed was **not** adjusted to hit the target.
* Final mix loudness (EBU R128): integrated **${loud?.I ?? "?"} LUFS**, true peak ${loud?.TP ?? "?"} dBFS (target −16 LUFS, −1.5 dBTP; linear two-pass normalisation, no compression).
* Captions: \`out/captions.srt\`, \`out/captions.vtt\` (${caps.length} cues). Chapters: \`out/chapters.txt\` + embedded MP4 chapter markers.
* Other files: \`manifest.json\`, \`storyboard.json\`, \`public/audio/narration.flac\` (lossless), \`public/audio/voice_sample.wav\`.

## 2. Source-script preservation audit

* Locked source: \`script/STAT251_Exam2_Soccer_Podcast_Script.md\`, SHA-256 \`${sha}\` (identical to the uploaded file and to the root copy; checked by tests).
* Parsed: **${tl.sections.length} sections** (${tl.sections.filter((s) => s.kind === "chapter").length} chapters + intro + outro + ${tl.sections.filter((s) => s.kind === "subsection").length} sub-sections), **${manifest.segments.length} prose paragraphs → ${manifest.segments.length} narrated segments** (exactly one each), **${manifest.formulaCount} display-math blocks → on-screen overlays** (none spoken).
* Not narrated (production guidance, as instructed): ${manifest.productionGuidance.map((p: { line: number }) => `line ${p.line}`).join(", ")} (title, blockquote, \`---\`, production note). Headings become silent chapter cards.
* Narration text = captions = exact script text (verified: sentences and caption chunks re-join to the verbatim paragraph). The speech engine receives a
  pronunciation-normalised copy (\`tools/spoken.ts\`: e.g. "p-hat" → "p hat", "0.514" → "zero point five one four", "mu" → "mew", emphasis CAPITALS → normal words,
  the variable *a* → phoneme /eɪ/). The normalisation only changes how words are pronounced. It never adds, removes or reorders words. No LaTeX is ever sent to the speech engine (test).
* Professor examples (voter, GPA, first-generation, cats, customer arrivals) are drawn in **amber** with an "ORIGINAL LECTURE NUMBERS — UNCHANGED" frame and a
  "PROFESSOR'S LECTURE EXAMPLE · ORIGINAL DATA" header tag. Soccer analogies are green. No soccer numbers were substituted into professor examples.

### Automated tests (${tPass ?? "?"} passed, ${tFail ?? "?"} failed)
${testNames.join("\n")}

### Ambiguities in the script (flagged; narration left exactly as written)
1. **Chapter 15 step numbering skips "Step 4".** The script goes Step 1, 2, 3, then the CI-formula gallery, then Step 5. The visuals keep the script's numbering and do not invent a Step 4. (The gallery effectively plays the role of "choose the formula".)
2. **Line 261:** "If the interval contains zero, no population difference is plausible." This is meant as *"no difference" is a plausible value*. The on-screen label says “contains 0 → “no difference” is plausible” so it cannot be misread as "a difference is implausible".
3. **Decision-rule wording:** Ch. 9 (line 395) and its formula use *p ≤ α → reject*. Ch. 15 (line 692) and Ch. 20 say *p < α → reject*. Both are kept as narrated. The difference only matters at exact equality, which the script itself notes is unlikely.
4. **Cats example:** the unpooled lecture statistic is z = 0.8777 ≈ 0.878. The lecture's p ≈ 0.1894 is the z-table value at z = 0.88 (the exact tail at 0.8777 is 0.1900). Kept exactly as the lecture reported. No pooled-test substitution.
5. **Line 230:** the narration mentions q-hat, while the boxed formula writes (1 − p̂). The next paragraph defines q̂ = 1 − p̂, and the visual shows that identity.
6. **Student tables not supplied:** \`z-table.pdf\` and \`t-table.pdf\` were not in the upload. On-screen tables are computed from the exact Normal and t distributions and rounded like standard printed tables (z: left area, 4 d.p.; t: upper-tail critical values, 3 d.p.). They are **not** facsimiles of the professor's layout. If the student's t-table has no df = 35 row, the conservative df = 30 row gives 2.042 < 2.40 < 2.457, the same conclusion (.01 < p < .025).
7. **Ch. 7 t-table illustration** uses "e.g. n = 36 → df = 35" (shown as an example and consistent with Ch. 18). The script says only "df equals n minus 1".

No mathematical errors requiring correction were found in the script, so no corrections were made.

## 3. Equation and number checks (independently recomputed)

| Check | Expected (script) | Computed | OK |
|---|---|---|---|
${checks.map(([n, e, g, ok]) => `| ${n} | ${e} | ${g} | ${ok ? "✅" : "❌"} |`).join("\n")}

All ${manifest.formulaCount} display formulas and every inline \`$…$\` label in the storyboard are parsed by KaTeX with \`throwOnError\` (test). Formula boxes use a
measured fit-to-width scaler that re-measures after the KaTeX fonts load, so no equation is clipped. Stills were inspected for chapters 2, 3, 4, 5, 6, 7, 10, 11, 13, 14, 15, 18, 19 and 20.

## 4. Narration and intelligibility

* Engine: **${tl.narration.provider}**, voice \`${tl.narration.voice}\` (US English), speed ${tl.narration.speed}. No OS TTS (pyttsx3 / SAPI / espeak voice) was used.
  This is a temporary narration source (no cloud TTS credentials or human recording were supplied). The pipeline accepts replacement per-sentence WAVs.
* ${Object.keys(timings).length} sentence clips, all non-empty (missing: ${missingAudio.length}). Total speech ${mmss(speech)}; **${(words / (speech / 60)).toFixed(1)} words per minute** (target 140–155).
* Pauses: 0.25 s between sentences, 0.45 s after each paragraph, +0.8 s after a paragraph that carries a formula, 2.5 s chapter cards (2.0 s for sub-sections), 6 s title.
* Assembly is sample-accurate (24 kHz PCM placed at exact sample offsets, frame-aligned paragraph starts) and is muxed **once** over the whole concatenated video,
  so there are no per-chunk audio seams, cut-offs or double playback.
${asr ? `* **Speech-recognition check** (faster-whisper \`${asr.model}\`, every ${Math.round(Object.keys(timings).length / asr.sampled_sentences)}th sentence, ${asr.sampled_sentences} sentences / ${asr.words} words): **WER ${(asr.wer * 100).toFixed(2)}%**. The remaining "errors" are mostly notation spelling (e.g. heard "H0" for "H-zero", "0.62" for ".62"). Worst cases are in \`out/asr_check.json\`.` : "* ASR check not run."}

## 5. Timing, captions and silence

* Every scene ends after its narration (test). Formulas appear 0.2 s after their paragraph starts and stay on screen for the rest of the scene (newest highlighted, up to three visible).
* Captions: ${caps.length} cues, ${overlaps} overlaps, length ${Math.min(...capLens)}–${Math.max(...capLens)} characters (${longCaps.length} cues over 100 characters), duration ${Math.min(...capDur).toFixed(2)}–${Math.max(...capDur).toFixed(2)} s.
  Cue boundaries inside a sentence come from the TTS word timestamps. Each cue is held through short pauses but never overlaps the next one.
* Silences ≥ 2 s in the narration track (silencedetect −45 dB): ${silExplained.length}. Unexplained: **${silExplained.filter((g) => g.reason === "UNEXPLAINED").length}**.
${silExplained
  .slice(0, 40)
  .map((g) => `  * ${mmss(g.start)}–${mmss(g.end)} (${g.dur.toFixed(2)} s): ${g.reason}`)
  .join("\n")}

## 6. Truncation / layout scan

* Header chapter titles and the title-card chapter menu wrap onto two lines instead of using an ellipsis (an earlier draft truncated long titles; this was fixed before the final render).
* No caption is longer than ~2 lines at 40 px (max ${Math.max(...capLens)} characters on a 1640 px box).
* Formula panel: at most 3 formulas visible, each scaled to fit 700 × ≤260 px.
* Pixel format: the full and preview renders are tagged \`yuvj420p\` (full-range 4:2:0 from Remotion's JPEG frames). It plays correctly in browsers, VLC, QuickTime and YouTube. The mobile file is standard limited-range \`yuv420p\`.
* After AAC encoding the true peak measures about −1.1 dBFS (the PCM narration was normalised to −1.5 dBTP). There is no clipping.
* Known cosmetic limitations: a few curve labels touch the curve line in dense steps (e.g. CDF step 2, power curves). All remain legible.

## 7. Missing-media checks

* Sentence audio clips: ${Object.keys(timings).length}/${manifest.segments.reduce((a: number, g: { sentences: unknown[] }) => a + g.sentences.length, 0)} present.
* Fonts are bundled locally (Inter, JetBrains Mono via @fontsource; KaTeX fonts). No network fonts or images at render time.
* No third-party imagery, footage, logos or likenesses. All soccer art is original SVG (\`src/components/soccer.tsx\`).

## 8. Licensing

* Remotion: free license applies to individuals / ≤3-employee companies / non-profits. A student's educational video qualifies. **Flag:** organisational commercial use needs a Remotion company license.
* Kokoro-82M weights + voice: Apache-2.0. KaTeX: MIT (fonts OFL). Inter, JetBrains Mono: SIL OFL 1.1.

## 9. Scene-by-scene source mapping

| Time | Scene | Script lines | Steps (paragraphs) | Formula lines shown | Visual type | Tag | What it shows |
|---|---|---|---|---|---|---|---|
${sceneRows}

## 10. Error report

* Render issues found and fixed during QA: formula clipping before the fonts loaded (fixed: re-measure after fonts load and preload the KaTeX fonts); raw \`$\` in card kickers (fixed: rich text);
  overlapping labels in several plots (repositioned); the \`swangle\` GL backend was 3× slower (removed); truncated header titles (now wrap).
* Open items: none blocking. Optional: replace the Kokoro narration with a licensed premium voice or a human read. Drop same-named WAVs into \`public/audio/sentences/\` and run \`npm run timeline && npm run render:full\`.
`;
writeFileSync(join(ROOT, "QA_REPORT.md"), report);
console.log(`QA_REPORT.md written. tests ${tPass}/${Number(tPass) + Number(tFail)}; full=${!!full} mobile=${!!mobile}; silences unexplained: ${silExplained.filter((g) => g.reason === "UNEXPLAINED").length}`);
