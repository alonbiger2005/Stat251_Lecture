export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  bg: "#0A1A14",
  bg2: "#0F241B",
  panel: "#132E23",
  panel2: "#183A2C",
  line: "#2C5A45",
  pitch: "#1B5E3C",
  pitchStripe: "#1F6842",
  pitchLine: "rgba(236,248,240,0.85)",
  text: "#F3F7F4",
  muted: "#A7C2B4",
  dim: "#6F8F80",
  soccer: "#3DDC84", // soccer analogy accent
  professor: "#FFB547", // professor's original lecture examples
  concept: "#6CB8FF", // core idea
  exam: "#C59BFF", // exam strategy
  danger: "#FF6B6B",
  ok: "#4BE38E",
  yellow: "#FFE066",
  white: "#FFFFFF",
  shade: "rgba(108,184,255,0.45)",
  shadeAlt: "rgba(255,181,71,0.5)",
  shadeRed: "rgba(255,107,107,0.5)",
  shadeGreen: "rgba(61,220,132,0.45)",
};

export type Tag = "professor" | "soccer" | "concept" | "exam";

export const TAGS: Record<Tag, { label: string; color: string }> = {
  professor: { label: "PROFESSOR'S LECTURE EXAMPLE · ORIGINAL DATA", color: C.professor },
  soccer: { label: "SOCCER ANALOGY", color: C.soccer },
  concept: { label: "CORE IDEA", color: C.concept },
  exam: { label: "EXAM STRATEGY", color: C.exam },
};

export const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

/** Layout regions */
export const L = {
  headerH: 96,
  stageTop: 116,
  stageBottom: 862,
  visualX: 56,
  visualWSplit: 1040,
  visualWFull: 1808,
  mathX: 1124,
  mathW: 740,
  captionTop: 884,
  captionH: 150,
};

export function moduleLabel(chapter: number): string {
  if (chapter === 0) return "OVERVIEW";
  if (chapter === 1) return "FOUNDATIONS";
  if (chapter <= 4) return "MODULE 4 · CONTINUOUS RVs";
  if (chapter === 5) return "MODULE 4 → 5 · BRIDGE";
  if (chapter <= 8) return "MODULE 5 · CONFIDENCE INTERVALS";
  if (chapter <= 13) return "MODULE 6 · HYPOTHESIS TESTS";
  if (chapter === 14) return "MODULES 5 + 6";
  if (chapter <= 20) return "EXAM REVIEW";
  return "WRAP-UP";
}
