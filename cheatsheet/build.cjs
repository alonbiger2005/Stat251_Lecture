// Builds cheatsheet/STAT251_Exam2_Cheat_Sheet.pdf from sheet.html.
// KaTeX is pre-rendered; Playwright finds the LARGEST base font size at which both sides fit
// (no column overflow), shrinks any equation wider than its column, then prints to Letter PDF.
// Usage: node cheatsheet/build.cjs
const fs = require("fs");
const path = require("path");
const katex = require("katex");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const render = (tex, display) => katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: "ignore" });
function build(fsPt) {
  let html = fs.readFileSync(path.join(__dirname, "sheet.html"), "utf8");
  html = html
    .replace("{{KATEX_CSS}}", "file://" + path.join(ROOT, "node_modules/katex/dist/katex.min.css"))
    .replaceAll("{{INTER}}", "file://" + path.join(ROOT, "node_modules/@fontsource/inter/files"))
    .replace("{{FS}}", String(fsPt));
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => render(t, true));
  html = html.replace(/\$([^$]+?)\$/g, (_, t) => render(t, false));
  const out = path.join(__dirname, "build.html");
  fs.writeFileSync(out, html);
  return out;
}

async function layout(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    // shrink equations that are wider than their column
    for (const el of document.querySelectorAll(".eq")) {
      let size = 100;
      while (el.scrollWidth > el.clientWidth + 0.5 && size > 55) {
        size -= 3;
        el.style.fontSize = size + "%";
      }
    }
    return [...document.querySelectorAll(".cols")].map((c) => {
      const r = c.getBoundingClientRect();
      let maxRight = 0;
      for (const k of c.querySelectorAll("section")) for (const x of k.getClientRects()) maxRight = Math.max(maxRight, x.right);
      return { overflow: maxRight > r.right + 2 };
    });
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
  let chosen = null;
  for (let pt = 8.2; pt >= 6.0; pt = Math.round((pt - 0.1) * 10) / 10) {
    await page.goto("file://" + build(pt));
    const rep = await layout(page);
    if (rep.every((r) => !r.overflow)) {
      chosen = pt;
      break;
    }
  }
  if (!chosen) throw new Error("content does not fit even at 6pt");
  const pdf = path.join(__dirname, "STAT251_Exam2_Cheat_Sheet.pdf");
  await page.pdf({ path: pdf, format: "Letter", printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 }, preferCSSPageSize: true });
  await browser.close();
  console.log(`base font ${chosen}pt → wrote ${pdf}`);
})();
