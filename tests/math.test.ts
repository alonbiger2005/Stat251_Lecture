/** Independent numerical verification of every number the video states. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Phi, proportionSampleSize, tCdf, tTableEntry, zTableEntry } from "../src/lib/stats.ts";

const close = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("Exponential lecture example ≈ 0.2798", () => {
  const v = Math.exp(-5 * 0.25) - Math.exp(-5 * 1);
  close(v, 0.27976685, 1e-8);
  close(Math.exp(-1.25), 0.2865, 5e-5);
  close(Math.exp(-5), 0.0067, 5e-5);
});

test("Uniform drill P(5<X<10) = 0.25, mean 10", () => {
  assert.equal((10 - 5) / (20 - 0), 0.25);
  assert.equal((0 + 20) / 2, 10);
});

test("z-table values", () => {
  assert.equal(zTableEntry(1.2), 0.8849);
  close(1 - zTableEntry(1.2), 0.1151, 1e-12);
  assert.equal(zTableEntry(-1.2), 0.1151);
  assert.equal(zTableEntry(2.0), 0.9772);
  close(2 * (1 - zTableEntry(2.0)), 0.0456, 1e-12);
  assert.equal(zTableEntry(1.96), 0.975);
});

test("68–95–99.7 reaction-time bands", () => {
  close(0.4 - 0.04, 0.36, 1e-12);
  close(0.4 + 0.04, 0.44, 1e-12);
  close(0.4 - 2 * 0.04, 0.32, 1e-12);
  close(0.4 + 2 * 0.04, 0.48, 1e-12);
  close(Phi(1) - Phi(-1), 0.6827, 1e-4);
  close(Phi(2) - Phi(-2), 0.9545, 1e-4);
  close(Phi(3) - Phi(-3), 0.9973, 1e-4);
});

test("Proportion sample size 9604", () => {
  assert.equal(proportionSampleSize(1.96, 0.5, 0.01), 9604);
});

test("Voter test z ≈ −1.20, p = 0.1151; voter CI ≈ (50.42%, 52.38%)", () => {
  const z = (0.514 - 0.52) / Math.sqrt((0.52 * 0.48) / 10000);
  close(z, -1.2, 0.005);
  assert.equal(zTableEntry(-1.2), 0.1151);
  const me = 1.96 * Math.sqrt((0.514 * 0.486) / 10000);
  close(0.514 - me, 0.5042, 5e-5);
  close(0.514 + me, 0.5238, 5e-5);
});

test("Cats lecture example: unpooled z ≈ 0.878, one-sided p ≈ 0.1894 (table at z = 0.88)", () => {
  const p1 = 13 / 45;
  const p2 = 16 / 74;
  const z = (p1 - p2) / Math.sqrt((p1 * (1 - p1)) / 45 + (p2 * (1 - p2)) / 74);
  close(z, 0.878, 0.0005);
  close(1 - zTableEntry(0.88), 0.1894, 1e-12);
});

test("GPA lecture example t ≈ 3.84, two-sided p < .001", () => {
  const t = (4.2317 - 4.1) / (0.3664 / Math.sqrt(114));
  close(t, 3.84, 0.005);
  assert.ok(2 * (1 - tCdf(t, 113)) < 0.001);
});

test("First-generation lecture example: t = −1.083, df ≈ 22.38 → one-sided p ≈ 0.145", () => {
  close(tCdf(-1.083, 22.38), 0.145, 0.001);
});

test("Soccer t-test: t = 2.40, df = 35, .01 < p < .025", () => {
  const t = (0.424 - 0.4) / (0.06 / Math.sqrt(36));
  close(t, 2.4, 1e-9);
  const lo = tTableEntry(0.025, 35);
  const hi = tTableEntry(0.01, 35);
  assert.equal(lo, 2.03);
  assert.equal(hi, 2.438);
  assert.ok(t > lo && t < hi);
  const p = 1 - tCdf(t, 35);
  assert.ok(p > 0.01 && p < 0.025);
});

test("Soccer proportion CI: .62 ± 1.96·SE ≈ (.5249, .7151)", () => {
  const se = Math.sqrt((0.62 * 0.38) / 100);
  close(se, 0.04854, 5e-6);
  close(1.96 * se, 0.0951, 5e-5);
  close(0.62 - 1.96 * se, 0.5249, 5e-5);
  close(0.62 + 1.96 * se, 0.7151, 5e-5);
});

test("t-table entries used on screen match standard printed tables", () => {
  assert.equal(tTableEntry(0.05, 35), 1.69);
  assert.equal(tTableEntry(0.025, 10), 2.228);
  assert.equal(tTableEntry(0.025, 1), 12.706);
  assert.equal(tTableEntry(0.05, 1), 6.314);
});
