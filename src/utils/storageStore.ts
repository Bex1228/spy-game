import { readJson, writeJson } from "./storage";

export interface StorageStore<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (updater: T | ((prev: T) => T)) => void;
}

/**
 * Маленькое внешнее хранилище поверх localStorage для useSyncExternalStore.
 * На сервере отдаёт initial; на клиенте лениво читает и валидирует сохранённое значение.
 */
export function createStorageStore<T>(key: string, sanitize: (raw: unknown) => T, initial: T): StorageStore<T> {
  let cached: T | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (cached === undefined) {
      cached = sanitize(readJson<unknown>(key, undefined));
    }
    return cached;
  };

  const notify = () => listeners.forEach((l) => l());

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) {
      cached = undefined;
      notify();
    }
  };

  return {
    getSnapshot: read,
    getServerSnapshot: () => initial,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") {
        window.addEventListener("storage", onStorage);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
    set(updater) {
      const prev = read();
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      if (Object.is(next, prev)) return;
      cached = next;
      writeJson(key, next);
      notify();
    },
  };
}
