"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Отмена",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="confirm"
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button type="button" aria-label="Закрыть" className="absolute inset-0 bg-black/75" onClick={onCancel} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-sm rounded-[28px] border border-white/8 bg-ink-900 p-6 shadow-card"
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <h2 id={titleId} className="font-display text-xl font-bold text-ink-100">
              {title}
            </h2>
            {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-300">{description}</p> : null}
            <div className="mt-6 flex flex-col gap-2">
              <Button variant={destructive ? "danger" : "primary"} size="md" fullWidth onClick={onConfirm}>
                {confirmLabel}
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
                {cancelLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
