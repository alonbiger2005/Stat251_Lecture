import React from "react";
import { ease, mix, rise } from "../lib/anim";
import { gaussian, rng } from "../lib/stats";
import { C, FONT, MONO } from "../theme";
import { CurvePlot, CurveStepCfg, resolveSteps } from "../components/CurvePlot";
import { RichText } from "../components/RichText";
import { TTableLookup, ZTableLookup } from "../components/tables";
import { Player } from "../components/soccer";
import { Heading, pick, SceneFC, WorkLine, WorkLines } from "./generic";

/* Shared: plot driven by steps (no title) */
const usePlot = (steps: CurveStepCfg[], step: number, stepFrame: number, map?: number[]) => {
  const resolved = React.useMemo(() => resolveSteps(steps), [steps]);
  const idx = (k: number) => Math.min(resolved.length - 1, map ? map[Math.min(k, map.length - 1)] : k);
  const ci = idx(step);
  const pi = step > 0 ? idx(step - 1) : ci;
  return { prev: resolved[pi], cur: resolved[ci], t: ci === pi ? 1 : ease(stepFrame, 0, 26) };
};

/* ---------------- z-table lookup with matching curve ---------------- */
export interface TableStepCfg {
  rows: number[];
  hiRow?: number;
  hiCol?: number;
}
export const ZTableScene: SceneFC<{ titles: string[]; tables: (TableStepCfg | undefined)[]; steps: CurveStepCfg[]; work?: WorkLine[]; stepMap?: number[] }> = ({ ctx, props }) => {
  const tb = pick(props.tables, ctx.step)!;
  const prevTb = ctx.step > 0 ? pick(props.tables, ctx.step - 1) : undefined;
  const fresh = !prevTb || JSON.stringify(prevTb) !== JSON.stringify(tb);
  const prog = fresh ? ease(ctx.stepFrame, 6, 60) : 1;
  const plot = usePlot(props.steps, ctx.step, ctx.stepFrame, props.stepMap);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <ZTableLookup rows={tb.rows} hiRow={tb.hiRow} hiCol={tb.hiCol} progress={prog} width={ctx.width} fontSize={ctx.width > 1200 ? 28 : 23} />
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <CurvePlot prev={plot.prev} cur={plot.cur} t={plot.t} width={ctx.width - (props.work ? 380 : 0)} height={ctx.height - 80 - 60 - tb.rows.length * 46 - 20} />
        {props.work && (
          <div style={{ width: 360, paddingTop: 10 }}>
            <WorkLines ctx={ctx} lines={props.work} width={360} size={28} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- t-table lookup with matching curve ---------------- */
export const TTableScene: SceneFC<{
  titles: string[];
  tables: ({ dfs: number[]; hiDf?: number; hiAlpha?: number; bracket?: [number, number] } | undefined)[];
  steps: CurveStepCfg[];
  work?: WorkLine[];
  stepMap?: number[];
}> = ({ ctx, props }) => {
  const tb = pick(props.tables, ctx.step)!;
  const prevTb = ctx.step > 0 ? pick(props.tables, ctx.step - 1) : undefined;
  const fresh = !prevTb || JSON.stringify(prevTb) !== JSON.stringify(tb);
  const prog = fresh ? ease(ctx.stepFrame, 6, 60) : 1;
  const plot = usePlot(props.steps, ctx.step, ctx.stepFrame, props.stepMap);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <TTableLookup dfs={tb.dfs} hiDf={tb.hiDf} hiAlpha={tb.hiAlpha} bracket={tb.bracket} progress={prog} width={ctx.width} fontSize={ctx.width > 1200 ? 28 : 24} />
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <CurvePlot prev={plot.prev} cur={plot.cur} t={plot.t} width={ctx.width - (props.work ? 380 : 0)} height={ctx.height - 80 - 60 - tb.dfs.length * 47 - 20} />
        {props.work && (
          <div style={{ width: 360, paddingTop: 10 }}>
            <WorkLines ctx={ctx} lines={props.work} width={360} size={28} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- side-by-side: z-table vs t-table semantics ---------------- */
export const TableCompare: SceneFC = ({ ctx }) => {
  const zc = resolveSteps([
    {
      curves: [{ id: "z", dist: { kind: "normal", mu: 0, sigma: 1 }, color: C.concept }],
      dom: [-3.5, 3.5],
      yMax: 0.45,
      shades: [{ id: "l", from: -9, to: 1.2, color: C.shade, label: "table value", labelX: -0.6, labelY: 0.5 }],
      markers: [{ id: "m", x: 1.2, label: "$z$", color: C.yellow, top: 0.3 }],
      ticks: [{ v: 0, label: "0" }],
    },
  ])[0];
  const tc = resolveSteps([
    {
      curves: [{ id: "t", dist: { kind: "t", df: 10 }, color: C.exam }],
      dom: [-3.5, 3.5],
      yMax: 0.45,
      shades: [{ id: "u", from: 2.228, to: 9, color: C.shadeAlt, label: "chosen area", labelX: 2.9, labelY: 0.42 }],
      markers: [{ id: "m", x: 2.228, label: "$t^*$ (table value)", color: C.yellow, top: 0.45 }],
      ticks: [{ v: 0, label: "0" }],
    },
  ])[0];
  const w = (ctx.width - 30) / 2;
  const s1 = ctx.at(1, 20);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["Two tables, two **different** questions", "t-table: pick the df **row** and the upper-tail **column**"]} />
      <div style={{ display: "flex", gap: 30 }}>
        {[
          { cfg: zc, title: "z-table", body: "you look up z → it gives the **area to the LEFT**", col: C.concept },
          { cfg: tc, title: "t-table", body: "you choose df + **upper-tail area** → it gives the **critical t**", col: C.exam },
        ].map((p, i) => (
          <div key={p.title} style={{ width: w, background: C.panel, borderRadius: 18, border: `3px solid ${p.col}`, padding: 16, opacity: i === 1 ? 0.5 + 0.5 * Math.max(ease(ctx.frame, 30, 20), s1) : 1 }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: p.col }}>{p.title}</div>
            <RichText text={p.body} size={27} color={C.text} />
            <CurvePlot prev={p.cfg} cur={p.cfg} t={1} width={w - 32} height={380} appear={ease(ctx.frame, 10 + i * 30, 30)} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 28, color: C.muted, textAlign: "center", opacity: s1 }}>
        <RichText text="With t you usually don't hunt for an exact p-value — you bracket it between columns." size={28} color={C.muted} />
      </div>
    </div>
  );
};

/* ---------------- CLT: repeated samples of 50 goalkeepers ---------------- */
export const CltSampling: SceneFC = ({ ctx }) => {
  // population: right-skewed reaction times (s); sample means pile up into a bell
  const r = React.useMemo(() => rng(42), []);
  const popDraw = React.useCallback((rr: () => number) => 0.3 + 0.05 * (-Math.log(1 - rr()) + -Math.log(1 - rr())), []); // gamma(2) mean .40, sd≈.0707
  const nOf = ctx.step >= 5 ? [10, 50, 200][Math.min(2, Math.floor(ctx.stepFrame / 70))] : 50;
  const means = React.useMemo(() => {
    const out: Record<number, number[]> = {};
    for (const n of [10, 50, 200]) {
      const rr = rng(1000 + n);
      out[n] = Array.from({ length: 160 }, () => {
        let s = 0;
        for (let i = 0; i < n; i++) s += popDraw(rr);
        return s / n;
      });
    }
    return out;
  }, [popDraw]);
  void r;
  const totalShown = ctx.step === 0 ? Math.floor(ease(ctx.stepFrame, 10, 200) * 60) : ctx.step === 1 ? 60 + Math.floor(ease(ctx.stepFrame, 0, 200) * 100) : 160;
  const list = means[nOf].slice(0, totalShown);
  const lo = 0.33;
  const hi = 0.47;
  const bins = 28;
  const counts = new Array(bins).fill(0);
  for (const m of list) {
    const b = Math.floor(((m - lo) / (hi - lo)) * bins);
    if (b >= 0 && b < bins) counts[b]++;
  }
  const W = ctx.width;
  const histH = 330;
  const bw = (W - 80) / bins;
  const maxC = nOf === 200 ? 52 : nOf === 50 ? 30 : 19;
  const sigma = 0.0707;
  const se = sigma / Math.sqrt(nOf);
  const xOf = (v: number) => 40 + ((v - lo) / (hi - lo)) * (W - 80);
  const showCurve = ctx.step >= 2;
  const curvePts = Array.from({ length: 200 }, (_, i) => {
    const x = lo + ((hi - lo) * i) / 199;
    const dens = Math.exp(-0.5 * ((x - 0.4) / se) ** 2) / (se * Math.sqrt(2 * Math.PI));
    const y = (dens * list.length * ((hi - lo) / bins)) / maxC;
    return `${i ? "L" : "M"}${xOf(x).toFixed(1)},${(histH - Math.min(1.1, y) * histH).toFixed(1)}`;
  }).join(" ");
  const dots = Array.from({ length: 50 }, (_, i) => i);
  const sampleSeed = Math.floor(ctx.frame / 12);
  const rr = rng(sampleSeed);
  return (
    <div style={{ width: W, height: ctx.height, fontFamily: FONT }}>
      <Heading
        ctx={ctx}
        titles={[
          "Bridge to Module 5: repeat the study again and again",
          "Each sample of 50 keepers → one $\\bar x$",
          "CLT: the sample means are approximately Normal",
          "Standard error = SD of a **statistic**",
          "SD: individuals vary · SE: sample means vary",
          "Larger $n$ → larger $\\sqrt n$ → smaller SE",
          "Watch the spread shrink as $n$ grows",
        ]}
        size={32}
      />
      <svg width={W} height={ctx.height - 80}>
        {/* one sample of 50 keepers */}
        <g transform="translate(20, 0)">
          <text x={0} y={26} fill={C.muted} fontSize={22} fontFamily={FONT}>
            one random sample of {nOf} goalkeepers (reaction times)
          </text>
          {dots.map((i) => {
            const v = popDraw(rr);
            return <circle key={i} cx={xOf(Math.min(hi + 0.06, v)) - 20} cy={60 + (i % 5) * 14} r={6} fill={C.soccer} opacity={0.8} />;
          })}
        </g>
        <g transform="translate(0, 170)">
          <text x={40} y={-14} fill={C.muted} fontSize={22} fontFamily={FONT}>
            collection of sample means x̄ → the sampling distribution
          </text>
          {counts.map((c, i) => (
            <rect key={i} x={40 + i * bw + 2} y={histH - (c / maxC) * histH} width={bw - 4} height={(c / maxC) * histH} fill={C.concept} opacity={0.85} rx={3} />
          ))}
          {showCurve && <path d={curvePts} fill="none" stroke={C.yellow} strokeWidth={5} opacity={ease(ctx.frame - ctx.stepStart(2), 0, 30)} />}
          <line x1={40} x2={W - 40} y1={histH} y2={histH} stroke={C.muted} strokeWidth={3} />
          {[0.34, 0.37, 0.4, 0.43, 0.46].map((v) => (
            <text key={v} x={xOf(v)} y={histH + 34} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={MONO}>
              {v.toFixed(2)}
            </text>
          ))}
          <line x1={xOf(0.4)} x2={xOf(0.4)} y1={0} y2={histH} stroke={C.yellow} strokeDasharray="8 8" strokeWidth={3} opacity={showCurve ? 1 : 0} />
          <text x={xOf(0.4) + 10} y={20} fill={C.yellow} fontSize={24} fontFamily={FONT} opacity={showCurve ? 1 : 0}>
            center μ
          </text>
        </g>
        {ctx.step >= 3 && (
          <g transform={`translate(${W - 420}, 540)`} opacity={ease(ctx.frame - ctx.stepStart(3), 0, 20)}>
            <rect x={0} y={0} width={400} height={110} rx={14} fill={C.panel} stroke={C.line} />
            <text x={20} y={44} fill={C.text} fontSize={28} fontFamily={MONO}>
              n = {nOf}
            </text>
            <text x={20} y={88} fill={C.yellow} fontSize={28} fontFamily={MONO}>
              SE = σ/√{nOf}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

/* ---------------- number line with an interval ---------------- */
export const NumberLineCI: React.FC<{
  width: number;
  min: number;
  max: number;
  ticks: { v: number; label: string }[];
  center: number;
  lo: number;
  hi: number;
  grow?: number;
  color?: string;
  nullValue?: { v: number; label: string; color?: string };
  centerLabel?: string;
  loLabel?: string;
  hiLabel?: string;
  y?: number;
  height?: number;
  openLeft?: boolean;
  openRight?: boolean;
}> = ({ width, min, max, ticks, center, lo, hi, grow = 1, color = C.soccer, nullValue, centerLabel, loLabel, hiLabel, y = 120, height = 260, openLeft, openRight }) => {
  const x = (v: number) => 40 + ((v - min) / (max - min)) * (width - 80);
  const L = openLeft ? x(min) : mix(x(center), x(lo), grow);
  const R = openRight ? x(max) : mix(x(center), x(hi), grow);
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <line x1={20} x2={width - 20} y1={y} y2={y} stroke={C.muted} strokeWidth={4} />
      {ticks.map((t) => (
        <g key={t.label + t.v}>
          <line x1={x(t.v)} x2={x(t.v)} y1={y - 10} y2={y + 10} stroke={C.muted} strokeWidth={3} />
          <text x={x(t.v)} y={y + 46} fill={C.text} fontSize={24} textAnchor="middle" fontFamily={MONO}>
            {t.label}
          </text>
        </g>
      ))}
      <rect x={L} y={y - 16} width={Math.max(0, R - L)} height={32} rx={16} fill={color} opacity={0.35} />
      <line x1={L} x2={R} y1={y} y2={y} stroke={color} strokeWidth={10} strokeLinecap="round" />
      {!openLeft && <line x1={L} x2={L} y1={y - 30} y2={y + 30} stroke={color} strokeWidth={6} />}
      {!openRight && <line x1={R} x2={R} y1={y - 30} y2={y + 30} stroke={color} strokeWidth={6} />}
      {openRight && <polygon points={`${R + 4},${y} ${R - 18},${y - 14} ${R - 18},${y + 14}`} fill={color} />}
      {openLeft && <polygon points={`${L - 4},${y} ${L + 18},${y - 14} ${L + 18},${y + 14}`} fill={color} />}
      <circle cx={x(center)} cy={y} r={13} fill={C.yellow} />
      {centerLabel && (
        <text x={x(center)} y={y - 44} fill={C.yellow} fontSize={26} textAnchor="middle" fontFamily={FONT} fontWeight={800}>
          {centerLabel}
        </text>
      )}
      {loLabel && !openLeft && (
        <text x={L} y={y + 86} fill={color} fontSize={26} textAnchor="middle" fontFamily={MONO} fontWeight={700} opacity={grow}>
          {loLabel}
        </text>
      )}
      {hiLabel && !openRight && (
        <text x={R} y={y + 86} fill={color} fontSize={26} textAnchor="middle" fontFamily={MONO} fontWeight={700} opacity={grow}>
          {hiLabel}
        </text>
      )}
      {nullValue && (
        <g>
          <line x1={x(nullValue.v)} x2={x(nullValue.v)} y1={y - 70} y2={y + 26} stroke={nullValue.color ?? C.danger} strokeWidth={4} strokeDasharray="8 6" />
          <text x={x(nullValue.v)} y={y - 80} fill={nullValue.color ?? C.danger} fontSize={24} textAnchor="middle" fontFamily={FONT} fontWeight={800}>
            {nullValue.label}
          </text>
        </g>
      )}
    </svg>
  );
};

/* ---------------- CI structure: estimate ± margin ---------------- */
export const CiStructure: SceneFC = ({ ctx }) => {
  const grow = ctx.step === 0 ? ease(ctx.stepFrame, 20, 40) : 1;
  const pulse = ctx.step >= 3 ? 0.75 + 0.25 * Math.sin(ctx.frame / 8) : 1;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["A range of plausible values for an unknown parameter", "Confidence interval = point estimate ± margin of error", "Margin of error = critical value × standard error", "The single pattern under every CI formula"]} />
      <div style={{ marginTop: 40 }}>
        <NumberLineCI
          width={ctx.width}
          min={0}
          max={10}
          ticks={[]}
          center={5}
          lo={5 - 2.6 * pulse}
          hi={5 + 2.6 * pulse}
          grow={grow}
          centerLabel="point estimate"
          loLabel="estimate − ME"
          hiLabel="estimate + ME"
          height={300}
          y={150}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 30, opacity: ctx.step >= 2 ? ctx.at(2, 20) : 0 }}>
        {[
          ["margin of error", C.soccer],
          ["=", C.muted],
          ["critical value", C.exam],
          ["×", C.muted],
          ["standard error", C.concept],
        ].map(([t, c], i) => (
          <div
            key={i}
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: c,
              border: t.length > 2 ? `3px solid ${c}` : undefined,
              borderRadius: 14,
              padding: t.length > 2 ? "10px 18px" : "10px 0",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 34, fontSize: 28, color: C.muted, opacity: ctx.step >= 3 ? ctx.at(3, 20) : 0 }}>
        <span>
          <b style={{ color: C.exam }}>critical value</b>: z* or t* from a table
        </span>
        <span>
          <b style={{ color: C.concept }}>SE</b>: how much the estimate varies
        </span>
      </div>
    </div>
  );
};

/* ---------------- 100-player proportion grid + CI ---------------- */
export const ProportionDots: SceneFC<{
  titles: string[];
  yes: number;
  n: number;
  yesLabel: string;
  noLabel: string;
  ci?: { lo: number; hi: number; center: number; at: number; min: number; max: number; ticks: number[] };
  work?: WorkLine[];
  hideCount?: boolean;
}> = ({ ctx, props }) => {
  const cols = 20;
  const fill = ease(ctx.frame, 10, 80);
  const shownYes = Math.round(props.yes * fill);
  const cellW = Math.min(44, (ctx.width - 420) / cols);
  const grow = props.ci ? (ctx.step === props.ci.at ? ease(ctx.stepFrame, 10, 40) : ctx.step > props.ci.at ? 1 : 0) : 0;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", gap: 26 }}>
        <svg width={cols * cellW + 10} height={Math.ceil(props.n / cols) * cellW + 90}>
          {Array.from({ length: props.n }, (_, i) => (
            <circle key={i} cx={cellW / 2 + (i % cols) * cellW} cy={cellW / 2 + Math.floor(i / cols) * cellW} r={cellW * 0.38} fill={i < shownYes ? C.soccer : C.panel2} stroke={C.line} />
          ))}
          <g transform={`translate(0, ${Math.ceil(props.n / cols) * cellW + 30})`}>
            <circle cx={12} cy={0} r={12} fill={C.soccer} />
            <text x={32} y={8} fill={C.text} fontSize={24} fontFamily={FONT}>
              {props.yesLabel}
            </text>
            <circle cx={12} cy={34} r={12} fill={C.panel2} stroke={C.line} />
            <text x={32} y={42} fill={C.text} fontSize={24} fontFamily={FONT}>
              {props.noLabel}
            </text>
          </g>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 30, color: C.muted }}>{props.hideCount ? "each dot = one sampled player" : `sample of n = ${props.n}`}</div>
          <div style={{ fontWeight: 900, color: C.soccer, margin: "4px 0 8px" }}>
            <RichText text={props.hideCount ? "$\\hat p$ = observed fraction" : `$\\hat p = ${props.yes}/${props.n}$`} size={props.hideCount ? 40 : 52} color={C.soccer} />
          </div>
          <WorkLines ctx={ctx} lines={props.work} width={ctx.width - cols * cellW - 40} size={28} />
        </div>
      </div>
      {props.ci && (
        <div style={{ opacity: grow > 0 ? 1 : 0 }}>
          <NumberLineCI
            width={ctx.width}
            min={props.ci.min}
            max={props.ci.max}
            ticks={props.ci.ticks.map((v) => ({ v, label: v.toFixed(2) }))}
            center={props.ci.center}
            lo={props.ci.lo}
            hi={props.ci.hi}
            grow={grow}
            centerLabel="p̂"
            loLabel={props.ci.lo.toFixed(4)}
            hiLabel={props.ci.hi.toFixed(4)}
            height={200}
            y={80}
          />
        </div>
      )}
    </div>
  );
};

/* ---------------- generic CI number-line scene with steps ---------------- */
export interface LineCfg {
  label?: string;
  min: number;
  max: number;
  ticks: { v: number; label: string }[];
  center: number;
  lo: number;
  hi: number;
  color?: string;
  centerLabel?: string;
  loLabel?: string;
  hiLabel?: string;
  nullValue?: { v: number; label: string; color?: string };
  openLeft?: boolean;
  openRight?: boolean;
  verdict?: string;
  at?: number;
}
export const CiLinesScene: SceneFC<{ titles: string[]; lines: LineCfg[]; work?: WorkLine[]; illustration?: "keepers" | "voters" | "none" }> = ({ ctx, props }) => {
  const vis = props.lines.filter((l) => ctx.step >= (l.at ?? 0));
  const h = Math.min(250, (ctx.height - 90 - (props.work ? 140 : 0)) / Math.max(1, vis.length));
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      {props.work && <WorkLines ctx={ctx} lines={props.work} width={ctx.width} size={28} />}
      {vis.map((l, i) => {
        const fresh = (l.at ?? 0) === ctx.step;
        const g = fresh ? ease(ctx.stepFrame, 8, 36) : 1;
        return (
          <div key={i} style={{ position: "relative", ...(fresh ? rise(ctx.stepFrame, 0, 14) : {}) }}>
            {(l.label || l.verdict) && (
              <div style={{ marginLeft: 20, display: "flex", gap: 18, alignItems: "baseline" }}>
                {l.label && <RichText text={l.label} size={26} color={C.muted} style={{ fontWeight: 700 }} />}
                {l.verdict && <RichText text={l.verdict} size={26} color={l.color ?? C.soccer} style={{ fontWeight: 800, opacity: g }} />}
              </div>
            )}
            <NumberLineCI {...l} width={ctx.width} grow={g} height={h - 30} y={Math.min(90, h * 0.42)} />
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- repeated-sampling coverage ---------------- */
export const CiCoverage: SceneFC = ({ ctx }) => {
  const N = 40;
  const r = React.useMemo(() => rng(95), []);
  const ints = React.useMemo(
    () =>
      Array.from({ length: N }, () => {
        const c = 0.52 + gaussian(r) * 0.01;
        return { c, lo: c - 0.0196, hi: c + 0.0196 };
      }),
    [r],
  );
  const shown = Math.floor(ease(ctx.frame, 20, 220) * N);
  const x = (v: number) => 60 + ((v - 0.47) / 0.1) * (ctx.width - 120);
  const hit = ints.slice(0, shown).filter((i) => i.lo <= 0.52 && i.hi >= 0.52).length;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["What “95% confident” really means: the **method** captures the truth ~95% of the time"]} size={30} />
      <svg width={ctx.width} height={560}>
        <line x1={x(0.52)} x2={x(0.52)} y1={0} y2={540} stroke={C.yellow} strokeWidth={4} strokeDasharray="10 8" />
        <text x={x(0.52) + 10} y={24} fill={C.yellow} fontSize={24} fontFamily={FONT} fontWeight={800}>
          fixed true parameter
        </text>
        {ints.slice(0, shown).map((it, i) => {
          const ok = it.lo <= 0.52 && it.hi >= 0.52;
          return (
            <g key={i}>
              <line x1={x(it.lo)} x2={x(it.hi)} y1={44 + i * 12.4} y2={44 + i * 12.4} stroke={ok ? C.soccer : C.danger} strokeWidth={6} strokeLinecap="round" />
              <circle cx={x(it.c)} cy={44 + i * 12.4} r={4} fill="#fff" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 24, fontSize: 28 }}>
        <div style={{ flex: 1, color: C.soccer, fontWeight: 800 }}>
          captured: {hit} / {shown}
        </div>
        <div style={{ flex: 2, color: C.danger, fontWeight: 800, textAlign: "right", opacity: ease(ctx.frame, 120, 20) }}>
          ✗ NOT “95% probability the parameter is in THIS interval”
        </div>
      </div>
    </div>
  );
};

/* ---------------- dot plots for one / two groups ---------------- */
export interface GroupCfg {
  name: string;
  mean: number;
  sd: number;
  n: number;
  color: string;
  seed: number;
}
export const GroupsScene: SceneFC<{
  titles: string[];
  groups: GroupCfg[];
  min: number;
  max: number;
  ticks: number[];
  unit?: string;
  work?: WorkLine[];
  showMeansAt?: number;
  showSdAt?: number;
  diffAt?: number;
  hideNumbers?: boolean;
}> = ({ ctx, props }) => {
  const width = ctx.width;
  const x = (v: number) => 40 + ((v - props.min) / (props.max - props.min)) * (width - 80);
  const rowH = 150;
  return (
    <div style={{ width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <svg width={width} height={props.groups.length * rowH + 80}>
        {props.groups.map((g, gi) => {
          const rr = rng(g.seed);
          const vals = Array.from({ length: g.n }, () => g.mean + gaussian(rr) * g.sd);
          // standardise sample so its mean/sd match the stated values exactly
          const m = vals.reduce((a, b) => a + b, 0) / vals.length;
          const sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / (vals.length - 1));
          const adj = vals.map((v) => g.mean + ((v - m) / sd) * g.sd);
          const y0 = 30 + gi * rowH;
          const app = ease(ctx.frame, 8 + gi * 20, 40);
          const meansOn = props.showMeansAt !== undefined && ctx.step >= props.showMeansAt;
          const sdOn = props.showSdAt !== undefined && ctx.step >= props.showSdAt;
          // simple stacking
          const stack = new Map<number, number>();
          return (
            <g key={g.name} opacity={app}>
              <text x={20} y={y0 + 10} fill={g.color} fontSize={26} fontWeight={800} fontFamily={FONT}>
                {g.name}
              </text>
              {adj.map((v, i) => {
                const b = Math.round(x(v) / 16);
                const k = stack.get(b) ?? 0;
                stack.set(b, k + 1);
                return <circle key={i} cx={b * 16} cy={y0 + rowH - 40 - k * 15} r={7} fill={g.color} opacity={i / adj.length < app ? 0.85 : 0} />;
              })}
              <line x1={30} x2={width - 30} y1={y0 + rowH - 28} y2={y0 + rowH - 28} stroke={C.line} strokeWidth={2} />
              {meansOn && (
                <g>
                  <line x1={x(g.mean)} x2={x(g.mean)} y1={y0 + 20} y2={y0 + rowH - 20} stroke={C.yellow} strokeWidth={5} />
                  <text x={x(g.mean) + 8} y={y0 + 36} fill={C.yellow} fontSize={24} fontFamily={MONO} fontWeight={700}>
                    x̄{props.groups.length > 1 ? String.fromCharCode(8321 + gi) : ""}{props.hideNumbers ? "" : ` = ${g.mean}`}
                  </text>
                </g>
              )}
              {sdOn && (
                <g>
                  <line x1={x(g.mean - g.sd)} x2={x(g.mean + g.sd)} y1={y0 + 52} y2={y0 + 52} stroke={C.concept} strokeWidth={4} />
                  <text x={x(g.mean + g.sd) + 8} y={y0 + 60} fill={C.concept} fontSize={22} fontFamily={MONO}>
                    ±s
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <g transform={`translate(0, ${props.groups.length * rowH + 10})`}>
          {props.ticks.map((v) => (
            <text key={v} x={x(v)} y={30} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={MONO}>
              {v}
            </text>
          ))}
          {props.unit && (
            <text x={width - 40} y={64} fill={C.muted} fontSize={22} textAnchor="end" fontFamily={FONT}>
              {props.unit}
            </text>
          )}
        </g>
        {props.diffAt !== undefined && ctx.step >= props.diffAt && props.groups.length === 2 && (
          <g opacity={ctx.at(props.diffAt, 20)}>
            <line x1={x(props.groups[0].mean)} x2={x(props.groups[1].mean)} y1={rowH + 20} y2={rowH + 20} stroke={C.yellow} strokeWidth={5} markerEnd="" />
            <text x={(x(props.groups[0].mean) + x(props.groups[1].mean)) / 2} y={rowH + 10} fill={C.yellow} fontSize={24} textAnchor="middle" fontFamily={FONT} fontWeight={800}>
              x̄₁ − x̄₂
            </text>
          </g>
        )}
      </svg>
      <WorkLines ctx={ctx} lines={props.work} width={width} size={28} />
    </div>
  );
};

/* ---------------- paired before / after ---------------- */
export const PairedScene: SceneFC<{ titles: string[]; work?: WorkLine[]; diffAt: number; statAt?: number }> = ({ ctx, props }) => {
  const players = 8;
  const rr = rng(12);
  const before = Array.from({ length: players }, () => 0.44 + gaussian(rr) * 0.035);
  const after = before.map((b) => b - 0.02 + gaussian(rr) * 0.01);
  const d = after.map((a, i) => a - before[i]);
  const showDiff = ctx.step >= props.diffAt;
  const dt = showDiff ? (ctx.step === props.diffAt ? ease(ctx.stepFrame, 10, 40) : 1) : 0;
  const x = (v: number) => 120 + ((v - 0.36) / 0.16) * (ctx.width * 0.55 - 160);
  const dbar = d.reduce((a, b) => a + b, 0) / players;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", gap: 20 }}>
        <svg width={ctx.width * 0.55} height={560}>
          <text x={x(0.4)} y={26} fill={C.muted} fontSize={22} fontFamily={FONT} textAnchor="middle">
            reflex-drill time (s): before → after training
          </text>
          {before.map((b, i) => {
            const y = 70 + i * 60;
            return (
              <g key={i}>
                <Player x={40} y={y + 22} scale={0.28} keeper jersey="#FF8A3D" number={i + 1} />
                <line x1={x(b)} x2={x(after[i])} y1={y} y2={y} stroke={C.line} strokeWidth={4} />
                <circle cx={x(b)} cy={y} r={11} fill={C.danger} />
                <circle cx={x(after[i])} cy={y} r={11} fill={C.soccer} />
              </g>
            );
          })}
          <g transform="translate(0, 540)">
            <circle cx={130} cy={0} r={10} fill={C.danger} />
            <text x={148} y={8} fill={C.text} fontSize={22} fontFamily={FONT}>
              before
            </text>
            <circle cx={260} cy={0} r={10} fill={C.soccer} />
            <text x={278} y={8} fill={C.text} fontSize={22} fontFamily={FONT}>
              after
            </text>
          </g>
        </svg>
        <div style={{ flex: 1, opacity: dt }}>
          <div style={{ fontSize: 26, color: C.yellow, fontWeight: 800, marginBottom: 8 }}>one list of differences d = after − before</div>
          <svg width={360} height={8 * 46 + 20}>
            <line x1={180} x2={180} y1={0} y2={8 * 46 + 10} stroke={C.muted} strokeWidth={2} />
            {d.map((v, i) => (
              <g key={i}>
                <text x={8} y={i * 46 + 30} fill={C.text} fontSize={24} fontFamily={MONO}>
                  d{String.fromCharCode(8321 + i)}
                </text>
                <rect x={v < 0 ? 180 + v * 3000 * dt : 180} y={i * 46 + 10} width={Math.abs(v) * 3000 * dt} height={26} rx={5} fill={v < 0 ? C.soccer : C.danger} />
              </g>
            ))}
            {props.statAt !== undefined && ctx.step >= props.statAt && (
              <line x1={180 + dbar * 3000} x2={180 + dbar * 3000} y1={0} y2={8 * 46 + 10} stroke={C.yellow} strokeWidth={5} strokeDasharray="8 6" />
            )}
          </svg>
          {props.statAt !== undefined && ctx.step >= props.statAt && (
            <div style={{ marginTop: 12, ...rise(ctx.frame - ctx.stepStart(props.statAt), 0, 14) }}>
              <RichText text={`yellow line: $\\bar d$ (mean difference) · $s_d$: SD of the d’s · $n = ${players}$ pairs`} size={26} color={C.yellow} />
            </div>
          )}
        </div>
      </div>
      <WorkLines ctx={ctx} lines={props.work} width={ctx.width} size={28} />
    </div>
  );
};

/* ---------------- sample size n vs E ---------------- */
export const SampleSizeScene: SceneFC = ({ ctx }) => {
  const W = ctx.width;
  const H = 470;
  const pad = 70;
  const Emin = 0.005;
  const Emax = 0.06;
  const nOf = (E: number) => (1.96 ** 2 * 0.25) / E ** 2;
  const nMax = 16000;
  const xs = (E: number) => pad + ((E - Emin) / (Emax - Emin)) * (W - 2 * pad);
  const ys = (n: number) => H - 50 - (Math.min(n, nMax) / nMax) * (H - 90);
  const path = Array.from({ length: 200 }, (_, i) => {
    const E = Emin + 0.0003 + ((Emax - Emin - 0.0003) * i) / 199;
    return `${i ? "L" : "M"}${xs(E).toFixed(1)},${ys(nOf(E)).toFixed(1)}`;
  }).join(" ");
  // sweep E
  const sweep = ctx.step <= 1 ? 0.06 - 0.045 * (0.5 + 0.5 * Math.sin(ctx.frame / 40)) : 0.01;
  const showPar = ctx.step >= 4 && ctx.step < 6;
  const E = ctx.step >= 6 ? 0.01 : sweep;
  return (
    <div style={{ width: W, height: ctx.height, fontFamily: FONT }}>
      <Heading
        ctx={ctx}
        titles={[
          "Sample size needed for a target margin of error",
          "Start from the margin of error for one proportion",
          "Solve for n",
          "$n$ grows like $1/E^2$: halve E → 4× the players",
          "No prior estimate? Use $\\hat p = 0.5$ (largest $\\hat p(1-\\hat p)$)",
          "Always round **up**",
          "Worked: 95%, E = 0.01 → n = 9604",
        ]}
        size={32}
      />
      {!showPar ? (
        <svg width={W} height={H}>
          <path d={path} fill="none" stroke={C.soccer} strokeWidth={5} />
          <line x1={pad} x2={W - pad} y1={H - 50} y2={H - 50} stroke={C.muted} strokeWidth={3} />
          <line x1={pad} x2={pad} y1={20} y2={H - 50} stroke={C.muted} strokeWidth={3} />
          {[0.01, 0.02, 0.03, 0.04, 0.05].map((v) => (
            <text key={v} x={xs(v)} y={H - 16} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={MONO}>
              {v.toFixed(2)}
            </text>
          ))}
          {[0, 5000, 10000, 15000].map((n) => (
            <text key={n} x={pad - 10} y={ys(n) + 8} fill={C.text} fontSize={20} textAnchor="end" fontFamily={MONO}>
              {n}
            </text>
          ))}
          <text x={W - pad} y={H - 60} fill={C.muted} fontSize={22} textAnchor="end" fontFamily={FONT}>
            margin of error E
          </text>
          <text x={pad + 10} y={30} fill={C.muted} fontSize={22} fontFamily={FONT}>
            required n (95%, p̂ = 0.5)
          </text>
          <circle cx={xs(E)} cy={ys(nOf(E))} r={12} fill={C.yellow} />
          <text x={xs(E) + 18} y={ys(nOf(E)) - 14} fill={C.yellow} fontSize={28} fontFamily={MONO} fontWeight={700}>
            E = {E.toFixed(3)} → n ≈ {Math.ceil(nOf(E) - 1e-6)}
          </text>
        </svg>
      ) : (
        <svg width={W} height={H}>
          {(() => {
            const px = (p: number) => pad + p * (W - 2 * pad);
            const py = (v: number) => H - 50 - (v / 0.27) * (H - 100);
            const d = Array.from({ length: 101 }, (_, i) => `${i ? "L" : "M"}${px(i / 100)},${py((i / 100) * (1 - i / 100))}`).join(" ");
            return (
              <g>
                <path d={d} fill="none" stroke={C.concept} strokeWidth={5} />
                <line x1={pad} x2={W - pad} y1={H - 50} y2={H - 50} stroke={C.muted} strokeWidth={3} />
                {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                  <text key={v} x={px(v)} y={H - 16} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={MONO}>
                    {v}
                  </text>
                ))}
                <circle cx={px(0.5)} cy={py(0.25)} r={13} fill={C.yellow} />
                <text x={px(0.5)} y={py(0.25) - 24} fill={C.yellow} fontSize={28} textAnchor="middle" fontFamily={MONO} fontWeight={700}>
                  max: 0.5 × 0.5 = 0.25
                </text>
                <text x={W - pad} y={40} fill={C.muted} fontSize={24} textAnchor="end" fontFamily={FONT}>
                  p̂(1 − p̂) for every possible p̂
                </text>
              </g>
            );
          })()}
        </svg>
      )}
      {ctx.step >= 5 && (
        <div style={{ display: "flex", gap: 20, justifyContent: "center", fontSize: 30, fontFamily: MONO, ...rise(ctx.frame - ctx.stepStart(5), 0, 16) }}>
          <span style={{ color: C.muted }}>fractional answer →</span>
          <span style={{ color: C.yellow, fontWeight: 800 }}>next whole number UP (⌈ ⌉)</span>
        </div>
      )}
    </div>
  );
};
