"use client";

import { useEffect, useRef, useState } from "react";

interface TimerOptions {
  /** Длительность в мс; null — секундомер без ограничения. */
  durationMs: number | null;
  /** Пока true — время не идёт (пауза пользователя, открытый оверлей и т.п.). */
  paused: boolean;
  onFinish?: () => void;
}

const TICK_MS = 100;

/**
 * Декларативный таймер на временных метках: точен даже если вкладка уходила в фон,
 * потому что считает не тики, а разницу Date.now(). Пауза управляется пропсом.
 */
export function useTimer({ durationMs, paused, onFinish }: TimerOptions) {
  const accumulatedRef = useRef(0);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (paused || finishedRef.current) return;

    const startedAt = Date.now();
    let stopped = false;

    const tick = () => {
      const elapsed = accumulatedRef.current + (Date.now() - startedAt);
      if (durationMs !== null && elapsed >= durationMs) {
        stopped = true;
        finishedRef.current = true;
        accumulatedRef.current = durationMs;
        window.clearInterval(id);
        setElapsedMs(durationMs);
        setFinished(true);
        onFinishRef.current?.();
        return;
      }
      setElapsedMs(elapsed);
    };

    const id = window.setInterval(tick, TICK_MS);

    return () => {
      window.clearInterval(id);
      if (!stopped) accumulatedRef.current += Date.now() - startedAt;
    };
  }, [paused, durationMs]);

  const remainingMs = durationMs === null ? null : Math.max(0, durationMs - elapsedMs);
  const progress = durationMs === null ? 0 : Math.min(1, elapsedMs / durationMs);

  return { elapsedMs, remainingMs, progress, finished };
}
