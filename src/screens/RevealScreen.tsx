"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, EyeOff, Smartphone } from "lucide-react";
import type { Round } from "@/types";
import type { RevealStep } from "@/game/session";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { RoleCard } from "@/components/game/RoleCard";
import { HAPTIC, useVibrate } from "@/hooks/useVibrate";

interface RevealScreenProps {
  round: Round;
  playerIndex: number;
  step: RevealStep;
  onReveal: () => void;
  onHide: () => void;
  onNext: () => void;
}

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8, filter: "blur(10px)" },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

export function RevealScreen({ round, playerIndex, step, onReveal, onHide, onNext }: RevealScreenProps) {
  const vibrate = useVibrate();
  const player = round.players[playerIndex];
  const total = round.players.length;
  const nextPlayer = round.players[playerIndex + 1];
  const revealed = step === "revealed";

  const handleReveal = () => {
    vibrate(HAPTIC.reveal);
    onReveal();
  };

  return (
    <ScreenShell contentClassName="relative">
      {/* Индикатор прогресса раздачи */}
      <div className="flex items-center gap-1.5 pt-1" aria-label={`Игрок ${playerIndex + 1} из ${total}`}>
        {round.players.map((p, i) => (
          <span
            key={p.id}
            className={
              "h-1 flex-1 rounded-full transition-colors duration-300 " +
              (i < playerIndex ? "bg-ink-400" : i === playerIndex ? "bg-accent-400" : "bg-ink-700")
            }
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step !== "pass" ? (
          <motion.div key={`card-${player.id}`} {...fade} className="flex flex-1 flex-col">
            <div className="pt-7 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400">
                Игрок {playerIndex + 1} из {total}
              </div>
              <h1 className="mt-2 font-display text-[30px] font-bold leading-tight text-ivory">{player.name}</h1>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={revealed ? "r" : "p"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-[15px] text-ink-300"
                >
                  {revealed ? "Запомни и скрой карточку" : "Убедись, что никто не смотрит"}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-1 items-center py-6">
              <RoleCard player={player} round={round} revealed={revealed} onReveal={handleReveal} />
            </div>

            <div className="min-h-[76px] pb-safe">
              <AnimatePresence mode="wait" initial={false}>
                {revealed ? (
                  <motion.div
                    key="hide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Button fullWidth onClick={onHide} leadingIcon={<EyeOff size={20} />}>
                      Скрыть карточку
                    </Button>
                  </motion.div>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pt-4 text-center text-xs text-ink-400"
                  >
                    Карточка откроется только после удержания
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div key="pass" {...fade} className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
                className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/8 bg-ink-850 text-ivory shadow-float"
              >
                {nextPlayer ? <Smartphone size={40} strokeWidth={1.6} /> : <Check size={42} strokeWidth={2} />}
                {nextPlayer ? (
                  <motion.span
                    className="absolute -right-2 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-white shadow-glow-accent"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  >
                    <ArrowRight size={18} strokeWidth={2.6} />
                  </motion.span>
                ) : null}
              </motion.div>

              {nextPlayer ? (
                <>
                  <h1 className="mt-8 font-display text-[26px] font-bold leading-tight text-ivory">
                    Передай телефон
                    <br />
                    следующему игроку
                  </h1>
                  <p className="mt-4 text-[15px] text-ink-300">Следующий:</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink-100">{nextPlayer.name}</p>
                </>
              ) : (
                <>
                  <h1 className="mt-8 font-display text-[26px] font-bold leading-tight text-ivory">
                    Все роли розданы
                  </h1>
                  <p className="mt-4 max-w-[260px] text-[15px] leading-relaxed text-ink-300">
                    Положи телефон так, чтобы все видели экран.
                  </p>
                </>
              )}
            </div>

            <div className="pb-safe">
              <Button fullWidth onClick={onNext}>
                {nextPlayer ? "Готово" : "Продолжить"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  );
}
