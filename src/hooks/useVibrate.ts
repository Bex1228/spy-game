"use client";

import { useCallback } from "react";
import { usePreferences } from "./useStoredData";

export const HAPTIC = {
  tap: 10,
  reveal: [12, 40, 24] as number[],
  finish: [220, 90, 220, 90, 420] as number[],
  warning: [60, 40, 60] as number[],
};

/** Вибрация через Vibration API — только если устройство поддерживает и пользователь не отключил. */
export function useVibrate() {
  const { preferences } = usePreferences();
  return useCallback(
    (pattern: number | number[]) => {
      if (!preferences.vibration) return;
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(pattern);
        }
      } catch {
        // некоторые браузеры бросают при вызове без user gesture — это не ошибка игры
      }
    },
    [preferences.vibration],
  );
}
