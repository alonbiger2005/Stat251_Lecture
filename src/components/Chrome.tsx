import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../lib/anim";
import { C, FONT, L, moduleLabel, Tag, TAGS, W } from "../theme";
import type { TLCaption, TLMath, TLSection, Timeline } from "../types";
import { FitTex } from "./Tex";

export const Background: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(1400px 900px at 30% 20%, ${C.bg2}, ${C.bg})` }}>
    {/* faint pitch lines as texture */}
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.07 }}>
      <g stroke="#fff" strokeWidth={3} fill="none">
        <rect x={40} y={40} width={1840} height={1000} />
        <line x1={960} x2={960} y1={40} y2={1040} />
        <circle cx={960} cy={540} r={150} />
      </g>
    </svg>
  </AbsoluteFill>
);

export const Header: React.FC<{ section: TLSection; chapterTitle: string; tag: Tag }> = ({ section, chapterTitle, tag }) => {
  const t = TAGS[tag];
  const chap = section.kind === "subsection" ? section.parentChapter : section.chapterNumber ?? 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: L.headerH,
        display: "flex",
        alignItems: "center",
        padding: "0 56px",
        boxSizing: "border-box",
        borderBottom: `2px solid ${C.line}`,
        background: "rgba(10,26,20,0.75)",
        fontFamily: FONT,
        gap: 24,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: C.bg, background: C.soccer, borderRadius: 8, padding: "6px 12px", letterSpacing: 1 }}>
        STAT 251 · EXAM 2
      </div>
      <div style={{ flex: 1, minWidth: 0, color: C.text, fontSize: chapterTitle.length > 54 ? 22 : 28, lineHeight: 1.12, fontWeight: 700 }}>{chapterTitle}</div>
      <div style={{ fontSize: 20, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{moduleLabel(chap)}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: t.color,
          border: `2px solid ${t.color}`,
          borderRadius: 999,
          padding: "6px 16px",
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        {t.label}
      </div>
    </div>
  );
};

/** Sentence-synchronous captions (exact locked script text). */
export const Captions: React.FC<{ captions: TLCaption[]; frame: number }> = ({ captions, frame }) => {
  // binary search
  let lo = 0;
  let hi = captions.length - 1;
  let found: TLCaption | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = captions[mid];
    if (frame < c.start) hi = mid - 1;
    else if (frame >= c.end) lo = mid + 1;
    else {
      found = c;
      break;
    }
  }
  if (!found) return null;
  const op = Math.min(ease(frame, found.start, 4), 1 - ease(frame, found.end - 4, 4));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: W,
        top: L.captionTop,
        height: L.captionH,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1640,
          background: "rgba(0,0,0,0.72)",
          borderRadius: 14,
          padding: "12px 28px",
          color: "#fff",
          fontFamily: FONT,
          fontSize: 40,
          lineHeight: 1.3,
          fontWeight: 600,
          textAlign: "center",
          opacity: Math.max(0.0001, op),
        }}
      >
        {found.text}
      </div>
    </div>
  );
};

export const Progress: React.FC<{ tl: Timeline; frame: number }> = ({ tl, frame }) => {
  const p = frame / tl.durationInFrames;
  const chapters = tl.sections.filter((s) => s.kind !== "subsection");
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: 10, background: "rgba(255,255,255,0.06)" }}>
      <div style={{ width: `${p * 100}%`, height: 10, background: C.soccer, opacity: 0.85 }} />
      {chapters.map((s) => (
        <div key={s.id} style={{ position: "absolute", left: `${(s.cardStart / tl.durationInFrames) * 100}%`, top: 0, width: 3, height: 10, background: C.bg }} />
      ))}
    </div>
  );
};

/** Right-hand panel with the scene's on-screen formulas (exact source LaTeX). */
export const FormulaPanel: React.FC<{ math: TLMath[]; frame: number; tag: Tag }> = ({ math, frame, tag }) => {
  const visible = math.filter((m) => frame >= m.appear);
  if (!visible.length) return null;
  const MAX = 3;
  const shown = visible.slice(-MAX);
  const accent = TAGS[tag].color;
  const avail = L.stageBottom - L.stageTop - 20;
  const per = Math.floor(avail / Math.max(shown.length, 1)) - 28;
  return (
    <div
      style={{
        position: "absolute",
        left: L.mathX,
        top: L.stageTop,
        width: L.mathW,
        height: L.stageBottom - L.stageTop,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {shown.map((m, i) => {
        const newest = i === shown.length - 1;
        const t = ease(frame, m.appear, 20);
        return (
          <div
            key={`${m.sourceLine}`}
            style={{
              background: newest ? "rgba(19,46,35,0.96)" : "rgba(19,46,35,0.6)",
              border: `3px solid ${newest ? accent : C.line}`,
              borderRadius: 18,
              padding: "16px 18px",
              opacity: (newest ? 1 : 0.62) * t,
              transform: `translateX(${(1 - t) * 40}px)`,
              boxShadow: newest ? `0 0 30px ${accent}33` : undefined,
            }}
          >
            <FitTex tex={`\\displaystyle ${m.tex}`} maxWidth={L.mathW - 40} maxHeight={Math.min(per, 260)} size={46} color={C.text} />
          </div>
        );
      })}
    </div>
  );
};
