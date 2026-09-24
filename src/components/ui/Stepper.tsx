"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { IconButton } from "./IconButton";

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
  hint?: string;
}

export function Stepper({ value, min, max, onChange, label, hint }: StepperProps) {
  const canDec = value > min;
  const canInc = value < max;

  return (
    <div
      className="flex items-center justify-between rounded-3xl border border-white/6 bg-ink-850 px-4 py-3"
      role="group"
      aria-label={label}
    >
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-ink-100">{label}</div>
        {hint ? <div className="mt-0.5 text-xs text-ink-400">{hint}</div> : null}
      </div>
      <div className="flex items-center gap-1">
        <IconButton label="Меньше" onClick={() => canDec && onChange(value - 1)} disabled={!canDec}>
          <Minus size={20} strokeWidth={2.5} />
        </IconButton>
        <div
          className="relative flex h-11 w-14 items-center justify-center overflow-hidden font-display text-2xl font-bold tabular text-ink-100"
          aria-live="polite"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        <IconButton label="Больше" onClick={() => canInc && onChange(value + 1)} disabled={!canInc}>
          <Plus size={20} strokeWidth={2.5} />
        </IconButton>
      </div>
    </div>
  );
}
