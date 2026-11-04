import React from "react";
import { ease, mix, rise } from "../lib/anim";
import { rng } from "../lib/stats";
import { C, FONT, MONO } from "../theme";
import { Ball, Cone, Goal, GoalTimer, Player, SoccerField, Stopwatch } from "../components/soccer";
import { RichText } from "../components/RichText";
import { CurvePlot, CurveStepCfg, resolveSteps } from "../components/CurvePlot";
import { Heading, SceneFC, WorkLine, WorkLines } from "./generic";

/* ---------------- INTRO: goalkeeper session plan ---------------- */
export const IntroWelcome: SceneFC = ({ ctx }) => {
  const f = ctx.frame;
  const steps = ["1 · Explain the idea", "2 · Practice it on the pitch", "3 · Connect to the exam calculation"];
  return (
    <div style={{ width: ctx.width, height: ctx.height, position: "relative", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, top: 0, borderRadius: 18, overflow: "hidden" }}>
        <SoccerField width={ctx.width} height={430} />
      </div>
      <svg width={ctx.width} height={430} style={{ position: "absolute", left: 0, top: 0 }}>
        <Goal x={ctx.width - 160} y={130} w={110} h={170} />
        <Player x={ctx.width - 230} y={300} scale={1.15} keeper jersey="#FF8A3D" number={1} pose={f % 120 > 60 ? "stand" : "stand"} />
        <Player x={ctx.width * 0.42} y={320} scale={1.15} jersey="#2F80ED" number={7} />
        <Ball x={mix(ctx.width * 0.42 + 40, ctx.width - 260, ease(f % 90, 10, 50))} y={mix(300, 220, ease(f % 90, 10, 50))} r={16} rot={f * 8} />
        <Player x={160} y={330} scale={1.2} jersey="#6CB8FF" number={"C"} />
        <text x={160} y={378} fill="#fff" fontSize={24} fontWeight={700} textAnchor="middle" fontFamily={FONT}>
          coach (you)
        </text>
      </svg>
      <div style={{ position: "absolute", left: 0, top: 452, width: ctx.width, display: "flex", gap: 16 }}>
        {steps.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              background: C.panel,
              border: `3px solid ${C.soccer}`,
              borderRadius: 16,
              padding: "16px 18px",
              fontSize: 28,
              fontWeight: 800,
              color: C.text,
              ...rise(f, 20 + i * 25, 16),
            }}
          >
            {s}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 560, width: ctx.width, display: "flex", gap: 16, ...rise(f, 110, 16) }}>
        <div style={{ flex: 1, border: `3px solid ${C.professor}`, borderRadius: 16, padding: "14px 18px", background: "rgba(255,181,71,0.08)" }}>
          <div style={{ color: C.professor, fontWeight: 800, fontSize: 22 }}>PROFESSOR'S ORIGINAL EXAMPLES (kept exactly)</div>
          <div style={{ color: C.text, fontSize: 28, marginTop: 6 }}>Voter proportion · GPA means · Customer arrivals · Cats preference</div>
        </div>
        <div style={{ flex: 1, border: `3px solid ${C.soccer}`, borderRadius: 16, padding: "14px 18px", background: "rgba(61,220,132,0.08)" }}>
          <div style={{ color: C.soccer, fontWeight: 800, fontSize: 22 }}>NEW SUPPORTING EXAMPLES</div>
          <div style={{ color: C.text, fontSize: 28, marginTop: 6 }}>Goalkeepers · drills · reaction times · training</div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Probability vs inference ---------------- */
