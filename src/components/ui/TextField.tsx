"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { leading, className, ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        "flex h-12 items-center gap-3 rounded-2xl border border-white/6 bg-ink-800 px-3.5 transition-colors",
        "focus-within:border-accent-500/60 focus-within:bg-ink-700",
        className,
      )}
    >
      {leading ? <span className="shrink-0 text-ink-400">{leading}</span> : null}
      <input
        ref={ref}
        className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-ink-100 placeholder:text-ink-500 focus:outline-none"
        {...rest}
      />
    </label>
  );
});
