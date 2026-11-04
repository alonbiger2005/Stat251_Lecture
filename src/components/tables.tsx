import React from "react";
import { fmtNoLead, tTableEntry, zTableEntry } from "../lib/stats";
import { C, FONT, MONO } from "../theme";

const cellBase: React.CSSProperties = {
  fontFamily: MONO,
  textAlign: "center",
  padding: "8px 4px",
  borderBottom: `1px solid ${C.line}`,
};

/**
 * Standard-normal table, LEFT cumulative area Φ(z) — the same semantics as the exam's z-table.
 * Entries are computed (Φ rounded to 4 d.p.), not typed in.
 */
export const ZTableLookup: React.FC<{
  rows: number[]; // e.g. [1.0, 1.1, 1.2, 1.3]  or negative [-1.3, -1.2, ...]
  cols?: number[]; // hundredths .00 … .09
  hiRow?: number;
  hiCol?: number;
  progress?: number; // 0..1 highlight sweep
  width?: number;
  fontSize?: number;
  title?: string;
}> = ({ rows, cols = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09], hiRow, hiCol, progress = 1, width = 1000, fontSize = 25, title }) => {
  const neg = rows.some((r) => r < 0) || Object.is(rows[0], -0);
  const zOf = (r: number, c: number) => (neg ? Math.round((r - c) * 100) / 100 : Math.round((r + c) * 100) / 100);
  const rowOn = progress > 0.05;
  const colOn = progress > 0.4;
  const cellOn = progress > 0.75;
  return (
    <div style={{ width, fontFamily: FONT, color: C.text }}>
      <div style={{ fontSize: fontSize + 2, fontWeight: 800, marginBottom: 10, color: C.concept }}>
        {title ?? (neg ? "z-table (negative z): area to the LEFT of z" : "z-table: area to the LEFT of z")}
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize, background: C.panel, borderRadius: 12, overflow: "hidden" }}>
        <thead>
          <tr style={{ background: C.panel2 }}>
            <th style={{ ...cellBase, fontFamily: FONT, color: C.muted }}>z</th>
            {cols.map((c) => (
              <th key={c} style={{ ...cellBase, color: colOn && hiCol !== undefined && Math.abs(c - hiCol) < 1e-9 ? C.yellow : C.muted }}>
                {fmtNoLead(c, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isRow = hiRow !== undefined && Math.abs(r - hiRow) < 1e-9 && Object.is(r < 0 || Object.is(r, -0), hiRow < 0 || Object.is(hiRow, -0));
            return (
              <tr key={String(r)} style={{ background: rowOn && isRow ? "rgba(255,224,102,0.16)" : undefined }}>
                <td style={{ ...cellBase, fontWeight: 800, color: rowOn && isRow ? C.yellow : C.text }}>{(Object.is(r, -0) ? "-0.0" : r.toFixed(1))}</td>
                {cols.map((c) => {
                  const isCol = hiCol !== undefined && Math.abs(c - hiCol) < 1e-9;
                  const hit = isRow && isCol && cellOn;
                  return (
                    <td
                      key={c}
                      style={{
                        ...cellBase,
                        background: hit ? C.yellow : colOn && isCol ? "rgba(255,224,102,0.12)" : undefined,
                        color: hit ? "#111" : C.text,
                        fontWeight: hit ? 800 : 400,
                        transform: hit ? "scale(1.12)" : undefined,
                      }}
                    >
                      {fmtNoLead(zTableEntry(zOf(r, c)), 4)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/** Student's t table: UPPER-tail probability columns, df rows; entries are critical values t*. */
export const TTableLookup: React.FC<{
  dfs: number[];
  alphas?: number[];
  hiDf?: number;
  hiAlpha?: number;
  bracket?: [number, number]; // highlight two neighbouring alphas (p-value bracketing)
  progress?: number;
  width?: number;
  fontSize?: number;
  title?: string;
}> = ({ dfs, alphas = [0.1, 0.05, 0.025, 0.01, 0.005, 0.001], hiDf, hiAlpha, bracket, progress = 1, width = 1000, fontSize = 26, title }) => {
  const rowOn = progress > 0.05;
  const colOn = progress > 0.4;
  const cellOn = progress > 0.75;
  return (
    <div style={{ width, fontFamily: FONT, color: C.text }}>
      <div style={{ fontSize: fontSize + 2, fontWeight: 800, marginBottom: 10, color: C.exam }}>
        {title ?? "t-table: critical values t* for an UPPER-tail area"}
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize, background: C.panel, borderRadius: 12, overflow: "hidden" }}>
        <thead>
          <tr style={{ background: C.panel2 }}>
            <th style={{ ...cellBase, fontFamily: FONT, color: C.muted }}>df \ upper tail</th>
            {alphas.map((a) => {
              const on = colOn && ((hiAlpha !== undefined && a === hiAlpha) || (bracket && bracket.includes(a)));
              return (
                <th key={a} style={{ ...cellBase, color: on ? C.yellow : C.muted }}>
                  {fmtNoLead(a, a < 0.01 ? 3 : a === 0.025 ? 3 : 2)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dfs.map((df) => {
            const isRow = df === hiDf;
            return (
              <tr key={df} style={{ background: rowOn && isRow ? "rgba(197,155,255,0.18)" : undefined }}>
                <td style={{ ...cellBase, fontWeight: 800, color: rowOn && isRow ? C.exam : C.text }}>{df}</td>
                {alphas.map((a) => {
                  const hit = isRow && cellOn && ((hiAlpha !== undefined && a === hiAlpha) || (bracket && bracket.includes(a)));
                  return (
                    <td
                      key={a}
                      style={{
                        ...cellBase,
                        background: hit ? C.yellow : undefined,
                        color: hit ? "#111" : C.text,
                        fontWeight: hit ? 800 : 400,
                      }}
                    >
                      {tTableEntry(a, df).toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
