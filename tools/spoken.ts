/**
 * Pronunciation normalisation for TTS.
 *
 * The DISPLAY text (captions, transcript) is always the exact locked script text.
 * This function only produces the string handed to the speech engine so that
 * technical terms are pronounced correctly ("p-hat", "x-bar", "mu", "zero point five one four" …).
 * It never adds, removes or reorders content words.
 */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const DIGIT = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

export function intToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error(`intToWords: ${n}`);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + intToWords(n % 100) : "");
  if (n < 1_000_000)
    return intToWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + intToWords(n % 1000) : "");
  throw new Error(`intToWords: too large ${n}`);
}

/** "0.514" → "zero point five one four"; ".025" → "point zero two five"; "9,604" → "nine thousand six hundred four" */
export function numberToWords(tok: string): string {
  const clean = tok.replace(/,/g, "");
  const [intPart, frac] = clean.split(".");
  const parts: string[] = [];
  if (intPart !== "") parts.push(intToWords(Number(intPart)));
  if (frac !== undefined) {
    parts.push("point");
    parts.push(frac.split("").map((d) => DIGIT[Number(d)]).join(" "));
  }
  return parts.join(" ");
}

/** Exact-phrase overrides, applied first (display phrase → spoken phrase). */
const PHRASES: [RegExp, string][] = [
  [/STAT 251/g, "Stat two fifty-one"],
  [/68-95-99\.7/g, "sixty-eight, ninety-five, ninety-nine point seven"],
  [/\bF\((\d+)\)/g, "F of $1"],
  // variables named a / b (avoid the article "a" being read as "uh")
  [/\bbetween a and b\b/g, "between [A](/ˈA/) and B"],
  [/\bfrom a to b\b/g, "from [A](/ˈA/) to B"],
  [/\bP of a less than X/g, "P of [A](/ˈA/) less than X"],
  [/\bF of b minus F of a\b/g, "F of B minus F of [A](/ˈA/)"],
  [/\ba is zero, b is twenty\b/g, "[A](/ˈA/) is zero, B is twenty"],
  [/\bP of X equals exactly 5\b/g, "P of X equals exactly five"],
  [/\bsuccess\/failure\b/gi, "success failure"],
  [/\byes\/no\b/g, "yes or no"],
  [/\bafter-minus-before\b/g, "after minus before"],
  [/\bless-than-or-equal\b/g, "less than or equal"],
  [/\bless-than\b/g, "less than"],
  [/\bbefore-after\b/g, "before and after"],
  [/\bleft-foot\b/g, "left foot"],
  [/\bright-foot\b/g, "right foot"],
  [/\bplayer-by-player\b/g, "player by player"],
  [/\bplayer-level\b/g, "player level"],
  [/\bpooled-null\b/g, "pooled null"],
  [/\bconstant-rate\b/g, "constant rate"],
  [/\bcustomer-arrival\b/g, "customer arrival"],
  [/\bbell-shaped\b/gi, "bell shaped"],
  [/\breaction-time\b/g, "reaction time"],
  [/\bsample-size\b/g, "sample size"],
  [/\bmargin-of-error\b/g, "margin of error"],
  [/\bconfidence-interval\b/g, "confidence interval"],
  [/\brepeated-sampling\b/g, "repeated sampling"],
  [/\btable-based\b/g, "table based"],
  [/\bone-proportion\b/g, "one proportion"],
  [/\btwo-proportion\b/g, "two proportion"],
  [/\btwo-independent-means\b/g, "two independent means"],
  [/\btwo-independent-samples\b/g, "two independent samples"],
  [/\bone-sample\b/g, "one sample"],
  [/\btwo-sample\b/g, "two sample"],
  [/\bone-mean\b/g, "one mean"],
  [/\bone-sided\b/g, "one sided"],
  [/\btwo-sided\b/g, "two sided"],
  [/\bone-tail\b/g, "one tail"],
  [/\bleft-tail\b/g, "left tail"],
  [/\bupper-tail\b/gi, "upper tail"],
  [/\bleft-tailed\b/g, "left tailed"],
  [/\bright-tailed\b/gi, "right tailed"],
  [/\bleft-area\b/g, "left area"],
  [/\bbuilt-in\b/g, "built in"],
  [/\bexam-style\b/g, "exam style"],
  [/\bExam-day\b/gi, "exam day"],
  [/\bhigh-quality\b/g, "high quality"],
];

/** Notation tokens (display → spoken). Order matters (longest first). */
const NOTATION: [RegExp, string][] = [
  [/\bs-sub-d\b/g, "s sub d"],
  [/\bDelta-zero\b/g, "delta zero"],
  [/\bmu-zero\b/g, "mew zero"],
  [/\bmu-d\b/g, "mew dee"],
  [/\bmu1\b/g, "mew one"],
  [/\bmu2\b/g, "mew two"],
  [/\bp-one\b/g, "p one"],
  [/\bp-two\b/g, "p two"],
  [/\bp1\b/g, "p one"],
  [/\bp2\b/g, "p two"],
  [/\bp-F\b/g, "p F"],
  [/\bp-M\b/g, "p M"],
  [/\bp-zero\b/g, "p zero"],
  [/\bq-zero\b/g, "q zero"],
  [/\bd-zero\b/gi, "d zero"],
  [/\bH-zero\b/g, "H zero"],
  [/\bH-a\b/g, "H A"],
  [/\bH-A\b/g, "H A"],
  [/\bp-hat\b/gi, "p hat"],
  [/\bq-hat\b/gi, "q hat"],
  [/\bx-bar\b/gi, "x bar"],
  [/\by-bar\b/gi, "y bar"],
  [/\bd-bar\b/gi, "d bar"],
  [/\bz-star\b/gi, "z star"],
  [/\bt-star\b/gi, "t star"],
  [/\bz-score(s?)\b/gi, "z score$1"],
  [/\bz-table\b/gi, "z table"],
  [/\bt-table\b/gi, "t table"],
  [/\bz-test\b/gi, "z test"],
  [/\bt-test\b/gi, "t test"],
  [/\bt-distribution\b/gi, "t distribution"],
  [/\bp-value(s?)\b/gi, "p value$1"],
  [/\bmu\b/g, "mew"],
  [/\bnu\b/g, "new"],
  [/\bdf\b/g, "D F"],
  [/\bPDF\b/g, "P D F"],
  [/\bCDF\b/g, "C D F"],
  [/\bCI\b/g, "C I"],
  [/\bSD\b/g, "S D"],
];

export function toSpoken(display: string): string {
  let s = display;
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  for (const [re, rep] of NOTATION) s = s.replace(re, rep);
  // emphasis capitals ("LEFT", "NOT EQUAL") → normal words so the engine does not spell them out
  const ACRONYMS = new Set(["GPA", "STAT", "PDF", "CDF"]);
  s = s.replace(/\b[A-Z]{3,}\b/g, (w) => (ACRONYMS.has(w) ? w : w.toLowerCase()));
  // numbers: 9,604 | 0.8849 | .025 | 36
  s = s.replace(/(?<![\w.])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d*\.\d+|\d+)(?![\w])/g, (m) => numberToWords(m));
  // typographic cleanup
  s = s
    .replace(/\s*—\s*/g, ", ")
    .replace(/…/g, "...")
    .replace(/[“”]/g, "")
    .replace(/’/g, "'")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
  return s;
}
