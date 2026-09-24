"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/format";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryTileProps {
  category: Category;
  selected: boolean;
  onToggle: () => void;
}

export function CategoryTile({ category, selected, onToggle }: CategoryTileProps) {
  const count = category.words.length;
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative flex min-h-[92px] flex-col items-start justify-between rounded-3xl border p-3.5 text-left transition-colors",
        selected
          ? "border-accent-500/50 bg-gradient-to-br from-accent-900/70 to-ink-850 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
          : "border-white/6 bg-ink-850 hover:bg-ink-800",
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border",
            selected ? "border-accent-400/40 bg-accent-500/20 text-accent-300" : "border-white/6 bg-ink-800 text-ink-300",
          )}
        >
          <CategoryIcon name={category.icon} size={18} strokeWidth={2.2} />
        </span>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
            selected ? "border-accent-400 bg-accent-500 text-white" : "border-white/12 bg-transparent text-transparent",
          )}
          aria-hidden
        >
          <Check size={14} strokeWidth={3} />
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <div className={cn("truncate text-[14px] font-bold leading-tight", selected ? "text-ink-100" : "text-ink-200")}>
          {category.name}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-400">
          {count} {pluralize(count, ["слово", "слова", "слов"])}
        </div>
      </div>
    </motion.button>
  );
}
