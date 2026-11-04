# QA REPORT: STAT 251 Exam 2 Soccer Explainer

Generated 2026-11-04T06:33:34.651Z by `npm run qa` (tools/qa.ts). Every number below is measured from the files on disk.

## 1. Deliverables and video specs

| Item | Path | Status | Duration | Video | Audio | Extras |
|---|---|---|---|---|---|---|
| Full episode | `out/STAT251_Exam2_Soccer_Explainer.mp4` | ✅ exists, 151.8 MB | 49:48 (2988.17 s) | h264 High 1920×1080 @ 30/1 fps, yuvj420p | aac 48000 Hz, 1 ch, 148 kb/s | 23 chapters, subs: none |
| Mobile | `out/STAT251_Exam2_Soccer_Explainer_Mobile.mp4` | ✅ exists, 55.2 MB | 49:48 (2988.18 s) | h264 High 1280×720 @ 30/1 fps, yuv420p | aac 44100 Hz, 1 ch, 60 kb/s | 23 chapters, subs: mov_text |
| Preview (formula scene + professor example) | `out/STAT251_Exam2_Soccer_Explainer_PREVIEW.mp4` | ✅ exists, 3.6 MB | 1:10 (70.00 s) | h264 High 1920×1080 @ 30/1 fps, yuvj420p | aac 48000 Hz, 1 ch, 154 kb/s | 0 chapters, subs: none |

* Timeline length (from the actual narration audio + teaching pauses): **49:48** (89645 frames at 30 fps = 2988.17 s).
  Target was ~45–50 min. Narration speed was **not** adjusted to hit the target.
* Final mix loudness (EBU R128): integrated **-16.1 LUFS**, true peak -1.1 dBFS (target −16 LUFS, −1.5 dBTP; linear two-pass normalisation, no compression).
* Captions: `out/captions.srt`, `out/captions.vtt` (755 cues). Chapters: `out/chapters.txt` + embedded MP4 chapter markers.
* Other files: `manifest.json`, `storyboard.json`, `public/audio/narration.flac` (lossless), `public/audio/voice_sample.wav`.

## 2. Source-script preservation audit

* Locked source: `script/STAT251_Exam2_Soccer_Podcast_Script.md`, SHA-256 `75f273b53dfbd62c1c898daf45d2ed903262048828fd5f41406b291749b3c22b` (identical to the uploaded file and to the root copy; checked by tests).
* Parsed: **32 sections** (20 chapters + intro + outro + 10 sub-sections), **319 prose paragraphs → 319 narrated segments** (exactly one each), **59 display-math blocks → on-screen overlays** (none spoken).
* Not narrated (production guidance, as instructed): line 1, line 3, line 857, line 859 (title, blockquote, `---`, production note). Headings become silent chapter cards.
* Narration text = captions = exact script text (verified: sentences and caption chunks re-join to the verbatim paragraph). The speech engine receives a
  pronunciation-normalised copy (`tools/spoken.ts`: e.g. "p-hat" → "p hat", "0.514" → "zero point five one four", "mu" → "mew", emphasis CAPITALS → normal words,
  the variable *a* → phoneme /eɪ/). The normalisation only changes how words are pronounced. It never adds, removes or reorders words. No LaTeX is ever sent to the speech engine (test).
* Professor examples (voter, GPA, first-generation, cats, customer arrivals) are drawn in **amber** with an "ORIGINAL LECTURE NUMBERS — UNCHANGED" frame and a
  "PROFESSOR'S LECTURE EXAMPLE · ORIGINAL DATA" header tag. Soccer analogies are green. No soccer numbers were substituted into professor examples.

