"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, SyntheticEvent } from "react";

interface HoldOptions {
  durationMs: number;
  onComplete: () => void;
  disabled?: boolean;
}

/**
 * «Нажми и удерживай»: прогресс 0..1, завершение по истечении durationMs.
 * Работает с pointer-событиями и клавиатурой (Space / Enter).
 */
export function useHoldGesture({ durationMs, onComplete, disabled = false }: HoldOptions) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    stopLoop();
    if (doneRef.current) return;
    setHolding(false);
    setProgress(0);
  }, [stopLoop]);

  const start = useCallback(() => {
    if (disabled || doneRef.current || rafRef.current !== null) return;
    startRef.current = performance.now();
    setHolding(true);
    const loop = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / durationMs);
      setProgress(p);
      if (p >= 1) {
        doneRef.current = true;
        rafRef.current = null;
        setHolding(false);
        onCompleteRef.current();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [disabled, durationMs]);

  useEffect(() => stopLoop, [stopLoop]);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      start();
    },
    [start],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        start();
      }
    },
    [start],
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === " " || e.key === "Enter") cancel();
    },
    [cancel],
  );

  const preventDefault = useCallback((e: SyntheticEvent) => e.preventDefault(), []);

  return {
    holding,
    progress,
    bind: {
      onPointerDown,
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
      onKeyDown,
      onKeyUp,
      onBlur: cancel,
      onContextMenu: preventDefault,
      onDragStart: preventDefault,
    },
  };
}
