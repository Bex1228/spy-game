"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flag, Pause, Play, TimerOff } from "lucide-react";
import { useState } from "react";
import type { Round } from "@/types";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { TimerRing } from "@/components/game/TimerRing";
import { useTimer } from "@/hooks/useTimer";
import { useWakeLock } from "@/hooks/useWakeLock";
import { HAPTIC, useVibrate } from "@/hooks/useVibrate";
import { formatClock } from "@/utils/format";
import { cn } from "@/utils/cn";

interface TimerScreenProps {
  round: Round;
  onEnd: () => void;
}

const TENSE_MS = 30_000;
const CRITICAL_MS = 10_000;

export function TimerScreen({ round, onEnd }: TimerScreenProps) {
  const vibrate = useVibrate();
  const reduced = useReducedMotion();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const durationMs = round.roundMinutes ? round.roundMinutes * 60_000 : null;
  const timer = useTimer({
    durationMs,
    onFinish: () => vibrate(HAPTIC.finish),
  });

  useWakeLock(timer.status === "running");

  const starter = round.players.find((p) => p.id === round.starterId) ?? round.players[0];
  const finished = timer.status === "finished";
  const paused = timer.status === "paused";

  const remaining = timer.remainingMs ?? 0;
  const tense = durationMs !== null && !finished && remaining <= TENSE_MS;
  const critical = durationMs !== null && !finished && remaining <= CRITICAL_MS;

  const clock = durationMs !== null ? formatClock(remaining) : formatClock(timer.elapsedMs);
  // Для секундомера кольцо показывает секунды текущей минуты.
  const fraction = durationMs !== null ? 1 - timer.progress : (timer.elapsedMs % 60_000) / 60_000;

  return (
    <ScreenShell contentClassName="relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(80% 55% at 50% 45%, rgb(230 50 63 / 0.28), transparent 70%)" }}
        animate={
          critical && !paused && !reduced
            ? { opacity: [0.5, 1, 0.5] }
            : { opacity: tense && !paused ? 0.6 : 0 }
        }
        transition={critical && !paused ? { repeat: Infinity, duration: 1, ease: "easeInOut" } : { duration: 0.6 }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between pt-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400">
          {finished ? "Время вышло" : paused ? "Пауза" : "Раунд идёт"}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-ink-850 px-3 py-1.5 text-xs font-semibold text-ink-200">
          {durationMs === null ? (
            <>
              <TimerOff size={14} /> Без таймера
            </>
          ) : (
            <>{round.roundMinutes} мин</>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-6">
        <TimerRing fraction={finished ? 0 : fraction} tense={tense} paused={paused}>
          <motion.div
            aria-live={critical ? "assertive" : "off"}
            animate={critical && !paused && !reduced ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={critical && !paused ? { repeat: Infinity, duration: 1, ease: "easeInOut" } : undefined}
            className={cn(
              "font-display text-[56px] font-bold tabular leading-none tracking-tight transition-colors duration-500",
              tense ? "text-accent-300" : "text-ivory",
              paused && "opacity-60",
            )}
          >
            {clock}
          </motion.div>
          <div className="mt-2 text-xs font-medium text-ink-400">{durationMs === null ? "прошло" : "осталось"}</div>
        </TimerRing>

        <div className="mt-9 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400">Начинает</div>
          <div className="mt-1.5 font-display text-xl font-bold text-ink-100">{starter.name}</div>
        </div>
      </div>

      <div className="relative flex flex-col gap-3 pb-safe">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={paused ? timer.resume : timer.pause}
            disabled={finished}
            leadingIcon={paused ? <Play size={20} /> : <Pause size={20} />}
          >
            {paused ? "Продолжить" : "Пауза"}
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setConfirmOpen(true)}
            disabled={finished}
            leadingIcon={<Flag size={20} />}
          >
            Завершить
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Завершить раунд?"
        description="Таймер остановится, и вы перейдёте к результатам."
        confirmLabel="Завершить раунд"
        onConfirm={() => {
          setConfirmOpen(false);
          onEnd();
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <AnimatePresence>
        {finished ? (
          <motion.div
            key="finished"
            role="dialog"
            aria-modal="true"
            aria-label="Время вышло"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ink-950/92 px-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="font-display text-[44px] font-extrabold uppercase leading-none text-accent-400"
              style={{ textShadow: "0 0 40px rgb(230 50 63 / 0.5)" }}
            >
              Время
              <br />
              вышло
            </motion.div>
            <p className="mt-5 max-w-[260px] text-[15px] leading-relaxed text-ink-300">
              Обсудите, кто вёл себя подозрительно, и голосуйте.
            </p>
            <div className="mt-10 w-full">
              <Button fullWidth onClick={onEnd}>
                К результатам
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ScreenShell>
  );
}
