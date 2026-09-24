/**
 * Проверка словаря игры: количество слов по категориям, дубли внутри категорий
 * и между категориями (с учётом регистра, ё/е и знаков препинания).
 * Запуск: npm run check:words. Завершается с кодом 1, если найдены дубли.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/categories");

const normalize = (w) =>
  w
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();

const categories = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
  const src = fs.readFileSync(path.join(dir, file), "utf8");
  const name = (src.match(/name:\s*"([^"]+)"/) || [])[1] ?? file;
  const wordsBlock = src.slice(src.indexOf("words: ["));
  const words = [...wordsBlock.matchAll(/^\s+"((?:[^"\\]|\\.)+)",?$/gm)].map((m) => m[1].replace(/\\"/g, '"'));
  categories.push({ id: file.replace(/\.ts$/, ""), name, words });
}

let problems = 0;
const seen = new Map(); // normalized → { word, category }

console.log("Категория".padEnd(26) + "Слов");
console.log("-".repeat(32));
for (const c of categories) {
  const local = new Set();
  for (const w of c.words) {
    const key = normalize(w);
    if (!key) {
      console.log(`  ! пустое слово в ${c.name}`);
      problems++;
      continue;
    }
    if (local.has(key)) {
      console.log(`  ! дубль внутри «${c.name}»: ${w}`);
      problems++;
    }
    local.add(key);
    const prev = seen.get(key);
    if (prev && prev.category !== c.id) {
      console.log(`  ! дубль между категориями: «${prev.word}» (${prev.category}) и «${w}» (${c.id})`);
      problems++;
    } else if (!prev) {
      seen.set(key, { word: w, category: c.id });
    }
  }
  console.log(`${c.name.padEnd(26)}${c.words.length}`);
}
const total = categories.reduce((s, c) => s + c.words.length, 0);
console.log("-".repeat(32));
console.log(`Всего категорий: ${categories.length}, всего слов: ${total}, уникальных: ${seen.size}`);

if (problems > 0) {
  console.log(`\nНайдено проблем: ${problems}`);
  process.exit(1);
}
console.log("\nДублей нет.");