export const ProbVsInference: SceneFC = ({ ctx }) => {
  const f = ctx.frame;
  const s1 = ctx.at(1, 20);
  const s2 = ctx.at(2, 20);
  const hiBoth = ctx.step >= 2;
  const panel = (color: string, on: number): React.CSSProperties => ({
    flex: 1,
    background: C.panel,
    borderRadius: 20,
    border: `3px solid ${color}`,
    padding: 22,
    position: "relative",
    opacity: 0.35 + 0.65 * on,
    boxShadow: hiBoth ? `0 0 40px ${color}44` : undefined,
  });
  const kicks = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT, display: "flex", flexDirection: "column", gap: 18 }}>
      <Heading ctx={ctx} titles={["Statistics solves one of **two** problems", "Penalty kicks: the same sport, two different questions", "Keep this split in your head: **probability vs inference**"]} />
      <div style={{ display: "flex", gap: 22, flex: 1 }}>
        <div style={panel(C.concept, 1)}>
          <div style={{ color: C.concept, fontWeight: 900, fontSize: 30 }}>PROBABILITY · Module 4</div>
          <div style={{ color: C.text, fontSize: 28, marginTop: 8 }}>Known model → chance of an outcome</div>
          <svg width={440} height={250} style={{ marginTop: 16, opacity: 0.25 + 0.75 * Math.max(s1, ctx.step === 0 ? 0.3 : 0) }}>
            {kicks.map((i) => {
              const saved = i < 2;
              return (
                <g key={i} transform={`translate(${30 + (i % 5) * 88}, ${60 + Math.floor(i / 5) * 110})`}>
                  <Ball x={0} y={0} r={26} rot={i * 33} />
                  <text x={0} y={60} fill={saved ? C.soccer : C.muted} fontSize={22} textAnchor="middle" fontFamily={FONT} fontWeight={700}>
                    {saved ? "SAVED" : "goal"}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ fontSize: 28, color: C.text, opacity: s1 }}>
            <RichText text="Save rate **known**: 20% → probability of an outcome?" size={28} />
          </div>
        </div>
        <div style={panel(C.soccer, 1)}>
          <div style={{ color: C.soccer, fontWeight: 900, fontSize: 30 }}>INFERENCE · Modules 5 & 6</div>
          <div style={{ color: C.text, fontSize: 28, marginTop: 8 }}>Sample → learn about a bigger population</div>
          <svg width={440} height={250} style={{ marginTop: 16 }}>
            {Array.from({ length: 40 }, (_, i) => {
              const sampled = [3, 8, 14, 17, 22, 29, 33, 38].includes(i);
              const on = ctx.step >= 1 ? s1 : 0.2;
              return <circle key={i} cx={30 + (i % 10) * 42} cy={40 + Math.floor(i / 10) * 52} r={16} fill={sampled ? C.soccer : C.panel2} opacity={sampled ? 0.3 + 0.7 * on : 1} stroke={C.line} />;
            })}
            <text x={220} y={245} fill={C.muted} fontSize={22} textAnchor="middle" fontFamily={FONT}>
              all goalkeepers (true save % unknown)
            </text>
          </svg>
          <div style={{ display: "flex", gap: 12, opacity: s1 }}>
            <div style={{ flex: 1, background: C.panel2, borderRadius: 12, padding: "10px 12px", fontSize: 24, color: C.text }}>
              <b style={{ color: C.soccer }}>Confidence interval</b>
              <br /> estimates the unknown number
            </div>
            <div style={{ flex: 1, background: C.panel2, borderRadius: 12, padding: "10px 12px", fontSize: 24, color: C.text }}>
              <b style={{ color: C.exam }}>Hypothesis test</b>
              <br /> challenges a claim about it
            </div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, color: C.yellow, opacity: s2, ...(s2 ? {} : {}) }}>
        probability ⟷ inference
      </div>
      <span style={{ display: "none" }}>{f}</span>
    </div>
  );
};

