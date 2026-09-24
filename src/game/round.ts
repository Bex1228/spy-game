import type { Category, GameSettings, Round, RoundPlayer } from "@/types";
import { getCategoryById, getWordText } from "@/data";
import { defaultRng, pickRandom, randomId, shuffle, type Rng } from "@/utils/random";
import { buildPlayers } from "./players";
import { clampSpies } from "./rules";
import { historyKey } from "./wordHistory";

export interface CreateRoundOptions {
  settings: GameSettings;
  /** Ключи недавно использованных слов (см. historyKey). */
  recentWords?: readonly string[];
  rng?: Rng;
}

/**
 * Выбирает слово из категории, избегая недавно использованных.
 * Если все слова категории уже были — берёт любое, кроме самого последнего (если возможно).
 */
export function pickWord(category: Category, recentWords: readonly string[], rng: Rng): string {
  const all = Array.from(new Set(category.words.map(getWordText)));
  const recentSet = new Set(recentWords);
  const fresh = all.filter((w) => !recentSet.has(historyKey(category.id, w)));
  if (fresh.length > 0) return pickRandom(fresh, rng);

  // Все слова уже были: исключим только самое недавнее, чтобы не повторить его подряд.
  const lastKey = [...recentWords].reverse().find((k) => k.startsWith(`${category.id}:`));
  const candidates = all.length > 1 && lastKey ? all.filter((w) => historyKey(category.id, w) !== lastKey) : all;
  return pickRandom(candidates, rng);
}

/**
 * Собирает новый раунд: категория → слово → роли → первый игрок.
 * Чистая функция относительно переданного rng.
 */
export function createRound({ settings, recentWords = [], rng = defaultRng }: CreateRoundOptions): Round {
  const categories = settings.categoryIds
    .map((id) => getCategoryById(id))
    .filter((c): c is Category => !!c && c.words.length > 0);

  if (categories.length === 0) {
    throw new Error("Не выбрано ни одной категории");
  }

  const category = pickRandom(categories, rng);
  const word = pickWord(category, recentWords, rng);

  const basePlayers = buildPlayers(settings);
  const spyCount = clampSpies(settings.spyCount, basePlayers.length);

  const shuffledIds = shuffle(
    basePlayers.map((p) => p.id),
    rng,
  );
  const spyIds = shuffledIds.slice(0, spyCount).sort((a, b) => a - b);
  const spySet = new Set(spyIds);

  const players: RoundPlayer[] = basePlayers.map((p) => ({
    ...p,
    role: spySet.has(p.id) ? "spy" : "civilian",
    status: "active",
  }));

  const civilians = players.filter((p) => p.role === "civilian");
  const starterId = pickRandom(civilians, rng).id;

  return {
    id: randomId(),
    categoryId: category.id,
    categoryName: category.name,
    word,
    players,
    spyIds,
    spyCount: spyIds.length,
    starterId,
    roundMinutes: settings.roundMinutes,
  };
}
