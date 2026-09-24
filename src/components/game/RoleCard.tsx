"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EyeOff, Fingerprint } from "lucide-react";
import type { RoundPlayer, Round } from "@/types";
import { useHoldGesture } from "@/hooks/useHoldGesture";
import { HOLD_TO_REVEAL_MS } from "@/game/rules";
import { cn } from "@/utils/cn";

interface RoleCardProps {
  player: RoundPlayer;
  round: Round;
  revealed: boolean;
  onReveal: () => void;
}

function wordSizeClass(word: string): string {
  const longest = Math.max(...word.split(/\s+/).map((w) => w.length));
  if (longest <= 6 && word.length <= 8) return "text-[46px] leading-[1.02]";
  if (longest <= 9 && word.length <= 12) return "text-[36px] leading-[1.05]";
  if (longest <= 12) return "text-[28px] leading-[1.1]";
  return "text-[22px] leading-[1.15]";
}

/**
 * Карточка роли. Спереди — закрытая сторона с «удерживай, чтобы открыть»,
 * сзади — роль. Содержимое роли монтируется только после раскрытия.
 */
export function RoleCard({ player, round, revealed, onReveal }: RoleCardProps) {
  const reduced = useReducedMotion();
  const { holding, progress, bind } = useHoldGesture({
    durationMs: HOLD_TO_REVEAL_MS,
    onComplete: onReveal,
    disabled: revealed,
  });

  const isSpy = player.role === "spy";

  return (
    <div
      className="mx-auto perspective-distant no-select"
      style={{ width: "min(100%, 330px, calc(54dvh * 5 / 7))" }}
    >
      <motion.div
        className="relative aspect-[5/7] w-full transform-3d"
        animate={{ rotateY: revealed ? 180 : 0, scale: holding && !revealed ? 1.03 : 1 }}
        transition={
          reduced
            ? { duration: 0 }
            : { rotateY: { type: "spring", stiffness: 190, damping: 24 }, scale: { type: "spring", stiffness: 400, damping: 26 } }
        }
      >
        {/* Закрытая сторона */}
        <button
          type="button"
          aria-label="Нажми и удерживай, чтобы открыть карточку"
          aria-pressed={holding}
          disabled={revealed}
          {...bind}
          className={cn(
            "absolute inset-0 flex touch-none flex-col items-center justify-center overflow-hidden rounded-[30px] border text-left backface-hidden",
            "border-white/10 bg-ink-800 shadow-card transition-colors duration-200",
            holding && "border-accent-500/50",
          )}
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 50% 0%, rgb(255 255 255 / 0.06), transparent 60%)," +
              "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.028) 0 2px, transparent 2px 14px)",
          }}
        >
          <div className="absolute inset-3 rounded-[22px] border border-white/6" aria-hidden />
          <div className="absolute top-6 left-0 right-0 flex justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Секретно</span>
          </div>

          <div className="relative flex h-[132px] w-[132px] items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="var(--color-accent-400)"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - progress}
                style={{ transition: holding ? "none" : "stroke-dashoffset 220ms ease-out" }}
              />
            </svg>
            <motion.span
              animate={{ scale: holding ? 1.08 : 1, opacity: holding ? 1 : 0.85 }}
              className="flex h-[92px] w-[92px] items-center justify-center rounded-full border border-white/8 bg-ink-900 text-ink-200 shadow-float"
            >
              <Fingerprint size={44} strokeWidth={1.6} />
            </motion.span>
          </div>

          <div className="mt-7 text-center">
            <div className="text-[15px] font-semibold text-ink-100">{holding ? "Держи…" : "Нажми и удерживай"}</div>
            <div className="mt-1 text-xs text-ink-400">чтобы открыть карточку</div>
          </div>
        </button>

        {/* Открытая сторона: контент существует только после раскрытия */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-[30px] border backface-hidden rotate-y-180",
            isSpy
              ? "border-accent-400/40 bg-gradient-to-b from-accent-600 via-accent-700 to-accent-900 shadow-[0_30px_70px_-20px_rgb(230_50_63/0.55)]"
              : "border-white/12 bg-gradient-to-b from-ink-700 via-ink-800 to-ink-900 shadow-card",
          )}
          aria-live="polite"
        >
          {revealed ? (
            isSpy ? (
              <SpyFace />
            ) : (
              <CivilianFace word={round.word} category={round.categoryName} />
            )
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

const contentEnter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function CivilianFace({ word, category }: { word: string; category: string }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-between px-6 py-7 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(90% 60% at 50% 100%, rgb(245 239 228 / 0.07), transparent 65%)" }}
        aria-hidden
      />
      <div className="absolute inset-3 rounded-[22px] border border-white/8" aria-hidden />
      <motion.div {...contentEnter} transition={{ delay: 0.25, duration: 0.3 }} className="relative">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Категория</div>
        <div className="mt-1.5 text-[15px] font-semibold text-ink-200">{category}</div>
      </motion.div>

      <motion.div {...contentEnter} transition={{ delay: 0.32, duration: 0.35 }} className="relative w-full">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Секретное слово</div>
        <div
          data-testid="secret-word"
          className={cn(
            "mt-3 font-display font-bold uppercase text-ivory text-balance break-words",
            wordSizeClass(word),
          )}
          style={{ textShadow: "0 8px 30px rgb(0 0 0 / 0.5)" }}
        >
          {word}
        </div>
      </motion.div>

      <motion.div {...contentEnter} transition={{ delay: 0.42, duration: 0.3 }} className="relative text-xs text-ink-400">
        Запомни слово и не произноси его вслух
      </motion.div>
    </div>
  );
}

function SpyFace() {
  return (
    <div className="relative flex h-full flex-col items-center justify-between px-6 py-7 text-center text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(80% 50% at 50% 0%, rgb(255 255 255 / 0.12), transparent 60%)" }}
        aria-hidden
      />
      <div className="absolute inset-3 rounded-[22px] border border-white/15" aria-hidden />
      <motion.div {...contentEnter} transition={{ delay: 0.25, duration: 0.3 }} className="relative">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Твоя роль</div>
      </motion.div>

      <motion.div
        {...contentEnter}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="relative flex flex-col items-center"
      >
        <span className="mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-float">
          <EyeOff size={36} strokeWidth={1.8} />
        </span>
        <div className="font-display text-[40px] font-bold uppercase leading-none tracking-tight">
          Ты <br /> шпион
        </div>
        <div className="mt-4 text-[15px] font-semibold text-white/85">Не выдай себя</div>
      </motion.div>

      <motion.div {...contentEnter} transition={{ delay: 0.42, duration: 0.3 }} className="relative text-xs text-white/70">
        Слушай ассоциации и угадай слово
      </motion.div>
    </div>
  );
}
