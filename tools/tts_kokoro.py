"""Neural narration synthesis with Kokoro-82M (Apache-2.0, https://huggingface.co/hexgrad/Kokoro-82M).

Reads   tools/.cache/tts_jobs.json   [{ "id", "spoken" }]
Writes  public/audio/sentences/<id>.wav   (mono, 24 kHz, PCM16, leading/trailing silence trimmed)
        public/audio/sentence_timings.json  { id: { duration, spokenHash, words: [[text, start, end], ...] } }

Env: NARRATION_VOICE (default af_heart), NARRATION_SPEED (default 0.92 -> ~150 WPM).
Cached: a sentence is re-synthesised only if its spoken text / voice / speed changed.
"""
import hashlib, json, os, sys, time
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS = os.path.join(ROOT, "tools", ".cache", "tts_jobs.json")
OUT_DIR = os.path.join(ROOT, "public", "audio", "sentences")
TIMINGS = os.path.join(ROOT, "public", "audio", "sentence_timings.json")
VOICE = os.environ.get("NARRATION_VOICE", "af_heart")
SPEED = float(os.environ.get("NARRATION_SPEED", "0.92"))
SR = 24000


def trim(audio: np.ndarray, thresh=0.006, margin=0.03):
    """Trim leading/trailing silence; returns (audio, seconds_removed_at_start)."""
    win = int(0.01 * SR)
    n = len(audio) // win
    if n == 0:
        return audio, 0.0
    frames = audio[: n * win].reshape(n, win)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    voiced = np.where(rms > thresh)[0]
    if len(voiced) == 0:
        return audio, 0.0
    start = max(0, voiced[0] * win - int(margin * SR))
    end = min(len(audio), (voiced[-1] + 1) * win + int(margin * SR))
    return audio[start:end], start / SR


def main():
    from kokoro import KPipeline

    jobs = json.load(open(JOBS))
    os.makedirs(OUT_DIR, exist_ok=True)
    timings = json.load(open(TIMINGS)) if os.path.exists(TIMINGS) else {}
    pipe = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    t0 = time.time()
    done = 0
    for job in jobs:
        sid, spoken = job["id"], job["spoken"]
        h = hashlib.sha1(f"{VOICE}|{SPEED}|{spoken}".encode()).hexdigest()
        wav = os.path.join(OUT_DIR, f"{sid}.wav")
        if sid in timings and timings[sid].get("spokenHash") == h and os.path.exists(wav):
            continue
        chunks, words, offset = [], [], 0.0
        for r in pipe(spoken, voice=VOICE, speed=SPEED, split_pattern=None):
            a = r.audio.numpy().astype(np.float32)
            for tk in r.tokens or []:
                if tk.start_ts is not None and tk.end_ts is not None:
                    words.append([tk.text, offset + tk.start_ts, offset + tk.end_ts])
            chunks.append(a)
            offset += len(a) / SR
        if not chunks:
            raise RuntimeError(f"empty audio for {sid}: {spoken!r}")
        audio = np.concatenate(chunks)
        audio, cut = trim(audio)
        dur = len(audio) / SR
        words = [[w, max(0.0, s - cut), min(dur, e - cut)] for w, s, e in words]
        sf.write(wav, audio, SR, subtype="PCM_16")
        timings[sid] = {"duration": dur, "spokenHash": h, "voice": VOICE, "speed": SPEED, "words": words}
        done += 1
        if done % 20 == 0:
            json.dump(timings, open(TIMINGS, "w"))
            print(f"[tts] {done} new sentences, {time.time() - t0:.0f}s elapsed", flush=True)
    json.dump(timings, open(TIMINGS, "w"))
    print(f"[tts] finished: {done} synthesised, {len(jobs)} total", flush=True)


if __name__ == "__main__":
    sys.exit(main())
