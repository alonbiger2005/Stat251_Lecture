/** Sentence and caption-chunk splitting. All outputs are exact substrings of the input. */

const SENT_RE = /(?<=[.!?…][”"’)]?)\s+(?=[A-Z“"(0-9])/u;

export function splitSentences(paragraph: string): string[] {
  return paragraph
    .split(SENT_RE)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const MAX_CAPTION_CHARS = 84; // ~2 lines at caption size, keeps cues short

/** Split a sentence into caption chunks of <= MAX_CAPTION_CHARS, preferring clause boundaries. */
export function splitCaptionChunks(sentence: string, max = MAX_CAPTION_CHARS): string[] {
  if (sentence.length <= max) return [sentence];
  // candidate split points: after , ; : or around an em dash
  const words = sentence.split(" ");
  const chunks: string[] = [];
  let cur: string[] = [];
  const flush = () => {
    if (cur.length) chunks.push(cur.join(" "));
    cur = [];
  };
  // greedy with lookahead preference for punctuation boundaries
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    const text = cur.join(" ");
    const remaining = words.slice(i + 1).join(" ");
    if (!remaining) break;
    const endsClause = /[,;:]$|—$/.test(words[i]) || words[i + 1] === "—";
    if (endsClause && text.length >= 30 && (remaining.length >= 18 || text.length + remaining.length + 1 > max)) {
      flush();
      continue;
    }
    const nextLen = text.length + 1 + words[i + 1].length;
    if (nextLen > max) flush();
  }
  flush();
  // merge a tiny trailing chunk back if it fits
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 14) {
    const last = chunks.pop()!;
    const merged = `${chunks[chunks.length - 1]} ${last}`;
    if (merged.length <= max + 12) chunks[chunks.length - 1] = merged;
    else chunks.push(last);
  }
  return chunks;
}
