import React from "react";
import { ease, rise } from "../lib/anim";
import { rng, tTableEntry } from "../lib/stats";
import { C, FONT, MONO } from "../theme";
import { CurvePlot, CurveStepCfg, resolveSteps } from "../components/CurvePlot";
import { RichText } from "../components/RichText";
import { TTableLookup } from "../components/tables";
import { Player, Stopwatch } from "../components/soccer";
import { Heading, SceneFC, WorkLine, WorkLines } from "./generic";

const plotAt = (steps: CurveStepCfg[], ci: number, pi: number, t: number) => {
  const r = resolveSteps(steps);
  return { prev: r[Math.min(pi, r.length - 1)], cur: r[Math.min(ci, r.length - 1)], t };
};

/* ---------------- tiny tail icon ---------------- */
export const TailIcon: React.FC<{ kind: "left" | "right" | "two"; w?: number; h?: number; color?: string }> = ({ kind, w = 120, h = 56, color = C.yellow }) => {
  const xs = Array.from({ length: 61 }, (_, i) => -3 + (6 * i) / 60);
  const X = (x: number) => ((x + 3) / 6) * w;
  const Y = (x: number) => h - 4 - Math.exp(-0.5 * x * x) * (h - 10);
  const curve = xs.map((x, i) => `${i ? "L" : "M"}${X(x)},${Y(x)}`).join(" ");
  const area = (a: number, b: number) => {
    const pts = xs.filter((x) => x >= a && x <= b);
    return `M${X(a)},${h - 4} ` + pts.map((x) => `L${X(x)},${Y(x)}`).join(" ") + ` L${X(b)},${h - 4} Z`;
  };
  return (
    <svg width={w} height={h}>
      {(kind === "left" || kind === "two") && <path d={area(-3, -1.3)} fill={color} opacity={0.8} />}
      {(kind === "right" || kind === "two") && <path d={area(1.3, 3)} fill={color} opacity={0.8} />}
      <path d={curve} fill="none" stroke="#fff" strokeWidth={3} />
      <line x1={0} x2={w} y1={h - 4} y2={h - 4} stroke={C.muted} strokeWidth={2} />
    </svg>
  );
};

