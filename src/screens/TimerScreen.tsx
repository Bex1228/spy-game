"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flag, Megaphone, Pause, Play, Search, TimerOff } from "lucide-react";
import { useState, type Dispatch } from "react";
import type { Round } from "@/types";
import type { PlayOverlay, SessionAction } from "@/game/session";
import { activePlayers, eliminatedPlayers, spiesRemaining } from "@/game/roundState";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { TimerRing } from "@/components/game/TimerRing";
import { RoundOverlays } from "@/components/game/RoundOverlays";
import { useTimer } from "@/hooks/useTimer";
import { useWakeLock } from "@/hooks/useWakeLock";
import { HAPTIC, useVibrate } from "@/hooks/useVibrate";
import { formatClock } from "@/utils/format";
import { cn } from "@/utils/cn";

interface TimerScreenProps {
  round: Round;
  overlay: PlayOverlay | null;
  dispatch: Dispatch<SessionAction>;
}

const TENSE_MS = 30_000;
const CRITICAL_MS = 10_000;

export function TimerScreen({ round, overlay, dispatch }: TimerScreenProps) {
  const vibrate = useVibrate();
  const reduced = useReducedMotion();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const durationMs = round.roundMinutes ? round.roundMinutes * 60_000 : null;
  const overlayOpen = overlay !== null;
  const timer = useTimer({
    durationMs,
    paused: userPaused || overlayOpen || confirmOpen,
    onFinish: () => vibrate(HAPTIC.finish),
  });

  const finished = timer.finished;
  const paused = !finished && (userPaused || overlayOpen || confirmOpen);
  useWakeLock(!paused && !finished);

  const starter = round.players.find((p) => p.id === round.starterId) ?? round.players[0];
  const alive = activePlayers(round);
  const out = eliminatedPlayers(round);
  const spiesLeft = spiesRemaining(round);

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
        style={{ background: "radial-gradient(80% 55% at 50% 40%, rgb(230 50 63 / 0.28), transparent 70%)" }}
        animate={
          critical && !paused && !reduced ? { opacity: [0.5, 1, 0.5] } : { opacity: tense && !paused ? 0.6 : 0 }
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

      <div className="relative flex flex-1 flex-col items-center justify-center py-4">
        <TimerRing fraction={finished ? 0 : fraction} tense={tense} paused={paused} size="sm">
          <motion.div
            aria-live={critical ? "assertive" : "off"}
            animate={critical && !paused && !reduced ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={critical && !paused ? { repeat: Infinity, duration: 1, ease: "easeInOut" } : undefined}
            className={cn(
              "font-display text-[48px] font-bold tabular leading-none tracking-tight transition-colors duration-500",
              tense ? "text-accent-300" : "text-ivory",
              paused && "opacity-60",
            )}
          >
            {clock}
          </motion.div>
          <div className="mt-1.5 text-xs font-medium text-ink-400">{durationMs === null ? "прошло" : "осталось"}</div>
        </TimerRing>

        <p className="mt-6 max-w-[290px] text-center text-[14px] leading-relaxed text-ink-300 text-balance">
          Называйте ассоциации по очереди. Не произносите секретное слово.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold text-ink-300">
          <span className="rounded-full border border-white/8 bg-ink-850 px-3 py-1.5">
            Начинает: <span className="text-ink-100">{starter.name}</span>
          </span>
          <span className="rounded-full border border-white/8 bg-ink-850 px-3 py-1.5">
            В игре: <span className="text-ink-100">{alive.length}</span> из {round.players.length}
          </span>
          <span className="rounded-full border border-white/8 bg-ink-850 px-3 py-1.5">
            Шпионов: <span className="text-ink-100">{spiesLeft}</span>
          </span>
        </div>
        {out.length > 0 ? (
          <p className="mt-2 text-center text-xs text-ink-400">Выбыли: {out.map((p) => p.name).join(", ")}</p>
        ) : null}
      </div>

      <div className="relative flex flex-col gap-2 pb-safe">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="md"
            className="px-3 text-[14px]"
            disabled={finished}
            onClick={() => dispatch({ type: "OPEN_SUSPECT" })}
            leadingIcon={<Search size={18} />}
          >
            Подозреваем
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="px-3 text-[14px]"
            disabled={finished}
            onClick={() => dispatch({ type: "OPEN_GUESS" })}
            leadingIcon={<Megaphone size={18} />}
          >
            Назвать слово
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setUserPaused((v) => !v)}
            disabled={finished || overlayOpen}
            leadingIcon={userPaused ? <Play size={18} /> : <Pause size={18} />}
          >
            {userPaused ? "Продолжить" : "Пауза"}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setConfirmOpen(true)}
            disabled={finished || overlayOpen}
            leadingIcon={<Flag size={18} />}
          >
            Завершить
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Завершить раунд?"
        description={
          spiesLeft > 0
            ? "Если хотя бы один шпион не найден, победа достанется шпионам. Слово будет показано только на экране результатов."
            : "Все шпионы уже раскрыты — переходим к результатам."
        }
        confirmLabel="Завершить раунд"
        destructive={spiesLeft > 0}
        onConfirm={() => {
          setConfirmOpen(false);
          dispatch({ type: "END_ROUND_MANUAL" });
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <RoundOverlays round={round} overlay={overlay} dispatch={dispatch} />

      <AnimatePresence>
        {finished ? (
          <motion.div
            key="finished"
            role="dialog"
            aria-modal="true"
            aria-label="Время вышло"
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink-950/92 px-6 text-center backdrop-blur-sm"
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
            <p className="mt-5 max-w-[280px] text-[15px] leading-relaxed text-ink-300">
              {spiesLeft > 0
                ? spiesLeft === 1
                  ? "Шпион остался нераскрытым — побеждают шпионы."
                  : "Шпионы остались нераскрытыми — побеждают шпионы."
                : "Все шпионы раскрыты — побеждают мирные."}
            </p>
            <div className="mt-10 w-full">
              <Button fullWidth onClick={() => dispatch({ type: "TIME_UP" })}>
                К результатам
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ScreenShell>
  );
}
