/**
 * Builds the frame-accurate timeline from the ACTUAL synthesized audio:
 *   manifest.json + public/audio/sentence_timings.json + src/storyboard.ts
 *   → src/data/timeline.json, storyboard.json, manifest.json (timing fields filled),
 *     public/audio/narration.wav (sample-accurate assembly, loudness-normalised),
 *     out/captions.srt, out/captions.vtt, out/chapters.txt, out/ffmetadata.txt
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Manifest, ManifestSegment } from "./parse-script.ts";
import { STORYBOARD } from "../src/storyboard.ts";
import { toSpoken } from "./spoken.ts";
import type { Timeline, TLCaption, TLScene, TLSection, TLSegment } from "../src/types.ts";

const ROOT = join(import.meta.dirname, "..");
const FPS = 30;
const SR = 24000;
const SPF = SR / FPS; // samples per frame = 800

// pacing (seconds) — teaching pauses, not speed changes
const TITLE_S = 6.0;
const CARD_S = { intro: 2.5, chapter: 2.5, outro: 2.5, subsection: 2.0 } as const;
const LEAD_S = 0.17;
const SENTENCE_GAP_S = 0.25;
const TAIL_S = 0.45;
const MATH_TAIL_S = 0.8; // extra pause after a paragraph that carries a formula

interface SentTiming {
  duration: number;
  words: [string, number, number][];
  voice: string;
  speed: number;
}

const manifest: Manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
const timings: Record<string, SentTiming> = JSON.parse(readFileSync(join(ROOT, "public/audio/sentence_timings.json"), "utf8"));

/* ---------- scene coverage ---------- */
const segScene = new Map<string, string>();
for (const seg of manifest.segments) {
  const hits = STORYBOARD.filter((d) => seg.sourceLine >= d.lines[0] && seg.sourceLine <= d.lines[1]);
  if (hits.length !== 1) throw new Error(`Segment ${seg.id} (line ${seg.sourceLine}) covered by ${hits.length} scenes`);
  segScene.set(seg.id, hits[0].id);
}
for (const d of STORYBOARD) {
  if (![...segScene.values()].includes(d.id)) throw new Error(`Scene ${d.id} covers no narrated paragraph`);
}

/* ---------- timing ---------- */
const f = (s: number) => Math.round(s * FPS);
let frame = f(TITLE_S);
const titleFrames = frame;
const sections: TLSection[] = [];
const segments: TLSegment[] = [];
const captions: TLCaption[] = [];
const placements: { id: string; sample: number }[] = [];

const alnum = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).length;

function captionTimes(seg: ManifestSegment, sentIdx: number, startSec: number) {
  const sent = seg.sentences[sentIdx];
  const tm = timings[sent.id];
  const chunks = sent.captionChunks;
  const out: { text: string; s: number; e: number }[] = [];
  if (chunks.length === 1) {
    out.push({ text: chunks[0], s: startSec, e: startSec + tm.duration });
    return out;
  }
  // fraction of spoken letters per chunk → time via the TTS word timestamps
  const chunkLetters = chunks.map((c) => alnum(toSpoken(c)));
  const total = chunkLetters.reduce((a, b) => a + b, 0);
  const words = tm.words.filter(([w]) => alnum(w) > 0);
  const wl = words.map(([w]) => alnum(w));
  const wTotal = wl.reduce((a, b) => a + b, 0);
  const timeAtFraction = (fr: number) => {
    if (!words.length) return fr * tm.duration;
    let acc = 0;
    for (let i = 0; i < words.length; i++) {
      const next = acc + wl[i] / wTotal;
      if (next >= fr - 1e-9) {
        // boundary between words: snap to end of this word / start of next
        return i + 1 < words.length ? (words[i][2] + words[i + 1][1]) / 2 : words[i][2];
      }
      acc = next;
    }
    return tm.duration;
  };
  let cum = 0;
  let prev = 0;
  chunks.forEach((c, k) => {
    cum += chunkLetters[k];
    const end = k === chunks.length - 1 ? tm.duration : timeAtFraction(cum / total);
    out.push({ text: c, s: startSec + prev, e: startSec + end });
    prev = end;
  });
  return out;
}

