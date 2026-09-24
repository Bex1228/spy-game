"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { IconButton } from "./IconButton";

interface ScreenShellProps {
  children: ReactNode;
  /** Заголовок в шапке. */
  title?: string;
  onBack?: () => void;
  /** Элемент справа в шапке. */
  trailing?: ReactNode;
  /** Фиксированный низ (кнопки действий). */
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const screenTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

/** Единая обёртка экрана: safe areas, шапка, скроллящийся контент, фиксированный футер. */
export function ScreenShell({ children, title, onBack, trailing, footer, className, contentClassName }: ScreenShellProps) {
  const hasHeader = title || onBack || trailing;
  return (
    <motion.section {...screenTransition} className={cn("flex min-h-dvh flex-col", className)}>
      {hasHeader ? (
        <header className="sticky top-0 z-20 flex items-center gap-2 bg-ink-950/85 px-4 pt-safe pb-2 backdrop-blur-md">
          {onBack ? (
            <IconButton label="Назад" onClick={onBack}>
              <ChevronLeft size={22} />
            </IconButton>
          ) : (
            <span className="w-11" />
          )}
          <h1 className="flex-1 text-center font-display text-base font-bold tracking-wide text-ink-100">{title}</h1>
          {trailing ?? <span className="w-11" />}
        </header>
      ) : null}
      <div className={cn("flex flex-1 flex-col px-5", !hasHeader && "pt-safe", contentClassName)}>{children}</div>
      {footer ? (
        <footer className="sticky bottom-0 z-20 bg-gradient-to-t from-ink-950 via-ink-950/95 to-transparent px-5 pt-6 pb-safe">
          {footer}
        </footer>
      ) : null}
    </motion.section>
  );
}
