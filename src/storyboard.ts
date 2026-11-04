/**
 * STORYBOARD — maps every narrated paragraph (by source line in the locked script)
 * to a visual scene. Each scene spans a contiguous range of source lines; every
 * narrated paragraph inside that range becomes one animation "step".
 *
 * tools/build-timeline.ts asserts that every narrated segment is covered by exactly one scene.
 */
import type { Tag } from "./theme";
import { C } from "./theme";
import type { CurveStepCfg } from "./components/CurvePlot";
import { tTableEntry } from "./lib/stats";

export interface SceneDef {
  id: string;
  lines: [number, number]; // inclusive source-line range in script/STAT251_Exam2_Soccer_Podcast_Script.md
  type: string;
  tag: Tag;
  description: string;
  props?: Record<string, unknown>;
}

const N01 = { kind: "normal", mu: 0, sigma: 1 } as const;
const INF = 99;
const zTicks = (vals: number[]) => vals.map((v) => ({ v, label: v.toFixed(v % 1 === 0 ? 0 : 2) }));
const t35 = (a: number) => tTableEntry(a, 35);

const pdfSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "f", dist: { kind: "normal", mu: 5, sigma: 1.3 }, color: C.text, label: "density curve $f(x)$", labelX: 6.6, labelDy: -10 }],
    dom: [0, 10],
    yMax: 0.34,
    ticks: zTicks([0, 2, 4, 5, 6, 8, 10]),
    xLabel: "x (e.g. a reaction time)",
  },
  {
    shades: [{ id: "a", from: 4, to: 6, color: C.shade, label: "probability = AREA", labelX: 5, labelY: 0.62 }],
    notes: [{ id: "h", text: "height is **density**, not probability", x: 0.8, y: 0.08, color: C.muted, size: 26, width: 380 }],
  },
  {
    markers: [{ id: "pt", x: 5, label: "$P(X=5)=0$", color: C.danger, top: 0.12 }],
    notes: [{ id: "h", text: "a single point has no width → zero area", x: 0.8, y: 0.08, color: C.danger, size: 26, width: 380 }],
    shades: [{ id: "a", from: 4, to: 6, color: C.shade, label: "$P(4<X<6)$", labelX: 5, labelY: 0.62 }],
  },
  {
    markers: [],
    shades: [{ id: "all", from: -INF, to: INF, color: C.shadeGreen, label: "total area $= 1$", labelX: 5, labelY: 0.62 }],
    notes: [{ id: "h", text: "$f(x)\\ge 0$ everywhere", x: 0.82, y: 0.08, color: C.soccer, size: 30, width: 360 }],
  },
  {
    ticks: [
      { v: 0, label: "0" },
      { v: 3.5, label: "a" },
      { v: 6.8, label: "b" },
      { v: 10, label: "10" },
    ],
    shades: [{ id: "ab", from: 3.5, to: 6.8, color: C.shade, label: "$\\int_a^b f(x)\\,dx$", labelX: 5.1, labelY: 0.6 }],
    notes: [{ id: "h", text: "probability = area over the event", x: 0.82, y: 0.08, color: C.muted, size: 26, width: 360 }],
  },
];

const cdfSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "f", dist: { kind: "normal", mu: 5, sigma: 1.3 }, color: C.text }],
    dom: [0, 10],
    yMax: 0.34,
    ticks: [
      { v: 0, label: "0" },
      { v: 6, label: "x" },
      { v: 10, label: "10" },
    ],
    shades: [{ id: "L", from: -INF, to: 6, color: C.shade, label: "$F(x)=P(X\\le x)$", labelX: 4.2, labelY: 0.6 }],
    showCdf: true,
    cdfTo: 6,
    notes: [{ id: "c", text: "yellow: the CDF accumulates area from the left", x: 0.78, y: 0.02, color: C.yellow, size: 24, width: 420 }],
  },
  {
    curves: [{ id: "g", dist: { kind: "exp", lambda: 1 / 30 }, color: C.soccer, label: "time until the next goal", labelX: 50, labelDy: -20 }],
    dom: [0, 90],
    yMax: 0.036,
    ticks: zTicks([0, 20, 40, 60, 90]),
    xLabel: "minutes until the next goal",
    shades: [{ id: "L", from: -INF, to: 20, color: C.shadeGreen, label: "$F(20)$", labelX: 10, labelY: 0.62 }],
    showCdf: true,
    cdfTo: 20,
    notes: [{ id: "c", text: "$F(20)$ = P(goal arrives within 20 min)", x: 0.66, y: 0.1, color: C.soccer, size: 28, width: 520 }],
  },
  {
    showCdf: false,
    ticks: [
      { v: 0, label: "0" },
      { v: 15, label: "a" },
      { v: 45, label: "b" },
      { v: 90, label: "90" },
    ],
    shades: [{ id: "L", from: 15, to: 45, color: C.shade, label: "$F(b)-F(a)$", labelX: 30, labelY: 0.66 }],
    notes: [
      { id: "c", text: "$P(X>x)=1-F(x)$", x: 0.72, y: 0.06, color: C.text, size: 30, width: 420, box: true },
      { id: "d", text: "$<$ or $\\le$: same answer — a point has probability 0", x: 0.72, y: 0.26, color: C.muted, size: 24, width: 440 },
    ],
  },
];

const meanVarSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "a", dist: { kind: "normal", mu: 0.4, sigma: 0.05 }, color: C.text }],
    dom: [0.1, 0.7],
    yMax: 9,
    ticks: zTicks([0.2, 0.3, 0.4, 0.5, 0.6]),
    xLabel: "goalkeeper reaction time (s)",
    markers: [{ id: "mu", x: 0.4, label: "$\\mu = E[X]$ (center)", top: 0.02 }],
  },
  {
    markers: [
      { id: "mu", x: 0.4, label: "$\\mu$", top: 0.02 },
      { id: "l", x: 0.35, label: "$-\\sigma$", color: C.concept, dashed: true, top: 0.4 },
      { id: "r", x: 0.45, label: "$+\\sigma$", color: C.concept, dashed: true, top: 0.4 },
    ],
    notes: [{ id: "v", text: "variance = spread around the mean; $\\sigma=\\sqrt{\\sigma^2}$", x: 0.78, y: 0.05, color: C.concept, size: 26, width: 420 }],
  },
  {
    curves: [
      { id: "a", dist: { kind: "normal", mu: 0.4, sigma: 0.02 }, color: C.soccer, label: "SD 0.02 s: consistent", labelX: 0.43, labelDy: 30 },
      { id: "b", dist: { kind: "normal", mu: 0.4, sigma: 0.1 }, color: C.professor, label: "SD 0.10 s: varies more", labelX: 0.58, labelDy: -10 },
    ],
    yMax: 21,
    markers: [{ id: "mu", x: 0.4, label: "same mean 0.40 s", top: 0.0 }],
    notes: [],
  },
];

const uniformSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "u", dist: { kind: "uniform", a: 0, b: 20 }, color: C.soccer, fill: "rgba(61,220,132,0.12)" }],
    dom: [-2, 22],
    yMax: 0.075,
    ticks: zTicks([0, 5, 10, 15, 20]),
    xLabel: "X = delay before the drill starts (minutes)",
  },
  { curves: [{ id: "u", dist: { kind: "uniform", a: 0, b: 20 }, color: C.soccer, fill: "rgba(61,220,132,0.12)", label: "flat: $f(x)=\\frac{1}{20}$", labelX: 10, labelDy: -6 }] },
  { markers: [{ id: "m", x: 10, label: "mean = midpoint = 10", top: 0.05 }] },
  { markers: [], shades: [{ id: "s", from: 5, to: 10, color: C.shade, label: "$\\frac{5}{20}=0.25$", labelX: 7.5, labelY: 0.6 }] },
  { notes: [{ id: "n", text: "“equally likely anywhere between…” → Uniform", x: 0.5, y: 0.02, color: C.yellow, size: 28, width: 700 }] },
];

const expSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "e", dist: { kind: "exp", lambda: 2 }, color: C.soccer }],
    dom: [0, 2.5],
    yMax: 2.2,
    ticks: [
      { v: 0, label: "0" },
      { v: 0.5, label: "0.5 h" },
      { v: 1, label: "1 h" },
      { v: 1.5, label: "1.5 h" },
      { v: 2, label: "2 h" },
    ],
    xLabel: "waiting time X until the next goal (hours)",
  },
  { notes: [{ id: "n", text: "idealised: goals at a constant average rate (real soccer isn't)", x: 0.62, y: 0.06, color: C.muted, size: 26, width: 620 }] },
  {
    curves: [{ id: "e", dist: { kind: "exp", lambda: 2 }, color: C.soccer, label: "$f(x)=\\lambda e^{-\\lambda x}$ starts high, decays", labelX: 0.55, labelDy: -20 }],
    notes: [{ id: "n", text: "$\\lambda$ = events per time unit · 5 per hour ≠ 5 hours", x: 0.65, y: 0.06, color: C.yellow, size: 28, width: 600 }],
  },
  { markers: [{ id: "m", x: 0.5, label: "mean $=1/\\lambda=0.5$ h", top: 0.3 }], notes: [] },
  { markers: [{ id: "m", x: 0.5, label: "1/2 hour = 30 min", top: 0.3 }] },
];

const profExpSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "e", dist: { kind: "exp", lambda: 5 }, color: C.professor }],
    dom: [0, 1.3],
    yMax: 5.3,
    ticks: [
      { v: 0, label: "0" },
      { v: 0.25, label: "0.25 h" },
      { v: 0.5, label: "0.5" },
      { v: 0.75, label: "0.75" },
      { v: 1, label: "1 h" },
    ],
    xLabel: "time until the first customer arrives (hours) · λ = 5 per hour",
    shades: [{ id: "s", from: 0.25, to: 1, color: C.shadeAlt, label: "≈ 0.2798", labelX: 0.5, labelY: 0.66 }],
    markers: [
      { id: "a", x: 0.25, label: "15 min", color: C.professor, top: 0.2 },
      { id: "b", x: 1, label: "60 min", color: C.professor, top: 0.6 },
    ],
  },
];

