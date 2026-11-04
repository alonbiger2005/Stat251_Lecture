import React from "react";
import { C, FONT } from "../theme";
import { areaPath, Axis, curvePath, Dist, makeScale, mixDist, pdf } from "./plot";
import { RichText } from "./RichText";
import { mix } from "../lib/anim";

export interface CurveCfg {
  id: string;
  dist: Dist;
  color?: string;
  width?: number;
  dashed?: boolean;
  label?: string; // rich text
  labelX?: number; // data x for label
  labelDy?: number;
  fill?: string; // whole-curve fill
}
export interface ShadeCfg {
  id: string;
  curve?: string; // curve id (default first)
  from: number;
  to: number;
  color?: string;
  label?: string;
  labelX?: number; // data x
  labelY?: number; // fraction of height from top
}
export interface MarkerCfg {
  id: string;
  x: number;
  label?: string;
  color?: string;
  dashed?: boolean;
  top?: number; // fraction of plot height (0 = top) where the line ends
  labelBelow?: boolean;
}
export interface NoteCfg {
  id: string;
  text: string;
  x: number; // 0..1 of width (center)
  y: number; // 0..1 of height (top)
  color?: string;
  size?: number;
  box?: boolean;
  width?: number;
}
export interface CurveStepCfg {
  curves?: CurveCfg[];
  dom?: [number, number];
  yMax?: number;
  ticks?: { v: number; label: string }[];
  xLabel?: string;
  shades?: ShadeCfg[];
  markers?: MarkerCfg[];
  notes?: NoteCfg[];
  /** draw the CDF (accumulated area) curve of the first curve on a right-hand 0..1 axis */
  showCdf?: boolean;
  cdfTo?: number; // animate the accumulation to this x
}

export type ResolvedCfg = Required<Pick<CurveStepCfg, "curves" | "dom" | "yMax" | "ticks" | "shades" | "markers" | "notes">> &
  Pick<CurveStepCfg, "xLabel" | "showCdf" | "cdfTo">;

const DEFAULT: ResolvedCfg = {
  curves: [],
  dom: [-4, 4],
  yMax: 0.45,
  ticks: [],
  shades: [],
  markers: [],
  notes: [],
};

/** Cumulative resolution: each step inherits everything it does not override. */
export function resolveSteps(steps: CurveStepCfg[]): ResolvedCfg[] {
  const out: ResolvedCfg[] = [];
  let cur: ResolvedCfg = DEFAULT;
  for (const s of steps) {
    cur = { ...cur, ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined)) } as ResolvedCfg;
    out.push(cur);
  }
  return out;
}

function keyed<T extends { id: string }>(prev: T[], cur: T[]) {
  const pm = new Map(prev.map((p) => [p.id, p]));
  const cm = new Map(cur.map((c) => [c.id, c]));
  const both: { p: T; c: T }[] = [];
  const added: T[] = [];
  const removed: T[] = [];
  for (const c of cur) {
    const p = pm.get(c.id);
    if (p) both.push({ p, c });
    else added.push(c);
  }
  for (const p of prev) if (!cm.has(p.id)) removed.push(p);
  return { both, added, removed };
}

