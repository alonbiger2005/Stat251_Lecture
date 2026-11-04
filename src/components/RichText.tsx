import React from "react";
import { Tex } from "./Tex";

/** Text with inline math: "Area $= 0.8849$". `**bold**` also supported. */
export const RichText: React.FC<{ text: string; size?: number; color?: string; mathColor?: string; style?: React.CSSProperties }> = ({
  text,
  size = 32,
  color,
  mathColor,
  style,
}) => {
  const parts = text.split(/(\$[^$]+\$)/g).filter((p) => p !== "");
  return (
    <span style={{ fontSize: size, color, lineHeight: 1.25, ...style }}>
      {parts.map((p, i) => {
        if (p.startsWith("$") && p.endsWith("$")) return <Tex key={i} tex={p.slice(1, -1)} size={size * 1.02} color={mathColor ?? color} />;
        const bolds = p.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={i}>
            {bolds.map((b, j) =>
              b.startsWith("**") ? (
                <b key={j} style={{ fontWeight: 800 }}>
                  {b.slice(2, -2)}
                </b>
              ) : (
                <React.Fragment key={j}>{b}</React.Fragment>
              ),
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
};
