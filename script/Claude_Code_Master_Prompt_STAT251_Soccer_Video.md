# MASTER PROMPT FOR CLAUDE CODE — STAT 251 EXAM 2 SOCCER VIDEO

You are an expert full-stack video engineer, motion designer, educator, audiovisual editor, and meticulous QA analyst. Build a finished educational explainer VIDEO, not merely a mock-up, slideshow, wireframe, scene list, or text-only storyboard.

## Inputs and non-negotiable source of truth

- **Required script**: `STAT251_Exam2_Soccer_Podcast_Script.md`, provided in the project root. Read the ENTIRE file before editing anything. It is the **locked source** for the episode, including all 20 chapter sections, the introduction/outro, professor examples, soccer examples, mathematical displays, numerical answers, and teaching order.
- The script's **prose paragraphs are narration**. The `\[ ... \]` formula blocks are **on-screen mathematical overlays**, NOT raw LaTeX to be pronounced. Spoken sentences next to equations explain each symbol naturally. Chapter headings are chapter-card cues; the introductory blockquote and final production note are production guidance, not spoken narration.
- Preserve every instructional paragraph and every example as written. Do NOT summarize, remove, reorder, paraphrase, shorten, add invented statistics, alter constants, convert sample/population meanings, or change conclusions. If you encounter a genuine mathematical or script ambiguity, flag it in `QA_REPORT.md`, make the smallest justified correction only after documenting it, and otherwise keep the supplied script.
- Keep the professor's *original* examples explicitly distinguished visually from newly created soccer analogies: professor examples cover voter proportion `p_0=0.52, n=10000, p-hat=0.514, z≈−1.20, p=0.1151`; one-mean GPA `μ_0=4.1, n=114, x-bar≈4.2317, s≈0.3664, t≈3.84`; two student-group means `4.1467 vs 4.2466, t≈−1.083, p≈0.145`; the cats preference two-proportion example `13/45 vs 16/74, lecture z≈0.878, one-sided p≈0.1894`; and Exponential(5/hour) time between 15 and 60 minutes, probability ≈0.2798. Do not substitute soccer numbers for these original professor data.
- **Exam scope**: Module 4 continuous random variables only: PDFs, CDFs, Uniform, Exponential, Normal, expected value/variance, z tables. Module 5: confidence intervals for `p`, `p1−p2`, `μ`, `μ1−μ2`, and paired differences, sample size for a proportion. Module 6: hypothesis tests, z/t table use, conditions, test statistics, p-values, tails, confidence-interval relationship, error types and power. Do not insert discrete distributions not in this requested Exam 2 scope.
- Project should remain a soccer-focused tutorial, with field diagrams, goalkeeper reaction-time scenes, drills, training-preference bar charts, goal-timing timelines, penalty arcs, players as clean stylized vector figures. No unrelated construction/engineering-themed supplementary example.

## Definition of done

Create a finished `STAT251_Exam2_Soccer_Explainer.mp4`, approximately **45–50 minutes**, **1920 × 1080**, **30 fps**, H.264 video and AAC audio, with synchronized articulate narration, meaningfully animated explanatory visuals, accurate formulas/typesetting, legible captions, a chapter menu/timestamps, and no missing content. The runtime should derive from the ACTUAL audio and teaching pauses; if clear narration runs slightly outside 45–50 minutes, prioritize intelligibility and report the measured duration instead of artificially changing speed. Also render a lower-bitrate `STAT251_Exam2_Soccer_Explainer_Mobile.mp4` and export `captions.srt`.

This is NOT a generic highlight reel and NOT a screen recording of scrolling text. Each scene must visually teach an idea.

## Technology and architecture

- Default to **Remotion with React and TypeScript** for fully programmatic, deterministic scenes, audio sync, mathematics, and MP4 rendering. Use a compatible current version and the official Remotion documentation before selecting CLI flags. Consult https://www.remotion.dev/docs/render, https://www.remotion.dev/docs/videos, and https://www.remotion.dev/docs/captions/.
- Use **KaTeX** (or MathJax when more reliable) for true mathematical typesetting of `\frac`, `\sqrt`, `\int`, `\mu`, `\sigma`, `\hat p`, `\bar x`, subscripts, and all mathematical operators. Never display raw LaTeX tokens to viewers. Verify readable font sizing and that long equations fit.
- Use SVG/React for graphs: Normal curves with accurate shaded tails; Uniform rectangular density; Exponential decay and cumulative curve; correct probability-area overlays; CI intervals around estimates; one/two-sample group comparisons; t-vs-z tails; court/pitch overlays. Animate values changing without making underlying numbers incorrect.
- Source no copyrighted soccer footage, logos, broadcast clips, game screenshots, real player likenesses, or trademarked branding without explicit authorized assets. Draw original pitch diagrams and stylized player figures. License and credit any third-party imagery/fonts.
- Keep scenes, math, narration, transcript, subtitles and metadata in separate modules so the project can be revised easily. Favor reusable typed components `FormulaReveal`, `NormalCurve`, `ZTableLookup`, `TTableLookup`, `GoalTimer`, `SoccerField`, `ConfidenceIntervalLine`, `HypothesisTail`, `PairedDifference`, `ChapterCard`, `SpeakerCaption`.

