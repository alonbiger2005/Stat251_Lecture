import React from "react";
import { expPdf, normalPdf, tPdf } from "../lib/stats";
import { C, FONT } from "../theme";

export type Dist =
  | { kind: "normal"; mu: number; sigma: number }
  | { kind: "t"; df: number }
  | { kind: "exp"; lambda: number }
  | { kind: "uniform"; a: number; b: number }
  | { kind: "skew"; shift: number; scale: number } // gamma(k=2) shaped population (for CLT)
  | { kind: "parabola" }; // p(1-p) on [0,1]

export function pdf(d: Dist, x: number): number {
  switch (d.kind) {
    case "normal":
      return normalPdf(x, d.mu, d.sigma);
    case "t":
      return d.df > 300 ? normalPdf(x) : tPdf(x, d.df);
    case "exp":
      return expPdf(x, d.lambda);
    case "uniform":
      return x >= d.a && x <= d.b ? 1 / (d.b - d.a) : 0;
    case "skew": {
      const z = (x - d.shift) / d.scale;
      return z <= 0 ? 0 : (z * Math.exp(-z)) / d.scale;
    }
    case "parabola":
      return x < 0 || x > 1 ? 0 : x * (1 - x);
  }
}

export function mixDist(a: Dist, b: Dist, t: number): Dist {
  if (a.kind !== b.kind || t >= 1) return b;
  const m = (x: number, y: number) => x + (y - x) * t;
  switch (b.kind) {
    case "normal": {
      const A = a as typeof b;
      return { kind: "normal", mu: m(A.mu, b.mu), sigma: m(A.sigma, b.sigma) };
    }
    case "t": {
      const A = a as typeof b;
      return { kind: "t", df: Math.exp(m(Math.log(A.df), Math.log(b.df))) };
    }
    case "exp": {
      const A = a as typeof b;
      return { kind: "exp", lambda: m(A.lambda, b.lambda) };
    }
    case "uniform": {
      const A = a as typeof b;
      return { kind: "uniform", a: m(A.a, b.a), b: m(A.b, b.b) };
    }
    case "skew": {
      const A = a as typeof b;
      return { kind: "skew", shift: m(A.shift, b.shift), scale: m(A.scale, b.scale) };
    }
    default:
      return b;
  }
}

export interface Scale {
  x: (v: number) => number;
  y: (v: number) => number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  dom: [number, number];
  yMax: number;
}

export function makeScale(width: number, height: number, dom: [number, number], yMax: number, pad = { l: 40, r: 40, t: 30, b: 70 }): Scale {
  const x0 = pad.l;
  const x1 = width - pad.r;
  const y0 = height - pad.b; // baseline (pixel)
  const y1 = pad.t;
  return {
    x: (v) => x0 + ((v - dom[0]) / (dom[1] - dom[0])) * (x1 - x0),
    y: (v) => y0 - (v / yMax) * (y0 - y1),
    x0,
    x1,
    y0,
    y1,
    dom,
    yMax,
  };
}

const N_SAMPLES = 260;

export function curvePath(d: Dist, s: Scale, from = s.dom[0], to = s.dom[1]): string {
  const pts: string[] = [];
  const a = Math.max(from, s.dom[0]);
  const b = Math.min(to, s.dom[1]);
  for (let i = 0; i <= N_SAMPLES; i++) {
    const x = a + ((b - a) * i) / N_SAMPLES;
    const y = Math.min(pdf(d, x), s.yMax * 1.08);
    pts.push(`${i === 0 ? "M" : "L"}${s.x(x).toFixed(2)},${s.y(y).toFixed(2)}`);
  }
  // uniform: draw crisp vertical edges
  return pts.join(" ");
}

export function areaPath(d: Dist, s: Scale, from: number, to: number): string {
  const a = Math.max(from, s.dom[0]);
  const b = Math.min(to, s.dom[1]);
  if (b <= a) return "";
  const n = 180;
  let p = `M${s.x(a).toFixed(2)},${s.y0}`;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    p += ` L${s.x(x).toFixed(2)},${s.y(Math.min(pdf(d, x), s.yMax * 1.08)).toFixed(2)}`;
  }
  p += ` L${s.x(b).toFixed(2)},${s.y0} Z`;
  return p;
}

export const Axis: React.FC<{ s: Scale; ticks: { v: number; label: string }[]; label?: string; color?: string; size?: number }> = ({
  s,
  ticks,
  label,
  color = C.muted,
  size = 24,
}) => (
  <g>
    <line x1={s.x0 - 10} x2={s.x1 + 10} y1={s.y0} y2={s.y0} stroke={color} strokeWidth={3} />
    {ticks.map((t, i) => (
      <g key={i}>
        <line x1={s.x(t.v)} x2={s.x(t.v)} y1={s.y0} y2={s.y0 + 10} stroke={color} strokeWidth={2.5} />
        <text x={s.x(t.v)} y={s.y0 + 38} fill={C.text} fontSize={size} textAnchor="middle" fontFamily={FONT}>
          {t.label}
        </text>
      </g>
    ))}
    {label && (
      <text x={(s.x0 + s.x1) / 2} y={s.y0 + 70} fill={C.muted} fontSize={size - 2} textAnchor="middle" fontFamily={FONT}>
        {label}
      </text>
    )}
  </g>
);

export const range = (a: number, b: number, step: number) => {
  const out: number[] = [];
  for (let v = a; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
};