const normalSteps: CurveStepCfg[] = [
  { curves: [{ id: "n", dist: N01, color: C.text, label: "symmetric, unimodal bell", labelX: 1.9, labelDy: -30 }], dom: [-4, 4], yMax: 0.45, ticks: [{ v: 0, label: "μ" }] },
  {
    ticks: [
      { v: -1, label: "μ − σ" },
      { v: 0, label: "μ" },
      { v: 1, label: "μ + σ" },
    ],
    markers: [
      { id: "mu", x: 0, label: "center: mean $\\mu$", top: 0.02 },
      { id: "s", x: 1, label: "spread: SD $\\sigma$", color: C.concept, dashed: true, top: 0.45 },
    ],
  },
  { notes: [{ id: "v", text: "$N(\\mu,\\sigma^2)$: second parameter is the **VARIANCE**", x: 0.8, y: 0.04, color: C.yellow, size: 28, width: 380, box: true }] },
  { notes: [{ id: "v", text: "CLT → Normal models appear in inference even for non-Normal populations", x: 0.8, y: 0.04, color: C.concept, size: 26, width: 380, box: true }] },
];

const empiricalSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "n", dist: { kind: "normal", mu: 0.4, sigma: 0.04 }, color: C.text }],
    dom: [0.26, 0.54],
    yMax: 10.5,
    ticks: zTicks([0.28, 0.32, 0.36, 0.4, 0.44, 0.48, 0.52]),
    xLabel: "goalkeeper reaction time (s): mean 0.40, SD 0.04",
    shades: [
      { id: "3", from: 0.28, to: 0.52, color: "rgba(108,184,255,0.18)", label: "99.7%", labelX: 0.505, labelY: 0.66 },
      { id: "2", from: 0.32, to: 0.48, color: "rgba(108,184,255,0.3)", label: "95%", labelX: 0.465, labelY: 0.5 },
      { id: "1", from: 0.36, to: 0.44, color: "rgba(108,184,255,0.55)", label: "68%", labelX: 0.4, labelY: 0.62 },
    ],
  },
  {
    shades: [
      { id: "3", from: 0.28, to: 0.52, color: "rgba(108,184,255,0.12)" },
      { id: "2", from: 0.32, to: 0.48, color: "rgba(61,220,132,0.3)", label: "95%: 0.32–0.48 s", labelX: 0.47, labelY: 0.32 },
      { id: "1", from: 0.36, to: 0.44, color: "rgba(61,220,132,0.6)", label: "68%: 0.36–0.44 s", labelX: 0.4, labelY: 0.62 },
    ],
    notes: [{ id: "a", text: "approximate — not a substitute for the z-table", x: 0.82, y: 0.0, color: C.danger, size: 24, width: 340 }],
  },
];

const zScoreSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "n", dist: { kind: "normal", mu: 0.4, sigma: 0.04 }, color: C.text }],
    dom: [0.26, 0.54],
    yMax: 10.5,
    ticks: [
      { v: 0.32, label: "−2σ" },
      { v: 0.36, label: "−1σ" },
      { v: 0.4, label: "μ (z = 0)" },
      { v: 0.44, label: "+1σ" },
      { v: 0.48, label: "+2σ" },
    ],
    xLabel: "raw value x  →  z counts standard deviations from μ",
    markers: [{ id: "x", x: 0.45, label: "a raw value $x$", top: 0.15 }],
  },
  {
    markers: [{ id: "x", x: 0.45, label: "$x-\\mu$ = distance, $\\div\\,\\sigma$ = in SDs", top: 0.15 }],
    shades: [{ id: "d", from: 0.4, to: 0.45, color: C.shadeAlt }],
  },
  {
    shades: [],
    markers: [
      { id: "x", x: 0.48, label: "$z=+2$", top: 0.25 },
      { id: "y", x: 0.348, label: "$z=-1.3$", color: C.concept, top: 0.25 },
    ],
  },
];

const zTableSteps: CurveStepCfg[] = [
  { curves: [{ id: "n", dist: N01, color: C.text }], dom: [-3.5, 3.5], yMax: 0.44, ticks: zTicks([-3, -2, -1, 0, 1, 2, 3]) },
  { shades: [{ id: "L", from: -INF, to: 1.2, color: C.shade, label: "LEFT area", labelX: -0.4, labelY: 0.62 }], markers: [{ id: "z", x: 1.2, label: "$z$", top: 0.3 }] },
  { shades: [{ id: "L", from: -INF, to: 1.2, color: C.shade, label: "0.8849", labelX: -0.4, labelY: 0.62 }], markers: [{ id: "z", x: 1.2, label: "$z=1.20$", top: 0.3 }] },
  { shades: [{ id: "R", from: 1.2, to: INF, color: C.shadeAlt, label: "1 − 0.8849 = 0.1151", labelX: 2.3, labelY: 0.25 }] },
  { shades: [{ id: "N", from: -INF, to: -1.2, color: C.shade, label: "0.1151", labelX: -2.2, labelY: 0.42 }], markers: [{ id: "z", x: -1.2, label: "$z=-1.20$", top: 0.3 }] },
];

const zBetweenSteps: CurveStepCfg[] = [
  {
    curves: [{ id: "n", dist: N01, color: C.text }],
    dom: [-3.5, 3.5],
    yMax: 0.44,
    ticks: [
      { v: -0.8, label: "z₁" },
      { v: 1.3, label: "z₂" },
    ],
    shades: [{ id: "b", from: -0.8, to: 1.3, color: C.shade, label: "left(z₂) − left(z₁)", labelX: 0.25, labelY: 0.62 }],
  },
  {
    ticks: [
      { v: -1.6, label: "−z" },
      { v: 1.6, label: "+z" },
    ],
    shades: [
      { id: "l", from: -INF, to: -1.6, color: C.shadeAlt, label: "one tail", labelX: -2.4, labelY: 0.5 },
      { id: "r", from: 1.6, to: INF, color: C.shadeAlt, label: "same tail", labelX: 2.4, labelY: 0.5 },
    ],
    notes: [{ id: "x", text: "outside both: 2 × one tail (symmetry)", x: 0.5, y: 0.0, color: C.yellow, size: 28, width: 580 }],
  },
  {
    ticks: zTicks([-2, 0, 2]),
    shades: [
      { id: "l", from: -INF, to: -2, color: C.shadeAlt, label: "0.0228", labelX: -2.7, labelY: 0.5 },
      { id: "r", from: 2, to: INF, color: C.shadeAlt, label: "0.0228", labelX: 2.7, labelY: 0.5 },
    ],
    notes: [{ id: "x", text: "$P(|Z|>2)=0.0456$", x: 0.5, y: 0.0, color: C.yellow, size: 32, width: 580 }],
  },
  { notes: [{ id: "x", text: "z-table: Normal probabilities · proportion CIs · proportion tests", x: 0.5, y: 0.0, color: C.concept, size: 25, width: 600, box: true }] },
];

const tVsZSteps: CurveStepCfg[] = [
  {
    curves: [
      { id: "z", dist: N01, color: C.muted, dashed: true, label: "standard Normal (dashed)", labelX: -2.6, labelDy: -40 },
      { id: "t", dist: { kind: "t", df: 2 }, color: C.exam, label: "$t$, df = 2: heavier tails", labelX: 2.4, labelDy: -40 },
    ],
    dom: [-4.5, 4.5],
    yMax: 0.44,
    ticks: zTicks([-4, -2, 0, 2, 4]),
    shades: [
      { id: "l", curve: "t", from: -INF, to: -2.5, color: C.shadeAlt },
      { id: "r", curve: "t", from: 2.5, to: INF, color: C.shadeAlt },
    ],
    notes: [{ id: "a", text: "extra uncertainty: $\\sigma$ unknown, estimated by $s$", x: 0.78, y: 0.02, color: C.exam, size: 26, width: 520 }],
  },
  {
    curves: [
      { id: "z", dist: N01, color: C.muted, dashed: true, label: "standard Normal (dashed)", labelX: -2.6, labelDy: -40 },
      { id: "t", dist: { kind: "t", df: 60 }, color: C.exam, label: "large df → approaches Normal", labelX: 2.4, labelDy: -40 },
    ],
    notes: [{ id: "a", text: "small df: heavy tails · large df: ≈ Normal", x: 0.78, y: 0.02, color: C.exam, size: 26, width: 520 }],
  },
];

const tTableCurve: CurveStepCfg[] = [
  {
    curves: [{ id: "t", dist: { kind: "t", df: 35 }, color: C.text }],
    dom: [-3.6, 3.6],
    yMax: 0.44,
    ticks: [
      { v: -t35(0.025), label: `−${t35(0.025).toFixed(3)}` },
      { v: 0, label: "0" },
      { v: t35(0.025), label: t35(0.025).toFixed(3) },
    ],
    shades: [
      { id: "l", from: -INF, to: -t35(0.025), color: C.shadeAlt, label: ".025", labelX: -2.9, labelY: 0.5 },
      { id: "m", from: -t35(0.025), to: t35(0.025), color: "rgba(61,220,132,0.22)", label: "95%", labelX: 0, labelY: 0.62 },
      { id: "r", from: t35(0.025), to: INF, color: C.shadeAlt, label: ".025", labelX: 2.9, labelY: 0.5 },
    ],
  },
  {
    ticks: [
      { v: -t35(0.05), label: `−${t35(0.05).toFixed(3)}` },
      { v: 0, label: "0" },
      { v: t35(0.05), label: t35(0.05).toFixed(3) },
    ],
    shades: [
      { id: "l", from: -INF, to: -t35(0.05), color: C.shadeAlt, label: ".05", labelX: -2.7, labelY: 0.5 },
      { id: "m", from: -t35(0.05), to: t35(0.05), color: "rgba(61,220,132,0.22)", label: "90%", labelX: 0, labelY: 0.62 },
      { id: "r", from: t35(0.05), to: INF, color: C.shadeAlt, label: ".05", labelX: 2.7, labelY: 0.5 },
    ],
  },
];

