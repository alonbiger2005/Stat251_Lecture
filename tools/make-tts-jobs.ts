/** Writes tools/.cache/tts_jobs.json from manifest.json (one job per sentence). */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Manifest } from "./parse-script.ts";

const ROOT = join(import.meta.dirname, "..");
const manifest: Manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
const jobs = manifest.segments.flatMap((seg) => seg.sentences.map((s) => ({ id: s.id, spoken: s.spoken })));
mkdirSync(join(ROOT, "tools", ".cache"), { recursive: true });
writeFileSync(join(ROOT, "tools", ".cache", "tts_jobs.json"), JSON.stringify(jobs, null, 1));
console.log(`tts_jobs.json: ${jobs.length} sentences`);
