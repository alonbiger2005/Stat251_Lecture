import { Easing, interpolate } from "remotion";

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 eased progress starting at `start` frames, lasting `dur` frames. */
export const ease = (frame: number, start: number, dur = 18) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clampOpts, easing: Easing.bezier(0.33, 0, 0.2, 1) });

export const lin = (frame: number, start: number, dur: number) => interpolate(frame, [start, start + dur], [0, 1], clampOpts);

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

/** fade+rise style for an element appearing at `start` */
export const rise = (frame: number, start: number, dur = 16, dist = 24) => {
  const t = ease(frame, start, dur);
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
};
