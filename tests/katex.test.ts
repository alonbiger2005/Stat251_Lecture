/** Every formula string and every inline $math$ in the storyboard must parse with KaTeX (no raw LaTeX on screen). */
import assert from "node:assert/strict";
import katex from "katex";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { STORYBOARD } from "../src/storyboard.ts";

const ROOT = join(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
const render = (tex: string) => katex.renderToString(tex, { throwOnError: true, strict: "ignore", displayMode: false });

test("all 59 script formulas typeset", () => {
  let n = 0;
  for (const seg of manifest.segments)
    for (const tex of seg.mathOverlays) {
      assert.doesNotThrow(() => render(`\\displaystyle ${tex}`), tex);
      n++;
    }
  assert.equal(n, 59);
});

test("all storyboard inline math typesets", () => {
  const strings: string[] = [];
  const walk = (v: unknown, key = "") => {
    if (typeof v === "string") {
      if (key === "tex") strings.push(v);
      else for (const m of v.matchAll(/\$([^$]+)\$/g)) strings.push(m[1]);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(STORYBOARD);
  assert.ok(strings.length > 50);
  for (const s of strings) assert.doesNotThrow(() => render(s), s);
});
