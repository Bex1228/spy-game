/** Генератор случайных чисел в [0, 1). Выделен в тип, чтобы логику можно было тестировать детерминированно. */
export type Rng = () => number;

/** Криптографически более качественный RNG, если доступен, иначе Math.random. */
export const defaultRng: Rng = () => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
};

export function randomInt(maxExclusive: number, rng: Rng = defaultRng): number {
  return Math.floor(rng() * maxExclusive);
}

export function pickRandom<T>(items: readonly T[], rng: Rng = defaultRng): T {
  if (items.length === 0) {
    throw new Error("pickRandom: пустой список");
  }
  return items[randomInt(items.length, rng)];
}

/** Тасование Фишера–Йетса, возвращает новый массив. */
export function shuffle<T>(items: readonly T[], rng: Rng = defaultRng): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
