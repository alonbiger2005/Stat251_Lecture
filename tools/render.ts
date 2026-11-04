/**
 * Rendering.
 *   npm run render:preview   → out/STAT251_Exam2_Soccer_Explainer_PREVIEW.mp4 (≈70 s: a formula scene + a professor example)
 *   npm run render:full      → out/STAT251_Exam2_Soccer_Explainer.mp4 (full episode)
 *
 * Video is rendered in resumable chapter-sized chunks (muted), concatenated losslessly,
 * then muxed ONCE with the sample-accurate narration track (AAC) and chapter metadata.
 */
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Timeline } from "../src/types.ts";
import { browserExecutable, COMPOSITION, makeBundle, ROOT } from "./remotion-common.ts";

const mode = process.argv[2] ?? "preview";
const tl: Timeline = JSON.parse(readFileSync(join(ROOT, "src/data/timeline.json"), "utf8"));
const OUT = join(ROOT, "out");
const CHUNKS = join(OUT, "chunks");
mkdirSync(CHUNKS, { recursive: true });
const CONCURRENCY = Number(process.env.REMOTION_CONCURRENCY ?? 4);
const CRF = Number(process.env.RENDER_CRF ?? 20);

function ranges(): { name: string; from: number; to: number }[] {
  if (mode === "preview") {
    // 1) ch04 z-table lookup (formula + table scene)  2) professor voter test
    const a = tl.scenes.find((s) => s.id === "ch04-ztable")!;
    const b = tl.scenes.find((s) => s.id === "ch10-voter-test")!;
    return [
      { name: "preview-a", from: a.start + a.stepStarts[2], to: Math.min(a.end, a.start + a.stepStarts[2] + 35 * 30) - 1 },
      { name: "preview-b", from: b.start + b.stepStarts[4], to: Math.min(b.end, b.start + b.stepStarts[4] + 35 * 30) - 1 },
    ];
  }
  // chunk at chapter (non-subsection) boundaries
  const starts = [0, ...tl.sections.filter((s) => s.kind !== "subsection").map((s) => s.cardStart).filter((f) => f > 0)];
  return starts.map((st, i) => ({ name: `chunk-${String(i).padStart(2, "0")}`, from: st, to: (starts[i + 1] ?? tl.durationInFrames) - 1 }));
}

const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id: COMPOSITION, browserExecutable });
const parts = ranges();
const t0 = Date.now();
for (const r of parts) {
  const file = join(CHUNKS, `${mode}-${r.name}.mp4`);
  if (existsSync(file)) {
    console.log(`skip ${r.name} (exists)`);
    continue;
  }
  const tmp = file.replace(/\.mp4$/, ".partial.mp4");
  const tStart = Date.now();
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: CRF,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 92,
    muted: true,
    frameRange: [r.from, r.to],
    outputLocation: tmp,
    concurrency: CONCURRENCY,
    browserExecutable,
    onProgress: ({ progress }) => {
      void progress;
    },
  });
  renameSync(tmp, file);
  const n = r.to - r.from + 1;
  console.log(`\n${r.name}: ${n} frames in ${((Date.now() - tStart) / 1000).toFixed(0)} s (${(n / ((Date.now() - tStart) / 1000)).toFixed(1)} fps)`);
}

// concat video chunks losslessly
const list = join(CHUNKS, `${mode}-list.txt`);
writeFileSync(list, parts.map((r) => `file '${join(CHUNKS, `${mode}-${r.name}.mp4`)}'`).join("\n") + "\n");
const videoOnly = join(CHUNKS, `${mode}-video.mp4`);
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", videoOnly]);

const finalName = mode === "preview" ? "STAT251_Exam2_Soccer_Explainer_PREVIEW.mp4" : "STAT251_Exam2_Soccer_Explainer.mp4";
const finalPath = join(OUT, finalName);
if (mode === "preview") {
  // cut matching audio for each preview range and concatenate
  const audioParts = parts.map((r, i) => {
    const p = join(CHUNKS, `preview-audio-${i}.wav`);
    execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", join(ROOT, "public/audio/narration.wav"), "-ss", String(r.from / tl.fps), "-t", String((r.to - r.from + 1) / tl.fps), p]);
    return p;
  });
  const alist = join(CHUNKS, "preview-audio-list.txt");
  writeFileSync(alist, audioParts.map((p) => `file '${p}'`).join("\n") + "\n");
  const audio = join(CHUNKS, "preview-audio.wav");
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", alist, "-c", "copy", audio]);
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", videoOnly, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-shortest", "-movflags", "+faststart", finalPath]);
} else {
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", videoOnly,
    "-i", join(ROOT, "public/audio/narration.wav"),
    "-i", join(OUT, "ffmetadata.txt"),
    "-map", "0:v", "-map", "1:a", "-map_metadata", "2", "-map_chapters", "2",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
    "-metadata:s:a:0", "language=eng",
    "-movflags", "+faststart",
    finalPath,
  ]);
}
console.log(`\nwrote ${finalPath} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
