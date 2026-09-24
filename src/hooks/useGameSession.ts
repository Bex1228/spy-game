"use client";

import { useCallback, useReducer } from "react";
import type { GameSettings } from "@/types";
import { createRound } from "@/game/round";
import { initialSessionState, sessionReducer } from "@/game/session";
import { pushRecentWord } from "@/game/wordHistory";
import { useRecentWords } from "./useStoredData";

/**
 * Состояние текущей игровой сессии. Раунд живёт только в памяти —
 * роли никогда не пишутся в localStorage.
 */
export function useGameSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const { recentWords, setRecentWords } = useRecentWords();

  const startRound = useCallback(
    (settings: GameSettings) => {
      const round = createRound({ settings, recentWords });
      setRecentWords((prev) => pushRecentWord(prev, round.categoryId, round.word));
      dispatch({ type: "START_ROUND", round });
    },
    [recentWords, setRecentWords],
  );

  return { state, dispatch, startRound };
}