### Automated tests (28 passed, 0 failed)
- ✅ all 59 script formulas typeset
- ✅ all storyboard inline math typesets
- ✅ Exponential lecture example ≈ 0.2798
- ✅ Uniform drill P(5<X<10) = 0.25, mean 10
- ✅ z-table values
- ✅ 68–95–99.7 reaction-time bands
- ✅ Proportion sample size 9604
- ✅ Voter test z ≈ −1.20, p = 0.1151; voter CI ≈ (50.42%, 52.38%)
- ✅ Cats lecture example: unpooled z ≈ 0.878, one-sided p ≈ 0.1894 (table at z = 0.88)
- ✅ GPA lecture example t ≈ 3.84, two-sided p < .001
- ✅ First-generation lecture example: t = −1.083, df ≈ 22.38 → one-sided p ≈ 0.145
- ✅ Soccer t-test: t = 2.40, df = 35, .01 < p < .025
- ✅ Soccer proportion CI: .62 ± 1.96·SE ≈ (.5249, .7151)
- ✅ t-table entries used on screen match standard printed tables
- ✅ locked script checksum unchanged and root copy identical
- ✅ manifest is a fresh parse of the locked script
- ✅ every non-production prose paragraph maps to exactly one narrated segment (verbatim)
- ✅ sentences and caption chunks reassemble the exact paragraph text
- ✅ captions in the timeline reproduce every paragraph exactly once, in order
- ✅ every display-math block maps to an on-screen overlay in the timeline
- ✅ TTS input never contains LaTeX and keeps every content word in order
- ✅ runtime derives from audio and lands near 45–50 minutes
- ✅ every sentence has non-empty audio
- ✅ no scene/segment ends before its narration ends
- ✅ captions are ordered, non-overlapping, and inside the narration windows
- ✅ silent gaps longer than 2 s occur only at intentional chapter cards
- ✅ narration track exists with exactly the composition length
- ✅ no duplicated narration segment

### Ambiguities in the script (flagged; narration left exactly as written)
1. **Chapter 15 step numbering skips "Step 4".** The script goes Step 1, 2, 3, then the CI-formula gallery, then Step 5. The visuals keep the script's numbering and do not invent a Step 4. (The gallery effectively plays the role of "choose the formula".)
2. **Line 261:** "If the interval contains zero, no population difference is plausible." This is meant as *"no difference" is a plausible value*. The on-screen label says “contains 0 → “no difference” is plausible” so it cannot be misread as "a difference is implausible".
3. **Decision-rule wording:** Ch. 9 (line 395) and its formula use *p ≤ α → reject*. Ch. 15 (line 692) and Ch. 20 say *p < α → reject*. Both are kept as narrated. The difference only matters at exact equality, which the script itself notes is unlikely.
4. **Cats example:** the unpooled lecture statistic is z = 0.8777 ≈ 0.878. The lecture's p ≈ 0.1894 is the z-table value at z = 0.88 (the exact tail at 0.8777 is 0.1900). Kept exactly as the lecture reported. No pooled-test substitution.
5. **Line 230:** the narration mentions q-hat, while the boxed formula writes (1 − p̂). The next paragraph defines q̂ = 1 − p̂, and the visual shows that identity.
6. **Student tables not supplied:** `z-table.pdf` and `t-table.pdf` were not in the upload. On-screen tables are computed from the exact Normal and t distributions and rounded like standard printed tables (z: left area, 4 d.p.; t: upper-tail critical values, 3 d.p.). They are **not** facsimiles of the professor's layout. If the student's t-table has no df = 35 row, the conservative df = 30 row gives 2.042 < 2.40 < 2.457, the same conclusion (.01 < p < .025).
7. **Ch. 7 t-table illustration** uses "e.g. n = 36 → df = 35" (shown as an example and consistent with Ch. 18). The script says only "df equals n minus 1".

No mathematical errors requiring correction were found in the script, so no corrections were made.

## 3. Equation and number checks (independently recomputed)

