/**
 * Parses the LOCKED source script into a stable manifest.
 *
 * Rules (from the master prompt):
 *  - Prose paragraphs are narration (one paragraph == exactly one narrated segment).
 *  - `\[ ... \]` display-math blocks are on-screen overlays, never spoken.
 *    Each one is attached to the nearest preceding prose paragraph in the same section.
 *  - `##` headings are chapter-card cues (not spoken).
 *  - The `# title`, the introductory blockquote, `---` and the final production note
 *    are production guidance (not spoken).
 *
 * Output: manifest.json (project root) — consumed by the TTS + timeline builders.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { splitSentences, splitCaptionChunks } from "./text-utils.ts";
import { toSpoken } from "./spoken.ts";

export const ROOT = join(import.meta.dirname, "..");
export const SCRIPT_PATH = join(ROOT, "script", "STAT251_Exam2_Soccer_Podcast_Script.md");

export type SectionKind = "intro" | "chapter" | "subsection" | "outro";

export interface ManifestSection {
  id: string;
  heading: string; // exact heading text (without "## ")
  kind: SectionKind;
  chapterNumber: number | null; // 0 = intro, 1..20, 21 = outro
  parentChapter: number; // chapter a subsection belongs to (for the chapter menu)
  sourceLine: number;
}

export interface ManifestSentence {
  id: string;
  display: string; // exact locked text
  spoken: string; // pronunciation-normalised text fed to TTS (never shown)
  captionChunks: string[]; // exact substrings of display, in order
}

export interface ManifestSegment {
  id: string;
  index: number;
  sectionId: string;
  chapterTitle: string;
  sourceLine: number;
  narration: string; // exact locked prose string
  sentences: ManifestSentence[];
  mathOverlays: string[]; // exact source LaTeX strings (inner content of \[ \])
  mathSourceLines: number[];
  // filled later by tools/build-timeline.ts
  visualType?: string;
  visualDescription?: string;
  audioFile?: string;
  audioStartSeconds?: number;
  audioDurationSeconds?: number;
}

export interface Manifest {
  title: string;
  sourceFile: string;
  sourceSha256: string;
  productionGuidance: { line: number; text: string }[];
  sections: ManifestSection[];
  segments: ManifestSegment[];
  formulaCount: number;
  proseParagraphCount: number;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/, "");

export function parseScript(src: string): Manifest {
  const lines = src.split(/\r?\n/);
  const sections: ManifestSection[] = [];
  const segments: ManifestSegment[] = [];
  const production: { line: number; text: string }[] = [];
  let title = "";
  let current: ManifestSection | null = null;
  let lastChapter = 0;
  let segInSection = 0;
  let formulaCount = 0;
  let inProductionTail = false;

  lines.forEach((raw, i) => {
    const lineNo = i + 1;
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      production.push({ line: lineNo, text: line });
      return;
    }
    if (line.startsWith(">")) {
      production.push({ line: lineNo, text: line });
      return;
    }
    if (line === "---") {
      inProductionTail = true;
      production.push({ line: lineNo, text: line });
      return;
    }
    if (inProductionTail || line.startsWith("**Production note")) {
      production.push({ line: lineNo, text: line });
      return;
    }
    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      let kind: SectionKind = "subsection";
      let num: number | null = null;
      const m = heading.match(/^CHAPTER (\d+)/);
      if (heading.startsWith("INTRO")) {
        kind = "intro";
        num = 0;
      } else if (heading.startsWith("OUTRO")) {
        kind = "outro";
        num = 21;
      } else if (m) {
        kind = "chapter";
        num = Number(m[1]);
      }
      if (num !== null) lastChapter = num;
      const prefix =
        kind === "intro" ? "intro" : kind === "outro" ? "outro" : kind === "chapter" ? `ch${String(num).padStart(2, "0")}` : `ch${String(lastChapter).padStart(2, "0")}s`;
      const short = slug(heading.replace(/^CHAPTER \d+ — /, "").replace(/^(INTRO|OUTRO) — /, ""));
      current = {
        id: `${prefix}-${short}`,
        heading,
        kind,
        chapterNumber: num,
        parentChapter: lastChapter,
        sourceLine: lineNo,
      };
      sections.push(current);
      segInSection = 0;
      return;
    }
    if (!current) throw new Error(`Content before first section at line ${lineNo}`);
    if (line.startsWith("\\[")) {
      if (!line.endsWith("\\]")) throw new Error(`Unterminated display math at line ${lineNo}`);
      const inner = line.slice(2, -2);
      const prev = segments[segments.length - 1];
      if (!prev || prev.sectionId !== current.id)
        throw new Error(`Formula at line ${lineNo} has no preceding prose paragraph in its section`);
      prev.mathOverlays.push(inner);
      prev.mathSourceLines.push(lineNo);
      formulaCount++;
      return;
    }
    // prose paragraph → exactly one narrated segment
    segInSection++;
    const id = `${current.id}-${String(segInSection).padStart(2, "0")}`;
    const sentences = splitSentences(line).map((s, k) => ({
      id: `${id}-s${k + 1}`,
      display: s,
      spoken: toSpoken(s),
      captionChunks: splitCaptionChunks(s),
    }));
    segments.push({
      id,
      index: segments.length,
      sectionId: current.id,
      chapterTitle: current.heading,
      sourceLine: lineNo,
      narration: line,
      sentences,
      mathOverlays: [],
      mathSourceLines: [],
    });
  });

  return {
    title,
    sourceFile: "script/STAT251_Exam2_Soccer_Podcast_Script.md",
    sourceSha256: createHash("sha256").update(src).digest("hex"),
    productionGuidance: production,
    sections,
    segments,
    formulaCount,
    proseParagraphCount: segments.length,
  };
}

if (process.argv[1] && process.argv[1].endsWith("parse-script.ts")) {
  const src = readFileSync(SCRIPT_PATH, "utf8");
  const manifest = parseScript(src);
  writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(
    `manifest.json: ${manifest.sections.length} sections, ${manifest.segments.length} narrated segments, ${manifest.formulaCount} formulas, sha256 ${manifest.sourceSha256.slice(0, 12)}…`,
  );
}
