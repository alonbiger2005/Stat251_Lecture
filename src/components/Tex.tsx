import katex from "katex";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";

const cache = new Map<string, string>();

export function renderTex(tex: string, display = true): string {
  const key = `${display ? "D" : "I"}|${tex}`;
  let html = cache.get(key);
  if (!html) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: "ignore", output: "html" });
    cache.set(key, html);
  }
  return html;
}

/** Inline/Display KaTeX. Never shows raw LaTeX: KaTeX throws on parse errors (caught by tests). */
export const Tex: React.FC<{ tex: string; size?: number; color?: string; display?: boolean; style?: React.CSSProperties }> = ({
  tex,
  size = 40,
  color,
  display = false,
  style,
}) => {
  const html = useMemo(() => renderTex(tex, display), [tex, display]);
  return (
    <span
      className={display ? "tex tex-display" : "tex"}
      style={{ fontSize: size, color, lineHeight: 1.2, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Display math scaled down (never up) so it always fits `maxWidth` × `maxHeight`.
 * Prevents clipped or off-screen equations.
 */
export const FitTex: React.FC<{ tex: string; size?: number; maxWidth: number; maxHeight?: number; color?: string; align?: "left" | "center" }> = ({
  tex,
  size = 44,
  maxWidth,
  maxHeight = 400,
  color,
  align = "center",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setNat((p) => (p && Math.abs(p.w - w) < 0.5 && Math.abs(p.h - h) < 0.5 ? p : { w, h }));
  }, []);
  // re-measure on every render (layout is unaffected by the transform) and once fonts finish loading
  useLayoutEffect(measure);
  useEffect(() => {
    if (document.fonts.status === "loaded") return;
    const handle = delayRender("FitTex fonts");
    document.fonts.ready.then(() => {
      measure();
      continueRender(handle);
    });
  }, [measure]);
  const scale = nat ? Math.min(1, maxWidth / Math.max(1, nat.w), maxHeight / Math.max(1, nat.h)) : 1;
  return (
    <div style={{ width: maxWidth, height: nat ? nat.h * scale : undefined, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <div style={{ width: nat ? nat.w * scale : undefined, height: nat ? nat.h * scale : undefined, position: "relative" }}>
        <div
          ref={ref}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `scale(${scale})`,
            display: "inline-block",
            whiteSpace: "nowrap",
            color,
            fontSize: size,
            visibility: nat ? "visible" : "hidden",
          }}
          dangerouslySetInnerHTML={{ __html: renderTex(tex, false) }}
        />
      </div>
    </div>
  );
};
