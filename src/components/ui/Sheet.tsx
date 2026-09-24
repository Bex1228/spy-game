"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { IconButton } from "./IconButton";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Нижняя шторка. Закрывается по фону, крестику и Escape. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-[440px] rounded-t-[32px] border-t border-white/8 bg-ink-900 pb-safe shadow-card"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-ink-600" aria-hidden />
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <h2 id={titleId} className="font-display text-lg font-bold text-ink-100">
                {title}
              </h2>
              <IconButton label="Закрыть" onClick={onClose}>
                <X size={20} />
              </IconButton>
            </div>
            <div className="max-h-[70dvh] overflow-y-auto px-5 pb-4 scrollbar-none">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
