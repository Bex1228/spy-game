import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const SRC = "C:/шпион/docs/screenshots/";
const OUT = "C:/шпион/docs/src/img/";
fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith(".png"))) {
  const img = await loadImage(SRC + f);
  const w = 780, h = Math.round((img.height / img.width) * w);
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const buf = c.toBuffer("image/jpeg", 88);
  fs.writeFileSync(OUT + f.replace(".png", ".jpg"), buf);
  total += buf.length;
}
console.log("jpg files:", fs.readdirSync(OUT).length, "total KB:", Math.round(total / 1024));
