/**
 * Renders inspection stills. Usage:
 *   npm run stills                       → one still per step for the default QA scene list
 *   npm run stills -- ch04-ztable ch18-final-ttest   → only these scenes
 *   npm run stills -- --frames 1200,5000             → explicit frames
 */
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Timeline } from "../src/types.ts";
import { browserExecutable, COMPOSITION, makeBundle, ROOT } from "./remotion-common.ts";

const tl: Timeline = JSON.parse(readFileSync(join(ROOT, "src/data/timeline.json"), "utf8"));
const args = process.argv.slice(2);
const DEFAULT = ["ch02-pdf", "ch04-ztable", "ch07-ttable", "ch10-voter-test", "ch14-duality", "ch18-final-ttest", "ch19-final-ci"];
let frames: { name: string; frame: number }[] = [];
if (args[0] === "--frames") {
  frames = args[1].split(",").map((x) => ({ name: `frame-${x}`, frame: Number(x) }));
} else if (args[0] === "--all") {
  for (const sc of tl.scenes) {
    const last = sc.stepStarts.length - 1;
    const fr = sc.start + Math.min(sc.end - sc.start - 10, sc.stepStarts[last] + Math.round((sc.end - sc.start - sc.stepStarts[last]) * 0.85));
    frames.push({ name: sc.id, frame: fr });
  }
  frames.push({ name: "title", frame: 150 });
} else {
  const ids = args.length ? args : DEFAULT;
  for (const id of ids) {
    const sc = tl.scenes.find((s) => s.id === id);
    if (!sc) throw new Error(`no scene ${id}`);
    sc.stepStarts.forEach((st, k) => {
      const nextSt = k + 1 < sc.stepStarts.length ? sc.stepStarts[k + 1] : sc.end - sc.start;
      frames.push({ name: `${id}-step${k}`, frame: sc.start + st + Math.round((nextSt - st) * 0.8) });
    });
  }
}
const outDir = join(ROOT, "out/stills");
mkdirSync(outDir, { recursive: true });
const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id: COMPOSITION, browserExecutable });
for (const fr of frames) {
  const output = join(outDir, `${fr.name}.png`);
  await renderStill({ serveUrl, composition, frame: fr.frame, output, browserExecutable, scale: 0.5 });
  console.log(output);
}