| Check | Expected (script) | Computed | OK |
|---|---|---|---|
| Exponential lecture: e^(−5·0.25) − e^(−5·1) | ≈ 0.27976685 (→ 0.2798) | 0.27976685 | ✅ |
| Uniform drill P(5<X<10) = 5/20 | 0.25 | 0.25 | ✅ |
| Φ(1.20) from z-table | 0.8849 | 0.8849 | ✅ |
| P(Z>1.20) = 1 − 0.8849 | 0.1151 | 0.1151 | ✅ |
| P(Z<−1.20) | 0.1151 | 0.1151 | ✅ |
| P(|Z|>2) = 2(1 − 0.9772) | 0.0456 | 0.0456 | ✅ |
| z* for 95%: left area .9750 | 1.96 | Φ(1.96) = .9750 | ✅ |
| 68–95–99.7 (exact Normal) | .6827 / .9545 / .9973 | 0.6827 / 0.9545 / 0.9973 | ✅ |
| Sample size ⌈1.96²·0.25/0.01²⌉ | 9604 | 9604 | ✅ |
| Voter test z = (0.514−0.52)/√(0.52·0.48/10000) | ≈ −1.20, p = 0.1151 | -1.20096115 | ✅ |
| Voter 95% CI | ≈ (50.42%, 52.38%) | (50.42%, 52.38%) | ✅ |
| Cats (unpooled, lecture convention) z | ≈ 0.878 | 0.87772711 | ✅ |
| Cats one-sided p via z-table at z = 0.88 | ≈ 0.1894 | 0.1894 | ✅ |
| GPA t = (4.2317−4.1)/(0.3664/√114) | ≈ 3.84; two-sided p < .001 | 3.8378; p = 2.05e-4 | ✅ |
| First-gen one-sided p, t = −1.083, df = 22.38 | ≈ 0.145 | 0.14516962 | ✅ |
| Soccer t = (0.424−0.400)/(0.060/√36) | 2.40, df 35 | 2.4 | ✅ |
| t-table df 35: t.025, t.01 | 2.030, 2.438 | 2.030, 2.438 | ✅ |
| Soccer right-tail p (exact) | between .01 and .025 | 0.01092493 | ✅ |
| …same bracket if a table only has df 30 (2.042, 2.457) | 2.042 < 2.4 < 2.457 | 2.042 < 2.4 < 2.457 | ✅ |
| Morning-training SE, E | ≈ 0.04854, ≈ 0.0951 | 0.04854, 0.0951 | ✅ |
| Morning-training 95% CI | (0.5249, 0.7151) | (0.5249, 0.7151) | ✅ |
| t-table 95% / 90% two-sided at df 35 (Ch. 7 illustration) | 2.030 / 1.690 | 2.030 / 1.690 | ✅ |

All 59 display formulas and every inline `$…$` label in the storyboard are parsed by KaTeX with `throwOnError` (test). Formula boxes use a
measured fit-to-width scaler that re-measures after the KaTeX fonts load, so no equation is clipped. Stills were inspected for chapters 2, 3, 4, 5, 6, 7, 10, 11, 13, 14, 15, 18, 19 and 20.

## 4. Narration and intelligibility

* Engine: **kokoro-82m (local neural TTS, Apache-2.0)**, voice `af_heart` (US English), speed 0.92. No OS TTS (pyttsx3 / SAPI / espeak voice) was used.
  This is a temporary narration source (no cloud TTS credentials or human recording were supplied). The pipeline accepts replacement per-sentence WAVs.
* 576 sentence clips, all non-empty (missing: 0). Total speech 43:08; **149.7 words per minute** (target 140–155).
* Pauses: 0.25 s between sentences, 0.45 s after each paragraph, +0.8 s after a paragraph that carries a formula, 2.5 s chapter cards (2.0 s for sub-sections), 6 s title.
* Assembly is sample-accurate (24 kHz PCM placed at exact sample offsets, frame-aligned paragraph starts) and is muxed **once** over the whole concatenated video,
  so there are no per-chunk audio seams, cut-offs or double playback.
* **Speech-recognition check** (faster-whisper `small.en`, every 6th sentence, 96 sentences / 1228 words): **WER 2.61%**. The remaining "errors" are mostly notation spelling (e.g. heard "H0" for "H-zero", "0.62" for ".62"). Worst cases are in `out/asr_check.json`.

## 5. Timing, captions and silence

* Every scene ends after its narration (test). Formulas appear 0.2 s after their paragraph starts and stay on screen for the rest of the scene (newest highlighted, up to three visible).
* Captions: 755 cues, 0 overlaps, length 4–96 characters (0 cues over 100 characters), duration 0.70–9.93 s.
  Cue boundaries inside a sentence come from the TTS word timestamps. Each cue is held through short pauses but never overlaps the next one.
