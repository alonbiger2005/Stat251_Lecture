/** Original stylised soccer vector art (no real teams, logos, players or footage). */
import React from "react";
import { C, FONT, MONO } from "../theme";

export const SoccerField: React.FC<{ width: number; height: number; opacity?: number; vertical?: boolean }> = ({ width, height, opacity = 1 }) => {
  const stripes = 10;
  const m = 18;
  const w = width - 2 * m;
  const h = height - 2 * m;
  const boxW = w * 0.16;
  const boxH = h * 0.56;
  const sixW = w * 0.06;
  const sixH = h * 0.28;
  const lw = 3;
  return (
    <svg width={width} height={height} style={{ opacity }}>
      <rect x={0} y={0} width={width} height={height} rx={18} fill={C.pitch} />
      {Array.from({ length: stripes }, (_, i) => (i % 2 ? <rect key={i} x={(width / stripes) * i} y={0} width={width / stripes} height={height} fill={C.pitchStripe} /> : null))}
      <g stroke={C.pitchLine} strokeWidth={lw} fill="none">
        <rect x={m} y={m} width={w} height={h} />
        <line x1={width / 2} x2={width / 2} y1={m} y2={m + h} />
        <circle cx={width / 2} cy={height / 2} r={h * 0.17} />
        <rect x={m} y={(height - boxH) / 2} width={boxW} height={boxH} />
        <rect x={m + w - boxW} y={(height - boxH) / 2} width={boxW} height={boxH} />
        <rect x={m} y={(height - sixH) / 2} width={sixW} height={sixH} />
        <rect x={m + w - sixW} y={(height - sixH) / 2} width={sixW} height={sixH} />
        {/* penalty arcs */}
        <path d={`M ${m + boxW} ${height / 2 - h * 0.13} A ${h * 0.17} ${h * 0.17} 0 0 1 ${m + boxW} ${height / 2 + h * 0.13}`} />
        <path d={`M ${m + w - boxW} ${height / 2 - h * 0.13} A ${h * 0.17} ${h * 0.17} 0 0 0 ${m + w - boxW} ${height / 2 + h * 0.13}`} />
      </g>
      <circle cx={width / 2} cy={height / 2} r={5} fill={C.pitchLine} />
      <circle cx={m + w * 0.11} cy={height / 2} r={4} fill={C.pitchLine} />
      <circle cx={m + w * 0.89} cy={height / 2} r={4} fill={C.pitchLine} />
    </svg>
  );
};