for (const sec of manifest.sections) {
  const card = f(CARD_S[sec.kind]);
  const tlSec: TLSection = { id: sec.id, heading: sec.heading, kind: sec.kind, chapterNumber: sec.chapterNumber, parentChapter: sec.parentChapter, cardStart: frame, cardEnd: frame + card, end: 0 };
  frame += card;
  for (const seg of manifest.segments.filter((s) => s.sectionId === sec.id)) {
    const start = frame;
    const audioStartSec = (start + f(LEAD_S)) / FPS;
    let t = audioStartSec;
    seg.sentences.forEach((sent, k) => {
      const tm = timings[sent.id];
      if (!tm || !(tm.duration > 0)) throw new Error(`Missing/empty audio for ${sent.id}`);
      placements.push({ id: sent.id, sample: Math.round(t * SR) });
      for (const c of captionTimes(seg, k, t)) captions.push({ text: c.text, start: Math.round(c.s * FPS), end: Math.round(c.e * FPS), segmentId: seg.id });
      t += tm.duration + (k < seg.sentences.length - 1 ? SENTENCE_GAP_S : 0);
    });
    const audioEndSec = t;
    const end = Math.ceil(audioEndSec * FPS) + f(TAIL_S + (seg.mathOverlays.length ? MATH_TAIL_S : 0));
    segments.push({
      id: seg.id,
      sectionId: seg.sectionId,
      sourceLine: seg.sourceLine,
      narration: seg.narration,
      start,
      end,
      audioStart: Math.round(audioStartSec * FPS),
      audioEnd: Math.ceil(audioEndSec * FPS),
      math: seg.mathOverlays,
      mathSourceLines: seg.mathSourceLines,
      scene: segScene.get(seg.id)!,
      step: 0,
    });
    seg.audioFile = "public/audio/narration.wav";
    seg.audioStartSeconds = +audioStartSec.toFixed(3);
    seg.audioDurationSeconds = +(audioEndSec - audioStartSec).toFixed(3);
    frame = end;
  }
  tlSec.end = frame;
  sections.push(tlSec);
}
const durationInFrames = frame + f(1.0);

// caption hold: keep a cue up through short pauses, never overlapping the next cue
for (let i = 0; i < captions.length; i++) {
  const next = captions[i + 1];
  const hold = captions[i].end + f(0.6);
  captions[i].end = next ? Math.min(hold, next.start) : Math.min(hold, durationInFrames);
  if (captions[i].end <= captions[i].start) captions[i].end = captions[i].start + 1;
}

/* ---------- scenes ---------- */
const scenes: TLScene[] = STORYBOARD.map((d) => {
  const segs = segments.filter((s) => s.scene === d.id);
  segs.forEach((s, k) => (s.step = k));
  const start = segs[0].start;
  const end = segs[segs.length - 1].end;
  const sec = sections.find((x) => x.id === segs[0].sectionId)!;
  return {
    id: d.id,
    type: d.type,
    tag: d.tag,
    start,
    end,
    sectionId: segs[0].sectionId,
    chapterNumber: sec.kind === "subsection" ? sec.parentChapter : sec.chapterNumber ?? 0,
    segmentIds: segs.map((s) => s.id),
    stepStarts: segs.map((s) => s.start - start),
    stepAudioEnds: segs.map((s) => s.audioEnd - start),
    math: segs.flatMap((s) => s.math.map((tex, i) => ({ tex, sourceLine: s.mathSourceLines[i], appear: s.audioStart - start + 6, segmentId: s.id }))),
    firstLine: d.lines[0],
    lastLine: d.lines[1],
  };
});
// scenes must be contiguous and ordered
scenes.sort((a, b) => a.start - b.start);
for (let i = 1; i < scenes.length; i++) {
  if (scenes[i].start < scenes[i - 1].end) throw new Error(`Scene overlap ${scenes[i - 1].id} / ${scenes[i].id}`);
}

const first = Object.values(timings)[0];
const tl: Timeline = {
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames,
  titleFrames,
  sections,
  scenes,
  segments,
  captions,
  audioFile: "audio/narration.wav",
  audioDurationSeconds: durationInFrames / FPS,
  generatedAt: new Date().toISOString(),
  narration: { provider: "kokoro-82m (local neural TTS, Apache-2.0)", voice: first.voice, speed: first.speed },
};
mkdirSync(join(ROOT, "src/data"), { recursive: true });
writeFileSync(join(ROOT, "src/data/timeline.json"), JSON.stringify(tl));

/* ---------- manifest + storyboard ---------- */
for (const seg of manifest.segments) {
  const d = STORYBOARD.find((x) => x.id === segScene.get(seg.id))!;
  seg.visualType = d.type;
  seg.visualDescription = d.description;
  (seg as unknown as { captions: TLCaption[] }).captions = captions
    .filter((c) => c.segmentId === seg.id)
    .map((c) => ({ ...c, startSeconds: +(c.start / FPS).toFixed(3), endSeconds: +(c.end / FPS).toFixed(3) }));
}
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2));
writeFileSync(
  join(ROOT, "storyboard.json"),
  JSON.stringify(
    {
      fps: FPS,
      durationSeconds: +(durationInFrames / FPS).toFixed(2),
      chapters: sections.map((s) => ({ id: s.id, heading: s.heading, kind: s.kind, cardStartSeconds: +(s.cardStart / FPS).toFixed(2), endSeconds: +(s.end / FPS).toFixed(2) })),
      scenes: scenes.map((sc) => {
        const d = STORYBOARD.find((x) => x.id === sc.id)!;
        return {
          id: sc.id,
          type: sc.type,
          tag: sc.tag,
          sourceLines: d.lines,
          description: d.description,
          startSeconds: +(sc.start / FPS).toFixed(2),
          endSeconds: +(sc.end / FPS).toFixed(2),
          steps: sc.segmentIds.map((id, k) => ({ segmentId: id, startSeconds: +((sc.start + sc.stepStarts[k]) / FPS).toFixed(2) })),
          math: sc.math.map((m) => ({ sourceLine: m.sourceLine, tex: m.tex, appearSeconds: +((sc.start + m.appear) / FPS).toFixed(2) })),
        };
      }),
    },
    null,
    2,
  ),
);