## Audio: use an intelligible voice, not robotic system TTS

- **Do not use `pyttsx3`, Windows SAPI, `espeak`, or other low-quality operating-system TTS**. The previous version was unintelligible. Use an appropriate high-quality licensed narration service only if credentials are provided, OR import a supplied human narration track. Do NOT claim to reproduce the proprietary voice of ChatGPT's Read Aloud/Voice; its voice cannot be assumed to be programmatically exportable. Ask only for a missing API credential or voice selection if required to proceed; otherwise build all the project and a locally playable preview using a clean temporary narration source if available.
- If using an external speech API, inspect its **current** documentation for supported models, deprecations, length limits, and rights. Use environment variables such as `NARRATION_PROVIDER` and a provider-specific secret; never hardcode or commit secrets. Since services can change, do not rely on deprecated model IDs from old examples.
- Create a **20–40 second voice sample** before synthesizing the whole episode for approval if the provider allows a choice; ideal English voice: natural U.S. accent, calm tutor, moderate energy, precise technical terms, 140–155 WPM average, short pauses after each major formula and each numeric answer. Correct pronunciation: “p-hat,” “x-bar,” “mu,” “sigma,” “lambda,” “alpha,” “beta,” “degrees of freedom,” “Student's t,” “zero point five one four.”
- Generate narration in manageable per-chapter or per-paragraph segments, then combine losslessly or with sample-accurate processing and normalize final audio. Each segment needs exact timing metadata. Avoid sentence cutoff, abrupt joins, missing audio, double playback, or mismatched captions. Mix background music ONLY if it doesn't reduce clarity; default is none.
- Formula lines are overlays and must NOT be fed as raw `\frac` / LaTeX to TTS. The corresponding adjacent narration explains the equation. If an on-screen equation has no adequate spoken definition, display it long enough for viewers to read while narration explains components.

## Scene plan, visual pedagogy and timing

First parse `STAT251_Exam2_Soccer_Podcast_Script.md` into a stable `manifest.json` with records like:

```
{
  "id": "chapter-10-p-value-03",
  "chapterTitle": "...",
  "narration": "exact locked prose string",
  "mathOverlays": ["exact source LaTeX string"],
  "visualType": "normal-curve-right-tail",
  "visualDescription": "...",
  "audioFile": "...",
  "audioStartSeconds": 0,
  "audioDurationSeconds": 12.4,
  "captions": []
}
```

Do not infer chapter durations from word-count alone after audio exists: derive scene timing from the ACTUAL audio and alignments. Narration must not outrun the math animation. Use successive overlays and highlights to show numerator first, denominator next, substitution, arithmetic and conclusion.

Create a rich storyboard for every chapter before rendering; aim for frequent meaningful scene changes (about every 8–25 seconds when appropriate) and natural chapter transitions. The concepts, not arbitrary transitions, should drive animation. Include specific visual types:

1. **Population vs sample**: a full soccer roster, then randomly spotlight sampled players; labels `p` vs `p-hat`, `μ` vs `x-bar`.
2. **Continuous variable**: zoom a goalkeeper stop-watch measurement through decimals; show `P(X=x)=0` and probability as interval area.
3. **PDF and CDF**: density curve, shaded area from a to b, accumulating fill from left to x, formula reveals.
4. **Uniform**: randomized goalkeeping drill start between 0–20 min; flat rectangle; shaded 5–10 min interval = 25%.
5. **Exponential**: countdown to next goal under idealized constant rate; curve `λe^{−λx}`; keep professor customer waiting-time calculation `e^{−1.25}−e^{−5}≈0.2798` visibly intact.
6. **Normal**: goalkeeper reaction time bell, show 68–95–99.7 bands; differentiate mean and standard deviation.
7. **Z-score and z-table**: point moving on bell curve, z=(x−μ)/σ; magnified table row 1.2/col .00 -> 0.8849, complementary right area -> 0.1151. Show the same left-area semantics as the student's provided table.
8. **CLT/SE**: repeated 50-player samples; each contributes one sample mean; tighter sampling distribution as n grows, with correct `σ/√n`.
9. **Confidence intervals**: center line = point estimate; expanding/contracting margin of error; strong repetition of `estimate ± critical × SE`.
10. **Table difference**: z-table gives *left cumulative area*; t-table gives *upper-tail critical value* selected by df and alpha. Show 95% two-sided -> right tail .025, row df=n−1. No fake table values.
11. **Every CI formula**: one proportion (grass preference), two independent proportions (goalkeepers vs outfielders), one mean (goalkeeper reaction time), two independent means (training groups), paired before-after goalkeeper reflexes. Show exactly what each numerator, n, and s means.
12. **Sample size**: visually change margin of error E, show n scaling like 1/E², worked 95% E=.01 -> n=9604.
13. **Hypothesis testing**: baseline H0 vs alternative Ha; left, right, two-tailed shaded Normal distributions; p-value is NOT probability H0 is true.
14. **Professor examples**: separate labeled cards for voter `z≈−1.2`, cats two proportions, GPA one-mean `t≈3.84`, first-generation comparison `t≈−1.083` and their decisions.
15. **Conditions**: randomized sampling, 10% sampling fraction, success-failure checks using p-hat for CI and p0 for test, shape/skew and independent groups.
16. **Type I, Type II, power**: storyboard uses a goalkeeper training program with H0 no real improvement; animate false alarm vs missed real gain.
17. **Final worked soccer t-test**: reaction-time `n=36`, mean .424 s, null .400 s, s=.060 s, t=2.4, df=35; mark right-tail p between .01 and .025.
18. **Final worked soccer proportion CI**: morning training p-hat=.62, n=100, 95% CI ≈(.5249,.7151).
19. **Exam decision tree**: clear full-screen flow: continuous probability vs estimation vs test -> proportion vs mean -> one/two/paired -> z or t -> correct tail -> conditions -> conclusion.
20. **Rapid recap**: replay all recognition cues, showing equations in split-screen, concise labels, soccer visuals.

