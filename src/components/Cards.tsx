import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, rise } from "../lib/anim";
import { C, FONT, moduleLabel } from "../theme";
import type { TLSection, Timeline } from "../types";
import { Ball, Player, SoccerField } from "./soccer";

export const fmtTime = (frames: number, fps: number) => {
  const s = Math.round(frames / fps);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

const cleanHeading = (h: string) => h.replace(/^CHAPTER \d+ — /, "").replace(/^(INTRO|OUTRO) — /, "");
export const chapterLabel = (s: TLSection) =>
  s.kind === "intro" ? "INTRO" : s.kind === "outro" ? "OUTRO" : s.kind === "chapter" ? `CHAPTER ${s.chapterNumber}` : `CHAPTER ${s.parentChapter} · SECTION`;

/** Chapter menu: every chapter with its timestamp (used on the title card). */
export const ChapterMenu: React.FC<{ tl: Timeline; current?: string; frame: number; compact?: boolean }> = ({ tl, current, frame, compact }) => {
  const chapters = tl.sections.filter((s) => s.kind !== "subsection");
  const half = Math.ceil(chapters.length / 2);
  const cols = [chapters.slice(0, half), chapters.slice(half)];
  return (
    <div style={{ display: "flex", gap: 40, fontFamily: FONT }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 6, width: 860 }}>
          {col.map((s, i) => {
            const on = s.id === current;
            const idx = ci * half + i;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  gap: 14,
                  fontSize: compact ? 18 : 21,
                  color: on ? C.bg : C.text,
                  background: on ? C.soccer : "rgba(19,46,35,0.75)",
                  borderRadius: 8,
                  padding: "4px 12px",
                  ...rise(frame, 8 + idx * 2, 12, 10),
                }}
              >
                <span style={{ width: 62, fontFamily: "'JetBrains Mono', monospace", color: on ? C.bg : C.soccer, fontWeight: 700 }}>{fmtTime(s.cardStart, tl.fps)}</span>
                <span style={{ width: 104, fontWeight: 800, color: on ? C.bg : C.muted }}>
                  {s.kind === "intro" ? "INTRO" : s.kind === "outro" ? "OUTRO" : `CH ${s.chapterNumber}`}
                </span>
                <span style={{ flex: 1, fontWeight: 600, lineHeight: 1.2 }}>{cleanHeading(s.heading)}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const TitleCard: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: 0.35 }}>
        <SoccerField width={1920} height={1080} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,26,20,0.55), rgba(10,26,20,0.96) 60%)" }} />
      <div style={{ position: "absolute", left: 80, top: 70, ...rise(frame, 0, 18) }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.soccer, letterSpacing: 3 }}>STAT 251 · EXAM 2 REVIEW</div>
        <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.05, marginTop: 10 }}>The Soccer Edition</div>
        <div style={{ fontSize: 34, color: C.muted, marginTop: 14 }}>Continuous random variables · Confidence intervals · Hypothesis tests</div>
        <div style={{ display: "flex", gap: 18, marginTop: 22, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: C.professor, border: `2px solid ${C.professor}`, borderRadius: 999, padding: "6px 14px" }}>AMBER = PROFESSOR'S ORIGINAL LECTURE EXAMPLES</span>
          <span style={{ color: C.soccer, border: `2px solid ${C.soccer}`, borderRadius: 999, padding: "6px 14px" }}>GREEN = NEW SOCCER ANALOGIES</span>
        </div>
      </div>
      <svg width={600} height={420} style={{ position: "absolute", right: 60, top: 40 }}>
        <Player x={300} y={360} scale={1.9} keeper jersey="#FF8A3D" number={1} />
        <Ball x={470 - ease(frame, 10, 60) * 40} y={140 + ease(frame, 10, 60) * 60} r={34} rot={frame * 4} />
      </svg>
      <div style={{ position: "absolute", left: 80, top: 410 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.muted, marginBottom: 12, letterSpacing: 2, ...rise(frame, 6, 12) }}>CHAPTERS</div>
        <ChapterMenu tl={tl} frame={frame} compact />
      </div>
    </AbsoluteFill>
  );
};

export const ChapterCard: React.FC<{ section: TLSection; tl: Timeline }> = ({ section, tl }) => {
  const frame = useCurrentFrame();
  const sub = section.kind === "subsection";
  const chapNum = sub ? section.parentChapter : section.chapterNumber ?? 0;
  const dur = section.cardEnd - section.cardStart;
  const out = 1 - ease(frame, dur - 8, 8);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text, opacity: out }}>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: 0.22 }}>
        <SoccerField width={1920} height={1080} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,26,20,0.97) 35%, rgba(10,26,20,0.6))" }} />
      <div style={{ position: "absolute", left: 120, top: sub ? 380 : 330, width: 1500 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 4, color: sub ? C.concept : C.soccer, ...rise(frame, 0, 14) }}>
          {chapterLabel(section)} <span style={{ color: C.muted, fontSize: 24, marginLeft: 18 }}>{moduleLabel(chapNum)}</span>
        </div>
        <div style={{ fontSize: sub ? 72 : 84, fontWeight: 800, lineHeight: 1.08, marginTop: 18, ...rise(frame, 4, 16) }}>{cleanHeading(section.heading)}</div>
        <div style={{ width: 220 * ease(frame, 8, 20), height: 8, background: sub ? C.concept : C.soccer, borderRadius: 4, marginTop: 30 }} />
        <div style={{ fontSize: 24, color: C.muted, marginTop: 24, fontFamily: "'JetBrains Mono', monospace", ...rise(frame, 10, 12) }}>
          {fmtTime(section.cardStart, tl.fps)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
