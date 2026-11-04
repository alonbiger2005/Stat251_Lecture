import React from "react";
import { Composition } from "remotion";
import { Main, timeline } from "./Main";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="STAT251Exam2Soccer"
      component={Main}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
    />
  </>
);
