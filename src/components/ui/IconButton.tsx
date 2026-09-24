"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  label: string;
  children: ReactNode;
  tone?: "default" | "accent";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, className, tone = "default", type = "button", ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      whileTap={rest.disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-full border transition-colors",
        tone === "default" && "border-white/8 bg-ink-800 text-ink-200 hover:bg-ink-700 hover:text-ink-100",
        tone === "accent" && "border-accent-400/40 bg-accent-500 text-white shadow-glow-accent hover:bg-accent-400",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
