# Как пересобрать PDF

Исходники: `../presentation.html` (12 слайдов 1280×720) и `../rules.html` (3 страницы A4).
Шрифты берутся из `public/fonts`, скриншоты — из `../img` (JPEG-копии оригиналов из `docs/screenshots`).

Скрипты рассчитаны на отдельную папку с зависимостями (в проект их ставить не нужно):

```powershell
mkdir pdf-tools; cd pdf-tools
npm init -y
npm install playwright pdf-lib pdfjs-dist @napi-rs/canvas
```

1. `docshots.mjs` — снимает скриншоты экранов с запущенного `npm run start` на порту 3055 в `docs/screenshots`.
2. `compress.mjs` — делает JPEG-копии 780px в `docs/src/img`.
3. `make-pdfs.mjs` — печатает HTML в PDF через Chromium, проверяет переполнение страниц, шрифты и картинки,
   затем рендерит каждую страницу PDF в PNG (папка `pdf-preview`) для визуальной проверки.

Скрипты используют установленный Google Chrome (`channel: "chrome"`).