/* ---------- audio assembly (sample-accurate) ---------- */
function readPcm16(path: string): Int16Array {
  const buf = readFileSync(path);
  let off = 12;
  while (off < buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") {
      const fmt = buf.readUInt16LE(off + 8);
      const ch = buf.readUInt16LE(off + 10);
      const sr = buf.readUInt32LE(off + 12);
      const bits = buf.readUInt16LE(off + 22);
      if (fmt !== 1 || ch !== 1 || sr !== SR || bits !== 16) throw new Error(`${path}: unexpected format ${fmt}/${ch}/${sr}/${bits}`);
    }
    if (id === "data") return new Int16Array(buf.buffer.slice(buf.byteOffset + off + 8, buf.byteOffset + off + 8 + size));
    off += 8 + size + (size % 2);
  }
  throw new Error(`${path}: no data chunk`);
}
function wavHeader(samples: number): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + samples * 2, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(samples * 2, 40);
  return h;
}
const totalSamples = durationInFrames * SPF;
const mixBuf = new Int16Array(totalSamples);
let lastEnd = 0;
for (const p of placements.sort((a, b) => a.sample - b.sample)) {
  const pcm = readPcm16(join(ROOT, "public/audio/sentences", `${p.id}.wav`));
  if (p.sample < lastEnd) throw new Error(`audio overlap at ${p.id}`);
  mixBuf.set(pcm, p.sample);
  lastEnd = p.sample + pcm.length;
}
const rawPath = join(ROOT, "public/audio/narration_raw.wav");
writeFileSync(rawPath, Buffer.concat([wavHeader(totalSamples), Buffer.from(mixBuf.buffer)]));

// loudness normalisation (EBU R128, two-pass, linear gain → no timing change)
const finalPath = join(ROOT, "public/audio/narration.wav");
const measure = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${rawPath}" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`]).toString();
const m = JSON.parse(measure);
execFileSync("ffmpeg", [
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-i",
  rawPath,
  "-af",
  `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  "-ar",
  String(SR),
  "-ac",
  "1",
  "-c:a",
  "pcm_s16le",
  finalPath + ".tmp.wav",
]);
renameSync(finalPath + ".tmp.wav", finalPath);
execFileSync("rm", ["-f", rawPath]);

/* ---------- captions + chapters ---------- */
mkdirSync(join(ROOT, "out"), { recursive: true });
const ts = (fr: number, sep: string) => {
  const ms = Math.round((fr / FPS) * 1000);
  const h = Math.floor(ms / 3600000);
  const mi = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}${sep}${String(ms % 1000).padStart(3, "0")}`;
};
writeFileSync(join(ROOT, "out/captions.srt"), captions.map((c, i) => `${i + 1}\n${ts(c.start, ",")} --> ${ts(c.end, ",")}\n${c.text}\n`).join("\n"));
writeFileSync(join(ROOT, "out/captions.vtt"), "WEBVTT\n\n" + captions.map((c, i) => `${i + 1}\n${ts(c.start, ".")} --> ${ts(c.end, ".")}\n${c.text}\n`).join("\n"));
const chapterList = sections.filter((s) => s.kind !== "subsection");
const mmss = (fr: number) => {
  const s = Math.floor(fr / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
writeFileSync(join(ROOT, "out/chapters.txt"), ["0:00 Title & chapter menu", ...sections.map((s) => `${mmss(s.cardStart)} ${s.kind === "subsection" ? "  · " : ""}${s.heading}`)].join("\n") + "\n");
let meta = ";FFMETADATA1\ntitle=STAT 251 Exam 2 — Soccer Edition\n";
const chapStarts = [{ start: 0, title: "Title & chapter menu" }, ...chapterList.map((s) => ({ start: s.cardStart, title: s.heading }))];
chapStarts.forEach((c, i) => {
  const end = i + 1 < chapStarts.length ? chapStarts[i + 1].start : durationInFrames;
  meta += `\n[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round((c.start / FPS) * 1000)}\nEND=${Math.round((end / FPS) * 1000)}\ntitle=${c.title.replace(/[=;#\\]/g, " ")}\n`;
});
writeFileSync(join(ROOT, "out/ffmetadata.txt"), meta);

console.log(
  `timeline: ${(durationInFrames / FPS / 60).toFixed(2)} min (${durationInFrames} frames), ${scenes.length} scenes, ${segments.length} segments, ${captions.length} captions; loudness in ${m.input_i} LUFS → -16`,
);