/* ---------------- Population vs sample roster ---------------- */
export const PopulationSample: SceneFC = ({ ctx }) => {
  const N = 120;
  const cols = 15;
  const r = React.useMemo(() => rng(251), []);
  const sampleIdx = React.useMemo(() => {
    const set = new Set<number>();
    while (set.size < 18) set.add(Math.floor(r() * N));
    return set;
  }, [r]);
  const step = ctx.step;
  const sampleOn = step >= 2 ? ctx.at(2, 30) : 0;
  const paramOn = step >= 3 ? ctx.at(3, 20) : 0;
  const statOn = step >= 4 ? ctx.at(4, 20) : 0;
  const arrowOn = step >= 5 ? ctx.at(5, 24) : 0;
  const gw = 640;
  const cell = gw / cols;
  const jerseys = ["#2F80ED", "#E2554F", "#F2C94C", "#9B51E0", "#27AE60"];
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT, position: "relative" }}>
      <Heading
        ctx={ctx}
        titles={["Four words: population · sample · parameter · statistic", "**Population**: the whole group you care about", "**Sample**: the smaller group you actually observe", "**Parameter**: describes the population (usually unknown)", "**Statistic**: calculated from the sample", "Inference: statistic → parameter"]}
        size={32}
      />
      <svg width={ctx.width} height={ctx.height - 70} style={{ position: "absolute", top: 70, left: 0 }}>
        <rect x={0} y={0} width={gw + 30} height={500} rx={18} fill={C.panel} stroke={C.concept} strokeWidth={3} />
        <text x={18} y={38} fill={C.concept} fontSize={26} fontWeight={800} fontFamily={FONT}>
          POPULATION · e.g. all college goalkeepers
        </text>
        {Array.from({ length: N }, (_, i) => {
          const x = 15 + cell * (i % cols) + cell / 2;
          const y = 80 + Math.floor(i / cols) * 52 + 40;
          const inS = sampleIdx.has(i);
          return (
            <Player
              key={i}
              x={x}
              y={y}
              scale={0.3}
              jersey={jerseys[i % jerseys.length]}
              keeper={i % 7 === 0}
              highlight={inS && sampleOn > 0.5}
              dim={sampleOn > 0.5 && !inS}
            />
          );
        })}
        {/* sample box */}
        <g opacity={sampleOn} transform={`translate(${gw + 70}, 0)`}>
          <rect x={0} y={0} width={ctx.width - gw - 70} height={260} rx={18} fill={C.panel} stroke={C.soccer} strokeWidth={3} />
          <text x={18} y={38} fill={C.soccer} fontSize={26} fontWeight={800} fontFamily={FONT}>
            SAMPLE · the players we observe
          </text>
          {Array.from(sampleIdx).map((idx, k) => (
            <Player key={idx} x={30 + (k % 9) * 34} y={110 + Math.floor(k / 9) * 70} scale={0.36} jersey={jerseys[idx % jerseys.length]} keeper={idx % 7 === 0} />
          ))}
          <text x={18} y={240} fill={C.muted} fontSize={22} fontFamily={FONT}>
            Lecture: a random sample of n = 114 students' GPAs
          </text>
        </g>
      </svg>
      {/* parameter labels */}
      <div style={{ position: "absolute", left: 20, top: 590, width: gw, opacity: paramOn, display: "flex", gap: 14 }}>
        {[
          ["\\mu", "true mean"],
          ["p", "true proportion"],
        ].map(([t, l]) => (
          <div key={t} style={{ flex: 1, background: C.panel2, border: `2px solid ${C.concept}`, borderRadius: 14, padding: "8px 14px", display: "flex", alignItems: "center", gap: 14 }}>
            <RichText text={`$${t}$`} size={46} color={C.concept} />
            <span style={{ fontSize: 24, color: C.text }}>
              {l} <span style={{ color: C.danger, fontWeight: 800 }}>(unknown ?)</span>
            </span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: gw + 70, top: 350, width: ctx.width - gw - 70, opacity: statOn, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["\\bar x", "sample mean (or \\bar y on slides)"],
          ["\\hat p", "sample proportion"],
          ["s", "sample standard deviation"],
        ].map(([t, l]) => (
          <div key={t} style={{ background: C.panel2, border: `2px solid ${C.soccer}`, borderRadius: 14, padding: "6px 14px", display: "flex", alignItems: "center", gap: 14 }}>
            <RichText text={`$${t}$`} size={40} color={C.soccer} />
            <RichText text={l.includes("\\bar y") ? "sample mean (or $\\bar y$ on slides)" : l} size={24} color={C.text} />
          </div>
        ))}
      </div>
      {arrowOn > 0 && (
        <div style={{ position: "absolute", left: gw + 70, top: 630, width: ctx.width - gw - 70, opacity: arrowOn, fontSize: 28, fontWeight: 800, color: C.yellow, textAlign: "center" }}>
          <RichText text="calculate $\bar x, \hat p$ → learn about $\mu, p$" size={30} color={C.yellow} />
        </div>
      )}
    </div>
  );
};

