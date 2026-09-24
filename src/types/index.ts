/** Уровень сложности слова (задел на будущее). */
export type Difficulty = "easy" | "medium" | "hard";

/** Слово может быть простой строкой или объектом с метаданными. */
export type Word = string | { text: string; difficulty?: Difficulty };

export type CategorySource = "builtin" | "custom";

/** Имя иконки из набора, который умеет рисовать CategoryIcon. */
export type CategoryIconName =
  | "map-pin"
  | "briefcase"
  | "globe"
  | "building"
  | "utensils"
  | "paw"
  | "trophy"
  | "clapperboard"
  | "gamepad"
  | "car"
  | "package"
  | "crown";

export interface Category {
  id: string;
  name: string;
  icon: CategoryIconName;
  source: CategorySource;
  words: readonly Word[];
}

/** Длительность раунда в минутах; null — без таймера. */
export type RoundMinutes = 3 | 5 | 7 | 10 | null;

export interface GameSettings {
  playerCount: number;
  spyCount: number;
  /** Имена по индексу игрока. Пустая строка → «Игрок N». Длина не обязана совпадать с playerCount. */
  playerNames: string[];
  roundMinutes: RoundMinutes;
  categoryIds: string[];
}

export interface UiPreferences {
  vibration: boolean;
}

export type Role = "civilian" | "spy";

export interface Player {
  /** Порядковый номер игрока, начиная с 1. */
  id: number;
  name: string;
}

export interface RoundPlayer extends Player {
  role: Role;
}

export interface Round {
  id: string;
  categoryId: string;
  categoryName: string;
  word: string;
  players: RoundPlayer[];
  spyIds: number[];
  /** id игрока-нешпиона, который начинает раунд. */
  starterId: number;
  roundMinutes: RoundMinutes;
}
