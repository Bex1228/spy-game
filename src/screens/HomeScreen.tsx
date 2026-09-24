"use client";

import { motion } from "framer-motion";
import { HelpCircle, Settings2, SlidersHorizontal, Zap } from "lucide-react";
import { useState } from "react";
import type { GameSettings } from "@/types";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { Sheet } from "@/components/ui/Sheet";
import { Logo } from "@/components/game/Logo";
import { RulesContent } from "@/components/game/RulesContent";
import { SettingsSheet } from "@/components/game/SettingsSheet";
import { pluralize } from "@/utils/format";
import { settingsForQuickPlay } from "@/game/rules";

interface HomeScreenProps {
  settings: GameSettings;
  onQuickPlay: () => void;
  onSetup: () => void;
}

const stagger = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function HomeScreen({ settings, onQuickPlay, onSetup }: HomeScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const quick = settingsForQuickPlay(settings);
  const summary = [
    `${quick.playerCount} ${pluralize(quick.playerCount, ["игрок", "игрока", "игроков"])}`,
    `${quick.spyCount} ${pluralize(quick.spyCount, ["шпион", "шпиона", "шпионов"])}`,
    quick.roundMinutes ? `${quick.roundMinutes} мин` : "без таймера",
    `${quick.categoryIds.length} ${pluralize(quick.categoryIds.length, ["категория", "категории", "категорий"])}`,
  ].join(" · ");

  return (
    <ScreenShell contentClassName="relative overflow-hidden">
      {/* Атмосфера */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60dvh]"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 0%, rgb(230 50 63 / 0.22), transparent 70%), radial-gradient(40% 30% at 50% 30%, rgb(255 255 255 / 0.04), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex items-center justify-end gap-2 pt-1">
        <IconButton label="Как играть" onClick={() => setRulesOpen(true)}>
          <HelpCircle size={20} />
        </IconButton>
        <IconButton label="Настройки" onClick={() => setSettingsOpen(true)}>
          <Settings2 size={20} />
        </IconButton>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center pb-10 text-center">
        <motion.div custom={0} variants={stagger} initial="hidden" animate="show">
          <Logo size={84} />
        </motion.div>

        <motion.h1
          custom={1}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-7 font-display text-[64px] font-extrabold uppercase leading-none tracking-[-0.02em] text-ivory"
          style={{ textShadow: "0 20px 60px rgb(0 0 0 / 0.6)" }}
        >
          Шпион
        </motion.h1>

        <motion.p
          custom={2}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-[280px] text-[15px] leading-relaxed text-ink-300"
        >
          Party-игра для компании. Один телефон, одно слово и кто-то, кто его не знает.
        </motion.p>
      </div>

      <motion.div custom={3} variants={stagger} initial="hidden" animate="show" className="relative flex flex-col gap-3 pb-safe">
        <Button fullWidth onClick={onQuickPlay} leadingIcon={<Zap size={20} strokeWidth={2.4} />}>
          Быстрая игра
        </Button>
        <Button fullWidth variant="secondary" onClick={onSetup} leadingIcon={<SlidersHorizontal size={20} />}>
          Настроить игру
        </Button>
        <p className="mt-1 text-center text-xs text-ink-400">{summary}</p>
      </motion.div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Sheet open={rulesOpen} onClose={() => setRulesOpen(false)} title="Как играть">
        <RulesContent />
      </Sheet>
    </ScreenShell>
  );
}