/** Front-facing stylised player figure, drawn in a 100×160 box. */
export const Player: React.FC<{
  x: number;
  y: number;
  scale?: number;
  jersey?: string;
  number?: number | string;
  keeper?: boolean;
  highlight?: boolean;
  dim?: boolean;
  pose?: "stand" | "dive";
}> = ({ x, y, scale = 1, jersey = "#2F80ED", number, keeper = false, highlight = false, dim = false, pose = "stand" }) => {
  const skin = "#E8B996";
  const shorts = keeper ? "#222" : "#F2F2F2";
  const glove = "#FFE066";
  const rot = pose === "dive" ? -55 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${rot}, 0, -60)`} opacity={dim ? 0.28 : 1}>
      {highlight && <ellipse cx={0} cy={2} rx={46} ry={12} fill={C.yellow} opacity={0.55} />}
      {/* legs */}
      <rect x={-17} y={-40} width={13} height={40} rx={6} fill={skin} />
      <rect x={4} y={-40} width={13} height={40} rx={6} fill={skin} />
      <rect x={-19} y={-14} width={16} height={14} rx={4} fill={jersey} opacity={0.9} />
      <rect x={3} y={-14} width={16} height={14} rx={4} fill={jersey} opacity={0.9} />
      {/* shorts */}
      <rect x={-22} y={-62} width={44} height={26} rx={8} fill={shorts} />
      {/* arms */}
      <rect x={-37} y={-108} width={13} height={46} rx={6} fill={jersey} transform={keeper ? "rotate(28,-30,-105)" : undefined} />
      <rect x={24} y={-108} width={13} height={46} rx={6} fill={jersey} transform={keeper ? "rotate(-28,30,-105)" : undefined} />
      {keeper && (
        <>
          <circle cx={-52} cy={-70} r={9} fill={glove} />
          <circle cx={52} cy={-70} r={9} fill={glove} />
        </>
      )}
      {/* torso */}
      <rect x={-26} y={-112} width={52} height={54} rx={14} fill={jersey} />
      {number !== undefined && (
        <text x={0} y={-75} fontSize={24} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily={FONT}>
          {number}
        </text>
      )}
      {/* head */}
      <circle cx={0} cy={-130} r={18} fill={skin} />
      <path d="M -18 -134 Q 0 -158 18 -134 Q 10 -146 0 -146 Q -10 -146 -18 -134 Z" fill="#3B2A20" />
    </g>
  );
};

export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 16, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <circle r={r} fill="#fff" stroke="#222" strokeWidth={2} />
    <polygon points={pent(r * 0.42)} fill="#222" />
    {[0, 72, 144, 216, 288].map((a) => (
      <polygon key={a} points={pent(r * 0.22)} fill="#222" transform={`rotate(${a}) translate(0,${-r * 0.82})`} />
    ))}
  </g>
);
function pent(R: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return `${(R * Math.cos(a)).toFixed(1)},${(R * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export const Goal: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 360, h = 130 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={w} height={h} fill="none" stroke="#fff" strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={`v${i}`} x1={(w / 12) * i} x2={(w / 12) * i} y1={0} y2={h} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <line key={`h${i}`} x1={0} x2={w} y1={(h / 5) * i} y2={(h / 5) * i} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
    ))}
  </g>
);

/** Digital stopwatch readout. */
export const Stopwatch: React.FC<{ x: number; y: number; value: string; label?: string; size?: number; color?: string }> = ({
  x,
  y,
  value,
  label,
  size = 1,
  color = C.soccer,
}) => (
  <g transform={`translate(${x},${y}) scale(${size})`}>
    <rect x={-22} y={-150} width={44} height={30} rx={6} fill="#cfd8d3" />
    <circle r={130} cy={20} fill="#0d1713" stroke="#cfd8d3" strokeWidth={14} />
    <circle r={110} cy={20} fill="none" stroke={color} strokeWidth={4} opacity={0.5} />
    <text y={42} fontSize={64} fill={color} textAnchor="middle" fontFamily={MONO} fontWeight={700}>
      {value}
    </text>
    {label && (
      <text y={92} fontSize={24} fill={C.muted} textAnchor="middle" fontFamily={FONT}>
        {label}
      </text>
    )}
  </g>
);

/** A match clock bar 0..total minutes with a progressing marker. */
export const GoalTimer: React.FC<{ x: number; y: number; width: number; minutes: number; total?: number; label?: string }> = ({
  x,
  y,
  width,
  minutes,
  total = 90,
  label,
}) => {
  const p = Math.min(1, minutes / total);
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={width} height={22} rx={11} fill={C.panel2} stroke={C.line} strokeWidth={2} />
      <rect x={0} y={0} width={width * p} height={22} rx={11} fill={C.soccer} opacity={0.8} />
      <Ball x={width * p} y={11} r={20} rot={minutes * 30} />
      <text x={0} y={60} fill={C.muted} fontSize={24} fontFamily={FONT}>
        0 min
      </text>
      <text x={width} y={60} fill={C.muted} fontSize={24} fontFamily={FONT} textAnchor="end">
        {total} min
      </text>
      {label && (
        <text x={width / 2} y={-18} fill={C.text} fontSize={28} fontFamily={FONT} textAnchor="middle" fontWeight={700}>
          {label}
        </text>
      )}
    </g>
  );
};

/** Cone marker for drills */
export const Cone: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <polygon points="-16,0 16,0 5,-38 -5,-38" fill="#FF8A3D" />
    <rect x={-20} y={-4} width={40} height={8} rx={3} fill="#E06A20" />
    <rect x={-11} y={-22} width={22} height={6} fill="#fff" opacity={0.8} />
  </g>
);
