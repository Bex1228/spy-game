import type { GameSettings, RoundMinutes } from "@/types";
import { getAllCategoryIds } from "@/data";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const MIN_SPIES = 1;

export const ROUND_PRESETS: readonly { minutes: RoundMinutes; label: string }[] = [
  { minutes: 3, label: "3 мин" },
  { minutes: 5, label: "5 мин" },
  { minutes: 7, label: "7 мин" },
  { minutes: 10, label: "10 мин" },
  { minutes: null, label: "Без таймера" },
];

/** Сколько всего слов хранить в истории недавних. */
export const RECENT_WORDS_LIMIT = 80;

/** Удержание карточки до раскрытия, мс. */
export const HOLD_TO_REVEAL_MS = 650;

/**
 * Максимум шпионов при данном числе игроков: шпионов всегда строго меньше,
 * чем обычных игроков, чтобы раунд имел смысл.
 * 3–4 → 1, 5–6 → 2, 7–8 → 3 … 20 → 9.
 */
export function maxSpiesFor(playerCount: number): number {
  return Math.max(MIN_SPIES, Math.floor((playerCount - 1) / 2));
}

export function clampPlayers(n: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(n)));
}

export function clampSpies(spies: number, playerCount: number): number {
  return Math.min(maxSpiesFor(playerCount), Math.max(MIN_SPIES, Math.round(spies)));
}

export function isValidRoundMinutes(value: unknown): value is RoundMinutes {
  return value === null || ROUND_PRESETS.some((p) => p.minutes === value);
}

export function defaultSettings(): GameSettings {
  return {
    playerCount: 6,
    spyCount: 1,
    playerNames: [],
    roundMinutes: 5,
    categoryIds: getAllCategoryIds(),
  };
}

/**
 * Приводит произвольный объект (например, из localStorage старой версии)
 * к корректным настройкам. Никогда не бросает.
 */
export function sanitizeSettings(input: unknown): GameSettings {
  const base = defaultSettings();
  if (!input || typeof input !== "object") return base;
  const raw = input as Partial<Record<keyof GameSettings, unknown>>;

  const playerCount =
    typeof raw.playerCount === "number" && Number.isFinite(raw.playerCount)
      ? clampPlayers(raw.playerCount)
      : base.playerCount;

  const spyCount =
    typeof raw.spyCount === "number" && Number.isFinite(raw.spyCount)
      ? clampSpies(raw.spyCount, playerCount)
      : clampSpies(base.spyCount, playerCount);

  const playerNames = Array.isArray(raw.playerNames)
    ? raw.playerNames
        .slice(0, MAX_PLAYERS)
        .map((n) => (typeof n === "string" ? n.slice(0, 24) : ""))
    : base.playerNames;

  const roundMinutes = isValidRoundMinutes(raw.roundMinutes) ? raw.roundMinutes : base.roundMinutes;

  const known = new Set(getAllCategoryIds());
  const categoryIds = Array.isArray(raw.categoryIds)
    ? raw.categoryIds.filter((id): id is string => typeof id === "string" && known.has(id))
    : base.categoryIds;

  return { playerCount, spyCount, playerNames, roundMinutes, categoryIds };
}

export function canStartGame(settings: GameSettings): boolean {
  return (
    settings.categoryIds.length > 0 &&
    settings.playerCount >= MIN_PLAYERS &&
    settings.spyCount >= MIN_SPIES &&
    settings.spyCount <= maxSpiesFor(settings.playerCount)
  );
}

/** Для быстрой игры: если категории не выбраны, включаем все. */
export function settingsForQuickPlay(settings: GameSettings): GameSettings {
  const s = sanitizeSettings(settings);
  if (s.categoryIds.length === 0) {
    return { ...s, categoryIds: getAllCategoryIds() };
  }
  return s;
}
