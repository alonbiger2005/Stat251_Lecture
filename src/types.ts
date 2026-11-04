import type { Tag } from "./theme";

export interface TLCaption {
  text: string;
  start: number; // frame
  end: number; // frame
  segmentId: string;
}

export interface TLSegment {
  id: string;
  sectionId: string;
  sourceLine: number;
  narration: string;
  start: number; // frame: segment window start (incl. lead-in)
  end: number; // frame: segment window end (incl. tail pause)
  audioStart: number; // frame where narration audio starts
  audioEnd: number; // frame where narration audio ends
  math: string[];
  mathSourceLines: number[];
  scene: string;
  step: number;
}

export interface TLMath {
  tex: string;
  sourceLine: number;
  appear: number; // frame relative to scene start
  segmentId: string;
}

export interface TLScene {
  id: string;
  type: string;
  tag: Tag;
  start: number;
  end: number;
  sectionId: string;
  chapterNumber: number;
  segmentIds: string[];
  stepStarts: number[]; // frames relative to scene start
  stepAudioEnds: number[]; // frames relative to scene start
  math: TLMath[];
  firstLine: number;
  lastLine: number;
}

export interface TLSection {
  id: string;
  heading: string;
  kind: "intro" | "chapter" | "subsection" | "outro";
  chapterNumber: number | null;
  parentChapter: number;
  cardStart: number;
  cardEnd: number;
  end: number;
}

export interface Timeline {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  titleFrames: number;
  sections: TLSection[];
  scenes: TLScene[];
  segments: TLSegment[];
  captions: TLCaption[];
  audioFile: string;
  audioDurationSeconds: number;
  generatedAt: string;
  narration: { provider: string; voice: string; speed: number };
}

export interface SceneCtx {
  frame: number; // relative to scene start
  step: number;
  stepFrame: number; // frames since current step start
  stepStart: (k: number) => number;
  stepDur: number;
  width: number;
  height: number;
  scene: TLScene;
  /** progress 0..1 of an animation that begins at the start of step k (+delay) */
  at: (k: number, dur?: number, delay?: number) => number;
}
