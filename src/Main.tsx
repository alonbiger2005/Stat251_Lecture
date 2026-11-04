import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background, Captions, FormulaPanel, Header, Progress } from "./components/Chrome";
import { ChapterCard, TitleCard } from "./components/Cards";
import { ease } from "./lib/anim";
import { SCENES } from "./scenes";
import { STORYBOARD } from "./storyboard";
import { C, FONT, L, TAGS } from "./theme";
import type { SceneCtx, Timeline, TLScene } from "./types";
import timelineJson from "./data/timeline.json";

export const timeline = timelineJson as unknown as Timeline;
const defsById = new Map(STORYBOARD.map((d) => [d.id, d]));
const sectionsById = new Map(timeline.sections.map((s) => [s.id, s]));

const SceneHost: React.FC<{ scene: TLScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const def = defsById.get(scene.id);
  const Comp = SCENES[scene.type];
  const section = sectionsById.get(scene.sectionId)!;
  if (!def || !Comp) throw new Error(`Unknown scene ${scene.id} / ${scene.type}`);
  let step = 0;
  for (let k = 0; k < scene.stepStarts.length; k++) if (frame >= scene.stepStarts[k]) step = k;
  const split = scene.math.length > 0;
  const width = split ? L.visualWSplit : L.visualWFull;
  const height = L.stageBottom - L.stageTop;
  const stepStart = (k: number) => scene.stepStarts[Math.min(k, scene.stepStarts.length - 1)] ?? 0;
  const ctx: SceneCtx = {
    frame,
    step,
    stepFrame: frame - stepStart(step),
    stepStart,
    stepDur: (scene.stepStarts[step + 1] ?? scene.end - scene.start) - stepStart(step),
    width,
    height,
    scene,
    at: (k, dur = 18, delay = 0) => ease(frame, stepStart(k) + delay, dur),
  };
  const fadeIn = ease(frame, 0, 10);
  const fadeOut = 1 - ease(frame, scene.end - scene.start - 8, 8);
  const tag = TAGS[scene.tag];
  const professor = scene.tag === "professor";
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut), fontFamily: FONT }}>
      <Header section={section} chapterTitle={section.heading} tag={scene.tag} />
      {professor && (
        <div
          style={{
            position: "absolute",
            left: L.visualX - 18,
            top: L.stageTop - 14,
            width: width + 36,
            height: height + 28,
            border: `4px solid ${C.professor}`,
            borderRadius: 22,
            background: "rgba(255,181,71,0.04)",
          }}
        >
          <div style={{ position: "absolute", right: 16, bottom: -2, transform: "translateY(50%)", background: C.bg, color: C.professor, fontSize: 18, fontWeight: 800, padding: "2px 10px", letterSpacing: 1 }}>
            ORIGINAL LECTURE NUMBERS — UNCHANGED
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: L.visualX, top: L.stageTop, width, height, overflow: "hidden" }}>
        <Comp ctx={ctx} props={def.props ?? {}} />
      </div>
      {split && <FormulaPanel math={scene.math} frame={frame} tag={scene.tag} />}
      <span style={{ display: "none" }}>{tag.label}</span>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = ["KaTeX_Main", "KaTeX_Math", "KaTeX_AMS", "KaTeX_Size1", "KaTeX_Size2", "KaTeX_Size3", "KaTeX_Size4", "Inter", "JetBrains Mono"];
    const loads = faces.flatMap((f) => [`40px ${f}`, `italic 40px ${f}`, `bold 40px ${f}`].map((spec) => document.fonts.load(spec).catch(() => [])));
    Promise.all(loads)
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
  const tl = timeline;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background />
      <Audio src={staticFile(tl.audioFile)} />
      <Sequence from={0} durationInFrames={tl.titleFrames} name="Title">
        <TitleCard tl={tl} />
      </Sequence>
      {tl.sections.map((s) => (
        <Sequence key={s.id} from={s.cardStart} durationInFrames={s.cardEnd - s.cardStart} name={`Card ${s.id}`}>
          <ChapterCard section={s} tl={tl} />
        </Sequence>
      ))}
      {tl.scenes.map((sc) => (
        <Sequence key={sc.id} from={sc.start} durationInFrames={sc.end - sc.start} name={sc.id}>
          <SceneHost scene={sc} />
        </Sequence>
      ))}
      <Captions captions={tl.captions} frame={frame} />
      <Progress tl={tl} frame={frame} />
    </AbsoluteFill>
  );
};
