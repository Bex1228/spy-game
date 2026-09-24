/** Безопасная обёртка над localStorage: не падает в SSR, приватном режиме и при переполнении. */

export const STORAGE_KEYS = {
  settings: "spy.settings.v1",
  preferences: "spy.preferences.v1",
  recentWords: "spy.recentWords.v1",
} as const;

export function isStorageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Квота или приватный режим — молча игнорируем: игра работает и без сохранения.
  }
}

export function removeKey(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
