"""Intelligibility QA: transcribe a deterministic sample of narration sentences with
faster-whisper and compute word error rate (WER) against the spoken script text.
Usage: python -I tools/asr_check.py [every_nth=8] [model=base.en]
Writes out/asr_check.json"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NTH = int(sys.argv[1]) if len(sys.argv) > 1 else 8
MODEL = sys.argv[2] if len(sys.argv) > 2 else "base.en"

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
def i2w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000: return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + i2w(n % 100))
    return i2w(n // 1000) + " thousand" + ("" if n % 1000 == 0 else " " + i2w(n % 1000))
def num(m):
    t = m.group(0).replace(",", "")
    if "." in t:
        a, b = t.split(".", 1)
        return (i2w(int(a)) + " " if a else "") + "point " + " ".join(ONES[int(d)] for d in b if d.isdigit())
    return i2w(int(t))
def norm(s):
    s = s.lower().replace("%", " percent").replace("μ", " mu ").replace("σ", " sigma ")
    s = re.sub(r"\[a\]\(/[^)]*\)", "a", s)
    s = re.sub(r"\d[\d,]*(\.\d+)?|\.\d+", num, s)
    s = s.replace("-", " ")
    s = re.sub(r"[^a-z' ]", " ", s)
    words = s.split()
    alias = {"mew": "mu", "mue": "mu", "new": "nu", "hat": "hat", "zed": "z", "zee": "z", "x": "x", "ex": "x", "pee": "p", "tee": "t", "h": "h", "age": "h", "aitch": "h", "naught": "zero", "nought": "zero", "oh": "zero"}
    return [alias.get(w, w) for w in words]
def wer(ref, hyp):
    d = list(range(len(hyp) + 1))
    for i in range(1, len(ref) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(hyp) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (ref[i - 1] != hyp[j - 1]))
            prev, d[j] = d[j], cur
    return d[len(hyp)]

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
model = WhisperModel(MODEL, device="cpu", compute_type="int8")
manifest = json.load(open(os.path.join(ROOT, "manifest.json")))
sents = [s for g in manifest["segments"] for s in g["sentences"]][::NTH]
tot_err = tot_words = 0
rows = []
for s in sents:
    wav = os.path.join(ROOT, "public", "audio", "sentences", s["id"] + ".wav")
    a, sr = sf.read(wav, dtype="float32")
    t16 = np.arange(0, len(a) / sr, 1 / 16000)
    a16 = np.interp(t16, np.arange(len(a)) / sr, a).astype(np.float32)
    segs, _ = model.transcribe(a16, language="en", beam_size=5)
    hyp = " ".join(x.text for x in segs).strip()
    r, h = norm(s["spoken"]), norm(hyp)
    e = wer(r, h)
    tot_err += e; tot_words += len(r)
    rows.append({"id": s["id"], "script": s["display"], "heard": hyp, "wer": round(e / max(1, len(r)), 3)})
res = {"model": MODEL, "sampled_sentences": len(sents), "words": tot_words, "word_errors": tot_err, "wer": round(tot_err / tot_words, 4), "worst": sorted(rows, key=lambda x: -x["wer"])[:12], "all": rows}
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
json.dump(res, open(os.path.join(ROOT, "out", "asr_check.json"), "w"), indent=1, ensure_ascii=False)
print(f"ASR check ({MODEL}): {len(sents)} sentences, {tot_words} words, WER = {100*tot_err/tot_words:.2f}%")
for w in res["worst"][:12]:
    print(f"  {w['wer']:.2f}  SCRIPT: {w['script']}\n        HEARD:  {w['heard']}")
