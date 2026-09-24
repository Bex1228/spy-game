"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { GameSettings, UiPreferences } from "@/types";
import { STORAGE_KEYS } from "@/utils/storage";
import { createStorageStore, type StorageStore } from "@/utils/storageStore";
import { defaultSettings, sanitizeSettings } from "@/game/rules";
import { sanitizeHistory } from "@/game/wordHistory";

function useStore<T>(store: StorageStore<T>): [T, StorageStore<T>["set"]] {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.set];
}

/* ---------- Настройки игры ---------- */

const settingsStore = createStorageStore<GameSettings>(STORAGE_KEYS.settings, sanitizeSettings, defaultSettings());

export function useGameSettings() {
  const [settings, set] = useStore(settingsStore);
  const update = useCallback((patch: Partial<GameSettings> | ((prev: GameSettings) => GameSettings)) => {
    set((prev) => sanitizeSettings(typeof patch === "function" ? patch(prev) : { ...prev, ...patch }));
  }, [set]);
  const reset = useCallback(() => set(defaultSettings()), [set]);
  return { settings, update, reset };
}

/* ---------- Настройки интерфейса ---------- */

const defaultPreferences: UiPreferences = { vibration: true };

function sanitizePreferences(raw: unknown): UiPreferences {
  if (!raw || typeof raw !== "object") return defaultPreferences;
  const r = raw as Partial<UiPreferences>;
  return { vibration: typeof r.vibration === "boolean" ? r.vibration : defaultPreferences.vibration };
}

const preferencesStore = createStorageStore<UiPreferences>(
  STORAGE_KEYS.preferences,
  sanitizePreferences,
  defaultPreferences,
);

export function usePreferences() {
  const [preferences, set] = useStore(preferencesStore);
  const update = useCallback((patch: Partial<UiPreferences>) => set((prev) => ({ ...prev, ...patch })), [set]);
  return { preferences, update };
}

/* ---------- История недавних слов ---------- */

const recentWordsStore = createStorageStore<string[]>(STORAGE_KEYS.recentWords, sanitizeHistory, []);

export function useRecentWords() {
  const [recentWords, set] = useStore(recentWordsStore);
  const clear = useCallback(() => set([]), [set]);
  return { recentWords, setRecentWords: set, clear };
}
