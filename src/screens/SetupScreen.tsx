"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Play, TimerOff, User } from "lucide-react";
import { useState } from "react";
import type { GameSettings, RoundMinutes } from "@/types";
import { BUILTIN_CATEGORIES, getAllCategoryIds } from "@/data";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Stepper } from "@/components/ui/Stepper";
import { TextField } from "@/components/ui/TextField";
import { CategoryTile } from "@/components/game/CategoryTile";
import { useGameSettings } from "@/hooks/useStoredData";
import { MAX_PLAYERS, MIN_PLAYERS, MIN_SPIES, ROUND_PRESETS, canStartGame, maxSpiesFor } from "@/game/rules";
import { defaultPlayerName } from "@/game/players";
import { pluralize } from "@/utils/format";

interface SetupScreenProps {
  onBack: () => void;
  onStart: (settings: GameSettings) => void;
}

export function SetupScreen({ onBack, onStart }: SetupScreenProps) {
  const { settings, update } = useGameSettings();
  const [namesOpen, setNamesOpen] = useState(() => settings.playerNames.some((n) => n.trim().length > 0));

  const maxSpies = maxSpiesFor(settings.playerCount);
  const allIds = getAllCategoryIds();
  const allSelected = settings.categoryIds.length === allIds.length;
  const canStart = canStartGame(settings);

  const setName = (index: number, value: string) => {
    update((prev) => {
      const names = prev.playerNames.slice();
      while (names.length <= index) names.push("");
      names[index] = value;
      return { ...prev, playerNames: names };
    });
  };

  const toggleCategory = (id: string) => {
    update((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  return (
    <ScreenShell
      title="Настройка игры"
      onBack={onBack}
      footer={
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {!canStart ? (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-xs font-medium text-accent-300"
              >
                Выбери хотя бы одну категорию
              </motion.p>
            ) : null}
          </AnimatePresence>
          <Button fullWidth disabled={!canStart} onClick={() => onStart(settings)} leadingIcon={<Play size={20} />}>
            Начать игру
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-7 pt-2 pb-4">
        <section>
          <SectionLabel>Игроки</SectionLabel>
          <div className="flex flex-col gap-2">
            <Stepper
              label="Количество игроков"
              hint={`от ${MIN_PLAYERS} до ${MAX_PLAYERS}`}
              value={settings.playerCount}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              onChange={(v) => update({ playerCount: v })}
            />
            <Stepper
              label="Шпионов"
              hint={
                maxSpies === MIN_SPIES
                  ? `При ${settings.playerCount} игроках — только один`
                  : `Максимум ${maxSpies} при ${settings.playerCount} игроках`
              }
              value={settings.spyCount}
              min={MIN_SPIES}
              max={maxSpies}
              onChange={(v) => update({ spyCount: v })}
            />

            <div className="overflow-hidden rounded-3xl border border-white/6 bg-ink-850">
              <button
                type="button"
                aria-expanded={namesOpen}
                onClick={() => setNamesOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              >
                <span>
                  <span className="block text-[15px] font-semibold text-ink-100">Имена игроков</span>
                  <span className="mt-0.5 block text-xs text-ink-400">Необязательно — по умолчанию Игрок 1, 2…</span>
                </span>
                <motion.span animate={{ rotate: namesOpen ? 180 : 0 }} className="text-ink-300">
                  <ChevronDown size={20} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {namesOpen ? (
                  <motion.div
                    key="names"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 px-3 pb-3">
                      {Array.from({ length: settings.playerCount }, (_, i) => (
                        <TextField
                          key={i}
                          leading={<User size={16} />}
                          value={settings.playerNames[i] ?? ""}
                          placeholder={defaultPlayerName(i)}
                          maxLength={24}
                          autoComplete="off"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          aria-label={`Имя игрока ${i + 1}`}
                          onChange={(e) => setName(i, e.target.value)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>Время раунда</SectionLabel>
          <SegmentedControl<RoundMinutes>
            name="round-minutes"
            label="Время раунда"
            options={ROUND_PRESETS.map((p) => ({
              value: p.minutes,
              label: p.label,
              content: p.minutes === null ? <TimerOff size={18} /> : undefined,
            }))}
            value={settings.roundMinutes}
            onChange={(v) => update({ roundMinutes: v })}
          />
        </section>

        <section>
          <SectionLabel
            trailing={
              <button
                type="button"
                onClick={() => update({ categoryIds: allSelected ? [] : allIds })}
                className="rounded-lg px-1.5 py-1 font-semibold text-accent-300 transition-colors hover:text-accent-400"
              >
                {allSelected ? "Снять все" : "Выбрать все"}
              </button>
            }
          >
            Категории · {settings.categoryIds.length} из {allIds.length}
          </SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {BUILTIN_CATEGORIES.map((c) => (
              <CategoryTile
                key={c.id}
                category={c}
                selected={settings.categoryIds.includes(c.id)}
                onToggle={() => toggleCategory(c.id)}
              />
            ))}
          </div>
          <p className="mt-3 px-1 text-xs text-ink-400">
            Каждый раунд случайно берёт одну из выбранных{" "}
            {pluralize(settings.categoryIds.length || 1, ["категории", "категорий", "категорий"])}.
          </p>
        </section>
      </div>
    </ScreenShell>
  );
}