## Mathematical accuracy: critical requirements

- Preserve formulas from script and ensure they are mathematically accurate. Validate with independently computed values, not only screenshot appearance.
- Exponential lecture value: `e^(-5×0.25) - e^(-5×1) ≈ 0.27976685`.
- Uniform drill: `P(5<X<10)=5/20=0.25`.
- z-table: `Φ(1.20)=0.8849`, `P(Z>1.20)=0.1151`; two tails beyond ±2 approximately 0.0456.
- Proportion sample size: `ceil(1.96²×0.5×0.5/0.01²)=9604`.
- Professor two-proportion cats example: 13/45 and 16/74 gives **the unpooled class-example z approximately 0.878** and one-sided p≈0.1894; retain the class-example convention and do not silently switch to a pooled-nulling variant.
- Soccer mean test: `(0.424−0.400)/(0.060/√36)=2.4`, `df=35`, right-tail p between .01 and .025.
- Soccer proportion CI: `.62 ± 1.96√(.62×.38/100) ≈ (.5249, .7151)`.
- Significance: `p <= α` reject; `p > α` fail to reject. Never portray fail-to-reject as proving the null.
- A 95% confidence interval does not mean the fixed population parameter has a 95% probability of being inside the already-computed interval.
- Include the actual supplied `z-table.pdf` and `t-table.pdf` as optional references if present; do not draw incorrect table scales. Use table examples from professor-supplied layout.

## Deliverables in repository

1. `src/` full type-safe Remotion source, reusable components, and styles.
2. `public/audio/` narration audio tracks (where licensed and generated); `public/assets/` original visuals.
3. `script/STAT251_Exam2_Soccer_Podcast_Script.md` a verbatim copy of the provided input, with checksum recorded.
4. `manifest.json` and a machine-readable `storyboard.json` with chapter/scene/audio/math timestamps.
5. `out/STAT251_Exam2_Soccer_Explainer.mp4` and mobile MP4.
6. `out/captions.srt` and `out/captions.vtt`.
7. `README.md`: setup, .env variables, preview, generation, rendering, captions and troubleshooting.
8. `QA_REPORT.md`: source-script preservation audit, equation checks, scene-by-scene source mapping, actual duration, caption alignment, truncated-text scan, missing-media checks, video specs, error report.
9. A `render:preview` script for a short test export (at least one formula scene and one professor example), plus `render:full` for full MP4.

## Validation and acceptance checks

- Run installation, typechecking, and basic tests.
- Use a script-coverage assertion: every nonproduction prose paragraph in the source must map to exactly one narrated segment. Every `\[...\]` formula must map to at least one valid on-screen math overlay. No extra invented narration.
- Check all formulas parse and visibly render; no broken `\frac`, squished captions, clipped superscripts, offscreen numbers, or wrong Greek glyphs.
- Render several still previews from chapters 2, 4, 7, 10, 14, 18 and 19 and inspect them. Render and watch a representative 60-second clip before undertaking the full 45–50 minute render.
- Check caption timestamps vs narration, all audio segments nonempty, no silent gaps over 2 seconds unless intentional, no unintended duplicates, no scene ending before the sentence ends.
- Read and obey current Remotion licensing terms for the intended use; flag any license restrictions rather than silently ignore them.
- If audio credentials are absent, do not fake success or claim the MP4 has full narration. Build the entire video pipeline, captions and assets, provide a playable visual-only preview, and clearly explain the one remaining credential/audio step; do not fabricate a completed movie.
- After completing the build, report the EXACT local output paths that actually exist. Do not claim completed rendering without checking the files on disk.

## Execution

Proceed to implement. Read the script, make a concise internal project plan, then create the code, assets, scenes, timing pipeline, tests, previews, and final renders available in the current environment. Choose useful defaults autonomously. Preserve the supplied script exactly, keep equations mathematically typeset, and prioritize a clear educational result over flashy decoration.
