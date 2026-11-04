import { bundle } from "@remotion/bundler";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const ROOT = join(import.meta.dirname, "..");
export const COMPOSITION = "STAT251Exam2Soccer";

const CANDIDATES = [
  process.env.REMOTION_BROWSER,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
];
export const browserExecutable = CANDIDATES.find((p) => p && existsSync(p)) ?? null;

export async function makeBundle() {
  return bundle({ entryPoint: join(ROOT, "src/index.ts"), publicDir: join(ROOT, "public") });
}
