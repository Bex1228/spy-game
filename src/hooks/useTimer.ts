"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TimerStatus = "running" | "paused" | "finished";

interface TimerOptions {
  /** Длительность в мс; null — секундомер без ограничения. */
  durationMs: number | null;
  onFinish?: () => void;
}

interface TimerSnapshot {
  status: TimerStatus;
  elapsedMs: number;
}

const TICK_MS = 100;

/**
 * Таймер на временных метках: точен даже если вкладка уходила в фон,
 * потому что считает не тики, а разницу Date.now().
 */
export function useTimer({ durationMs, onFinish }: TimerOptions) {
  const startRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const [snapshot, setSnapshot] = useState<TimerSnapshot>({ status: "running", elapsedMs: 0 });
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const compute = useCallback(
    (status: TimerStatus): TimerSnapshot => {
      const live = status === "running" && startRef.current !== null ? Date.now() - startRef.current : 0;
      const elapsed = accumulatedRef.current + live;
      if (durationMs !== null && elapsed >= durationMs) {
        return { status: "finished", elapsedMs: durationMs };
      }
      return { status, elapsedMs: elapsed };
    },
    [durationMs],
  );

  useEffect(() => {
    if (snapshot.status !== "running") return;
    if (startRef.current === null) startRef.current = Date.now();
    const id = window.setInterval(() => {
      setSnapshot((prev) => {
        if (prev.status !== "running") return prev;
        const next = compute("running");
        if (next.status === "finished") {
          accumulatedRef.current = next.elapsedMs;
          queueMicrotask(() => onFinishRef.current?.());
        }
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [snapshot.status, compute]);

  const pause = useCallback(() => {
    setSnapshot((prev) => {
      if (prev.status !== "running") return prev;
      if (startRef.current !== null) accumulatedRef.current += Date.now() - startRef.current;
      return { status: "paused", elapsedMs: accumulatedRef.current };
    });
  }, []);

  const resume = useCallback(() => {
    setSnapshot((prev) => {
      if (prev.status !== "paused") return prev;
      startRef.current = Date.now();
      return { status: "running", elapsedMs: accumulatedRef.current };
    });
  }, []);

  const remainingMs = durationMs === null ? null : Math.max(0, durationMs - snapshot.elapsedMs);
  const progress = durationMs === null ? 0 : Math.min(1, snapshot.elapsedMs / durationMs);

  return {
    status: snapshot.status,
    elapsedMs: snapshot.elapsedMs,
    remainingMs,
    /** Доля прошедшего времени 0..1 (для секундомера всегда 0). */
    progress,
    pause,
    resume,
  };
}
