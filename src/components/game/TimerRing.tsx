"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TimerRingProps {
  /** Доля заполнения кольца 0..1. */
  fraction: number;
  tense?: boolean;
  paused?: boolean;
  size?: "md" | "sm";
  children: ReactNode;
}

export function TimerRing({ fraction, tense = false, paused = false, size = "md", children }: TimerRingProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  return (
    <div className={cn("relative mx-auto aspect-square w-full", size === "md" ? "max-w-[300px]" : "max-w-[240px]")}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-ivory)" />
            <stop offset="100%" stopColor="var(--color-ivory-dim)" />
          </linearGradient>
          <linearGradient id="ring-grad-tense" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-300)" />
            <stop offset="100%" stopColor="var(--color-accent-500)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="4" />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={tense ? "url(#ring-grad-tense)" : "url(#ring-grad)"}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          initial={false}
          animate={{ strokeDashoffset: 1 - clamped, opacity: paused ? 0.45 : 1 }}
          transition={{ strokeDashoffset: { duration: 0.15, ease: "linear" }, opacity: { duration: 0.3 } }}
        />
      </svg>
      <div
        className={cn(
          "absolute inset-[9%] flex flex-col items-center justify-center rounded-full border transition-colors duration-500",
          tense ? "border-accent-500/25 bg-accent-900/25" : "border-white/6 bg-ink-850",
        )}
        style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 30px 60px -30px rgb(0 0 0 / 0.9)" }}
      >
        {children}
      </div>
    </div>
  );
}
