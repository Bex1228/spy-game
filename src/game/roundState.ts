import type { EliminationReason, Round, RoundPlayer } from "@/types";

/** Вспомогательные чистые функции над состоянием раунда. */

export function activePlayers(round: Round): RoundPlayer[] {
  return round.players.filter((p) => p.status === "active");
}

export function eliminatedPlayers(round: Round): RoundPlayer[] {
  return round.players.filter((p) => p.status === "eliminated");
}

export function activeSpies(round: Round): RoundPlayer[] {
  return round.players.filter((p) => p.role === "spy" && p.status === "active");
}

export function spiesRemaining(round: Round): number {
  return activeSpies(round).length;
}

export function getPlayer(round: Round, id: number): RoundPlayer | undefined {
  return round.players.find((p) => p.id === id);
}

/** Возвращает новый раунд, где игрок помечен выбывшим. */
export function eliminatePlayer(round: Round, id: number, reason: EliminationReason): Round {
  return {
    ...round,
    players: round.players.map((p) =>
      p.id === id && p.status === "active" ? { ...p, status: "eliminated", eliminationReason: reason } : p,
    ),
  };
}
