"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface SegmentOption<T> {
  value: T;
  /** Текстовая подпись; используется и как доступное имя. */
  label: string;
  /** Необязательное визуальное содержимое вместо текста (например, иконка). */
  content?: ReactNode;
}

interface SegmentedControlProps<T> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Уникальное имя для layoutId — на странице может быть несколько контролов. */
  name: string;
}

export function SegmentedControl<T extends string | number | null>({
  options,
  value,
  onChange,
  label,
  name,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-3xl border border-white/6 bg-ink-850 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative isolate h-11 rounded-[20px] px-1 text-[13px] font-semibold transition-colors",
              active ? "text-ink-950" : "text-ink-300 hover:text-ink-100",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`segment-${name}`}
                className="absolute inset-0 -z-10 rounded-[20px] bg-ivory shadow-float"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            ) : null}
            <span className="relative flex items-center justify-center whitespace-nowrap">{opt.content ?? opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