/* ---------------- Continuous variable: stopwatch zoom ---------------- */
export const ContinuousStopwatch: SceneFC = ({ ctx }) => {
  const vals = ["0.4", "0.42", "0.420", "0.4201", "0.42017"];
  const k = Math.min(vals.length - 1, Math.floor(ctx.frame / 22) % (vals.length + 2));
  const value = ctx.step === 0 ? "0.4" : vals[Math.min(k, vals.length - 1)];
  const sprint = ["4.20", "4.201", "4.2017"];
  const ks = Math.min(sprint.length - 1, Math.floor(ctx.stepFrame / 30));
  const zoom = ctx.step >= 1 ? ease(ctx.stepFrame, 10, 90) : 0;
  const lineW = ctx.width - 80;
  const lo = mix(0, 0.419, zoom);
  const hi = mix(1, 0.421, zoom);
  const xOf = (v: number) => 40 + ((v - lo) / (hi - lo)) * lineW;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT, position: "relative" }}>
      <Heading ctx={ctx} titles={["Module 4: **continuous** random variables only", "A continuous variable can take **any value in an interval**", "Sprint times: 4.20 s, 4.201 s, 4.2017 s, … → continuous"]} />
      <svg width={ctx.width} height={640} style={{ position: "absolute", top: 80 }}>
        <Stopwatch x={ctx.step === 2 ? 760 : 220} y={190} value={ctx.step === 2 ? sprint[ks] : value} label={ctx.step === 2 ? "sprint time (s)" : "keeper reaction time (s)"} size={1.05} />
        {ctx.step < 2 && (
          <g>
            <Player x={600} y={330} scale={1.4} keeper jersey="#FF8A3D" number={1} pose={Math.floor(ctx.frame / 40) % 2 ? "dive" : "stand"} />
            <Ball x={820} y={150} r={22} rot={ctx.frame * 6} />
          </g>
        )}
        {ctx.step === 2 && <Player x={230} y={330} scale={1.4} jersey="#2F80ED" number={9} />}
        {/* zooming number line */}
        <g transform="translate(0, 470)">
          <line x1={40} x2={40 + lineW} y1={0} y2={0} stroke={C.muted} strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => {
            const v = lo + ((hi - lo) * i) / 10;
            return (
              <g key={i}>
                <line x1={xOf(v)} x2={xOf(v)} y1={-12} y2={12} stroke={C.muted} strokeWidth={3} />
                <text x={xOf(v)} y={48} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={MONO}>
                  {v.toFixed(zoom > 0.5 ? 4 : zoom > 0.1 ? 3 : 1)}
                </text>
              </g>
            );
          })}
          <circle cx={xOf(0.42017)} cy={0} r={12} fill={C.soccer} />
          <text x={40 + lineW / 2} y={100} fill={C.muted} fontSize={26} textAnchor="middle" fontFamily={FONT}>
            {ctx.step >= 1 ? "zoom in: there is always another decimal — infinitely many possible values" : "reaction time, shot speed, distance covered, time until a goal…"}
          </text>
        </g>
      </svg>
    </div>
  );
};