export const CurvePlot: React.FC<{
  prev: ResolvedCfg;
  cur: ResolvedCfg;
  t: number; // transition progress prev→cur
  width: number;
  height: number;
  appear?: number; // whole-plot draw-in 0..1
}> = ({ prev, cur, t, width, height, appear = 1 }) => {
  const uid = "clip" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const dom: [number, number] = [mix(prev.dom[0], cur.dom[0], t), mix(prev.dom[1], cur.dom[1], t)];
  const yMax = mix(prev.yMax, cur.yMax, t);
  const pad = { l: 50, r: cur.showCdf ? 110 : 50, t: 30, b: 90 };
  const s = makeScale(width, height, dom, yMax, pad);
  const clampX = (v: number) => Math.max(dom[0], Math.min(dom[1], v));

  const curves = keyed(prev.curves, cur.curves);
  const curveItems: { c: CurveCfg; dist: Dist; op: number }[] = [
    ...curves.both.map(({ p, c }) => ({ c, dist: mixDist(p.dist, c.dist, t), op: 1 })),
    ...curves.added.map((c) => ({ c, dist: c.dist, op: t })),
    ...curves.removed.map((c) => ({ c, dist: c.dist, op: 1 - t })),
  ];
  const distOf = (id?: string) => {
    const it = id ? curveItems.find((x) => x.c.id === id) : curveItems[0];
    return it?.dist ?? curveItems[0]?.dist;
  };

  const shades = keyed(prev.shades, cur.shades);
  const shadeItems = [
    ...shades.both.map(({ p, c }) => ({ c: { ...c, from: mix(clampX(p.from), clampX(c.from), t), to: mix(clampX(p.to), clampX(c.to), t) }, op: 1 })),
    ...shades.added.map((c) => ({ c, op: t })),
    ...shades.removed.map((c) => ({ c, op: 1 - t })),
  ];
  const markers = keyed(prev.markers, cur.markers);
  const markerItems = [
    ...markers.both.map(({ p, c }) => ({ c: { ...c, x: mix(p.x, c.x, t) }, op: 1 })),
    ...markers.added.map((c) => ({ c, op: t })),
    ...markers.removed.map((c) => ({ c, op: 1 - t })),
  ];
  const notes = keyed(prev.notes, cur.notes);
  const noteItems = [
    ...notes.both.map(({ p, c }) => ({ c: { ...c, x: mix(p.x, c.x, t), y: mix(p.y, c.y, t) }, op: 1 })),
    ...notes.added.map((c) => ({ c, op: t })),
    ...notes.removed.map((c) => ({ c, op: 1 - t })),
  ];
  const tickChange = JSON.stringify(prev.ticks) !== JSON.stringify(cur.ticks);
  const clipW = s.x0 + (s.x1 - s.x0 + 40) * appear;

  // CDF accumulation (right axis 0..1)
  let cdfPath = "";
  if (cur.showCdf && curveItems[0]) {
    const d = curveItems[0].dist;
    const end = cur.cdfTo !== undefined ? mix(prev.cdfTo ?? dom[0], cur.cdfTo, t) : dom[1];
    const n = 200;
    let acc = 0;
    const dx = (dom[1] - dom[0]) / n;
    const cy = (v: number) => s.y0 - v * (s.y0 - s.y1);
    for (let i = 0; i <= n; i++) {
      const x = dom[0] + i * dx;
      if (x > end) break;
      if (i > 0) acc += ((pdf(d, x - dx) + pdf(d, x)) / 2) * dx;
      cdfPath += `${i === 0 ? "M" : "L"}${s.x(x).toFixed(1)},${cy(Math.min(1, acc)).toFixed(1)} `;
    }
  }

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={uid}>
            <rect x={0} y={0} width={clipW} height={height} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid})`}>
          {shadeItems.map(({ c, op }) => {
            const d = distOf(c.curve);
            if (!d) return null;
            return <path key={c.id} d={areaPath(d, s, c.from, c.to)} fill={c.color ?? C.shade} opacity={op} />;
          })}
          {curveItems.map(({ c, dist, op }) => (
            <g key={c.id} opacity={op}>
              {c.fill && <path d={areaPath(dist, s, dom[0], dom[1])} fill={c.fill} />}
              <path
                d={curvePath(dist, s)}
                fill="none"
                stroke={c.color ?? C.text}
                strokeWidth={c.width ?? 5}
                strokeDasharray={c.dashed ? "14 10" : undefined}
                strokeLinejoin="round"
              />
            </g>
          ))}
          {cdfPath && <path d={cdfPath} fill="none" stroke={C.yellow} strokeWidth={5} strokeDasharray="2 0" />}
        </g>
        <Axis s={s} ticks={tickChange ? [] : cur.ticks} label={cur.xLabel} />
        {tickChange && (
          <>
            <g opacity={1 - t}>
              <Axis s={s} ticks={prev.ticks.filter((k) => k.v >= dom[0] && k.v <= dom[1])} />
            </g>
            <g opacity={t}>
              <Axis s={s} ticks={cur.ticks.filter((k) => k.v >= dom[0] && k.v <= dom[1])} label={cur.xLabel} />
            </g>
          </>
        )}
        {cur.showCdf && (
          <g>
            <line x1={s.x1 + 30} x2={s.x1 + 30} y1={s.y0} y2={s.y1} stroke={C.yellow} strokeWidth={2} opacity={0.7} />
            {[0, 0.5, 1].map((v) => (
              <text key={v} x={s.x1 + 42} y={s.y0 - v * (s.y0 - s.y1) + 8} fill={C.yellow} fontSize={22} fontFamily={FONT}>
                {v}
              </text>
            ))}
          </g>
        )}
        {markerItems.map(({ c, op }) => {
          const d = distOf();
          const top = c.top !== undefined ? s.y1 + (s.y0 - s.y1) * c.top : d ? s.y(pdf(d, c.x)) - 30 : s.y1;
          return (
            <g key={c.id} opacity={op}>
              <line
                x1={s.x(c.x)}
                x2={s.x(c.x)}
                y1={s.y0}
                y2={Math.max(s.y1 - 10, top)}
                stroke={c.color ?? C.yellow}
                strokeWidth={4}
                strokeDasharray={c.dashed ? "10 8" : undefined}
              />
              <circle cx={s.x(c.x)} cy={s.y0} r={8} fill={c.color ?? C.yellow} />
            </g>
          );
        })}
      </svg>
      {/* HTML labels (support math) */}
      {curveItems.map(({ c, dist, op }) =>
        c.label ? (
          <div
            key={`cl-${c.id}`}
            style={{
              position: "absolute",
              left: s.x(c.labelX ?? 0) - 200,
              width: 400,
              textAlign: "center",
              top: s.y(Math.min(pdf(dist, c.labelX ?? 0), yMax)) - 64 + (c.labelDy ?? 0),
              opacity: op,
              fontFamily: FONT,
            }}
          >
            <RichText text={c.label} size={28} color={c.color ?? C.text} />
          </div>
        ) : null,
      )}
      {shadeItems.map(({ c, op }) =>
        c.label ? (
          <div
            key={`sl-${c.id}`}
            style={{
              position: "absolute",
              left: s.x(c.labelX ?? (Math.max(c.from, dom[0]) + Math.min(c.to, dom[1])) / 2) - 170,
              width: 340,
              textAlign: "center",
              top: (c.labelY ?? 0.55) * height,
              opacity: op,
              fontFamily: FONT,
              fontWeight: 700,
            }}
          >
            <RichText text={c.label} size={30} color={C.white} />
          </div>
        ) : null,
      )}
      {markerItems.map(({ c, op }) =>
        c.label ? (
          <div
            key={`ml-${c.id}`}
            style={{
              position: "absolute",
              left: s.x(c.x) - 160,
              width: 320,
              textAlign: "center",
              top: c.labelBelow ? s.y0 + 44 : (c.top !== undefined ? s.y1 + (s.y0 - s.y1) * c.top : s.y1) - 52,
              opacity: op,
              fontFamily: FONT,
            }}
          >
            <RichText text={c.label} size={28} color={c.color ?? C.yellow} />
          </div>
        ) : null,
      )}
      {noteItems.map(({ c, op }) => (
        <div
          key={`n-${c.id}`}
          style={{
            position: "absolute",
            left: c.x * width - (c.width ?? 460) / 2,
            width: c.width ?? 460,
            top: c.y * height,
            textAlign: "center",
            opacity: op,
            fontFamily: FONT,
            ...(c.box
              ? { background: "rgba(10,26,20,0.88)", border: `2px solid ${c.color ?? C.line}`, borderRadius: 14, padding: "10px 14px" }
              : {}),
          }}
        >
          <RichText text={c.text} size={c.size ?? 30} color={c.color ?? C.text} />
        </div>
      ))}
    </div>
  );
};
