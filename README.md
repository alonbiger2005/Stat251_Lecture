# STAT 251 Exam 2: Soccer Edition (educational explainer video)

A fully programmatic, ~50-minute 1080p30 explainer video built from the **locked** podcast script
`script/STAT251_Exam2_Soccer_Podcast_Script.md` (SHA-256 recorded in `script/*.sha256`).

The stack:
* **Remotion 4 + React + TypeScript** for deterministic scenes and rendering.
* **KaTeX** for every formula.
* **SVG** for all charts, tables and the original soccer vector art.
* A **local neural narrator** (Kokoro-82M, Apache-2.0) for the audio.

| Deliverable | Path |
|---|---|
| Full video (1920×1080, 30 fps, H.264 + AAC, chapter markers) | `out/STAT251_Exam2_Soccer_Explainer.mp4` *(not in git: too large; regenerate with `npm run render:full`)* |
| Mobile video (1280×720, low bitrate, soft subtitles) | `out/STAT251_Exam2_Soccer_Explainer_Mobile.mp4` |
| Preview clip (formula scene + professor example, 70 s) | `out/STAT251_Exam2_Soccer_Explainer_PREVIEW.mp4` |
| Captions | `out/captions.srt`, `out/captions.vtt` |
| Chapter list / MP4 chapter metadata | `out/chapters.txt`, `out/ffmetadata.txt` |
| Manifest (one record per narrated paragraph) | `manifest.json` |
| Storyboard with scene / step / math timestamps | `storyboard.json` (generated from `src/storyboard.ts`) |
| Narration (lossless) | `public/audio/narration.flac` (+ `narration.wav` working copy, git-ignored) |
| Voice sample (32 s) | `public/audio/voice_sample.wav` |
| QA report | `QA_REPORT.md` |

## Layout

```
script/                 locked source script (verbatim) + checksum + the master prompt
tools/
  parse-script.ts       script → manifest.json (prose = narration, \[..\] = overlays, headings = cards)
  text-utils.ts         sentence + caption-chunk splitting (exact substrings)
  spoken.ts             pronunciation normalisation for TTS only ("p-hat", "0.514" → "zero point five one four")
  tts_kokoro.py         neural narration per sentence (cached, trimmed, word timestamps)
  run-tts.sh            npm run narrate
  build-timeline.ts     ACTUAL audio durations → frame timeline, narration.wav, captions, chapters
  render-stills.ts      inspection stills
  render.ts             preview / full render (chunked, resumable, lossless concat, single audio mux)
  make-mobile.sh        mobile transcode
  asr_check.py          intelligibility check (Whisper WER vs. script)
  qa.ts                 generates QA_REPORT.md
src/
  storyboard.ts         every narrated paragraph (by source line) → scene + per-step animation config
  Main.tsx / Root.tsx   composition: title + chapter menu, chapter cards, scenes, formula panel, captions
  components/           Tex/FitTex (KaTeX), CurvePlot (morphing distributions), tables (z/t lookup),
                        soccer.tsx (pitch, players, ball, stopwatch, goal timer), Chrome (header/captions/panel)
  scenes/               generic (CurveScene, CardsScene, StepsScene) + specialised scenes
  lib/stats.ts          Φ, t CDF/critical values, densities. All table entries are computed, not typed
  data/timeline.json    generated timeline
tests/                  script coverage, math checks, KaTeX parse, timeline/audio integrity
```

## Setup

```bash
npm install
```

Node 20+ and `ffmpeg`/`ffprobe` are required. Remotion needs a Chrome/Chromium headless shell: set
`REMOTION_BROWSER=/path/to/chrome-headless-shell` if it is not at the default path in
`tools/remotion-common.ts`. Otherwise Remotion downloads its own.

### Narration setup (local neural TTS, no API key needed)

```bash
uv venv -p python3.12 /opt/tts/venv
```

```bash
VIRTUAL_ENV=/opt/tts/venv uv pip install --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple --index-strategy unsafe-best-match torch kokoro soundfile "numpy<2"
```