/* ---------------- Decision tree / flow ---------------- */
export interface FlowRow {
  label: string;
  at: number;
  chips: { text: string; hi?: number[]; color?: string; icon?: "left" | "right" | "two"; at?: number }[];
}
export const FlowScene: SceneFC<{ titles: string[]; rows: FlowRow[] }> = ({ ctx, props }) => {
  const rows = props.rows.filter((r) => ctx.step >= r.at);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, ri) => {
          const fresh = r.at === ctx.step;
          return (
            <div key={ri} style={{ display: "flex", alignItems: "stretch", gap: 14, ...(fresh ? rise(ctx.stepFrame, 0, 14) : {}) }}>
              <div style={{ width: 210, display: "flex", alignItems: "center", fontSize: 24, fontWeight: 900, color: C.muted, letterSpacing: 0.5 }}>
                <RichText text={r.label} size={24} color={C.muted} />
              </div>
              <div style={{ flex: 1, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {r.chips
                  .filter((c) => ctx.step >= (c.at ?? r.at))
                  .map((c, ci) => {
                    const hi = c.hi?.includes(ctx.step);
                    const col = c.color ?? C.soccer;
                    const anyHi = r.chips.some((x) => x.hi?.includes(ctx.step));
                    return (
                      <div
                        key={ci}
                        style={{
                          flex: 1,
                          minWidth: 150,
                          background: hi ? "rgba(24,58,44,1)" : C.panel,
                          border: `3px solid ${hi ? col : C.line}`,
                          borderRadius: 14,
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          opacity: anyHi && !hi ? 0.5 : 1,
                          boxShadow: hi ? `0 0 26px ${col}55` : undefined,
                        }}
                      >
                        {c.icon && <TailIcon kind={c.icon} w={90} h={44} />}
                        <RichText text={c.text} size={26} color={C.text} style={{ fontWeight: 700 }} />
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- scrolling cue list ---------------- */
export const CueList: SceneFC<{ titles: string[]; items: { cue: string; method: string; at: number; color?: string }[] }> = ({ ctx, props }) => {
  const vis = props.items.filter((i) => ctx.step >= i.at);
  const windowN = 6;
  const shown = vis.slice(-windowN);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((it, i) => {
          const cur = it.at === ctx.step;
          const col = it.color ?? C.soccer;
          return (
            <div
              key={it.at}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: cur ? "rgba(24,58,44,1)" : C.panel,
                border: `3px solid ${cur ? col : C.line}`,
                borderRadius: 14,
                padding: "12px 18px",
                opacity: cur ? 1 : 0.55 + 0.07 * i,
                ...(cur ? rise(ctx.stepFrame, 0, 14) : {}),
              }}
            >
              <div style={{ flex: 1.3, fontSize: 28, color: C.text, fontStyle: "italic" }}>
                <RichText text={it.cue} size={28} color={C.text} />
              </div>
              <div style={{ fontSize: 34, color: C.muted }}>→</div>
              <div style={{ flex: 1, fontSize: 28, fontWeight: 800, color: col }}>
                <RichText text={it.method} size={28} color={col} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- Professor cats two-proportion example ---------------- */
export const ProfCats: SceneFC = ({ ctx }) => {
  const pF = 13 / 45;
  const pM = 16 / 74;
  const barH = 360;
  const bar = (p: number) => p * barH * 2.4;
  const grow = ease(ctx.frame, 10, 40);
  const curveOn = ctx.step >= 3;
  const plot = plotAt(
    [
      {
        curves: [{ id: "z", dist: { kind: "normal", mu: 0, sigma: 1 }, color: C.text }],
        dom: [-3.5, 3.5],
        yMax: 0.45,
        ticks: [
          { v: 0, label: "0" },
          { v: 0.878, label: "0.878" },
          { v: 1.282, label: "" },
        ],
        shades: [{ id: "p", from: 0.878, to: 9, color: C.shadeAlt, label: "$p \\approx 0.1894$", labelX: 2.2, labelY: 0.42 }],
        markers: [{ id: "z", x: 0.878, label: "$z_{\\mathrm{lecture}}\\approx0.878$", color: C.professor }],
      },
    ],
    0,
    0,
    1,
  );
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading
        ctx={ctx}
        titles={["Lecture example: who prefers cats?", "Original data: females 13 of 45 · males 16 of 74", "$H_0: p_F - p_M = 0$ vs $H_a: p_F - p_M > 0$", "Lecture result: right-tail p ≈ 0.1894 > α = 0.10", "The lecture's unpooled standardization is kept", "Two separate groups + yes/no → two-proportion z"]}
        size={32}
      />
      <div style={{ display: "flex", gap: 24 }}>
        <svg width={420} height={520}>
          {[
            { name: "Female", x: 70, p: pF, txt: "13/45 ≈ 0.2889" },
            { name: "Male", x: 250, p: pM, txt: "16/74 ≈ 0.2162" },
          ].map((b) => (
            <g key={b.name}>
              <rect x={b.x} y={430 - bar(b.p) * grow} width={110} height={bar(b.p) * grow} rx={10} fill={C.professor} opacity={0.85} />
              <text x={b.x + 55} y={470} fill={C.text} fontSize={26} textAnchor="middle" fontFamily={FONT} fontWeight={800}>
                {b.name}
              </text>
              <text x={b.x + 55} y={420 - bar(b.p) * grow} fill={C.professor} fontSize={24} textAnchor="middle" fontFamily={MONO} fontWeight={700}>
                {b.txt}
              </text>
            </g>
          ))}
          <line x1={40} x2={400} y1={430} y2={430} stroke={C.muted} strokeWidth={3} />
          <text x={220} y={510} fill={C.muted} fontSize={22} textAnchor="middle" fontFamily={FONT}>
            sample proportion preferring cats
          </text>
        </svg>
        <div style={{ flex: 1 }}>
          {ctx.step >= 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10, ...rise(ctx.frame - ctx.stepStart(2), 0, 14) }}>
              <div style={{ background: C.panel, border: `2px solid ${C.professor}`, borderRadius: 12, padding: "8px 14px" }}>
                <RichText text="$H_0: p_F-p_M=0$" size={28} color={C.text} />
              </div>
              <div style={{ background: C.panel, border: `2px solid ${C.professor}`, borderRadius: 12, padding: "8px 14px" }}>
                <RichText text="$H_a: p_F-p_M>0$ (right tail)" size={28} color={C.text} />
              </div>
            </div>
          )}
          {curveOn && (
            <div style={{ opacity: ease(ctx.frame - ctx.stepStart(3), 0, 20) }}>
              <CurvePlot prev={plot.prev} cur={plot.cur} t={1} width={ctx.width - 450} height={360} appear={ease(ctx.frame - ctx.stepStart(3), 0, 30)} />
              <div style={{ fontSize: 28, fontWeight: 800, color: C.professor, textAlign: "center" }}>0.1894 &gt; 0.10 → insufficient evidence (fail to reject)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Conditions checklist (4 columns) ---------------- */
export const ConditionsChecklist: SceneFC<{ cols: { title: string; at: number; items: { text: string; at: number }[] }[] }> = ({ ctx, props }) => {
  const w = (ctx.width - 3 * 16) / 4;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["Conditions: when are the formulas legal?"]} />
      <div style={{ display: "flex", gap: 16 }}>
        {props.cols.map((c) => {
          const on = ctx.step >= c.at;
          const active = c.at <= ctx.step && (props.cols.find((x) => x.at > c.at)?.at ?? 1e9) > ctx.step;
          return (
            <div
              key={c.title}
              style={{
                width: w,
                minHeight: 520,
                background: C.panel,
                border: `3px solid ${active ? C.soccer : C.line}`,
                borderRadius: 18,
                padding: 16,
                opacity: on ? 1 : 0.18,
                boxShadow: active ? `0 0 30px ${C.soccer}44` : undefined,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: active ? C.soccer : C.text, marginBottom: 14 }}>{c.title}</div>
              {c.items
                .filter((i) => ctx.step >= i.at)
                .map((i) => (
                  <div key={i.text} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, ...(i.at === ctx.step ? rise(ctx.stepFrame, 0, 12) : {}) }}>
                    <div style={{ minWidth: 34, height: 34, borderRadius: 8, background: C.soccer, color: C.bg, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                    <RichText text={i.text} size={25} color={C.text} />
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- Conditions detail ---------------- */
export const ConditionsDetail: SceneFC = ({ ctx }) => {
  const w = (ctx.width - 16) / 2;
  const pop = 400;
  const panel = (k: number): React.CSSProperties => ({
    width: w,
    height: 300,
    background: C.panel,
    borderRadius: 18,
    border: `3px solid ${ctx.step === k ? C.soccer : C.line}`,
    padding: 14,
    boxSizing: "border-box",
    opacity: ctx.step >= k ? 1 : 0.25,
    position: "relative",
  });
  const rr = rng(5);
  const hist = (skew: number) =>
    Array.from({ length: 14 }, (_, i) => {
      const x = i / 13;
      return skew === 0 ? Math.exp(-((x - 0.5) ** 2) / 0.04) : Math.pow(x + 0.05, 0.6) * Math.exp(-x * (3 + skew * 5)) * 3;
    });
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["Randomization: the problem says “random sample”", "10% condition: sample ≤ 10% of the population", "Success/failure: expected counts at least 10", "Means: shape and sample size"]} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <div style={panel(0)}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Random sample</div>
          <svg width={w - 30} height={220}>
            {Array.from({ length: 48 }, (_, i) => {
              const picked = rr() < 0.2;
              const jitter = ctx.step === 0 ? Math.sin(ctx.frame / 6 + i) * 4 : 0;
              return <circle key={i} cx={30 + (i % 12) * ((w - 80) / 12)} cy={40 + Math.floor(i / 12) * 44 + jitter} r={14} fill={picked ? C.soccer : C.panel2} stroke={C.line} />;
            })}
          </svg>
        </div>
        <div style={panel(1)}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>10% condition (sampling without replacement)</div>
          <svg width={w - 30} height={220}>
            {Array.from({ length: pop }, (_, i) => (
              <rect key={i} x={10 + (i % 40) * ((w - 60) / 40)} y={20 + Math.floor(i / 40) * 17} width={9} height={12} fill={i < 36 ? C.yellow : C.panel2} />
            ))}
          </svg>
          <div style={{ position: "absolute", bottom: 14, left: 16, fontSize: 24, color: C.yellow, fontFamily: MONO }}>e.g. n = 36 needs N ≥ 360</div>
        </div>
        <div style={panel(2)}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Success / failure</div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <RichText text="CI uses $\hat p$:  $n\hat p\ge10$ and $n(1-\hat p)\ge10$" size={28} />
            <RichText text="Test uses $p_0$:  $np_0\ge10$ and $n(1-p_0)\ge10$" size={28} />
          </div>
        </div>
        <div style={panel(3)}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Means: how much skew?</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {[
              { s: 0, t: "small n: roughly Normal, no severe outliers" },
              { s: 0.3, t: "some skew: n > 30" },
              { s: 1, t: "a lot of skew: n > 100" },
            ].map((h) => (
              <div key={h.t} style={{ flex: 1 }}>
                <svg width={(w - 60) / 3} height={130}>
                  {hist(h.s).map((v, i, arr) => {
                    const mx = Math.max(...arr);
                    const bw = (w - 60) / 3 / 14;
                    return <rect key={i} x={i * bw} y={125 - (v / mx) * 115} width={bw - 2} height={(v / mx) * 115} fill={C.concept} />;
                  })}
                </svg>
                <div style={{ fontSize: 20, color: C.muted }}>{h.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Type I / II matrix (goalkeeper training) ---------------- */
export const ErrorMatrix: SceneFC = ({ ctx }) => {
  const t1 = ease(ctx.frame, 30, 20);
  const t2 = ease(ctx.frame, 150, 20);
  const cell = (title: string, body: string, color: string, on: number, big?: boolean): React.ReactNode => (
    <div
      style={{
        flex: 1,
        height: 230,
        background: C.panel,
        border: `3px solid ${on > 0.5 ? color : C.line}`,
        borderRadius: 16,
        padding: 18,
        boxSizing: "border-box",
        boxShadow: on > 0.5 ? `0 0 30px ${color}55` : undefined,
        opacity: big === false ? 0.7 : 1,
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 900, color }}>{title}</div>
      <RichText text={body} size={26} color={C.text} />
    </div>
  );
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["Goalkeeper training program — $H_0$: it causes **no improvement**"]} size={32} />
      <div style={{ display: "flex", gap: 14, marginLeft: 240, marginBottom: 10 }}>
        <div style={{ flex: 1, textAlign: "center" }}><RichText text="TRUTH: no real improvement ($H_0$ true)" size={26} color={C.muted} style={{ fontWeight: 800 }} /></div>
        <div style={{ flex: 1, textAlign: "center" }}><RichText text="TRUTH: real improvement ($H_0$ false)" size={26} color={C.muted} style={{ fontWeight: 800 }} /></div>
      </div>
      {[
        { label: "We reject $H_0$ (“it works!”)", cells: [cell("TYPE I ERROR · α", "false alarm: declaring an improvement that does not exist", C.danger, t1), cell("Correct · power = 1 − β", "detected a real gain", C.ok, 0, false)] },
        { label: "We fail to reject $H_0$", cells: [cell("Correct", "no improvement claimed, none exists", C.ok, 0, false), cell("TYPE II ERROR · β", "missed a real improvement", C.professor, t2)] },
      ].map((row) => (
        <div key={row.label} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center" }}>
          <div style={{ width: 226, fontSize: 26, fontWeight: 800, color: C.text }}>
            <RichText text={row.label} size={26} />
          </div>
          {row.cells}
        </div>
      ))}
      <svg width={ctx.width} height={120}>
        <Player x={120} y={110} scale={0.6} keeper jersey="#FF8A3D" number={1} />
        <text x={200} y={70} fill={C.muted} fontSize={26} fontFamily={FONT}>
          Different mistakes, different costs: α controls false alarms; β is the chance of missing a real gain.
        </text>
      </svg>
    </div>
  );
};

/* ---------------- Final soccer t-test walk-through ---------------- */
export const FinalTTest: SceneFC<{ work: WorkLine[] }> = ({ ctx, props }) => {
  const s = ctx.step;
  const t35 = (a: number) => tTableEntry(a, 35);
  const curveSteps: CurveStepCfg[] = [
    {
      curves: [{ id: "t", dist: { kind: "t", df: 35 }, color: C.text, label: "$t$, df = 35", labelX: 0.9, labelDy: -6 }],
      dom: [-3.6, 3.6],
      yMax: 0.44,
      ticks: [{ v: 0, label: "0" }],
      shades: [{ id: "r", from: 1.6, to: 9, color: C.shadeAlt, label: "right tail", labelX: 2.6, labelY: 0.42 }],
    },
    {
      ticks: [
        { v: 0, label: "0" },
        { v: 2.4, label: "2.40" },
      ],
      shades: [{ id: "r", from: 2.4, to: 9, color: C.shadeAlt, label: "p-value", labelX: 3.0, labelY: 0.4 }],
      markers: [{ id: "t", x: 2.4, label: "$t = 2.40$", color: C.yellow, top: 0.15 }],
    },
    {
      dom: [-1.2, 3.6],
      ticks: [
        { v: 0, label: "0" },
        { v: t35(0.025), label: t35(0.025).toFixed(3) },
        { v: t35(0.01), label: t35(0.01).toFixed(3) },
      ],
      shades: [{ id: "r", from: 2.4, to: 9, color: C.shadeAlt }],
      markers: [
        { id: "a", x: t35(0.025), label: "upper .025", color: C.exam, dashed: true, top: 0.42 },
        { id: "t", x: 2.4, label: "$t = 2.40$", color: C.yellow, top: 0.12 },
        { id: "b", x: t35(0.01), label: "upper .01", color: C.exam, dashed: true, top: 0.62 },
      ],
    },
  ];
  const ci = s >= 8 ? 2 : s >= 6 ? 1 : 0;
  const pi = s - 1 >= 8 ? 2 : s - 1 >= 6 ? 1 : 0;
  const pl = plotAt(curveSteps, ci, pi, ci === pi ? 1 : ease(ctx.stepFrame, 0, 26));
  const chips = ["claim $\\mu_0 = 0.400$ s", "$n = 36$", "$\\bar x = 0.424$ s", "$s = 0.060$ s", "$\\alpha = 0.05$"];
  const workH = s >= 8 ? 120 : 230;
  const shown = props.work.filter((w) => w.at <= s).slice(s >= 8 ? -2 : -4);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        {chips.map((t) => (
          <div key={t} style={{ background: C.panel, border: `2px solid ${C.soccer}`, borderRadius: 10, padding: "4px 12px" }}>
            <RichText text={t} size={25} color={C.text} />
          </div>
        ))}
      </div>
      <div style={{ height: workH, display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <WorkLines ctx={ctx} lines={shown} width={ctx.width - (s < 3 ? 300 : 0)} size={27} />
        </div>
        {s < 3 && (
          <svg width={280} height={workH}>
            <Stopwatch x={140} y={110} value={s === 0 ? "0.424" : "0.400"} label={s === 0 ? "sample mean (s)" : "claimed mean"} size={0.7} />
          </svg>
        )}
      </div>
      {s >= 3 && s < 8 && <CurvePlot prev={pl.prev} cur={pl.cur} t={pl.t} width={ctx.width} height={ctx.height - 60 - workH - 10} appear={s === 3 ? ease(ctx.stepFrame, 0, 30) : 1} />}
      {s >= 8 && (
        <div>
          <TTableLookup dfs={[34, 35, 36]} hiDf={35} bracket={[0.025, 0.01]} progress={s === 8 ? ease(ctx.stepFrame, 6, 50) : 1} width={ctx.width} fontSize={23} />
          <CurvePlot prev={pl.prev} cur={pl.cur} t={pl.t} width={ctx.width} height={ctx.height - 60 - workH - 200} />
        </div>
      )}
      {s < 3 && (
        <svg width={ctx.width} height={360}>
          <Player x={ctx.width / 2 - 200} y={300} scale={1.3} keeper jersey="#FF8A3D" number={1} pose={Math.floor(ctx.frame / 45) % 2 ? "dive" : "stand"} />
          <text x={ctx.width / 2 - 60} y={180} fill={C.muted} fontSize={28} fontFamily={FONT}>
            reflex drill · 36 randomly sampled goalkeepers
          </text>
        </svg>
      )}
    </div>
  );
};

/* ---------------- Outro ---------------- */
export const OutroScene: SceneFC = ({ ctx }) => {
  const qs = ["What parameter is this?", "What is the point estimate?", "What is the standard error?", "Which table?", "Which tail?"];
  const passes = ["2nd pass: focus on the transitions", "3rd pass: pause and predict each formula", "Answer the five questions → you understand the map"];
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["How to replay this episode"]} />
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {passes.map((p, i) => (
          <div key={p} style={{ flex: 1, background: C.panel, border: `3px solid ${ctx.step === i ? C.soccer : C.line}`, borderRadius: 16, padding: 16, fontSize: 28, fontWeight: 800, color: C.text, opacity: ctx.step >= i ? 1 : 0.25 }}>
            {p}
          </div>
        ))}
      </div>
      {ctx.step === 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 26, ...rise(ctx.stepFrame, 10, 14) }}>
          {["probability → inference", "proportion → mean", "z → t", "CI → hypothesis test", "independent → paired"].map((t) => (
            <span key={t} style={{ background: C.panel2, borderRadius: 999, padding: "8px 16px", color: C.soccer, fontWeight: 700 }}>
              {t}
            </span>
          ))}
        </div>
      )}
      {ctx.step >= 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {qs.map((q, i) => (
            <div key={q} style={{ fontSize: 34, fontWeight: 800, color: C.text, ...rise(ctx.frame - ctx.stepStart(1), 20 + i * 20, 14) }}>
              <span style={{ color: C.soccer, marginRight: 16 }}>{i + 1}.</span>
              {q}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
