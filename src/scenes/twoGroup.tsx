import React from "react";
import { ease, rise } from "../lib/anim";
import { C, FONT } from "../theme";
import { Player } from "../components/soccer";
import { RichText } from "../components/RichText";
import { Heading, SceneFC } from "./generic";
import { NumberLineCI } from "./middle";

/** Two independent soccer groups on a yes/no outcome (no numbers invented: symbols only). */
export const TwoGroupBars: SceneFC<{ titles: string[] }> = ({ ctx, props }) => {
  const s = ctx.step;
  const grow = ease(ctx.frame, 10, 40);
  const H = 300;
  const p1 = 0.66;
  const p2 = 0.48;
  const showDiff = s >= 1;
  const showN = s >= 3;
  if (s >= 5) {
    const t = ease(ctx.stepFrame, 0, 30);
    const lines = [
      { lo: -0.05, hi: 0.2, c: 0.075, txt: "contains 0 → “no difference” is plausible", col: C.yellow },
      { lo: 0.04, hi: 0.26, c: 0.15, txt: "entirely positive → group 1 likely larger", col: C.soccer },
      { lo: -0.24, hi: -0.03, c: -0.135, txt: "entirely negative → group 1 likely smaller", col: C.danger },
    ];
    return (
      <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
        <Heading ctx={ctx} titles={props.titles} />
        {lines.map((l, i) => (
          <div key={i} style={{ position: "relative", ...rise(ctx.stepFrame, i * 40, 14) }}>
            <div style={{ fontSize: 26, color: l.col, fontWeight: 800, marginLeft: 20 }}>{l.txt}</div>
            <NumberLineCI
              width={ctx.width}
              min={-0.3}
              max={0.3}
              ticks={[{ v: 0, label: "0" }]}
              center={l.c}
              lo={l.lo}
              hi={l.hi}
              grow={Math.min(1, t * 1.5 - i * 0.2)}
              color={l.col}
              nullValue={{ v: 0, label: "", color: C.muted }}
              height={170}
              y={80}
            />
          </div>
        ))}
      </div>
    );
  }
  const bars = [
    { name: "goalkeepers", p: p1, col: C.soccer, sym: "\\hat p_1", n: "n_1", jersey: "#FF8A3D", keeper: true },
    { name: "outfield players", p: p2, col: C.concept, sym: "\\hat p_2", n: "n_2", jersey: "#2F80ED", keeper: false },
  ];
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", gap: 30 }}>
        <svg width={560} height={520}>
          {bars.map((b, i) => {
            const x = 80 + i * 240;
            const h = b.p * H * grow;
            return (
              <g key={b.name}>
                <Player x={x + 60} y={500} scale={0.55} keeper={b.keeper} jersey={b.jersey} number={b.keeper ? 1 : 8} />
                <rect x={x} y={400 - h} width={120} height={h} rx={10} fill={b.col} opacity={0.85} />
                <text x={x + 60} y={420 - h - 30} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={FONT}>
                  {b.name}
                </text>
              </g>
            );
          })}
          <line x1={40} x2={540} y1={400} y2={400} stroke={C.muted} strokeWidth={3} />
          {showDiff && (
            <g opacity={ctx.at(1, 20)}>
              <line x1={300} x2={340} y1={400 - p1 * H} y2={400 - p1 * H} stroke={C.yellow} strokeWidth={3} strokeDasharray="6 4" />
              <line x1={320} x2={320} y1={400 - p1 * H} y2={400 - p2 * H} stroke={C.yellow} strokeWidth={6} />
            </g>
          )}
        </svg>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, paddingTop: 20 }}>
          {bars.map((b) => (
            <div key={b.name} style={{ display: "flex", gap: 14, alignItems: "center", background: C.panel, borderRadius: 14, padding: "10px 16px", border: `2px solid ${b.col}` }}>
              <RichText text={`$${b.sym}$`} size={40} color={b.col} />
              <span style={{ fontSize: 26, color: C.text }}>observed fraction of {b.name} who prefer grass</span>
              {showN && (
                <span style={{ marginLeft: "auto", ...rise(ctx.frame - ctx.stepStart(3), 0, 12) }}>
                  <RichText text={`$${b.n}$`} size={36} color={C.yellow} />
                </span>
              )}
            </div>
          ))}
          {showDiff && (
            <div style={{ fontSize: 30, color: C.yellow, fontWeight: 800, ...rise(ctx.frame - ctx.stepStart(1), 0, 14) }}>
              <RichText text="point estimate: $\hat p_1-\hat p_2$" size={34} color={C.yellow} />
            </div>
          )}
          {s >= 2 && (
            <div style={{ fontSize: 26, color: C.concept, ...rise(ctx.frame - ctx.stepStart(2), 0, 14) }}>
              <RichText text="SE: each group contributes its own $\hat p(1-\hat p)/n$" size={28} color={C.concept} />
            </div>
          )}
          {s >= 3 && (
            <div style={{ fontSize: 26, color: C.danger, ...rise(ctx.frame - ctx.stepStart(3), 10, 14) }}>
              <RichText text="never reuse one group's $n$ for the other" size={28} color={C.danger} />
            </div>
          )}
          {s >= 4 && (
            <div style={{ ...rise(ctx.frame - ctx.stepStart(4), 0, 14) }}>
              <RichText text="$(\hat p_1-\hat p_2)\pm z^*\,SE$" size={40} color={C.text} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
