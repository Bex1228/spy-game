"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-3xl border border-white/6 bg-ink-850 px-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink-100">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-ink-400">{description}</span> : null}
      </span>
      <span
        className={cn(
          "relative flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition-colors",
          checked ? "border-accent-400/50 bg-accent-500" : "border-white/8 bg-ink-700",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 34 }}
          className={cn("h-6 w-6 rounded-full bg-white shadow-md", checked ? "ml-auto" : "ml-0")}
        />
      </span>
    </button>
  );
}