/* ---------------- Three distribution shapes ---------------- */
export const ThreeShapes: SceneFC = ({ ctx }) => {
  const mk = (cfg: CurveStepCfg) => resolveSteps([cfg])[0];
  const plots = [
    { name: "Uniform", note: "flat: equally likely in an interval", cfg: mk({ curves: [{ id: "u", dist: { kind: "uniform", a: 0, b: 20 }, color: C.soccer, fill: "rgba(61,220,132,0.25)" }], dom: [-3, 23], yMax: 0.08, ticks: [{ v: 0, label: "a" }, { v: 20, label: "b" }] }) },
    { name: "Exponential", note: "waiting time until the first event", cfg: mk({ curves: [{ id: "e", dist: { kind: "exp", lambda: 2 }, color: C.concept, fill: "rgba(108,184,255,0.25)" }], dom: [0, 2.5], yMax: 2.1, ticks: [{ v: 0, label: "0" }] }) },
    { name: "Normal", note: "symmetric bell curve", cfg: mk({ curves: [{ id: "n", dist: { kind: "normal", mu: 0, sigma: 1 }, color: C.professor, fill: "rgba(255,181,71,0.25)" }], dom: [-3.5, 3.5], yMax: 0.44, ticks: [{ v: 0, label: "μ" }] }) },
  ];
  const w = (ctx.width - 40) / 3;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={["Three continuous distributions to recognise"]} />
      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        {plots.map((p, i) => {
          const t = ease(ctx.frame, 10 + i * 30, 30);
          return (
            <div key={p.name} style={{ width: w, background: C.panel, borderRadius: 18, border: `2px solid ${C.line}`, padding: 12, opacity: t }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.text, textAlign: "center" }}>{p.name}</div>
              <CurvePlot prev={p.cfg} cur={p.cfg} t={1} width={w - 24} height={360} appear={t} />
              <div style={{ fontSize: 26, color: C.muted, textAlign: "center" }}>{p.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- Uniform drill start ---------------- */
export const UniformDrill: SceneFC<{ steps: CurveStepCfg[]; titles: string[]; work?: WorkLine[] }> = ({ ctx, props }) => {
  const resolved = React.useMemo(() => resolveSteps(props.steps), [props.steps]);
  const ci = Math.min(resolved.length - 1, ctx.step);
  const pi = Math.max(0, Math.min(resolved.length - 1, ctx.step - 1));
  const t = ci === pi ? 1 : ease(ctx.stepFrame, 0, 26);
  const r = rng(Math.floor(ctx.frame / 24) + 7);
  const start = ctx.step <= 1 ? r() * 20 : ctx.step === 2 ? 10 : ctx.step === 3 ? 5 + r() * 5 : r() * 20;
  const barW = ctx.width - 470;
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", gap: 20 }}>
        <svg width={barW + 60} height={160}>
          <text x={30} y={150} fill={C.muted} fontSize={22} fontFamily={FONT}>
            minutes after warm-up · drill start chosen at random
          </text>
          <rect x={30} y={70} width={barW} height={18} rx={9} fill={C.panel2} stroke={C.line} />
          {[0, 5, 10, 15, 20].map((m) => (
            <g key={m}>
              <Cone x={30 + (m / 20) * barW} y={66} s={0.8} />
              <text x={30 + (m / 20) * barW} y={124} fill={C.text} fontSize={22} textAnchor="middle" fontFamily={FONT}>
                {m}
              </text>
            </g>
          ))}
          <g transform={`translate(${30 + (start / 20) * barW}, 50)`}>
            <polygon points="-14,-26 14,-26 0,0" fill={C.yellow} />
            <text x={0} y={-34} fill={C.yellow} fontSize={22} textAnchor="middle" fontFamily={MONO}>
              {start.toFixed(1)}
            </text>
          </g>
        </svg>
        <div style={{ width: 400 }}>
          <WorkLines ctx={ctx} lines={props.work} width={400} size={26} />
        </div>
      </div>
      <CurvePlot prev={resolved[pi]} cur={resolved[ci]} t={t} width={ctx.width} height={ctx.height - 260} appear={ease(ctx.frame, 0, 30)} />
    </div>
  );
};

/* ---------------- Exponential: time until next goal ---------------- */
export const ExponentialGoal: SceneFC<{ steps: CurveStepCfg[]; titles: string[]; work?: WorkLine[] }> = ({ ctx, props }) => {
  const resolved = React.useMemo(() => resolveSteps(props.steps), [props.steps]);
  const ci = Math.min(resolved.length - 1, ctx.step);
  const pi = Math.max(0, Math.min(resolved.length - 1, ctx.step - 1));
  const t = ci === pi ? 1 : ease(ctx.stepFrame, 0, 26);
  // goal clock: waits restart each "goal"
  const r = rng(Math.floor(ctx.frame / 75) + 3);
  const wait = -Math.log(1 - r()) * 30; // mean 30 min (rate 2/hour)
  const elapsed = Math.min(wait, ((ctx.frame % 75) / 75) * 60);
  return (
    <div style={{ width: ctx.width, height: ctx.height, fontFamily: FONT }}>
      <Heading ctx={ctx} titles={props.titles} />
      <div style={{ display: "flex", gap: 30 }}>
        <svg width={ctx.width - 420} height={130}>
          <GoalTimer x={30} y={60} width={ctx.width - 500} minutes={elapsed} total={60} label="idealised match: waiting for the next goal" />
        </svg>
        <div style={{ width: 380 }}>
          <WorkLines ctx={ctx} lines={props.work} width={380} size={28} />
        </div>
      </div>
      <CurvePlot prev={resolved[pi]} cur={resolved[ci]} t={t} width={ctx.width} height={ctx.height - 220} appear={ease(ctx.frame, 0, 30)} />
    </div>
  );
};