```bash
curl -L -o /opt/tts/en_core_web_sm-3.7.1-py3-none-any.whl https://huggingface.co/spacy/en_core_web_sm/resolve/main/en_core_web_sm-any-py3-none-any.whl
```

```bash
VIRTUAL_ENV=/opt/tts/venv uv pip install /opt/tts/en_core_web_sm-3.7.1-py3-none-any.whl
```

`.env` / environment variables (all optional):

| Variable | Default | Meaning |
|---|---|---|
| `NARRATION_PROVIDER` | `kokoro` | Only `kokoro` is implemented. To use a licensed cloud voice or a human recording, replace the per-sentence WAVs in `public/audio/sentences/` (same ids) and re-run `npm run timeline`. |
| `NARRATION_VOICE` | `af_heart` | Kokoro voice id (e.g. `am_michael`, `af_bella`). |
| `NARRATION_SPEED` | `0.92` | Speaking rate → measured 149.7 WPM. |
| `TTS_PYTHON` | `/opt/tts/venv/bin/python` | Interpreter with Kokoro installed. |
| `REMOTION_BROWSER` | pre-installed headless shell | Chrome headless shell for rendering. |
| `REMOTION_CONCURRENCY` | `4` | Parallel render tabs (≤ CPU cores). |
| `RENDER_CRF` | `20` | x264 quality for the full render. |

No secrets are used or committed.

## Generate and render

```bash
npm run build:data
```

`npm run build:data` runs three steps: `manifest`, then `narrate` (≈15 min on 4 CPU cores, cached per sentence), then `timeline`.
To rebuild only the timing after editing pauses or the storyboard, run `npm run timeline`. Restoring the
lossless narration (instead of re-synthesising) also works:

```bash
ffmpeg -i public/audio/narration.flac public/audio/narration.wav
```

Preview in the browser:

```bash
npm run studio
```

Checks:

```bash
npm run typecheck && npm test
```

```bash
npm run stills -- ch04-ztable ch18-final-ttest
```

```bash
npm run render:preview
```

```bash
npm run render:full
```

```bash
npm run render:mobile
```

```bash
npm run qa
```

`render:full` renders chapter-sized chunks into `out/chunks/` (delete a chunk to re-render just that part),
concatenates them losslessly, then muxes the narration (AAC 160 kb/s, 48 kHz) and chapter markers once.

## Captions

Captions are the **exact** locked script text, split at clause boundaries (≤ ~2 lines). Cue times come
from the TTS word timestamps of each sentence. `out/captions.srt` / `.vtt` can be uploaded alongside the
video. The mobile MP4 also carries them as a soft subtitle track.

## Troubleshooting

* **Formulas look clipped:** `FitTex` re-measures after KaTeX fonts load. Make sure `katex/dist/katex.min.css` is
  imported (it is, in `src/index.ts`).
* **Very slow rendering:** do not force `chromiumOptions.gl = "swangle"`; the default backend renders ~3× faster here (≈24 fps vs 7 fps).
* **spaCy / numpy binary errors in the TTS venv:** use Python 3.12 and `numpy<2` (thinc 8.2 is built against numpy 1.x).
* **A caption seems early or late:** edit pacing constants at the top of `tools/build-timeline.ts`, then `npm run timeline`.
  The tests verify ordering, no overlaps and that no scene ends before its narration.

## Licensing notes

* **Remotion** is free for individuals, for-profit organisations with up to 3 employees, and non-profits; larger
  companies need a company license (see remotion.dev/license). This project is a student's educational
  video, which falls under the free tier. **Check this again if the video is used commercially by an organisation.**
* **Kokoro-82M** model and voices: Apache-2.0. **KaTeX**: MIT (fonts SIL OFL). **Inter**, **JetBrains Mono**: SIL OFL.
* All soccer graphics are original SVG drawings (no footage, logos, real players or broadcast material).
