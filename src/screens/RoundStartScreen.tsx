"use client";

import { motion } from "framer-motion";
import { MessageCircleQuestion, Play, Timer, TimerOff } from "lucide-react";
import type { Round } from "@/types";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { formatMinutes } from "@/utils/format";

interface RoundStartScreenProps {
  round: Round;
  onBegin: () => void;
}

export function RoundStartScreen({ round, onBegin }: RoundStartScreenProps) {
  const starter = round.players.find((p) => p.id === round.starterId) ?? round.players[0];

  return (
    <ScreenShell
      contentClassName="relative overflow-hidden"
      footer={
        <Button fullWidth onClick={onBegin} leadingIcon={<Play size={20} />}>
          Начать раунд
        </Button>
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50dvh]"
        style={{ background: "radial-gradient(70% 50% at 50% 0%, rgb(245 239 228 / 0.08), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-white/8 bg-ink-850 text-ivory shadow-float"
        >
          <MessageCircleQuestion size={36} strokeWidth={1.7} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400"
        >
          Первым задаёт вопрос
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 max-w-full break-words px-2 font-display text-[40px] font-extrabold leading-[1.05] text-ivory"
          style={{ textShadow: "0 20px 50px rgb(0 0 0 / 0.6)" }}
        >
          {starter.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 max-w-[280px] text-[15px] leading-relaxed text-ink-300"
        >
          Задай вопрос любому игроку. Тот, кто ответил, спрашивает следующим.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/8 bg-ink-850 px-4 py-2 text-sm font-semibold text-ink-200"
        >
          {round.roundMinutes ? <Timer size={16} /> : <TimerOff size={16} />}
          {round.roundMinutes ? formatMinutes(round.roundMinutes) : "Без таймера"}
        </motion.div>
      </div>
    </ScreenShell>
  );
}
