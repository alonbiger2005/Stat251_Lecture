import { CardsScene, CurveScene, SceneFC, StepsScene } from "./generic";
import { ContinuousStopwatch, ExponentialGoal, IntroWelcome, PopulationSample, ProbVsInference, ThreeShapes, UniformDrill } from "./early";
import { CiCoverage, CiLinesScene, CiStructure, CltSampling, GroupsScene, PairedScene, ProportionDots, SampleSizeScene, TableCompare, TTableScene, ZTableScene } from "./middle";
import { ConditionsChecklist, ConditionsDetail, CueList, ErrorMatrix, FinalTTest, FlowScene, OutroScene, ProfCats } from "./late";
import { TwoGroupBars } from "./twoGroup";

export const SCENES: Record<string, SceneFC> = {
  CardsScene,
  CurveScene: CurveScene as SceneFC,
  StepsScene,
  IntroWelcome,
  ProbVsInference,
  PopulationSample,
  ContinuousStopwatch,
  ThreeShapes,
  UniformDrill,
  ExponentialGoal,
  ZTableScene,
  TTableScene,
  TableCompare,
  CltSampling,
  CiStructure,
  ProportionDots,
  CiLinesScene,
  CiCoverage,
  GroupsScene,
  PairedScene,
  SampleSizeScene,
  TwoGroupBars,
  FlowScene,
  CueList,
  ProfCats,
  ConditionsChecklist,
  ConditionsDetail,
  ErrorMatrix,
  FinalTTest,
  OutroScene,
};
