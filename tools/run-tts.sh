#!/usr/bin/env bash
# Synthesises narration for every sentence in manifest.json.
# Requires the Kokoro venv (see README: "Narration setup"). TTS_PYTHON overrides the interpreter.
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${TTS_PYTHON:-/opt/tts/venv/bin/python}"
npx tsx tools/make-tts-jobs.ts
"$PY" -I tools/tts_kokoro.py