* Silences ≥ 2 s in the narration track (silencedetect −45 dB): 32. Unexplained: **0**.
  * 0:00–0:08 (8.70 s): title card + chapter menu (intentional)
  * 2:04–2:08 (3.16 s): chapter card “CHAPTER 1 — POPULATION, SAMPLE, PARAMETER, STATISTIC” (intentional)
  * 3:50–3:54 (3.20 s): chapter card “CHAPTER 2 — CONTINUOUS RANDOM VARIABLES: WHAT ARE YOU LOOKING AT?” (intentional)
  * 7:16–7:19 (3.18 s): chapter card “CHAPTER 3 — UNIFORM, EXPONENTIAL, AND NORMAL” (intentional)
  * 11:41–11:44 (3.19 s): chapter card “CHAPTER 4 — Z-SCORES AND THE Z-TABLE” (intentional)
  * 13:58–14:02 (3.21 s): chapter card “CHAPTER 5 — THE CENTRAL LIMIT THEOREM AND STANDARD ERROR” (intentional)
  * 15:18–15:21 (3.20 s): chapter card “CHAPTER 6 — CONFIDENCE INTERVALS: WHAT ARE THEY ACTUALLY DOING?” (intentional)
  * 17:05–17:08 (2.68 s): chapter card “ONE PROPORTION CONFIDENCE INTERVAL” (intentional)
  * 18:56–18:59 (2.69 s): chapter card “TWO PROPORTIONS CONFIDENCE INTERVAL” (intentional)
  * 19:48–19:51 (2.69 s): chapter card “ONE MEAN CONFIDENCE INTERVAL” (intentional)
  * 20:29–20:33 (3.18 s): chapter card “CHAPTER 7 — WHAT IS THE T-DISTRIBUTION AND HOW DO I USE THE T-TABLE?” (intentional)
  * 22:31–22:33 (2.68 s): chapter card “TWO INDEPENDENT MEANS CONFIDENCE INTERVAL” (intentional)
  * 23:26–23:29 (2.68 s): chapter card “PAIRED DIFFERENCE CONFIDENCE INTERVAL” (intentional)
  * 24:19–24:22 (3.17 s): chapter card “CHAPTER 8 — CONFIDENCE INTERVAL SAMPLE SIZE FOR A PROPORTION” (intentional)
  * 25:40–25:44 (3.99 s): chapter card “CHAPTER 9 — HYPOTHESIS TESTING: THE BIG IDEA” (intentional)
  * 27:33–27:37 (3.96 s): chapter card “CHAPTER 10 — TAILS: HOW H-A TELLS YOU THE P-VALUE AREA” (intentional)
  * 29:40–29:44 (3.98 s): chapter card “CHAPTER 11 — WHICH HYPOTHESIS TEST FORMULA DO I USE?” (intentional)
  * 29:46–29:49 (2.68 s): chapter card “ONE PROPORTION TEST” (intentional)
  * 30:03–30:05 (2.69 s): chapter card “TWO PROPORTIONS TEST” (intentional)
  * 31:20–31:22 (2.68 s): chapter card “ONE MEAN TEST” (intentional)
  * 32:31–32:34 (2.66 s): chapter card “TWO INDEPENDENT MEANS TEST” (intentional)
  * 33:33–33:36 (3.47 s): chapter card “PAIRED MEAN TEST” (intentional)
  * 34:07–34:10 (3.18 s): chapter card “CHAPTER 12 — CONDITIONS: WHEN ARE THE FORMULAS LEGAL?” (intentional)
  * 35:44–35:47 (3.20 s): chapter card “CHAPTER 13 — TYPE I ERROR, TYPE II ERROR, ALPHA, BETA, AND POWER” (intentional)
  * 36:49–36:52 (3.17 s): chapter card “CHAPTER 14 — CONFIDENCE INTERVALS AND HYPOTHESIS TESTS ARE TWO VIEWS OF THE SAME IDEA” (intentional)
  * 37:37–37:40 (3.16 s): chapter card “CHAPTER 15 — YOUR EXAM-DAY DECISION TREE” (intentional)
  * 39:58–40:02 (3.18 s): chapter card “CHAPTER 16 — WORDING CUES THAT SHOULD TRIGGER A METHOD” (intentional)
  * 41:23–41:27 (3.99 s): chapter card “CHAPTER 17 — COMMON TRAPS” (intentional)
  * 42:56–42:59 (3.14 s): chapter card “CHAPTER 18 — FINAL WALK-THROUGH: ONE COMPLETE EXAM-STYLE SCENARIO” (intentional)
  * 45:44–45:48 (3.19 s): chapter card “CHAPTER 19 — FINAL WALK-THROUGH: CONFIDENCE INTERVAL SCENARIO” (intentional)
  * 47:44–47:47 (3.20 s): chapter card “CHAPTER 20 — LAST FIVE MINUTES: WHAT TO REMEMBER IF EVERYTHING ELSE DISAPPEARS” (intentional)
  * 49:04–49:07 (3.17 s): chapter card “OUTRO — HOW TO REPLAY THIS EPISODE” (intentional)

