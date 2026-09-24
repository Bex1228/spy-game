import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

const DOCS = "C:/шпион/docs";
const PREVIEW = "./pdf-preview";
fs.rmSync(PREVIEW, { recursive: true, force: true });
fs.mkdirSync(PREVIEW, { recursive: true });

const jobs = [
  { html: `${DOCS}/src/presentation.html`, pdf: `${DOCS}/SPY_Presentation_RU.pdf`, selector: ".slide", size: { width: "1280px", height: "720px" } },
  { html: `${DOCS}/src/rules.html`, pdf: `${DOCS}/SPY_Rules_RU.pdf`, selector: ".page", size: { format: "A4" } },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });

for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));
  await page.goto(pathToFileURL(job.html).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  // Проверка: шрифты загружены, картинки загружены, нет переполнения страниц
  const report = await page.evaluate((selector) => {
    const fonts = [...document.fonts].map((f) => `${f.family} ${f.status}`);
    const imgs = [...document.images].map((i) => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0 }));
    const pages = [...document.querySelectorAll(selector)].map((el, i) => {
      const r = el.getBoundingClientRect();
      let overflow = false;
      for (const child of el.querySelectorAll("*")) {
        const c = child.getBoundingClientRect();
        if (c.width === 0 || c.height === 0) continue;
        if (c.right > r.right + 0.5 || c.bottom > r.bottom + 0.5 || c.left < r.left - 0.5 || c.top < r.top - 0.5) {
          const style = getComputedStyle(child);
          if (style.position === "absolute" && el.contains(child)) continue; // декоративные слои внутри overflow:hidden
          overflow = true;
        }
      }
      return { index: i + 1, width: Math.round(r.width), height: Math.round(r.height), overflow };
    });
    return { fonts, imgs, pages };
  }, job.selector);

  const fontProblems = report.fonts.filter((f) => !f.endsWith("loaded"));
  const imgProblems = report.imgs.filter((i) => !i.ok);
  const overflowPages = report.pages.filter((p) => p.overflow).map((p) => p.index);
  console.log(`\n== ${path.basename(job.pdf)} ==`);
  console.log(`pages in DOM: ${report.pages.length}, sizes: ${[...new Set(report.pages.map((p) => `${p.width}x${p.height}`))].join(", ")}`);
  console.log(`fonts: ${report.fonts.length} faces, problems: ${fontProblems.length ? fontProblems.join("; ") : "none"}`);
  console.log(`images: ${report.imgs.length}, broken: ${imgProblems.length ? imgProblems.map((i) => i.src).join("; ") : "none"}`);
  console.log(`overflow pages: ${overflowPages.length ? overflowPages.join(", ") : "none"}`);
  if (errors.length) console.log("page errors:", errors);

  await page.pdf({ path: job.pdf, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, ...job.size });
  await page.close();

  // Проверка результата: количество страниц и размер
  const bytes = fs.readFileSync(job.pdf);
  const doc = await PDFDocument.load(bytes);
  const sizes = doc.getPages().map((p) => `${Math.round(p.getWidth())}x${Math.round(p.getHeight())}`);
  console.log(`PDF pages: ${doc.getPageCount()}, size: ${(bytes.length / 1024 / 1024).toFixed(2)} MB, page sizes (pt): ${[...new Set(sizes)].join(", ")}`);

  // Рендер каждой страницы PDF в PNG для визуальной проверки
  const pdfjsDoc = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const base = path.basename(job.pdf, ".pdf");
  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const p = await pdfjsDoc.getPage(i);
    const scale = 1.4;
    const vp = p.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    const ctx = canvas.getContext("2d");
    await p.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    fs.writeFileSync(`${PREVIEW}/${base}-${String(i).padStart(2, "0")}.png`, canvas.toBuffer("image/png"));
  }
  console.log(`rendered ${pdfjsDoc.numPages} preview pages → ${PREVIEW}`);
}

await browser.close();
