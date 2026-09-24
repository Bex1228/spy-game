import type { GameSettings, Player } from "@/types";

export function defaultPlayerName(index: number): string {
  return `Игрок ${index + 1}`;
}

/** Отображаемое имя: введённое пользователем или «Игрок N». */
export function displayName(names: readonly string[], index: number): string {
  const custom = names[index]?.trim();
  return custom ? custom : defaultPlayerName(index);
}

export function buildPlayers(settings: GameSettings): Player[] {
  return Array.from({ length: settings.playerCount }, (_, i) => ({
    id: i + 1,
    name: displayName(settings.playerNames, i),
  }));
}
