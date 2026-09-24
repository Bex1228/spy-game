import type { Round } from "@/types";

/**
 * Конечный автомат игровой сессии.
 * Все переходы явные; недопустимые действия игнорируются, чтобы UI
 * не мог случайно перескочить, например, к чужой карточке.
 */

export type RevealStep = "privacy" | "revealed" | "pass";

export type SessionState =
  | { phase: "home" }
  | { phase: "setup" }
  | { phase: "reveal"; round: Round; playerIndex: number; step: RevealStep }
  | { phase: "roundStart"; round: Round }
  | { phase: "playing"; round: Round }
  | { phase: "results"; round: Round; revealed: boolean };

export type SessionAction =
  | { type: "GO_HOME" }
  | { type: "GO_SETUP" }
  | { type: "START_ROUND"; round: Round }
  | { type: "REVEAL_CARD" }
  | { type: "HIDE_CARD" }
  | { type: "NEXT_PLAYER" }
  | { type: "BEGIN_ROUND" }
  | { type: "END_ROUND" }
  | { type: "REVEAL_RESULTS" };

export const initialSessionState: SessionState = { phase: "home" };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "GO_HOME":
      return { phase: "home" };

    case "GO_SETUP":
      return { phase: "setup" };

    case "START_ROUND":
      return { phase: "reveal", round: action.round, playerIndex: 0, step: "privacy" };

    case "REVEAL_CARD":
      if (state.phase !== "reveal" || state.step !== "privacy") return state;
      return { ...state, step: "revealed" };

    case "HIDE_CARD":
      if (state.phase !== "reveal" || state.step !== "revealed") return state;
      return { ...state, step: "pass" };

    case "NEXT_PLAYER": {
      if (state.phase !== "reveal" || state.step !== "pass") return state;
      const next = state.playerIndex + 1;
      if (next >= state.round.players.length) {
        return { phase: "roundStart", round: state.round };
      }
      return { ...state, playerIndex: next, step: "privacy" };
    }

    case "BEGIN_ROUND":
      if (state.phase !== "roundStart") return state;
      return { phase: "playing", round: state.round };

    case "END_ROUND":
      if (state.phase !== "playing") return state;
      return { phase: "results", round: state.round, revealed: false };

    case "REVEAL_RESULTS":
      if (state.phase !== "results") return state;
      return { ...state, revealed: true };

    default:
      return state;
  }
}

/** Фазы, в которых на экране есть или скоро будет секретная информация. */
export function isInGame(state: SessionState): boolean {
  return state.phase !== "home" && state.phase !== "setup";
}
