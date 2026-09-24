"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { RoundPlayer } from "@/types";
import { cn } from "@/utils/cn";

interface PlayerPickerProps {
  players: RoundPlayer[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  label: string;
}

/** Список активных игроков для выбора. Роли не показываются. */
export function PlayerPicker({ players, selectedId, onSelect, label }: PlayerPickerProps) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
      {players.map((p) => {
        const active = p.id === selectedId;
        return (
          <motion.button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(p.id)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "flex min-h-[56px] items-center justify-between gap-2 rounded-2xl border px-3.5 text-left transition-colors",
              active
                ? "border-accent-500/60 bg-accent-900/60 text-ink-100"
                : "border-white/6 bg-ink-850 text-ink-200 hover:bg-ink-800",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold">{p.name}</span>
              {p.name !== `Игрок ${p.id}` ? (
                <span className="block text-[11px] text-ink-400">Игрок {p.id}</span>
              ) : null}
            </span>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                active ? "border-accent-400 bg-accent-500 text-white" : "border-white/12 text-transparent",
              )}
              aria-hidden
            >
              <Check size={14} strokeWidth={3} />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
