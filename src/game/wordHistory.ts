import { RECENT_WORDS_LIMIT } from "./rules";

/** Ключ слова в истории — категория + слово, чтобы «Метро» в Местах и Транспорте считались разными. */
export function historyKey(categoryId: string, word: string): string {
  return `${categoryId}:${word}`;
}

/** Добавляет слово в конец истории и обрезает её до лимита. Возвращает новый массив. */
export function pushRecentWord(history: readonly string[], categoryId: string, word: string): string[] {
  const key = historyKey(categoryId, word);
  const next = history.filter((k) => k !== key);
  next.push(key);
  if (next.length > RECENT_WORDS_LIMIT) {
    return next.slice(next.length - RECENT_WORDS_LIMIT);
  }
  return next;
}

export function sanitizeHistory(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((k): k is string => typeof k === "string").slice(-RECENT_WORDS_LIMIT);
}
