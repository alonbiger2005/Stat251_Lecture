import React from "react";
import { ease, rise } from "../lib/anim";
import { C, FONT } from "../theme";
import type { SceneCtx } from "../types";
import { CurvePlot, CurveStepCfg, resolveSteps } from "../components/CurvePlot";
import { RichText } from "../components/RichText";
import { FitTex } from "../components/Tex";

export type SceneFC<P = any> = React.FC<{ ctx: SceneCtx; props: P }>;

/** pick per-step value from a sparse array (last defined at or before step) */
export function pick<T>(arr: (T | undefined)[] | undefined, step: number): T | undefined {
  if (!arr) return undefined;
  for (let k = Math.min(step, arr.length - 1); k >= 0; k--) if (arr[k] !== undefined) return arr[k];
  return undefined;
}

export const Heading: React.FC<{ ctx: SceneCtx; titles?: (string | undefined)[]; size?: number; color?: string }> = ({ ctx, titles, size = 36, color = C.text }) => {
  if (!titles) return null;
  const cur = pick(titles, ctx.step);
  const prevStep = ctx.step - 1;
  const prev = prevStep >= 0 ? pick(titles, prevStep) : undefined;
  const changed = cur !== prev;
  const t = changed ? ease(ctx.stepFrame, 0, 14) : 1;
  return (
    <div style={{ position: "relative", height: size * 1.9, fontFamily: FONT, fontWeight: 700 }}>
      {changed && prev && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: 1 - t }}>
          <RichText text={prev} size={size} color={color} />
        </div>
      )}
      {cur && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: t, transform: `translateY(${(1 - t) * 12}px)` }}>
          <RichText text={cur} size={size} color={color} />
        </div>
      )}
    </div>
  );
};

export interface WorkLine {
  at: number; // step index at which it appears
  text?: string; // rich text
  tex?: string; // display math (worked arithmetic)
  color?: string;
  until?: number; // hide from this step on
  delay?: number; // frames after the step starts
}

