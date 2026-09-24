import type { Round, RoundOutcome } from "@/types";
import { eliminatePlayer, getPlayer, spiesRemaining } from "./roundState";

/**
 * Конечный автомат игровой сессии.
 * Все переходы явные; недопустимые действия игнорируются, чтобы UI
 * не мог случайно перескочить, например, к чужой карточке или раскрыть слово раньше времени.
 */

export type RevealStep = "privacy" | "revealed" | "pass";

/** Модальные состояния внутри раунда. Пока оверлей открыт, таймер стоит на паузе. */
export type PlayOverlay =
  /** Выбор подозреваемого и решение компании: выгнать или продолжить. */
  | { kind: "suspect"; playerId: number | null }
  /** Итог изгнания: был ли выгнанный шпионом. Слово не показывается. */
  | { kind: "verdict"; playerId: number; wasSpy: boolean; spiesLeft: number }
  /** Игрок заявляет себя шпионом и называет слово вслух. */
  | { kind: "guess"; playerId: number | null }
  /** Шпион не угадал и выбыл. Слово не показывается. */
  | { kind: "guessFailed"; playerId: number; spiesLeft: number };

export type SessionState =
  | { phase: "home" }
  | { phase: "setup" }
  | { phase: "reveal"; round: Round; playerIndex: number; step: RevealStep }
  | { phase: "roundStart"; round: Round }
  | { phase: "playing"; round: Round; overlay: PlayOverlay | null }
  | { phase: "results"; round: Round; outcome: RoundOutcome; revealed: boolean };

export type SessionAction =
  | { type: "GO_HOME" }
  | { type: "GO_SETUP" }
  | { type: "START_ROUND"; round: Round }
  | { type: "REVEAL_CARD" }
  | { type: "HIDE_CARD" }
  | { type: "NEXT_PLAYER" }
  | { type: "BEGIN_ROUND" }
  /* --- внутри раунда --- */
  | { type: "OPEN_SUSPECT" }
  | { type: "SELECT_SUSPECT"; playerId: number }
  | { type: "ELIMINATE_SUSPECT" }
  | { type: "OPEN_GUESS" }
  | { type: "SELECT_GUESSER"; playerId: number }
  | { type: "RESOLVE_GUESS"; correct: boolean }
  /** Закрыть оверлей без последствий («Продолжить игру» / «Отмена»). */
  | { type: "CLOSE_OVERLAY" }
  /** Подтвердить вердикт или провал догадки: продолжить игру или перейти к итогам. */
  | { type: "ACKNOWLEDGE" }
  | { type: "TIME_UP" }
  | { type: "END_ROUND_MANUAL" }
  /* --- итоги --- */
  | { type: "REVEAL_RESULTS" };

export const initialSessionState: SessionState = { phase: "home" };

function finishRound(round: Round, outcome: RoundOutcome): SessionState {
  return { phase: "results", round, outcome, revealed: false };
}

/** Если шпионов не осталось — победа мирных; иначе остаёмся в раунде без оверлея. */
function continueOrFinish(round: Round): SessionState {
  if (spiesRemaining(round) === 0) {
    return finishRound(round, { winner: "civilians", reason: "allSpiesOut" });
  }
  return { phase: "playing", round, overlay: null };
}

/** Исход при истечении времени или ручном завершении. */
function endByTime(round: Round, reason: "timeUp" | "manualEnd"): SessionState {
  if (spiesRemaining(round) > 0) {
    return finishRound(round, { winner: "spies", reason });
  }
  return finishRound(round, { winner: "civilians", reason: "allSpiesOut" });
}

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
      return { phase: "playing", round: state.round, overlay: null };

    /* ---------- Подозрение и изгнание ---------- */

    case "OPEN_SUSPECT":
      if (state.phase !== "playing" || state.overlay !== null) return state;
      return { ...state, overlay: { kind: "suspect", playerId: null } };

    case "SELECT_SUSPECT": {
      if (state.phase !== "playing" || state.overlay?.kind !== "suspect") return state;
      const target = getPlayer(state.round, action.playerId);
      if (!target || target.status !== "active") return state;
      return { ...state, overlay: { kind: "suspect", playerId: action.playerId } };
    }

    case "ELIMINATE_SUSPECT": {
      if (state.phase !== "playing" || state.overlay?.kind !== "suspect" || state.overlay.playerId === null) {
        return state;
      }
      const id = state.overlay.playerId;
      const target = getPlayer(state.round, id);
      if (!target || target.status !== "active") return state;
      const round = eliminatePlayer(state.round, id, "voted");
      return {
        phase: "playing",
        round,
        overlay: { kind: "verdict", playerId: id, wasSpy: target.role === "spy", spiesLeft: spiesRemaining(round) },
      };
    }

    /* ---------- Попытка шпиона назвать слово ---------- */

    case "OPEN_GUESS":
      if (state.phase !== "playing" || state.overlay !== null) return state;
      return { ...state, overlay: { kind: "guess", playerId: null } };

    case "SELECT_GUESSER": {
      if (state.phase !== "playing" || state.overlay?.kind !== "guess") return state;
      const target = getPlayer(state.round, action.playerId);
      if (!target || target.status !== "active") return state;
      return { ...state, overlay: { kind: "guess", playerId: action.playerId } };
    }

    case "RESOLVE_GUESS": {
      if (state.phase !== "playing" || state.overlay?.kind !== "guess" || state.overlay.playerId === null) {
        return state;
      }
      const id = state.overlay.playerId;
      const target = getPlayer(state.round, id);
      if (!target || target.status !== "active") return state;

      // Мирный, назвавшийся шпионом, просто выбывает — его роль он раскрыл сам.
      if (target.role !== "spy") {
        const round = eliminatePlayer(state.round, id, "wrongGuess");
        return {
          phase: "playing",
          round,
          overlay: { kind: "verdict", playerId: id, wasSpy: false, spiesLeft: spiesRemaining(round) },
        };
      }

      if (action.correct) {
        return finishRound(state.round, { winner: "spies", reason: "spyGuessed", playerId: id });
      }

      const round = eliminatePlayer(state.round, id, "wrongGuess");
      return { phase: "playing", round, overlay: { kind: "guessFailed", playerId: id, spiesLeft: spiesRemaining(round) } };
    }

    /* ---------- Общие переходы внутри раунда ---------- */

    case "CLOSE_OVERLAY":
      if (state.phase !== "playing" || state.overlay === null) return state;
      if (state.overlay.kind !== "suspect" && state.overlay.kind !== "guess") return state;
      return { ...state, overlay: null };

    case "ACKNOWLEDGE":
      if (state.phase !== "playing" || state.overlay === null) return state;
      if (state.overlay.kind !== "verdict" && state.overlay.kind !== "guessFailed") return state;
      return continueOrFinish(state.round);

    case "TIME_UP":
      if (state.phase !== "playing") return state;
      return endByTime(state.round, "timeUp");

    case "END_ROUND_MANUAL":
      if (state.phase !== "playing") return state;
      return endByTime(state.round, "manualEnd");

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
