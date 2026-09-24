import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3055/";
const OUT = "C:/шпион/docs/screenshots/";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: "ru-RU",
});
const page = await ctx.newPage();
const shot = (name) => page.screenshot({ path: `${OUT}${name}.png` });

await page.goto(BASE, { waitUntil: "networkidle" });
// Имена игроков для красивых скриншотов
await page.evaluate(() => {
  localStorage.setItem(
    "spy.settings.v1",
    JSON.stringify({
      playerCount: 5,
      spyCount: 1,
      playerNames: ["Алина", "Марат", "Дана", "Тимур", "Камила"],
      roundMinutes: 5,
      categoryIds: ["places", "professions", "countries", "cities", "food", "animals", "sports", "movies", "videogames", "transport", "objects", "characters"],
    }),
  );
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await shot("01-home");

await page.getByRole("button", { name: "Как играть" }).click();
await page.waitForTimeout(700);
await shot("02-rules");
await page.getByRole("button", { name: "Закрыть" }).last().click();
await page.waitForTimeout(400);

await page.getByRole("button", { name: "Настроить игру" }).click();
await page.waitForTimeout(700);
await shot("03-setup");
await page.getByRole("checkbox", { name: /Спорт/ }).scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await shot("04-setup-categories");
await page.getByRole("button", { name: "Начать игру" }).click();
await page.waitForTimeout(800);

const hold = async (ms) => {
  const card = page.getByRole("button", { name: /удерживай/ });
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
};

// Раздача: ищем и мирного, и шпиона
let gotSpy = false;
let gotCivil = false;
let word = "";
for (let i = 0; i < 5; i++) {
  if (i === 0) await shot("05-privacy");
  await hold(350);
  if (i === 0) await shot("06-holding");
  await page.waitForTimeout(650);
  await page.mouse.up();
  await page.waitForTimeout(1100);
  const isSpy = (await page.getByText("Не выдай себя").count()) > 0;
  if (isSpy && !gotSpy) {
    await shot("08-card-spy");
    gotSpy = true;
  }
  if (!isSpy && !gotCivil) {
    await shot("07-card-civilian");
    word = (await page.getByTestId("secret-word").innerText()).trim();
    gotCivil = true;
  }
  await page.getByRole("button", { name: "Скрыть карточку" }).click();
  await page.waitForTimeout(600);
  if (i === 0) await shot("09-pass");
  await page.getByRole("button", { name: i < 4 ? "Готово" : "Продолжить" }).click();
  await page.waitForTimeout(500);
}
await page.waitForTimeout(900);
await shot("10-round-start");
await page.getByRole("button", { name: "Начать раунд" }).click();
await page.waitForTimeout(1200);
await shot("11-timer");

await page.getByRole("button", { name: "Подозреваем" }).click();
await page.waitForTimeout(600);
await page.getByRole("radio", { name: /^Тимур/ }).click();
await page.waitForTimeout(300);
await shot("12-suspect");
await page.getByRole("button", { name: "Продолжить игру" }).click();
await page.waitForTimeout(500);

await page.getByRole("button", { name: "Назвать слово" }).click();
await page.waitForTimeout(600);
await page.getByRole("radio", { name: /^Марат/ }).click();
await page.waitForTimeout(300);
await shot("13-guess");
await page.getByRole("button", { name: "Отмена" }).click();
await page.waitForTimeout(500);

// Напряжённый таймер: сдвигаем время на 4:40, остаётся ~20 с
await page.evaluate(() => {
  const o = Date.now;
  Date.now = () => o() + 4 * 60_000 + 40_000;
});
await page.waitForTimeout(700);
await shot("14-timer-tense");

// Мирные побеждают: выгоняем шпиона (определяем его по вердикту — перебираем игроков)
const names = ["Алина", "Марат", "Дана", "Тимур", "Камила"];
for (const n of names) {
  await page.getByRole("button", { name: "Подозреваем" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("radio", { name: new RegExp(`^${n}`) }).click();
  await page.getByRole("button", { name: /^Выгнать/ }).click();
  await page.waitForTimeout(700);
  const title = (await page.locator("#round-overlay-title").innerText()).trim();
  if (title === "Шпион найден.") {
    await shot("15-verdict-spy");
    await page.getByRole("button", { name: "К результатам" }).click();
    break;
  } else {
    if (!fs.existsSync(`${OUT}16-verdict-not-spy.png`)) await shot("16-verdict-not-spy");
    await page.getByRole("button", { name: "Продолжить игру" }).click();
    await page.waitForTimeout(500);
  }
}
await page.waitForTimeout(1200);
await shot("17-results-civilians");
await page.getByRole("button", { name: "Показать слово и роли" }).click();
await page.waitForTimeout(1600);
await shot("18-results-civilians-revealed");

// Шпионы побеждают: новый раунд, шпион «угадывает»
await page.getByRole("button", { name: "Ещё раунд" }).click();
await page.waitForTimeout(700);
for (let i = 0; i < 5; i++) {
  await hold(1000);
  await page.mouse.up();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Скрыть карточку" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: i < 4 ? "Готово" : "Продолжить" }).click();
  await page.waitForTimeout(500);
}
await page.getByRole("button", { name: "Начать раунд" }).click();
await page.waitForTimeout(1000);
// Шпиона не знаем — пробуем каждого до тех пор, пока не найдётся (мирный, назвавший слово, выбывает)
for (const n of names) {
  await page.getByRole("button", { name: "Назвать слово" }).click();
  await page.waitForTimeout(500);
  const radio = page.getByRole("radio", { name: new RegExp(`^${n}`) });
  if ((await radio.count()) === 0) continue;
  await radio.click();
  await page.getByRole("button", { name: "Угадал", exact: true }).click();
  await page.waitForTimeout(900);
  if ((await page.locator("h1").count()) > 0 && (await page.locator("h1").first().textContent()).includes("Шпионы победили")) break;
  // мирный выбыл — продолжаем
  await page.getByRole("button", { name: "Продолжить игру" }).click();
  await page.waitForTimeout(500);
}
await page.waitForTimeout(800);
await shot("19-results-spies");
await page.getByRole("button", { name: "Показать слово и роли" }).click();
await page.waitForTimeout(1600);
await shot("20-results-spies-revealed");

console.log("word was:", word, "| shots:", fs.readdirSync(OUT).length);
await browser.close();