export const WorkLines: React.FC<{ ctx: SceneCtx; lines?: WorkLine[]; width: number; size?: number; align?: "left" | "center" }> = ({ ctx, lines, width, size = 30, align = "left" }) => {
  if (!lines) return null;
  const vis = lines.filter((l) => ctx.step >= l.at && (l.until === undefined || ctx.step < l.until));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width, fontFamily: FONT }}>
      {vis.map((l, i) => {
        const st = l.at === ctx.step ? rise(ctx.stepFrame, 4 + (l.delay ?? 0), 14, 14) : {};
        return (
          <div key={`${l.at}-${i}`} style={{ textAlign: align, ...st }}>
            {l.tex ? (
              <FitTex tex={`\\displaystyle ${l.tex}`} maxWidth={width} maxHeight={120} size={size + 6} color={l.color ?? C.text} align={align} />
            ) : (
              <RichText text={l.text ?? ""} size={size} color={l.color ?? C.text} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* CurveScene: declarative distribution plot whose shading/markers     */
/* morph from step to step (one step per narrated paragraph).          */
/* ------------------------------------------------------------------ */
export interface CurveSceneProps {
  steps: CurveStepCfg[];
  titles?: (string | undefined)[];
  work?: WorkLine[];
  workPos?: "right" | "top" | "bottom";
  workWidth?: number;
  stepMap?: number[]; // segment step → config index
  plotHeight?: number;
}

export const CurveScene: SceneFC<CurveSceneProps> = ({ ctx, props }) => {
  const resolved = React.useMemo(() => resolveSteps(props.steps), [props.steps]);
  const idx = (k: number) => Math.min(resolved.length - 1, props.stepMap ? props.stepMap[Math.min(k, props.stepMap.length - 1)] : k);
  const ci = idx(ctx.step);
  const pi = ctx.step > 0 ? idx(ctx.step - 1) : ci;
  const t = ci === pi ? 1 : ease(ctx.stepFrame, 0, 26);
  const appear = ease(ctx.frame, 0, 30);
  const titleH = props.titles ? 74 : 0;
  const workRight = props.work && (props.workPos ?? "right") === "right";
  const workW = props.workWidth ?? 380;
  const plotW = workRight ? ctx.width - workW - 20 : ctx.width;
  const workTopH = props.work && props.workPos === "top" ? 160 : 0;
  const workBottomH = props.work && props.workPos === "bottom" ? 150 : 0;
  const plotH = props.plotHeight ?? ctx.height - titleH - workTopH - workBottomH - 10;
  return (
    <div style={{ width: ctx.width, height: ctx.height, position: "relative" }}>
      <Heading ctx={ctx} titles={props.titles} />
      {workTopH > 0 && (
        <div style={{ height: workTopH }}>
          <WorkLines ctx={ctx} lines={props.work} width={ctx.width} />
        </div>
      )}
      <div style={{ display: "flex", gap: 20 }}>
        <CurvePlot prev={resolved[pi]} cur={resolved[ci]} t={t} width={plotW} height={plotH} appear={appear} />
        {workRight && (
          <div style={{ width: workW, paddingTop: 20 }}>
            <WorkLines ctx={ctx} lines={props.work} width={workW} />
          </div>
        )}
      </div>
      {workBottomH > 0 && <WorkLines ctx={ctx} lines={props.work} width={ctx.width} align="center" />}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* CardsScene: grid of cards revealed / highlighted by step            */
/* ------------------------------------------------------------------ */
export interface Card {
  title: string; // rich text
  body?: string; // rich text
  tex?: string;
  kicker?: string; // small label
  color?: string;
  at?: number; // step it appears (default 0)
  hi?: number[]; // steps where it is highlighted
  verdict?: "ok" | "bad";
  verdictAt?: number;
}
export interface CardsSceneProps {
  titles?: (string | undefined)[];
  cards: Card[];
  cols?: number;
  cardHeight?: number;
  titleSize?: number;
  bodySize?: number;
  dimOthersOnHi?: boolean;
  footer?: WorkLine[];
}

export const CardsScene: SceneFC<CardsSceneProps> = ({ ctx, props }) => {
  const cols = props.cols ?? 2;
  const gap = 18;
  const titleH = props.titles ? 74 : 0;
  const footerH = props.footer ? 130 : 0;
  const rows = Math.ceil(props.cards.length / cols);
  const cw = (ctx.width - gap * (cols - 1)) / cols;
  const ch = props.cardHeight ?? Math.min(260, (ctx.height - titleH - footerH - gap * (rows - 1)) / rows);
  const anyHi = props.cards.some((c) => c.hi?.includes(ctx.step));
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", flexWrap: "wrap", gap }}>
        {props.cards.map((c, i) => {
          const at = c.at ?? 0;
          const shown = ctx.step >= at;
          const order = props.cards.slice(0, i).filter((x) => (x.at ?? 0) === at).length;
          const appearT = at === ctx.step ? ease(ctx.stepFrame, 2 + order * 10, 16) : shown ? 1 : 0;
          const hi = c.hi?.includes(ctx.step);
          const col = c.color ?? C.concept;
          const dim = props.dimOthersOnHi !== false && anyHi && !hi;
          const vt = c.verdict && ctx.step >= (c.verdictAt ?? at) ? (c.verdictAt === ctx.step ? ease(ctx.stepFrame, 6, 12) : 1) : 0;
          return (
            <div
              key={i}
              style={{
                width: cw,
                height: ch,
                boxSizing: "border-box",
                borderRadius: 18,
                padding: "16px 22px",
                background: hi ? "rgba(24,58,44,0.98)" : C.panel,
                border: `3px solid ${hi ? col : C.line}`,
                boxShadow: hi ? `0 0 34px ${col}44` : undefined,
                opacity: appearT * (dim ? 0.45 : 1),
                transform: `translateY(${(1 - appearT) * 20}px) scale(${hi ? 1.015 : 1})`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {c.kicker && <RichText text={c.kicker} size={20} color={col} style={{ fontWeight: 800, letterSpacing: 1 }} />}
              <RichText text={c.title} size={props.titleSize ?? 32} color={C.text} style={{ fontWeight: 800 }} />
              {c.body && <RichText text={c.body} size={props.bodySize ?? 26} color={C.muted} />}
              {c.tex && (
                <div style={{ marginTop: "auto" }}>
                  <FitTex tex={`\\displaystyle ${c.tex}`} maxWidth={cw - 48} maxHeight={ch * 0.42} size={34} color={C.text} />
                </div>
              )}
              {vt > 0 && (
                <div
                  style={{
                    position: "absolute",
                    right: 16,
                    top: 12,
                    fontSize: 40,
                    fontWeight: 900,
                    color: c.verdict === "ok" ? C.ok : C.danger,
                    opacity: vt,
                    transform: `scale(${0.6 + 0.4 * vt})`,
                  }}
                >
                  {c.verdict === "ok" ? "✓" : "✗"}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {props.footer && (
        <div style={{ marginTop: 18 }}>
          <WorkLines ctx={ctx} lines={props.footer} width={ctx.width} align="center" />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* StepsScene: numbered vertical list; the current item glows          */
/* ------------------------------------------------------------------ */
export interface StepsSceneProps {
  titles?: (string | undefined)[];
  items: { text: string; at: number; hi?: number[]; color?: string; sub?: string }[];
  numbered?: boolean;
  size?: number;
  side?: WorkLine[];
  sideWidth?: number;
}
export const StepsScene: SceneFC<StepsSceneProps> = ({ ctx, props }) => {
  const size = props.size ?? 32;
  const sideW = props.side ? props.sideWidth ?? 420 : 0;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", gap: 28 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {props.items.map((it, i) => {
            const shown = ctx.step >= it.at;
            if (!shown) return null;
            const hi = (it.hi ?? [it.at]).includes(ctx.step);
            const t = it.at === ctx.step ? ease(ctx.stepFrame, 2, 14) : 1;
            const col = it.color ?? C.soccer;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "12px 18px",
                  borderRadius: 14,
                  background: hi ? "rgba(24,58,44,0.98)" : "rgba(19,46,35,0.7)",
                  border: `3px solid ${hi ? col : "transparent"}`,
                  opacity: t * (hi ? 1 : 0.72),
                  transform: `translateX(${(1 - t) * -30}px)`,
                }}
              >
                {props.numbered !== false && (
                  <div
                    style={{
                      minWidth: 50,
                      height: 50,
                      borderRadius: 25,
                      background: hi ? col : C.panel2,
                      color: hi ? C.bg : C.text,
                      fontWeight: 900,
                      fontSize: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <RichText text={it.text} size={size} color={C.text} style={{ fontWeight: 700 }} />
                  {it.sub && <RichText text={it.sub} size={size * 0.75} color={C.muted} />}
                </div>
              </div>
            );
          })}
        </div>
        {props.side && (
          <div style={{ width: sideW }}>
            <WorkLines ctx={ctx} lines={props.side} width={sideW} />
          </div>
        )}
      </div>
    </div>
  );
};
