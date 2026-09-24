"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Home, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { Round, RoundOutcome, RoundPlayer } from "@/types";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getPlayer } from "@/game/roundState";
import { cn } from "@/utils/cn";

interface ResultsScreenProps {
  round: Round;
  outcome: RoundOutcome;
  revealed: boolean;
  onReveal: () => void;
  onNewRound: () => void;
  onSettings: () => void;
  onHome: () => void;
}

function reasonText(round: Round, outcome: RoundOutcome): string {
  switch (outcome.reason) {
    case "allSpiesOut":
      return round.spyCount > 1 ? "Все шпионы раскрыты" : "Шпион раскрыт";
    case "spyGuessed": {
      const name = outcome.playerId !== undefined ? getPlayer(round, outcome.playerId)?.name : undefined;
      return name ? `${name} угадал секретное слово` : "Шпион угадал секретное слово";
    }
    case "timeUp":
      return "Время вышло, шпион остался нераскрытым";
    case "manualEnd":
      return "Раунд завершён, шпион остался нераскрытым";
  }
}

function spyStatus(p: RoundPlayer, outcome: RoundOutcome): string {
  if (outcome.reason === "spyGuessed" && outcome.playerId === p.id) return "угадал слово";
  if (p.status === "eliminated") return p.eliminationReason === "wrongGuess" ? "ошибся со словом" : "найден игроками";
  return "не раскрыт";
}

export function ResultsScreen({ round, outcome, revealed, onReveal, onNewRound, onSettings, onHome }: ResultsScreenProps) {
  const spies = round.players.filter((p) => p.role === "spy");
  const wronglyOut = round.players.filter((p) => p.role === "civilian" && p.status === "eliminated");
  const spiesWon = outcome.winner === "spies";

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
            Показать слово и роли
          </Button>
        )
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[55dvh]"
        style={{
          background: spiesWon
            ? "radial-gradient(70% 50% at 50% 0%, rgb(230 50 63 / 0.28), transparent 70%)"
            : "radial-gradient(70% 50% at 50% 0%, rgb(245 239 228 / 0.12), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col pt-3">
        <div className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400">Раунд окончен</div>

        {/* Победитель — всегда сверху и крупно */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
          className="mt-8 text-center"
        >
          <h1
            className={cn(
              "font-display text-[40px] font-extrabold uppercase leading-[1.02] text-balance",
              spiesWon ? "text-accent-400" : "text-ivory",
            )}
            style={{ textShadow: spiesWon ? "0 0 40px rgb(230 50 63 / 0.45)" : "0 20px 50px rgb(0 0 0 / 0.6)" }}
          >
            {spiesWon ? "Шпионы победили" : "Мирные победили"}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-ink-300">{reasonText(round, outcome)}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <p className="max-w-[280px] text-[15px] leading-relaxed text-ink-400">
                Секретное слово и роли всех игроков скрыты до нажатия кнопки.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col justify-center gap-3 py-6"
            >
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.35 }}
                className="rounded-[28px] border border-white/8 bg-ink-850 p-6 text-center"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Секретное слово</div>
                <div
                  data-testid="result-word"
                  className="mt-2 break-words font-display text-[30px] font-bold uppercase leading-tight text-ivory text-balance"
                >
                  {round.word}
                </div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400">Категория</div>
                <div className="mt-1.5 text-[15px] font-semibold text-ink-200">{round.categoryName}</div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 26 }}
                className="rounded-[28px] border border-accent-400/40 bg-gradient-to-b from-accent-600 via-accent-700 to-accent-900 p-5 text-white shadow-[0_30px_70px_-20px_rgb(230_50_63/0.55)]"
              >
                <div className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
                  {spies.length > 1 ? "Шпионы" : "Шпион"}
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {spies.map((s, i) => (
                    <motion.li
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-2.5"
                    >
                      <span className="min-w-0 truncate font-display text-lg font-bold">{s.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-white/75">{spyStatus(s, outcome)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.section>

              {wronglyOut.length > 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="px-2 text-center text-xs leading-relaxed text-ink-400"
                >
                  Выгнаны по ошибке: {wronglyOut.map((p) => p.name).join(", ")}
                </motion.p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScreenShell>
  );
}
