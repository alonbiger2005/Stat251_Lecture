/**
 * Numerical statistics helpers used for drawing curves, filling tables and for
 * independent verification in tests. No values in the video are hard-coded tables:
 * z-table and t-table entries are computed here and rounded like printed tables.
 */

export const normalPdf = (x: number, mu = 0, sigma = 1) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));

/** erf via high-precision series / continued fraction (|err| < 1e-13 on the range used). */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  if (ax < 3) {
    // Maclaurin series
    let sum = ax;
    let term = ax;
    for (let n = 1; n < 200; n++) {
      term *= (-ax * ax) / n;
      const add = term / (2 * n + 1);
      sum += add;
      if (Math.abs(add) < 1e-17) break;
    }
    return (sign * 2 * sum) / Math.sqrt(Math.PI);
  }
  // continued fraction for erfc
  let f = 0;
  for (let k = 60; k >= 1; k--) f = (k / 2) / (ax + f);
  const erfc = Math.exp(-ax * ax) / Math.sqrt(Math.PI) / (ax + f);
  return sign * (1 - erfc);
}

export const Phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

/** Printed z-table entry: left-area rounded to 4 decimals. */
export const zTableEntry = (z: number) => Math.round(Phi(z) * 10000) / 10000;

export function invPhi(p: number): number {
  let lo = -10;
  let hi = 10;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (Phi(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** log-gamma (Lanczos) */
export function lnGamma(z: number): number {
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export const tPdf = (x: number, df: number) =>
  Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (x * x) / df));

/** Regularised incomplete beta via continued fraction (Numerical Recipes betacf). */
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 300;
  const EPS = 1e-15;
  const FPMIN = 1e-300;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  void qab;
  void qap;
  void qam;
  return h;
}

export function regIncBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** Student t CDF */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const tail = 0.5 * regIncBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - tail : tail;
}

/** upper-tail critical value t* with P(T > t*) = alpha */
export function tCritical(alpha: number, df: number): number {
  let lo = 0;
  let hi = 700;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (1 - tCdf(mid, df) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Printed t-table entry (3 decimals). */
export const tTableEntry = (alpha: number, df: number) => Math.round(tCritical(alpha, df) * 1000) / 1000;

export const expPdf = (x: number, lambda: number) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x));
export const expCdf = (x: number, lambda: number) => (x < 0 ? 0 : 1 - Math.exp(-lambda * x));

/** Deterministic PRNG (mulberry32) so "random" sampling animations are reproducible. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian(r: () => number) {
  const u = Math.max(r(), 1e-12);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Sample size for a proportion, guarding against floating error before ceil. */
export function proportionSampleSize(zStar: number, pHat: number, E: number): number {
  const raw = (zStar * zStar * pHat * (1 - pHat)) / (E * E);
  return Math.ceil(Math.round(raw * 1e6) / 1e6);
}

export const fmt = (x: number, d: number) => {
  const s = x.toFixed(d);
  return s === `-${(0).toFixed(d)}` ? (0).toFixed(d) : s;
};
/** ".8849" style (no leading zero) */
export const fmtNoLead = (x: number, d: number) => fmt(x, d).replace(/^(-?)0\./, "$1.");
