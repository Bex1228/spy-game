"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Home, RefreshCw, SlidersHorizontal, UserX } from "lucide-react";
import type { Round } from "@/types";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { pluralize } from "@/utils/format";

interface ResultsScreenProps {
  round: Round;
  revealed: boolean;
  onReveal: () => void;
  onNewRound: () => void;
  onSettings: () => void;
  onHome: () => void;
}

export function ResultsScreen({ round, revealed, onReveal, onNewRound, onSettings, onHome }: ResultsScreenProps) {
  const spies = round.players.filter((p) => p.role === "spy");

  return (
    <ScreenShell
      contentClassName="relative overflow-hidden"
      footer={
        revealed ? (
          <div className="flex flex-col gap-2">
            <Button fullWidth onClick={onNewRound} leadingIcon={<RefreshCw size={20} />}>
              Ещё раунд
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="md" onClick={onSettings} leadingIcon={<SlidersHorizontal size={18} />}>
                Настройки
              </Button>
              <Button variant="secondary" size="md" onClick={onHome} leadingIcon={<Home size={18} />}>
                На главную
              </Button>
            </div>
          </div>
        ) : (
          <Button fullWidth onClick={onReveal} leadingIcon={<Eye size={20} />}>
            Раскрыть
          </Button>
        )
      }
    >
      <AnimatePresence>
        {revealed ? (
          <motion.div
            key="glow"
            className="pointer-events-none absolute inset-x-0 top-0 h-[55dvh]"
            style={{ background: "radial-gradient(70% 50% at 50% 0%, rgb(230 50 63 / 0.25), transparent 70%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>

      <div className="relative flex flex-1 flex-col pt-3">
        <div className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400">Раунд окончен</div>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/8 bg-ink-850 text-ivory shadow-float">
                <UserX size={42} strokeWidth={1.5} />
              </div>
              <h1 className="mt-8 font-display text-[32px] font-bold leading-tight text-ivory">
                Кто был
                <br />
                шпионом?
              </h1>
              <p className="mt-4 max-w-[270px] text-[15px] leading-relaxed text-ink-300">
                Сначала проголосуйте всей компанией, потом раскройте ответ.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col justify-center gap-4 py-6"
            >
              <motion.section
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 26 }}
                className="rounded-[28px] border border-accent-400/40 bg-gradient-to-b from-accent-600 via-accent-700 to-accent-900 p-6 text-center text-white shadow-[0_30px_70px_-20px_rgb(230_50_63/0.55)]"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
                  {pluralize(spies.length, ["Шпион", "Шпионы", "Шпионы"])}
                </div>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {spies.map((s, i) => (
                    <motion.li
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.12 }}
                      className="break-words font-display text-[30px] font-extrabold leading-tight"
                    >
                      {s.name}
                    </motion.li>
                  ))}
                </ul>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="rounded-[28px] border border-white/8 bg-ink-850 p-6 text-center"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Секретное слово</div>
                <div className="mt-2 break-words font-display text-[30px] font-bold uppercase leading-tight text-ivory text-balance">
                  {round.word}
                </div>
                <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Категория</div>
                <div className="mt-1.5 text-[15px] font-semibold text-ink-200">{round.categoryName}</div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScreenShell>
  );
}
