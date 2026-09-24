"use client";

import { useEffect } from "react";

/** Не даёт экрану гаснуть во время раунда (Screen Wake Lock API, если доступен). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) await sentinel.release();
      } catch {
        // Wake lock — приятный бонус; без него игра работает
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => undefined);
    };
  }, [active]);
}
