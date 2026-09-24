"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent-500 text-white shadow-glow-accent border border-accent-400/40 " +
    "hover:bg-accent-400 disabled:bg-ink-700 disabled:text-ink-400 disabled:shadow-none disabled:border-ink-600",
  secondary:
    "bg-ink-800 text-ink-100 border border-white/8 shadow-float " +
    "hover:bg-ink-700 disabled:text-ink-400 disabled:bg-ink-850",
  ghost: "bg-transparent text-ink-300 border border-transparent hover:text-ink-100 hover:bg-white/5 disabled:text-ink-500",
  danger:
    "bg-accent-900/60 text-accent-300 border border-accent-700/50 hover:bg-accent-900 disabled:text-ink-400",
};

const sizeClass: Record<Size, string> = {
  md: "h-12 px-5 text-[15px] rounded-2xl gap-2",
  lg: "h-15 px-6 text-base rounded-[22px] gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "lg", fullWidth = false, leadingIcon, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={rest.disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold tracking-wide",
        "transition-colors duration-150 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="-ml-1 flex shrink-0 items-center">{leadingIcon}</span> : null}
      <span>{children}</span>
    </motion.button>
  );
});
