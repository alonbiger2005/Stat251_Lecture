#!/usr/bin/env bash
# Lower-bitrate mobile version (1280x720, H.264 + AAC, chapters + soft subtitles kept).
set -euo pipefail
cd "$(dirname "$0")/.."
IN=out/STAT251_Exam2_Soccer_Explainer.mp4
OUT=out/STAT251_Exam2_Soccer_Explainer_Mobile.mp4
ffmpeg -y -hide_banner -loglevel error -i "$IN" -i out/captions.srt \
  -map 0:v -map 0:a -map 1:s -map_chapters 0 -map_metadata 0 \
  -vf "scale=1280:720:flags=lanczos" -c:v libx264 -preset slow -crf 28 -maxrate 900k -bufsize 1800k -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 64k -ac 1 -ar 44100 \
  -c:s mov_text -metadata:s:s:0 language=eng \
  -movflags +faststart "$OUT"
ls -la "$OUT"