const pValueSteps: CurveStepCfg[] = [
  { curves: [{ id: "n", dist: N01, color: C.text, label: "if $H_0$ were true", labelX: -1.9, labelDy: 20 }], dom: [-3.6, 3.6], yMax: 0.44, ticks: zTicks([-3, -2, -1, 0, 1, 2, 3]), xLabel: "test statistic" },
  { notes: [{ id: "no", text: "✗  p-value is NOT P($H_0$ is true)", x: 0.5, y: 0.02, color: C.danger, size: 32, width: 640, box: true }] },
  {
    notes: [{ id: "no", text: "assume $H_0$ → how extreme is our sample?", x: 0.5, y: 0.02, color: C.text, size: 28, width: 640, box: true }],
    markers: [{ id: "obs", x: 1.9, label: "observed", top: 0.35 }],
    shades: [{ id: "p", from: 1.9, to: INF, color: C.shadeAlt, label: "this extreme or more", labelX: 2.75, labelY: 0.45 }],
  },
  { shades: [{ id: "p", from: 1.9, to: INF, color: C.shadeAlt, label: "= p-value", labelX: 2.75, labelY: 0.45 }] },
  {
    markers: [{ id: "obs", x: 2.7, label: "observed", top: 0.35 }],
    shades: [{ id: "p", from: 2.7, to: INF, color: C.shadeRed, label: "small p", labelX: 3.1, labelY: 0.45 }],
    notes: [{ id: "no", text: "hard to explain under $H_0$ → **reject** $H_0$", x: 0.5, y: 0.02, color: C.danger, size: 28, width: 640, box: true }],
  },
  {
    markers: [{ id: "obs", x: 0.6, label: "observed", top: 0.1 }],
    shades: [{ id: "p", from: 0.6, to: INF, color: C.shadeGreen, label: "large p", labelX: 1.8, labelY: 0.6 }],
    notes: [{ id: "no", text: "compatible with $H_0$ → **fail to reject** $H_0$", x: 0.5, y: 0.02, color: C.soccer, size: 28, width: 640, box: true }],
  },
  { notes: [{ id: "no", text: "p ≤ α → reject · p > α → fail to reject", x: 0.5, y: 0.02, color: C.yellow, size: 30, width: 640, box: true }] },
];

const tailSteps: CurveStepCfg[] = [
  { curves: [{ id: "n", dist: N01, color: C.text }], dom: [-3.6, 3.6], yMax: 0.44, ticks: zTicks([-2, 0, 2]), xLabel: "test statistic under H₀" },
  { shades: [{ id: "l", from: -INF, to: -1.5, color: C.shadeAlt, label: "LEFT tail ($<$)", labelX: -2.6, labelY: 0.45 }], markers: [{ id: "s", x: -1.5, label: "statistic", top: 0.35 }] },
  { shades: [{ id: "r", from: 1.5, to: INF, color: C.shadeAlt, label: "RIGHT tail ($>$)", labelX: 2.6, labelY: 0.45 }], markers: [{ id: "s", x: 1.5, label: "statistic", top: 0.35 }] },
  {
    shades: [
      { id: "l", from: -INF, to: -1.5, color: C.shadeAlt, label: "both", labelX: -2.6, labelY: 0.45 },
      { id: "r", from: 1.5, to: INF, color: C.shadeAlt, label: "tails ($\\ne$)", labelX: 2.6, labelY: 0.45 },
    ],
    markers: [
      { id: "s", x: 1.5, label: "statistic", top: 0.35 },
      { id: "s2", x: -1.5, label: "mirror", color: C.muted, dashed: true, top: 0.35 },
    ],
  },
  { notes: [{ id: "z", text: "z-table gives the area **BELOW**", x: 0.5, y: 0.0, color: C.concept, size: 30, width: 600, box: true }] },
  { shades: [{ id: "l", from: -INF, to: -1.5, color: C.shade, label: "left: table value", labelX: -2.5, labelY: 0.45 }], markers: [{ id: "s", x: -1.5, label: "z", top: 0.35 }] },
  { shades: [{ id: "r", from: 1.5, to: INF, color: C.shade, label: "right: 1 − table", labelX: 2.5, labelY: 0.45 }], markers: [{ id: "s", x: 1.5, label: "z", top: 0.35 }] },
  {
    shades: [
      { id: "l", from: -INF, to: -1.5, color: C.shade, label: "two-sided:", labelX: -2.5, labelY: 0.45 },
      { id: "r", from: 1.5, to: INF, color: C.shade, label: "2 × one tail", labelX: 2.5, labelY: 0.45 },
    ],
    markers: [{ id: "s", x: 1.5, label: "z", top: 0.35 }],
  },
];

const voterTestSteps: CurveStepCfg[] = [
  { curves: [{ id: "n", dist: N01, color: C.text, label: "z if $H_0: p=0.52$ is true", labelX: 1.6, labelDy: -10 }], dom: [-3.6, 3.6], yMax: 0.44, ticks: zTicks([-3, -2, -1, 0, 1, 2, 3]) },
  {},
  {},
  {},
  {},
  { markers: [{ id: "z", x: -1.2, label: "$z\\approx-1.20$", color: C.professor, top: 0.3 }] },
  { shades: [{ id: "l", from: -INF, to: -1.2, color: C.shadeAlt, label: "0.1151", labelX: -2.2, labelY: 0.45 }] },
];

const errSteps: CurveStepCfg[] = [
  {
    curves: [
      { id: "h0", dist: N01, color: C.text, label: "$H_0$ true", labelX: -0.6, labelDy: -10 },
      { id: "ha", dist: { kind: "normal", mu: 2.6, sigma: 1 }, color: C.soccer, label: "$H_0$ false (real effect)", labelX: 3.3, labelDy: -10 },
    ],
    dom: [-3.5, 6],
    yMax: 0.46,
    ticks: [
      { v: 0, label: "null value" },
      { v: 1.645, label: "cut-off" },
    ],
    markers: [{ id: "c", x: 1.645, label: "reject →", color: C.yellow, dashed: true, top: 0.05 }],
  },
  { shades: [{ id: "a", curve: "h0", from: 1.645, to: INF, color: C.shadeRed, label: "α: Type I", labelX: 2.2, labelY: 0.72 }] },
  { shades: [{ id: "a", curve: "h0", from: 1.645, to: INF, color: C.shadeRed }, { id: "b", curve: "ha", from: -INF, to: 1.645, color: C.shadeAlt, label: "β: Type II", labelX: 0.9, labelY: 0.5 }] },
  {
    shades: [
      { id: "a", curve: "h0", from: 1.645, to: INF, color: C.shadeRed },
      { id: "b", curve: "ha", from: -INF, to: 1.645, color: C.shadeAlt },
      { id: "p", curve: "ha", from: 1.645, to: INF, color: C.shadeGreen, label: "power = 1 − β", labelX: 3.2, labelY: 0.52 },
    ],
  },
];

const powerSteps: CurveStepCfg[] = [
  {
    curves: [
      { id: "h0", dist: { kind: "normal", mu: 0, sigma: 0.7 }, color: C.text, label: "$H_0$", labelX: -0.4 },
      { id: "ha", dist: { kind: "normal", mu: 2.6, sigma: 0.7 }, color: C.soccer, label: "real effect", labelX: 3.1 },
    ],
    dom: [-3.5, 6],
    yMax: 0.62,
    ticks: [{ v: 0, label: "null value" }],
    markers: [{ id: "c", x: 1.15, label: "cut-off", color: C.yellow, dashed: true, top: 0.3 }],
    shades: [{ id: "p", curve: "ha", from: 1.15, to: INF, color: C.shadeGreen, label: "power ↑", labelX: 3.0, labelY: 0.6 }],
    notes: [{ id: "n", text: "larger n → narrower curves → more power", x: 0.5, y: 0.0, color: C.soccer, size: 28, width: 680 }],
  },
  {
    curves: [
      { id: "h0", dist: { kind: "normal", mu: 0, sigma: 0.7 }, color: C.text, label: "$H_0$", labelX: -0.4 },
      { id: "ha", dist: { kind: "normal", mu: 4, sigma: 0.7 }, color: C.soccer, label: "bigger effect size", labelX: 4.4 },
    ],
    notes: [{ id: "n", text: "true value far from the null → easy to detect", x: 0.5, y: 0.0, color: C.soccer, size: 28, width: 680 }],
  },
];