## 6. Truncation / layout scan

* Header chapter titles and the title-card chapter menu wrap onto two lines instead of using an ellipsis (an earlier draft truncated long titles; this was fixed before the final render).
* No caption is longer than ~2 lines at 40 px (max 96 characters on a 1640 px box).
* Formula panel: at most 3 formulas visible, each scaled to fit 700 × ≤260 px.
* Pixel format: the full and preview renders are tagged `yuvj420p` (full-range 4:2:0 from Remotion's JPEG frames). It plays correctly in browsers, VLC, QuickTime and YouTube. The mobile file is standard limited-range `yuv420p`.
* After AAC encoding the true peak measures about −1.1 dBFS (the PCM narration was normalised to −1.5 dBTP). There is no clipping.
* Known cosmetic limitations: a few curve labels touch the curve line in dense steps (e.g. CDF step 2, power curves). All remain legible.

## 7. Missing-media checks

* Sentence audio clips: 576/576 present.
* Fonts are bundled locally (Inter, JetBrains Mono via @fontsource; KaTeX fonts). No network fonts or images at render time.
* No third-party imagery, footage, logos or likenesses. All soccer art is original SVG (`src/components/soccer.tsx`).

## 8. Licensing

* Remotion: free license applies to individuals / ≤3-employee companies / non-profits. A student's educational video qualifies. **Flag:** organisational commercial use needs a Remotion company license.
* Kokoro-82M weights + voice: Apache-2.0. KaTeX: MIT (fonts OFL). Inter, JetBrains Mono: SIL OFL 1.1.

## 9. Scene-by-scene source mapping

| Time | Scene | Script lines | Steps (paragraphs) | Formula lines shown | Visual type | Tag | What it shows |
|---|---|---|---|---|---|---|---|
| 0:08–0:37 | `intro-welcome` | 8–8 | 1 | — | IntroWelcome | soccer | Goalkeeper session on an original pitch; legend separating professor examples (amber) from soccer analogies (green). |
| 0:37–1:09 | `intro-scope` | 10–10 | 1 | — | CardsScene | exam | Exam 2 scope cards: Modules 4/5/6 and the provided z- and t-tables. |
| 1:09–2:05 | `intro-big-picture` | 12–16 | 3 | — | ProbVsInference | concept | Split screen: probability (known save rate) vs inference (sample of games → unknown save rate); CI estimates, test challenges. |
| 2:07–3:16 | `ch01-roster` | 21–31 | 6 | — | PopulationSample | concept | Full roster of stylised players = population; random spotlight = sample; μ, p vs x̄, p̂, s labels. |
| 3:16–3:51 | `ch01-notation` | 33–37 | 3 | — | CardsScene | exam | Wording → symbol cards: p̂ vs p, x̄ vs μ. |
| 3:53–4:36 | `ch02-continuous` | 42–46 | 3 | — | ContinuousStopwatch | soccer | Goalkeeper stopwatch zooms through decimals 0.4 → 0.42017; number line zoom shows infinitely many values. |
| 4:36–5:38 | `ch02-pdf` | 48–56 | 5 | 58 | CurveScene | concept | Density curve; probability as shaded area; P(X=x)=0 sliver; total area 1; area from a to b. |
| 5:38–6:28 | `ch02-cdf` | 60–68 | 3 | 62, 68 | CurveScene | concept | CDF accumulates area from the left (yellow curve); goal-timing F(20); shortcuts 1−F(x) and F(b)−F(a). |
| 6:28–7:17 | `ch02-meanvar` | 70–77 | 3 | 72, 73 | CurveScene | soccer | Mean as center, SD as spread; two reaction-time curves with the same mean 0.40 s and SD 0.02 vs 0.10. |
| 7:19–7:28 | `ch03-shapes` | 82–82 | 1 | — | ThreeShapes | concept | Uniform, Exponential and Normal side by side. |
| 7:28–8:26 | `ch03-uniform` | 84–98 | 5 | 88, 92, 96 | UniformDrill | soccer | Randomised drill start between 0 and 20 minutes; flat density; mean 10; shaded 5–10 = 25%. |
| 8:26–9:44 | `ch03-exponential` | 100–112 | 5 | 106, 110 | ExponentialGoal | soccer | Countdown to the next goal under an idealised constant rate; decaying curve λe^{−λx}; mean 1/λ = 30 minutes. |
| 9:44–10:12 | `ch03-prof-exponential` | 114–114 | 1 | 116 | CurveScene | professor | Professor's customer-arrival example kept intact: λ=5/hour, P(0.25<X<1)=e^{−1.25}−e^{−5}≈0.2798. |
| 10:12–10:55 | `ch03-normal` | 118–126 | 4 | 124 | CurveScene | concept | Bell curve with mean and SD; N(μ,σ²) uses variance; CLT motivation. |
| 10:55–11:41 | `ch03-empirical` | 128–130 | 2 | — | CurveScene | soccer | Goalkeeper reaction times N(0.40, 0.04²): 68–95–99.7 bands. |
| 11:44–12:13 | `ch04-zscore` | 135–141 | 3 | 139 | CurveScene | concept | Point moving on the reaction-time bell; z = (x−μ)/σ; z=+2 and z=−1.3 markers. |
| 12:13–13:07 | `ch04-ztable` | 143–157 | 5 | 149, 153, 157 | ZTableScene | concept | Magnified z-table: row 1.2 / column .00 → 0.8849 (left area); complement 0.1151; negative half gives 0.1151 for z=−1.20. |
| 13:07–13:59 | `ch04-between` | 159–167 | 4 | 165 | CurveScene | concept | Area between two z-scores; two-sided outside area = 2 × one tail; worked P(|Z|>2)=0.0456. |
| 14:01–15:18 | `ch05-clt` | 172–186 | 7 | 178 | CltSampling | soccer | Repeated random samples of 50 goalkeepers; each contributes one x̄; sampling distribution tightens with n (σ/√n). |
| 15:21–15:52 | `ch06-structure` | 191–201 | 4 | 195, 199 | CiStructure | concept | Center = point estimate; expanding margin of error; ME = critical × SE. |
| 15:52–16:12 | `ch06-three-questions` | 203–211 | 5 | — | CardsScene | exam | Three questions for every CI problem. |
| 16:12–17:05 | `ch06-parameters` | 213–223 | 6 | — | CardsScene | soccer | Five targets with soccer contexts: p (grass preference), p1−p2 (keepers vs outfielders), μ (reaction time), μ1−μ2 (training groups), paired. |
| 17:07–17:37 | `ch06-oneprop` | 228–234 | 3 | 232 | ProportionDots | soccer | Grid of sampled players coloured by grass preference; anatomy of p̂ ± z*√(p̂(1−p̂)/n). |
| 17:37–18:13 | `ch06-zstar` | 236–238 | 2 | — | ZTableScene | concept | z* for 95%: middle 95%, 2.5% per tail, look up left area .9750 → 1.96. |
| 18:13–18:35 | `ch06-voter-ci` | 240–240 | 1 | — | CiLinesScene | professor | Professor's voter CI: p̂≈.514, 95% CI ≈ 50.42% to 52.38%. |
| 18:35–18:56 | `ch06-coverage` | 242–242 | 1 | — | CiCoverage | concept | Simulated repeated samples: about 95% of intervals capture the fixed true parameter; false interpretation crossed out. |
| 18:58–19:49 | `ch06-twoprop` | 247–261 | 6 | 253, 259 | TwoGroupBars | soccer | Goalkeepers vs outfield players preferring grass: difference of p̂'s, separate n's, SE; CIs vs zero. |
| 19:51–20:30 | `ch06-onemean` | 266–276 | 5 | 270 | GroupsScene | soccer | Dot plot of sampled reaction times with x̄ and ±s; t*_{n−1} explained; SE = s/√n. |
| 20:32–21:02 | `ch07-t` | 281–283 | 2 | — | CurveScene | concept | t vs Normal: heavier tails at small df, converging at large df. |
| 21:02–21:26 | `ch07-tables` | 285–287 | 2 | — | TableCompare | exam | z-table = left cumulative area; t-table = critical value for a chosen upper-tail area and df. |
| 21:26–21:50 | `ch07-ttable` | 289–291 | 2 | — | TTableScene | exam | 95% two-sided → .025 column; 90% → .05 column; row df = n − 1 (illustrated with df = 35). |
| 21:50–22:31 | `ch07-onesided` | 293–297 | 2 | 295 | CiLinesScene | concept | One-sided bounds: lower bound to +∞ (α=.10 in the lower tail), upper bound from −∞. |
| 22:33–23:27 | `ch07-twomeans` | 302–316 | 6 | 308, 312 | GroupsScene | soccer | Two independent training groups; difference of means; SE from s²/n of each group; Welch df; zero reference. |
| 23:29–24:19 | `ch07-paired` | 321–329 | 4 | 327 | PairedScene | soccer | Same goalkeepers before/after a reflex drill; per-player differences d; one-sample interval on d̄. |
| 24:22–25:41 | `ch08-samplesize` | 334–352 | 7 | 338, 344, 352 | SampleSizeScene | exam | n vs E curve (n ∝ 1/E²), p̂(1−p̂) maximised at 0.5, round up, worked n = 9604. |
| 25:43–25:54 | `ch09-ci-vs-test` | 357–359 | 2 | — | CardsScene | concept | CI question vs test question. |
| 25:54–26:24 | `ch09-hypotheses` | 361–367 | 4 | — | CardsScene | concept | H0 (default, equality) and Ha (<, >, ≠); alternative chosen before seeing data. |
| 26:24–26:41 | `ch09-workflow` | 369–381 | 7 | — | StepsScene | exam | Six-step hypothesis test workflow, each lit as narrated. |
| 26:41–27:34 | `ch09-pvalue` | 383–397 | 7 | 397 | CurveScene | concept | Null distribution; observed statistic; tail area = p-value; small vs large p; decision rule. |
| 27:37–28:19 | `ch10-tails` | 402–422 | 8 | 406, 410, 414 | CurveScene | exam | Left, right and two-tailed shading from Ha; z-table reading rules for each. |
| 28:19–29:41 | `ch10-voter-test` | 424–438 | 7 | 430, 440 | CurveScene | professor | Professor's voter test: p0=0.52, n=10000, p̂=0.514, z≈−1.20, left-tail p=0.1151 > .05 → fail to reject. |
| 29:44–30:03 | `ch11-oneprop-test` | 445–456 | 4 | 454 | CardsScene | exam | Start with the parameter; one-proportion z-test uses p0; z-table. |
| 30:05–31:20 | `ch11-cats` | 461–473 | 6 | 469 | ProfCats | professor | Professor's cats example: 13/45 vs 16/74, lecture z≈0.878 (unpooled), one-sided p≈0.1894 > 0.10. |
| 31:22–31:52 | `ch11-onemean-test` | 478–488 | 5 | 484 | CurveScene | concept | One-sample t: distance of x̄ from μ0 in estimated SEs; df = n − 1. |
| 31:52–32:32 | `ch11-gpa` | 490–494 | 2 | 492 | CurveScene | professor | Professor's GPA example: μ0=4.1, n=114, x̄=4.2317, s=0.3664, t≈3.84, two-sided p<.001, reject at α=.02. |
| 32:34–33:07 | `ch11-twomeans-test` | 499–509 | 5 | 505 | CurveScene | concept | Two independent group distributions; observed difference minus Δ0 over combined SE; Welch t. |
| 33:07–33:34 | `ch11-firstgen` | 511–511 | 1 | 513 | CurveScene | professor | Professor's first-generation comparison: t≈−1.083, df≈22.38, one-sided p≈0.145 > α=.03 → fail to reject. |
| 33:36–34:08 | `ch11-paired-test` | 518–526 | 4 | 522 | PairedScene | soccer | Paired test: differences first, then a one-sample t on d̄ with d0 commonly 0. |
| 34:10–34:51 | `ch12-checklist` | 531–567 | 19 | — | ConditionsChecklist | exam | Four-column condition checklist filled as narrated. |
| 34:51–35:44 | `ch12-detail` | 569–577 | 4 | 575 | ConditionsDetail | concept | Random sample, 10% sampling fraction, success–failure (p̂ for CI, p0 for test), skew and sample size. |
| 35:47–36:14 | `ch13-errors` | 582–590 | 4 | 590 | CurveScene | concept | H0 and Ha distributions; α, β and power shaded. |
| 36:14–36:32 | `ch13-matrix` | 592–592 | 1 | — | ErrorMatrix | soccer | Goalkeeper training program with H0 = no improvement: false alarm vs missed real gain. |
| 36:32–36:49 | `ch13-power` | 594–596 | 2 | — | CurveScene | concept | Power grows with sample size and effect size. |
| 36:52–37:37 | `ch14-duality` | 601–611 | 5 | 603 | CiLinesScene | concept | Null value outside the CI → reject; inside → fail to reject; zero for differences; cross-check. |
| 37:40–38:36 | `ch15-tree-1` | 616–644 | 15 | — | FlowScene | exam | Exam-day decision tree, steps 1–3: question type → parameter → z or t. |
| 38:36–39:10 | `ch15-ci-gallery` | 646–668 | 6 | 648, 652, 656, 660, 664, 668 | CardsScene | exam | All five CI formulas in one pattern: estimate ± critical × SE. |
| 39:10–39:59 | `ch15-tree-2` | 670–696 | 14 | — | FlowScene | exam | Decision tree, steps 5–10: hypotheses → tail → conditions → statistic → table → p vs α → conclusion. |
| 40:01–41:25 | `ch16-cues` | 701–731 | 15 | 731 | CueList | exam | Wording cue → method list. |
| 41:27–42:56 | `ch17-traps` | 736–758 | 12 | — | CardsScene | exam | Twelve common traps as cards, highlighted one at a time. |
| 42:59–45:45 | `ch18-final-ttest` | 763–787 | 11 | 775, 779 | FinalTTest | soccer | Full soccer t-test: n=36, x̄=.424, μ0=.400, s=.060 → t=2.40, df=35, right tail, .01<p<.025, reject. |
| 45:47–47:44 | `ch19-final-ci` | 792–814 | 9 | 800, 804, 812 | ProportionDots | soccer | 62 of 100 players prefer morning training: p̂=.62, SE≈.04854, E≈.0951, 95% CI ≈ (.5249, .7151); contrast with H0 p=.50. |
| 47:47–49:05 | `ch20-recap` | 819–843 | 13 | — | CardsScene | exam | Ten recognition cues replayed as tiles. |
| 49:07–49:47 | `outro` | 848–854 | 4 | — | OutroScene | soccer | Replay passes and the five self-check questions. |

## 10. Error report

* Render issues found and fixed during QA: formula clipping before the fonts loaded (fixed: re-measure after fonts load and preload the KaTeX fonts); raw `$` in card kickers (fixed: rich text);
  overlapping labels in several plots (repositioned); the `swangle` GL backend was 3× slower (removed); truncated header titles (now wrap).
* Open items: none blocking. Optional: replace the Kokoro narration with a licensed premium voice or a human read. Drop same-named WAVs into `public/audio/sentences/` and run `npm run timeline && npm run render:full`.