export const STORYBOARD: SceneDef[] = [
  /* ---------------- INTRO ---------------- */
  { id: "intro-welcome", lines: [8, 8], type: "IntroWelcome", tag: "soccer", description: "Goalkeeper session on an original pitch; legend separating professor examples (amber) from soccer analogies (green)." },
  {
    id: "intro-scope",
    lines: [10, 10],
    type: "CardsScene",
    tag: "exam",
    description: "Exam 2 scope cards: Modules 4/5/6 and the provided z- and t-tables.",
    props: {
      titles: ["The Exam 2 guide narrows the scope"],
      cols: 2,
      cards: [
        { kicker: "MODULE 4", title: "Continuous random variables only", body: "PDFs · CDFs · Uniform · Exponential · Normal", color: C.concept },
        { kicker: "MODULE 5", title: "Confidence intervals", body: "proportions, means, differences, paired data, sample size", color: C.soccer },
        { kicker: "MODULE 6", title: "Hypothesis testing", body: "hypotheses, test statistics, tails, p-values, errors, power", color: C.exam },
        { kicker: "PROVIDED ON THE EXAM", title: "z-table and t-table", body: "use the tables — not a calculator's built-in normal function", color: C.professor },
      ],
    },
  },
  { id: "intro-big-picture", lines: [12, 16], type: "ProbVsInference", tag: "concept", description: "Split screen: probability (known save rate) vs inference (sample of games → unknown save rate); CI estimates, test challenges." },

  /* ---------------- CHAPTER 1 ---------------- */
  { id: "ch01-roster", lines: [21, 31], type: "PopulationSample", tag: "concept", description: "Full roster of stylised players = population; random spotlight = sample; μ, p vs x̄, p̂, s labels." },
  {
    id: "ch01-notation",
    lines: [33, 37],
    type: "CardsScene",
    tag: "exam",
    description: "Wording → symbol cards: p̂ vs p, x̄ vs μ.",
    props: {
      titles: ["Read the wording → pick the symbol", undefined, "Formulas are built around the parameter"],
      cols: 2,
      cards: [
        { title: "“Thirty-two percent of the sampled students…”", body: "a sample proportion → $\\hat p$", color: C.soccer, at: 0, hi: [0] },
        { title: "“the true proportion of all students…”", body: "the population proportion → $p$", color: C.concept, at: 0, hi: [0] },
        { title: "“the average sprint time of 50 sampled goalkeepers”", body: "a sample mean → $\\bar x$", color: C.soccer, at: 1, hi: [1] },
        { title: "“the true average sprint time of all college goalkeepers”", body: "a population mean → $\\mu$", color: C.concept, at: 1, hi: [1] },
      ],
      footer: [{ at: 2, text: "Identify the **parameter** you estimate or test → that decides the formula", color: C.yellow }],
    },
  },

  /* ---------------- CHAPTER 2 ---------------- */
  { id: "ch02-continuous", lines: [42, 46], type: "ContinuousStopwatch", tag: "soccer", description: "Goalkeeper stopwatch zooms through decimals 0.4 → 0.42017; number line zoom shows infinitely many values." },
  { id: "ch02-pdf", lines: [48, 56], type: "CurveScene", tag: "concept", description: "Density curve; probability as shaded area; P(X=x)=0 sliver; total area 1; area from a to b.", props: { steps: pdfSteps, titles: ["The PDF: a **density** curve", "Probability comes from AREA under the curve", "Exact point: probability 0 · intervals: positive", "A valid PDF: total area 1, never negative", "Probability between a and b = integral = area"] } },
  { id: "ch02-cdf", lines: [60, 68], type: "CurveScene", tag: "concept", description: "CDF accumulates area from the left (yellow curve); goal-timing F(20); shortcuts 1−F(x) and F(b)−F(a).", props: { steps: cdfSteps, titles: ["The CDF: $F(x)=P(X\\le x)$", "Time until the next goal: $F(20)$ = within 20 minutes", "Shortcuts from the CDF"] } },
  { id: "ch02-meanvar", lines: [70, 77], type: "CurveScene", tag: "soccer", description: "Mean as center, SD as spread; two reaction-time curves with the same mean 0.40 s and SD 0.02 vs 0.10.", props: { steps: meanVarSteps, titles: ["Mean $\\mu = E[X]$: the expected center", "Variance: spread around the mean", "Same mean, different spread"] } },

  /* ---------------- CHAPTER 3 ---------------- */
  { id: "ch03-shapes", lines: [82, 82], type: "ThreeShapes", tag: "concept", description: "Uniform, Exponential and Normal side by side." },
  {
    id: "ch03-uniform",
    lines: [84, 98],
    type: "UniformDrill",
    tag: "soccer",
    description: "Randomised drill start between 0 and 20 minutes; flat density; mean 10; shaded 5–10 = 25%.",
    props: {
      steps: uniformSteps,
      titles: ["First: Uniform", "Drill start equally likely across 20 minutes", "Mean = midpoint", "Probability = interval length ÷ total length", "Recognise Uniform"],
      work: [
        { at: 1, text: "$a=0,\\; b=20$ minutes" },
        { at: 2, text: "$E[X]=\\frac{0+20}{2}=10$ min" },
        { at: 3, text: "$P(5<X<10)=\\frac{5}{20}=0.25$", color: C.yellow },
      ],
    },
  },
  {
    id: "ch03-exponential",
    lines: [100, 112],
    type: "ExponentialGoal",
    tag: "soccer",
    description: "Countdown to the next goal under an idealised constant rate; decaying curve λe^{−λx}; mean 1/λ = 30 minutes.",
    props: {
      steps: expSteps,
      titles: ["Second: Exponential", "Time until the first event at a constant average rate", "The PDF starts high and decreases", "Mean wait = SD = $1/\\lambda$", "Two scoring events per hour → 30 minutes"],
      work: [
        { at: 3, text: "rate $\\lambda = 2$ per hour" },
        { at: 3, text: "$E[X]=\\frac{1}{2}$ hour", delay: 20 },
        { at: 4, text: "$= 30$ minutes (a long-run average)", color: C.yellow },
      ],
    },
  },
  {
    id: "ch03-prof-exponential",
    lines: [114, 114],
    type: "CurveScene",
    tag: "professor",
    description: "Professor's customer-arrival example kept intact: λ=5/hour, P(0.25<X<1)=e^{−1.25}−e^{−5}≈0.2798.",
    props: {
      steps: profExpSteps,
      titles: ["Lecture example: first customer between 15 and 60 minutes"],
      work: [
        { at: 0, text: "$X\\sim\\operatorname{Exp}(5)$ per **hour**" },
        { at: 0, text: "15 min $=0.25$ h · 60 min $=1$ h", delay: 60 },
        { at: 0, tex: "F(1)-F(0.25)", delay: 140 },
        { at: 0, tex: "=e^{-1.25}-e^{-5}", delay: 200 },
        { at: 0, tex: "\\approx0.2865-0.0067", delay: 260 },
        { at: 0, tex: "\\approx0.2798", color: C.professor, delay: 320 },
      ],
      workWidth: 360,
    },
  },
  { id: "ch03-normal", lines: [118, 126], type: "CurveScene", tag: "concept", description: "Bell curve with mean and SD; N(μ,σ²) uses variance; CLT motivation.", props: { steps: normalSteps, titles: ["Third: Normal", "Center $\\mu$, spread $\\sigma$", "Check: variance or standard deviation?", "Why Normal matters"] } },
  { id: "ch03-empirical", lines: [128, 130], type: "CurveScene", tag: "soccer", description: "Goalkeeper reaction times N(0.40, 0.04²): 68–95–99.7 bands.", props: { steps: empiricalSteps, titles: ["The 68–95–99.7 rule", "Reaction times: mean 0.40 s, SD 0.04 s"] } },

  /* ---------------- CHAPTER 4 ---------------- */
  { id: "ch04-zscore", lines: [135, 141], type: "CurveScene", tag: "concept", description: "Point moving on the reaction-time bell; z = (x−μ)/σ; z=+2 and z=−1.3 markers.", props: { steps: zScoreSteps, titles: ["A z-score: how many SDs from the mean?", "Numerator: distance $x-\\mu$ · denominator: $\\sigma$", "$z=+2$: 2 SDs above · $z=-1.3$: 1.3 SDs below"] } },
  {
    id: "ch04-ztable",
    lines: [143, 157],
    type: "ZTableScene",
    tag: "concept",
    description: "Magnified z-table: row 1.2 / column .00 → 0.8849 (left area); complement 0.1151; negative half gives 0.1151 for z=−1.20.",
    props: {
      titles: ["The exam provides the z-table — use it", "The z-table gives the area to the LEFT of z", "Row 1.2, column .00 → 0.8849", "Right of 1.20: 1 − 0.8849", "Negative z: use the negative half of the table"],
      tables: [{ rows: [1.0, 1.1, 1.2, 1.3, 1.4] }, undefined, { rows: [1.0, 1.1, 1.2, 1.3, 1.4], hiRow: 1.2, hiCol: 0 }, undefined, { rows: [-1.4, -1.3, -1.2, -1.1, -1.0], hiRow: -1.2, hiCol: 0 }],
      steps: zTableSteps,
    },
  },
  {
    id: "ch04-between",
    lines: [159, 167],
    type: "CurveScene",
    tag: "concept",
    description: "Area between two z-scores; two-sided outside area = 2 × one tail; worked P(|Z|>2)=0.0456.",
    props: {
      steps: zBetweenSteps,
      titles: ["Between two z-scores: larger left area − smaller left area", "Outside ±z: find one tail, double it", "Example: z = 2.00", "When do we use the z-table?"],
      work: [
        { at: 2, text: "table: $\\Phi(2.00)=0.9772$" },
        { at: 2, text: "right tail $=0.0228$", delay: 40 },
        { at: 2, text: "both tails $=0.0456$", color: C.yellow, delay: 80 },
      ],
      workWidth: 320,
    },
  },

  /* ---------------- CHAPTER 5 ---------------- */
  { id: "ch05-clt", lines: [172, 186], type: "CltSampling", tag: "soccer", description: "Repeated random samples of 50 goalkeepers; each contributes one x̄; sampling distribution tightens with n (σ/√n)." },

  /* ---------------- CHAPTER 6 ---------------- */
  { id: "ch06-structure", lines: [191, 201], type: "CiStructure", tag: "concept", description: "Center = point estimate; expanding margin of error; ME = critical × SE." },
  {
    id: "ch06-three-questions",
    lines: [203, 211],
    type: "CardsScene",
    tag: "exam",
    description: "Three questions for every CI problem.",
    props: {
      titles: ["Every CI problem = three questions"],
      cols: 1,
      cardHeight: 150,
      cards: [
        { kicker: "ONE", title: "What parameter am I estimating?", at: 1, hi: [1, 4], color: C.soccer },
        { kicker: "TWO", title: "What is the point estimate and the standard error?", at: 2, hi: [2, 4], color: C.concept },
        { kicker: "THREE", title: "z critical value or t critical value?", at: 3, hi: [3, 4], color: C.exam },
      ],
      footer: [{ at: 4, text: "Memorise this decision process", color: C.yellow }],
    },
  },
  {
    id: "ch06-parameters",
    lines: [213, 223],
    type: "CardsScene",
    tag: "soccer",
    description: "Five targets with soccer contexts: p (grass preference), p1−p2 (keepers vs outfielders), μ (reaction time), μ1−μ2 (training groups), paired.",
    props: {
      titles: ["Which parameter? Which tool?"],
      cols: 2,
      cardHeight: 196,
      cards: [
        { kicker: "ONE PROPORTION · $p$", title: "% of goalkeepers who prefer natural grass", body: "use $\\hat p$ and the z-table", at: 0, hi: [0], color: C.soccer },
        { kicker: "TWO PROPORTIONS · $p_1-p_2$", title: "keepers vs outfield players preferring grass", body: "difference of sample proportions, z", at: 1, hi: [1], color: C.soccer },
        { kicker: "ONE MEAN · $\\mu$", title: "true average goalkeeper reaction time", body: "$\\bar x$ and Student's t, df = n − 1", at: 2, hi: [2], color: C.exam },
        { kicker: "TWO MEANS · $\\mu_1-\\mu_2$", title: "two independent training groups", body: "two-sample t, Welch df", at: 3, hi: [3], color: C.exam },
        { kicker: "PAIRED · $\\mu_d$", title: "paired data → one list of differences", body: "one-sample t interval on the mean difference", at: 4, hi: [4], color: C.concept },
        { kicker: "NEXT", title: "Let's go one by one →", at: 5, hi: [5], color: C.yellow },
      ],
    },
  },
  {
    id: "ch06-oneprop",
    lines: [228, 234],
    type: "ProportionDots",
    tag: "soccer",
    description: "Grid of sampled players coloured by grass preference; anatomy of p̂ ± z*√(p̂(1−p̂)/n).",
    props: {
      titles: ["One population proportion", "Read the formula", "Hat = sample estimate · star = critical cutoff"],
      yes: 58,
      n: 100,
      hideCount: true,
      yesLabel: "prefers natural grass",
      noLabel: "does not",
      work: [
        { at: 1, text: "$\\hat p$ = observed fraction in the sample" },
        { at: 1, text: "$\\hat q = 1-\\hat p$ = the opposite fraction", delay: 30 },
        { at: 1, text: "$n$ = number sampled", delay: 60 },
        { at: 2, text: "$\\sqrt{\\hat p(1-\\hat p)/n}$ = standard error", color: C.concept },
        { at: 2, text: "$z^*$ = critical cutoff", color: C.exam, delay: 30 },
      ],
    },
  },
  {
    id: "ch06-zstar",
    lines: [236, 238],
    type: "ZTableScene",
    tag: "concept",
    description: "z* for 95%: middle 95%, 2.5% per tail, look up left area .9750 → 1.96.",
    props: {
      titles: ["$z^*$ for 95% confidence: find left area .9750", "95% in the middle, 2.5% in each tail"],
      tables: [{ rows: [1.7, 1.8, 1.9, 2.0], hiRow: 1.9, hiCol: 0.06 }],
      steps: [
        {
          curves: [{ id: "n", dist: N01, color: C.text }],
          dom: [-3.6, 3.6],
          yMax: 0.44,
          ticks: [
            { v: -1.96, label: "−1.96" },
            { v: 0, label: "0" },
            { v: 1.96, label: "1.96" },
          ],
          shades: [
            { id: "l", from: -INF, to: -1.96, color: C.shadeAlt, label: ".025", labelX: -2.7, labelY: 0.5 },
            { id: "m", from: -1.96, to: 1.96, color: "rgba(61,220,132,0.25)", label: "95%", labelX: 0, labelY: 0.62 },
            { id: "r", from: 1.96, to: INF, color: C.shadeAlt, label: ".025", labelX: 2.7, labelY: 0.5 },
          ],
        },
      ],
      work: [{ at: 0, text: "left area .9750 → $z^*\\approx1.96$", color: C.yellow, delay: 60 }],
    },
  },
  {
    id: "ch06-voter-ci",
    lines: [240, 240],
    type: "CiLinesScene",
    tag: "professor",
    description: "Professor's voter CI: p̂≈.514, 95% CI ≈ 50.42% to 52.38%.",
    props: {
      titles: ["Lecture example: the voter interval"],
      work: [
        { at: 0, text: "$\\hat p\\approx0.514$ with a large sample" },
        { at: 0, text: "“We are 95% confident that the true population proportion lies in that interval.”", color: C.professor, delay: 200 },
      ],
      lines: [
        {
          min: 0.5,
          max: 0.53,
          ticks: [
            { v: 0.5, label: "50%" },
            { v: 0.51, label: "51%" },
            { v: 0.52, label: "52%" },
            { v: 0.53, label: "53%" },
          ],
          center: 0.514,
          lo: 0.5042,
          hi: 0.5238,
          color: C.professor,
          centerLabel: "p̂ ≈ 0.514",
          loLabel: "50.42%",
          hiLabel: "52.38%",
          label: "95% confidence interval",
        },
      ],
    },
  },
  { id: "ch06-coverage", lines: [242, 242], type: "CiCoverage", tag: "concept", description: "Simulated repeated samples: about 95% of intervals capture the fixed true parameter; false interpretation crossed out." },
  {
    id: "ch06-twoprop",
    lines: [247, 261],
    type: "TwoGroupBars",
    tag: "soccer",
    description: "Goalkeepers vs outfield players preferring grass: difference of p̂'s, separate n's, SE; CIs vs zero.",
    props: {
      titles: ["Two independent groups, yes/no outcome", "Point estimate: the difference of the two observed percentages", "SE combines both groups' variation", "Subscripts 1 and 2: each group has its own n", "Estimate ± z* × SE", "Read the interval against zero"],
    },
  },
  {
    id: "ch06-onemean",
    lines: [266, 276],
    type: "GroupsScene",
    tag: "soccer",
    description: "Dot plot of sampled reaction times with x̄ and ±s; t*_{n−1} explained; SE = s/√n.",
    props: {
      titles: ["One population mean, σ unknown", "Read the formula", "$t^*_{n-1}$: the subscript is the degrees of freedom", "SE $=s/\\sqrt n$ · df $=n-1$", "Enter the t-table"],
      groups: [{ name: "sampled goalkeeper reaction times", mean: 0.42, sd: 0.05, n: 40, color: C.soccer, seed: 9 }],
      min: 0.28,
      max: 0.56,
      ticks: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
      unit: "seconds",
      hideNumbers: true,
      showMeansAt: 1,
      showSdAt: 1,
      work: [
        { at: 1, text: "$\\bar x$ = sample average · $s$ = sample SD · $n$ = sample size" },
        { at: 2, text: "it does **not** mean “t* minus 1”", color: C.danger },
        { at: 3, text: "SE $= s/\\sqrt n$, df $= n-1$", color: C.concept },
      ],
    },
  },

  /* ---------------- CHAPTER 7 ---------------- */
  { id: "ch07-t", lines: [281, 283], type: "CurveScene", tag: "concept", description: "t vs Normal: heavier tails at small df, converging at large df.", props: { steps: tVsZSteps, titles: ["The t-distribution: a bell with heavier tails", "Its shape depends on degrees of freedom"] } },
  { id: "ch07-tables", lines: [285, 287], type: "TableCompare", tag: "exam", description: "z-table = left cumulative area; t-table = critical value for a chosen upper-tail area and df." },
  {
    id: "ch07-ttable",
    lines: [289, 291],
    type: "TTableScene",
    tag: "exam",
    description: "95% two-sided → .025 column; 90% → .05 column; row df = n − 1 (illustrated with df = 35).",
    props: {
      titles: ["95% two-sided: α = .05 → .025 per tail → .025 column", "90% two-sided: .05 per tail → .05 column"],
      tables: [
        { dfs: [33, 34, 35, 36, 37], hiDf: 35, hiAlpha: 0.025 },
        { dfs: [33, 34, 35, 36, 37], hiDf: 35, hiAlpha: 0.05 },
      ],
      steps: tTableCurve,
      work: [
        { at: 0, text: "row: df = n − 1 (e.g. n = 36 → df = 35)" },
        { at: 0, text: `t* = ${t35(0.025).toFixed(3)}`, color: C.yellow, delay: 80 },
        { at: 1, text: `t* = ${t35(0.05).toFixed(3)}`, color: C.yellow, delay: 60 },
      ],
    },
  },
  {
    id: "ch07-onesided",
    lines: [293, 297],
    type: "CiLinesScene",
    tag: "concept",
    description: "One-sided bounds: lower bound to +∞ (α=.10 in the lower tail), upper bound from −∞.",
    props: {
      titles: ["One-sided 90% lower bound: α = .10 in the lower tail", "One finite endpoint"],
      work: [{ at: 0, text: "use the positive $t^*$ with upper-tail .10 (symmetry)" }],
      lines: [
        { label: "lower confidence bound", min: 0, max: 10, ticks: [], center: 5, lo: 3.4, hi: 10, openRight: true, centerLabel: "estimate", loLabel: "estimate − c*·SE", color: C.soccer, at: 0, verdict: "→ +∞" },
        { label: "upper confidence bound", min: 0, max: 10, ticks: [], center: 5, lo: 0, hi: 6.6, openLeft: true, centerLabel: "estimate", hiLabel: "estimate + c*·SE", color: C.concept, at: 1, verdict: "−∞ →" },
      ],
    },
  },
  {
    id: "ch07-twomeans",
    lines: [302, 316],
    type: "GroupsScene",
    tag: "soccer",
    description: "Two independent training groups; difference of means; SE from s²/n of each group; Welch df; zero reference.",
    props: {
      titles: ["Two separate, independent groups", "Point estimate: $\\bar x_1-\\bar x_2$", "SE: add each group's $s^2/n$, then square root", "t critical value with Welch df", "$\\nu$: the Welch approximate df", "Zero is the key reference"],
      groups: [
        { name: "training group 1", mean: 0.43, sd: 0.04, n: 26, color: C.soccer, seed: 21 },
        { name: "training group 2", mean: 0.4, sd: 0.05, n: 30, color: C.concept, seed: 22 },
      ],
      min: 0.28,
      max: 0.56,
      ticks: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
      unit: "reaction time (s)",
      hideNumbers: true,
      showMeansAt: 1,
      diffAt: 1,
      showSdAt: 2,
      work: [
        { at: 3, text: "professor: the “crazy df” — use the provided formula/information" },
        { at: 4, text: "no exact row? professor's rounding rule or a conservative **lower** row", color: C.exam },
        { at: 5, text: "CI for $\\mu_1-\\mu_2$ contains 0 → equal means remain plausible", color: C.yellow },
      ],
    },
  },
  {
    id: "ch07-paired",
    lines: [321, 329],
    type: "PairedScene",
    tag: "soccer",
    description: "Same goalkeepers before/after a reflex drill; per-player differences d; one-sample interval on d̄.",
    props: {
      titles: ["Paired: each observation has a natural partner", "Not two independent samples → one list of differences", "$\\bar d$, $s_d$, and n = number of pairs", "“Same individuals before and after” → PAIRED"],
      diffAt: 1,
      statAt: 2,
    },
  },

  /* ---------------- CHAPTER 8 ---------------- */
  { id: "ch08-samplesize", lines: [334, 352], type: "SampleSizeScene", tag: "exam", description: "n vs E curve (n ∝ 1/E²), p̂(1−p̂) maximised at 0.5, round up, worked n = 9604." },

  /* ---------------- CHAPTER 9 ---------------- */
  {
    id: "ch09-ci-vs-test",
    lines: [357, 359],
    type: "CardsScene",
    tag: "concept",
    description: "CI question vs test question.",
    props: {
      titles: ["Two different questions"],
      cols: 2,
      cardHeight: 300,
      cards: [
        { kicker: "CONFIDENCE INTERVAL", title: "“What parameter values are plausible?”", body: "a range of values", color: C.soccer, at: 0, hi: [0] },
        { kicker: "HYPOTHESIS TEST", title: "“Is this specific claim about the parameter compatible with the sample?”", body: "a verdict about one claim", color: C.exam, at: 1, hi: [1] },
      ],
    },
  },
  {
    id: "ch09-hypotheses",
    lines: [361, 367],
    type: "CardsScene",
    tag: "concept",
    description: "H0 (default, equality) and Ha (<, >, ≠); alternative chosen before seeing data.",
    props: {
      titles: ["Every test has two hypotheses"],
      cols: 3,
      cardHeight: 330,
      cards: [
        { kicker: "NULL", title: "$H_0$: the default claim", body: "assumed for the calculation · contains equality", tex: "H_0:\\ \\theta=\\theta_0", color: C.concept, at: 1, hi: [1] },
        { kicker: "ALTERNATIVE", title: "$H_a$: what you seek evidence for", body: "less than, greater than, or not equal", tex: "\\theta<\\theta_0\\ \\ \\theta>\\theta_0\\ \\ \\theta\\ne\\theta_0", color: C.exam, at: 2, hi: [2] },
        { kicker: "RULE", title: "Choose $H_a$ BEFORE looking at the data", body: "never pick the direction that makes p smaller", color: C.danger, at: 3, hi: [3], verdict: "bad", verdictAt: 3 },
      ],
    },
  },
  {
    id: "ch09-workflow",
    lines: [369, 381],
    type: "StepsScene",
    tag: "exam",
    description: "Six-step hypothesis test workflow, each lit as narrated.",
    props: {
      titles: ["The hypothesis-test workflow"],
      items: [
        { text: "State $H_0$ and $H_a$", at: 1 },
        { text: "Check conditions", at: 2 },
        { text: "Calculate the test statistic", at: 3 },
        { text: "Correct distribution + tail → p-value", at: 4 },
        { text: "Compare the p-value with α", at: 5 },
        { text: "Write the conclusion in context", at: 6 },
      ],
    },
  },
  { id: "ch09-pvalue", lines: [383, 397], type: "CurveScene", tag: "concept", description: "Null distribution; observed statistic; tail area = p-value; small vs large p; decision rule.", props: { steps: pValueSteps, titles: ["The p-value — slow down", "What it is NOT", "Assume $H_0$, then ask…", "…that area is the p-value", "Small p-value", "Large p-value", "Decision rule"] } },

  /* ---------------- CHAPTER 10 ---------------- */
  { id: "ch10-tails", lines: [402, 422], type: "CurveScene", tag: "exam", description: "Left, right and two-tailed shading from Ha; z-table reading rules for each.", props: { steps: tailSteps, titles: ["$H_a$ tells you the tail", "$H_a: \\theta<\\theta_0$ → left tail", "$H_a: \\theta>\\theta_0$ → right tail", "$H_a: \\theta\\ne\\theta_0$ → both tails", "For a z-test", "Left-tail p-value", "Right-tail p-value", "Two-sided p-value"] } },
  {
    id: "ch10-voter-test",
    lines: [424, 438],
    type: "CurveScene",
    tag: "professor",
    description: "Professor's voter test: p0=0.52, n=10000, p̂=0.514, z≈−1.20, left-tail p=0.1151 > .05 → fail to reject.",
    props: {
      steps: voterTestSteps,
      titles: ["Lecture example: voter support (left-tail z-test)", "The test statistic", "SE uses $p_0$ from the null", "$p_0$ = the null claim", "Test uses $p_0$ · CI uses $\\hat p$", "Plug in", "Left area → compare with α"],
      work: [
        { at: 0, text: "$H_0: p=0.52$" },
        { at: 0, text: "$H_a: p<0.52$", delay: 40 },
        { at: 0, text: "$n=10{,}000$, $\\hat p=0.514$", delay: 120 },
        { at: 2, text: "SE $=\\sqrt{0.52(0.48)/10000}$", color: C.concept },
        { at: 5, text: "$z\\approx-1.20$", color: C.professor },
        { at: 6, text: "p = 0.1151 > 0.05", color: C.professor },
        { at: 6, text: "→ fail to reject $H_0$", color: C.professor, delay: 60 },
      ],
      workWidth: 360,
    },
  },

  /* ---------------- CHAPTER 11 ---------------- */
  {
    id: "ch11-oneprop-test",
    lines: [445, 456],
    type: "CardsScene",
    tag: "exam",
    description: "Start with the parameter; one-proportion z-test uses p0; z-table.",
    props: {
      titles: ["Which test formula? Start with the parameter"],
      cols: 1,
      cardHeight: 130,
      cards: [
        { kicker: "STEP 0", title: "Identify the parameter", at: 0, hi: [0], color: C.yellow },
        { kicker: "ONE PROPORTION TEST", title: "one population percentage → one-proportion z test", at: 1, hi: [1], color: C.soccer },
        { kicker: "STANDARD ERROR", title: "null proportion $p_0$ — not the sample $\\hat p$", at: 2, hi: [2], color: C.concept },
        { kicker: "TABLE", title: "use the z-table", at: 3, hi: [3], color: C.concept },
      ],
    },
  },
  { id: "ch11-cats", lines: [461, 473], type: "ProfCats", tag: "professor", description: "Professor's cats example: 13/45 vs 16/74, lecture z≈0.878 (unpooled), one-sided p≈0.1894 > 0.10." },
  {
    id: "ch11-onemean-test",
    lines: [478, 488],
    type: "CurveScene",
    tag: "concept",
    description: "One-sample t: distance of x̄ from μ0 in estimated SEs; df = n − 1.",
    props: {
      titles: ["One mean test", "Test statistic", "Read the formula", "t = number of estimated SEs from $\\mu_0$", "t distribution, df = n − 1"],
      steps: [
        {
          curves: [{ id: "t", dist: { kind: "t", df: 20 }, color: C.text }],
          dom: [-3.6, 3.6],
          yMax: 0.44,
          ticks: [
            { v: -2, label: "−2 SE" },
            { v: -1, label: "−1 SE" },
            { v: 0, label: "μ₀" },
            { v: 1, label: "+1 SE" },
            { v: 2, label: "+2 SE" },
          ],
          xLabel: "where could x̄ land if H₀ is true?",
        },
        {},
        { markers: [{ id: "x", x: 1.6, label: "observed $\\bar x$", top: 0.3 }] },
        { shades: [{ id: "d", from: 0, to: 1.6, color: C.shadeAlt, label: "t SEs", labelX: 0.8, labelY: 0.62 }] },
        { notes: [{ id: "n", text: "df $= n-1$", x: 0.82, y: 0.05, color: C.exam, size: 32, width: 300 }] },
      ],
      work: [
        { at: 2, text: "$\\bar x$: observed sample average" },
        { at: 2, text: "$\\mu_0$: claimed mean", delay: 30 },
        { at: 2, text: "$s/\\sqrt n$: estimated SE", delay: 60 },
      ],
      workWidth: 330,
    },
  },
  {
    id: "ch11-gpa",
    lines: [490, 494],
    type: "CurveScene",
    tag: "professor",
    description: "Professor's GPA example: μ0=4.1, n=114, x̄=4.2317, s=0.3664, t≈3.84, two-sided p<.001, reject at α=.02.",
    props: {
      titles: ["Lecture example: high-school GPA", "Two-sided: both tails beyond ±3.84"],
      steps: [
        { curves: [{ id: "t", dist: { kind: "t", df: 113 }, color: C.text, label: "t, df = 113", labelX: -2, labelDy: 10 }], dom: [-4.6, 4.6], yMax: 0.44, ticks: zTicks([-4, -2, 0, 2, 4]) },
        {
          markers: [
            { id: "a", x: 3.84, label: "3.84", color: C.professor, top: 0.45 },
            { id: "b", x: -3.84, label: "−3.84", color: C.professor, dashed: true, top: 0.45 },
          ],
          shades: [
            { id: "l", from: -INF, to: -3.84, color: C.professor },
            { id: "r", from: 3.84, to: INF, color: C.professor },
          ],
          notes: [{ id: "n", text: "tails almost invisible: p < .001", x: 0.5, y: 0.02, color: C.professor, size: 28, width: 520, box: true }],
        },
      ],
      work: [
        { at: 0, text: "$H_0:\\mu=4.1$" },
        { at: 0, text: "$H_a:\\mu\\ne4.1$", delay: 40 },
        { at: 0, text: "$n=114$, $\\bar x=4.2317$, $s=0.3664$", delay: 140 },
        { at: 1, text: "$t\\approx3.84$ · two-sided", color: C.professor },
        { at: 1, text: "p < .001 < α = .02 → reject $H_0$", color: C.professor, delay: 120 },
      ],
      workWidth: 360,
    },
  },
  {
    id: "ch11-twomeans-test",
    lines: [499, 509],
    type: "CurveScene",
    tag: "concept",
    description: "Two independent group distributions; observed difference minus Δ0 over combined SE; Welch t.",
    props: {
      titles: ["Two independent means test", "Test statistic", "(observed difference − hypothesised difference) ÷ combined SE", "$\\Delta_0$: hypothesised difference, commonly 0", "Welch t and the “crazy” df"],
      steps: [
        {
          curves: [
            { id: "a", dist: { kind: "normal", mu: -0.8, sigma: 1 }, color: C.soccer, label: "group 1", labelX: -1.6 },
            { id: "b", dist: { kind: "normal", mu: 0.8, sigma: 1.2 }, color: C.concept, label: "group 2", labelX: 1.9 },
          ],
          dom: [-4.5, 4.5],
          yMax: 0.46,
          ticks: [
            { v: -0.8, label: "x̄₁" },
            { v: 0.8, label: "x̄₂" },
          ],
          xLabel: "numerical response, two separate groups",
        },
        {},
        {
          markers: [
            { id: "d1", x: -0.8, label: "$\\bar x_1$", top: 0.25 },
            { id: "d2", x: 0.8, label: "$\\bar x_2$", top: 0.25 },
          ],
          notes: [{ id: "d", text: "observed difference $\\bar x_1-\\bar x_2$", x: 0.5, y: 0.0, color: C.yellow, size: 28, width: 520 }],
        },
        { notes: [{ id: "d", text: "professor's test: $\\Delta_0 = 0$", x: 0.5, y: 0.0, color: C.yellow, size: 28, width: 520 }] },
        { notes: [{ id: "d", text: "denominator: uncertainty from **both** groups", x: 0.5, y: 0.0, color: C.exam, size: 28, width: 620 }] },
      ],
    },
  },
  {
    id: "ch11-firstgen",
    lines: [511, 511],
    type: "CurveScene",
    tag: "professor",
    description: "Professor's first-generation comparison: t≈−1.083, df≈22.38, one-sided p≈0.145 > α=.03 → fail to reject.",
    props: {
      titles: ["Lecture example: first-generation vs non-first-generation GPA"],
      steps: [
        {
          curves: [{ id: "t", dist: { kind: "t", df: 22.38 }, color: C.text, label: "t, df ≈ 22.38", labelX: 1.8 }],
          dom: [-4, 4],
          yMax: 0.44,
          ticks: zTicks([-3, -2, -1, 0, 1, 2, 3]),
          markers: [{ id: "t", x: -1.083, label: "$t\\approx-1.083$", color: C.professor, top: 0.3 }],
          shades: [{ id: "l", from: -INF, to: -1.083, color: C.shadeAlt, label: "p ≈ 0.145", labelX: -2.3, labelY: 0.45 }],
        },
      ],
      work: [
        { at: 0, text: "first-gen $\\bar x\\approx4.1467$" },
        { at: 0, text: "non-first-gen $\\bar x\\approx4.2466$", delay: 60 },
        { at: 0, text: "$t\\approx-1.083$, df ≈ 22.38", delay: 200 },
        { at: 0, text: "one-sided p ≈ .145 > α = .03", color: C.professor, delay: 300 },
        { at: 0, text: "→ fail to reject", color: C.professor, delay: 380 },
      ],
      workWidth: 360,
    },
  },
  {
    id: "ch11-paired-test",
    lines: [518, 526],
    type: "PairedScene",
    tag: "soccer",
    description: "Paired test: differences first, then a one-sample t on d̄ with d0 commonly 0.",
    props: {
      titles: ["Paired mean test: differences first", "One-sample t on the differences d", "$d_0$: the null difference, commonly 0", "Usually $d_0 = 0$"],
      diffAt: 0,
      statAt: 2,
    },
  },

  /* ---------------- CHAPTER 12 ---------------- */
  {
    id: "ch12-checklist",
    lines: [531, 567],
    type: "ConditionsChecklist",
    tag: "exam",
    description: "Four-column condition checklist filled as narrated.",
    props: {
      cols: [
        { title: "One proportion", at: 1, items: [{ text: "Randomization", at: 2 }, { text: "10% condition", at: 3 }, { text: "Success/failure", at: 4 }] },
        { title: "Two proportions", at: 5, items: [{ text: "Randomization — both groups", at: 6 }, { text: "10% — both", at: 7 }, { text: "Success/failure — both", at: 8 }, { text: "Independent samples", at: 9 }] },
        { title: "One mean", at: 10, items: [{ text: "Randomization", at: 11 }, { text: "10% condition", at: 12 }, { text: "Large enough or sufficiently Normal", at: 13 }] },
        { title: "Two independent means", at: 14, items: [{ text: "Randomization — both", at: 15 }, { text: "10% — both", at: 16 }, { text: "Large enough / Normal — both", at: 17 }, { text: "Independent samples", at: 18 }] },
      ],
    },
  },
  { id: "ch12-detail", lines: [569, 577], type: "ConditionsDetail", tag: "concept", description: "Random sample, 10% sampling fraction, success–failure (p̂ for CI, p0 for test), skew and sample size." },

  /* ---------------- CHAPTER 13 ---------------- */
  { id: "ch13-errors", lines: [582, 590], type: "CurveScene", tag: "concept", description: "H0 and Ha distributions; α, β and power shaded.", props: { steps: errSteps, titles: ["Two ways to be wrong", "Type I: reject a TRUE null — probability α", "Type II: fail to reject a FALSE null — probability β", "Power $= 1-\\beta$"] } },
  { id: "ch13-matrix", lines: [592, 592], type: "ErrorMatrix", tag: "soccer", description: "Goalkeeper training program with H0 = no improvement: false alarm vs missed real gain." },
  { id: "ch13-power", lines: [594, 596], type: "CurveScene", tag: "concept", description: "Power grows with sample size and effect size.", props: { steps: powerSteps, titles: ["What increases power? Larger n · larger effect · larger α (more Type I risk)", "Effect size: distance from the null value"], work: [{ at: 0, text: "larger α: cut-off moves toward the null — more power, more Type I risk", color: C.muted }], workPos: "bottom" } },

  /* ---------------- CHAPTER 14 ---------------- */
  {
    id: "ch14-duality",
    lines: [601, 611],
    type: "CiLinesScene",
    tag: "concept",
    description: "Null value outside the CI → reject; inside → fail to reject; zero for differences; cross-check.",
    props: {
      titles: ["Two-sided 95% CI ⟷ two-sided test at α = .05", "Null value OUTSIDE → reject", "Null value INSIDE → fail to reject", "Differences: the null value is usually 0", "A great exam cross-check"],
      lines: [
        { label: "95% CI = the plausible values", min: 0, max: 10, ticks: [], center: 4.4, lo: 3.0, hi: 5.8, color: C.concept, at: 0, verdict: "test at α = .05 asks: is θ₀ plausible?" },
        { label: "95% CI", min: 0, max: 10, ticks: [], center: 4.4, lo: 3.0, hi: 5.8, color: C.soccer, nullValue: { v: 7.2, label: "θ₀", color: C.danger }, at: 1, verdict: "outside → reject $H_0$" },
        { label: "95% CI", min: 0, max: 10, ticks: [], center: 4.4, lo: 3.0, hi: 5.8, color: C.soccer, nullValue: { v: 5.1, label: "θ₀", color: C.yellow }, at: 2, verdict: "inside → fail to reject" },
        { label: "95% CI for $\\mu_1-\\mu_2$", min: -3, max: 3, ticks: [{ v: 0, label: "0" }], center: 0.5, lo: -0.7, hi: 1.7, color: C.concept, nullValue: { v: 0, label: "0", color: C.yellow }, at: 3, verdict: "contains 0 → “no difference” plausible" },
      ],
      work: [{ at: 4, text: "CI includes 0 but the matching two-sided test rejects? Something went wrong.", color: C.danger }],
    },
  },

  /* ---------------- CHAPTER 15 ---------------- */
  {
    id: "ch15-tree-1",
    lines: [616, 644],
    type: "FlowScene",
    tag: "exam",
    description: "Exam-day decision tree, steps 1–3: question type → parameter → z or t.",
    props: {
      titles: ["Your exam-day decision tree"],
      rows: [
        {
          label: "STEP 1 · what is asked?",
          at: 1,
          chips: [
            { text: "continuous probability → **Module 4**", hi: [2], color: C.concept, at: 2 },
            { text: "range for a parameter → **CI · Module 5**", hi: [3], color: C.soccer, at: 3 },
            { text: "evidence about a claim → **test · Module 6**", hi: [4], color: C.exam, at: 4 },
          ],
        },
        {
          label: "STEP 2 · parameter?",
          at: 5,
          chips: [
            { text: "one proportion $p$", hi: [6], at: 6 },
            { text: "$p_1-p_2$", hi: [7], at: 7 },
            { text: "one mean $\\mu$", hi: [8], at: 8 },
            { text: "$\\mu_1-\\mu_2$", hi: [9], at: 9 },
            { text: "paired $\\mu_d$", hi: [10], at: 10 },
          ],
        },
        {
          label: "STEP 3 · z or t?",
          at: 11,
          chips: [
            { text: "proportions → **z**", hi: [12], color: C.concept, at: 12 },
            { text: "means → **t**", hi: [13], color: C.exam, at: 13 },
            { text: "Normal raw value, known $\\mu,\\sigma$ → standardise, **z-table**", hi: [14], color: C.concept, at: 14 },
          ],
        },
      ],
    },
  },
  {
    id: "ch15-ci-gallery",
    lines: [646, 668],
    type: "CardsScene",
    tag: "exam",
    description: "All five CI formulas in one pattern: estimate ± critical × SE.",
    props: {
      titles: ["Every two-sided CI: $\\mathrm{PE}\\pm c^*\\times SE$"],
      cols: 2,
      cardHeight: 186,
      cards: [
        { kicker: "PATTERN", title: "point estimate ± critical value × SE", color: C.yellow, at: 0, hi: [0] },
        { kicker: "ONE PROPORTION", title: "PE $\\hat p$ · $z^*$", body: "SE $=\\sqrt{\\hat p(1-\\hat p)/n}$", color: C.soccer, at: 1, hi: [1] },
        { kicker: "TWO PROPORTIONS", title: "PE $\\hat p_1-\\hat p_2$ · $z^*$", body: "SE adds both groups' $\\hat p(1-\\hat p)/n$", color: C.soccer, at: 2, hi: [2] },
        { kicker: "ONE MEAN", title: "PE $\\bar x$ · $t^*_{n-1}$", body: "SE $=s/\\sqrt n$", color: C.exam, at: 3, hi: [3] },
        { kicker: "TWO INDEPENDENT MEANS", title: "PE $\\bar x_1-\\bar x_2$ · $t^*_\\nu$", body: "SE $=\\sqrt{s_1^2/n_1+s_2^2/n_2}$, Welch df", color: C.exam, at: 4, hi: [4] },
        { kicker: "PAIRED", title: "PE $\\bar d$ · $t^*_{n-1}$", body: "SE $=s_d/\\sqrt n$, n = pairs", color: C.concept, at: 5, hi: [5] },
      ],
    },
  },
  {
    id: "ch15-tree-2",
    lines: [670, 696],
    type: "FlowScene",
    tag: "exam",
    description: "Decision tree, steps 5–10: hypotheses → tail → conditions → statistic → table → p vs α → conclusion.",
    props: {
      titles: ["Hypothesis-test branch"],
      rows: [
        { label: "STEP 5 · hypotheses", at: 0, chips: [{ text: "write $H_0$ and $H_a$ before calculating", hi: [0] }] },
        {
          label: "tail from $H_a$",
          at: 1,
          chips: [
            { text: "less than → left", icon: "left", hi: [2], at: 2 },
            { text: "greater than → right", icon: "right", hi: [3], at: 3 },
            { text: "not equal → both", icon: "two", hi: [4], at: 4 },
          ],
        },
        { label: "STEP 6 · 7", at: 5, chips: [{ text: "check conditions", hi: [5], at: 5 }, { text: "calculate the test statistic", hi: [6], at: 6 }] },
        {
          label: "STEP 8 · table",
          at: 7,
          chips: [
            { text: "z-table: area to the left", hi: [8], color: C.concept, at: 8 },
            { text: "t-table: upper-tail critical values by df", hi: [9], color: C.exam, at: 9 },
          ],
        },
        {
          label: "STEP 9 · p vs α",
          at: 10,
          chips: [
            { text: "p < α → reject $H_0$", hi: [11], color: C.danger, at: 11 },
            { text: "p > α → fail to reject $H_0$", hi: [12], color: C.soccer, at: 12 },
          ],
        },
        { label: "STEP 10 · conclude", at: 13, chips: [{ text: "conclusion in context", hi: [13] }, { text: "never “accept the null”", hi: [13], color: C.danger }, { text: "p-value ≠ P($H_0$ true)", hi: [13], color: C.danger }] },
      ],
    },
  },

  /* ---------------- CHAPTER 16 ---------------- */
  {
    id: "ch16-cues",
    lines: [701, 731],
    type: "CueList",
    tag: "exam",
    description: "Wording cue → method list.",
    props: {
      titles: ["Wording cues → method"],
      items: [
        { cue: "“Probability that a continuous measurement is between…”", method: "integrate PDF / CDF difference · if Normal → z-table", at: 1, color: C.concept },
        { cue: "“Equally likely anywhere between a and b”", method: "Uniform", at: 2, color: C.concept },
        { cue: "“Time until the next or first event”", method: "Exponential", at: 3, color: C.concept },
        { cue: "“Bell-shaped, mean and SD given”", method: "Normal", at: 4, color: C.concept },
        { cue: "“Estimate the percentage of all…”", method: "one-proportion CI", at: 5 },
        { cue: "“Estimate difference in percentages between group A and B”", method: "two-proportion CI", at: 6 },
        { cue: "“Estimate the average of all…”", method: "one-mean t interval", at: 7 },
        { cue: "“Estimate difference in average between two separate groups”", method: "two-independent-means t interval", at: 8 },
        { cue: "“Before and after on the same people”", method: "paired t method", at: 9 },
        { cue: "“Is the true proportion equal to, less than, or greater than…”", method: "one-proportion z test", at: 10, color: C.exam },
        { cue: "“Do these two groups have different proportions?”", method: "two-proportion z test", at: 11, color: C.exam },
        { cue: "“Is the true mean equal to…”", method: "one-sample t test", at: 12, color: C.exam },
        { cue: "“Do these two independent groups have different means?”", method: "two-sample Welch t test", at: 13, color: C.exam },
        { cue: "sample size for margin of error E (proportion)", method: "squared z* formula · use 0.5 and 0.5 if no estimate", at: 14, color: C.yellow },
      ],
    },
  },

  /* ---------------- CHAPTER 17 ---------------- */
  {
    id: "ch17-traps",
    lines: [736, 758],
    type: "CardsScene",
    tag: "exam",
    description: "Twelve common traps as cards, highlighted one at a time.",
    props: {
      titles: ["Common traps"],
      cols: 3,
      cardHeight: 158,
      titleSize: 24,
      bodySize: 21,
      cards: [
        { kicker: "TRAP 1", title: "$p$ vs p-value", body: "parameter vs evidence", at: 0, hi: [0], color: C.danger },
        { kicker: "TRAP 2", title: "$\\hat p$ in the test SE", body: "test uses $p_0$; CI uses $\\hat p$", at: 1, hi: [1], color: C.danger },
        { kicker: "TRAP 3", title: "z for means", body: "means → t (σ unknown)", at: 2, hi: [2], color: C.danger },
        { kicker: "TRAP 4", title: "z-table backward", body: "it gives area to the LEFT", at: 3, hi: [3], color: C.danger },
        { kicker: "TRAP 5", title: "t-table like z-table", body: "critical values, upper tail, by df", at: 4, hi: [4], color: C.danger },
        { kicker: "TRAP 6", title: "not splitting α", body: "95% two-sided → .025 per tail", at: 5, hi: [5], color: C.danger },
        { kicker: "TRAP 7", title: "not doubling a one-tail p", body: "symmetric two-sided test", at: 6, hi: [6], color: C.danger },
        { kicker: "TRAP 8", title: "paired as independent", body: "differences first", at: 7, hi: [7], color: C.danger },
        { kicker: "TRAP 9", title: "“95% probability…”", body: "say “we are 95% confident”", at: 8, hi: [8], color: C.danger },
        { kicker: "TRAP 10", title: "“accept $H_0$”", body: "say “fail to reject $H_0$”", at: 9, hi: [9], color: C.danger },
        { kicker: "TRAP 11", title: "ignoring units", body: "λ per hour vs minutes: convert first", at: 10, hi: [10], color: C.danger },
        { kicker: "TRAP 12", title: "forgetting zero", body: "0 in a difference interval = no difference", at: 11, hi: [11], color: C.danger },
      ],
    },
  },

  /* ---------------- CHAPTER 18 ---------------- */
  {
    id: "ch18-final-ttest",
    lines: [763, 787],
    type: "FinalTTest",
    tag: "soccer",
    description: "Full soccer t-test: n=36, x̄=.424, μ0=.400, s=.060 → t=2.40, df=35, right tail, .01<p<.025, reject.",
    props: {
      work: [
        { at: 0, text: "Coach claims $\\mu = 0.400$ s; you suspect **slower**: $\\mu > 0.400$" },
        { at: 1, text: "Task: **hypothesis test** — a specific claimed mean" },
        { at: 2, text: "Parameter: a mean $\\mu$ → Student's t and the t-table, not z" },
        { at: 3, text: "$H_0:\\mu=0.400$ vs $H_a:\\mu>0.400$ → right-tailed", color: C.soccer },
        { at: 4, text: "random sample ✓ · 10%: N > 360 ✓ · n = 36, no heavy skew/outliers ✓" },
        { at: 5, text: "$t=(\\bar x-\\mu_0)/(s/\\sqrt n)$" },
        { at: 6, text: "numerator $0.424-0.400=0.024$" },
        { at: 6, text: "SE $0.060/\\sqrt{36}=0.010$", delay: 90 },
        { at: 6, text: "$t=0.024/0.010=2.40$", color: C.yellow, delay: 170 },
        { at: 7, text: "df $=36-1=35$", color: C.exam },
        { at: 8, text: `df 35: ${t35(0.025).toFixed(3)} < 2.40 < ${t35(0.01).toFixed(3)} → .01 < p < .025`, color: C.yellow },
        { at: 9, text: "whole range < α = .05 → **reject** $H_0$: mean reaction time > 0.400 s (slower)", color: C.soccer },
        { at: 10, text: "parameter → z or t → SE → tail → table → p vs α → words", color: C.yellow },
      ],
    },
  },

  /* ---------------- CHAPTER 19 ---------------- */
  {
    id: "ch19-final-ci",
    lines: [792, 814],
    type: "ProportionDots",
    tag: "soccer",
    description: "62 of 100 players prefer morning training: p̂=.62, SE≈.04854, E≈.0951, 95% CI ≈ (.5249, .7151); contrast with H0 p=.50.",
    props: {
      titles: ["62 of 100 sampled players prefer morning training", "Parameter: one proportion $p$ → z", "95% → $z^*=1.96$", "Standard error and margin of error", "The interval", "Success/failure check", "Interpretation", "If instead we tested $p>0.50$…", "CI uses $\\hat p$ · test uses $p_0$"],
      yes: 62,
      n: 100,
      yesLabel: "prefers morning training",
      noLabel: "does not",
      ci: { lo: 0.5249, hi: 0.7151, center: 0.62, at: 4, min: 0.45, max: 0.8, ticks: [0.5, 0.6, 0.7] },
      work: [
        { at: 1, text: "$\\hat p=0.62$, $\\hat q=0.38$", until: 5 },
        { at: 2, text: "$z^*=1.96$", until: 5 },
        { at: 3, text: "SE ≈ 0.04854 · E ≈ 0.0951", color: C.concept, until: 7 },
        { at: 4, text: "CI ≈ (0.5249, 0.7151)", color: C.yellow, until: 7 },
        { at: 5, text: "$100(0.62)=62\\ge10$ ✓ · $100(0.38)=38\\ge10$ ✓", until: 7 },
        { at: 6, text: "95% confident: true p between the endpoints", color: C.soccer, until: 7 },
        { at: 7, text: "$H_0:p=0.50$ · $H_a:p>0.50$", color: C.exam },
        { at: 7, text: "test SE uses $0.50\\times0.50$, not $0.62\\times0.38$", color: C.exam, delay: 60 },
      ],
    },
  },

  /* ---------------- CHAPTER 20 ---------------- */
  {
    id: "ch20-recap",
    lines: [819, 843],
    type: "CardsScene",
    tag: "exam",
    description: "Ten recognition cues replayed as tiles.",
    props: {
      titles: ["If you remember nothing else…"],
      cols: 2,
      cardHeight: 96,
      titleSize: 25,
      cards: [
        { title: "1 · continuous probability = AREA; $P(X=x)=0$", at: 1, hi: [1], color: C.concept },
        { title: "2 · Uniform flat · Exponential wait · Normal bell", at: 2, hi: [2], color: C.concept },
        { title: "3 · z-score = # of SDs from the mean", at: 3, hi: [3], color: C.concept },
        { title: "4 · z-table = AREA TO THE LEFT", at: 4, hi: [4], color: C.concept },
        { title: "5 · CI = estimate ± critical × SE", at: 5, hi: [5], color: C.soccer },
        { title: "6 · proportions → z · means → t", at: 6, hi: [6], color: C.soccer },
        { title: "7 · t-table: df + UPPER-TAIL probability", at: 7, hi: [7], color: C.exam },
        { title: "8 · less → left · greater → right · ≠ → both", at: 8, hi: [8], color: C.exam },
        { title: "9 · p < α → reject $H_0$; else fail to reject", at: 9, hi: [9], color: C.exam },
        { title: "10 · identify the parameter FIRST", at: 10, hi: [10], color: C.yellow },
      ],
      footer: [
        { at: 11, text: "sample says → measure uncertainty with SE → compare with what you estimate or test", color: C.yellow },
        { at: 12, text: "the real structure behind this entire exam", color: C.soccer },
      ],
    },
  },

  /* ---------------- OUTRO ---------------- */
  { id: "outro", lines: [848, 854], type: "OutroScene", tag: "soccer", description: "Replay passes and the five self-check questions." },
];
