import { cn } from "@/utils/cn";

interface LogoProps {
  size?: number;
  className?: string;
}

/** Фирменный знак: глаз-прицел. */
export function Logo({ size = 72, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      className={cn("drop-shadow-[0_10px_30px_rgb(230_50_63/0.35)]", className)}
    >
      <circle cx="40" cy="40" r="37" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="29" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1.5" strokeDasharray="3 5" />
      <path
        d="M12 40C19 28 29 22 40 22s21 6 28 18c-7 12-17 18-28 18S19 52 12 40Z"
        stroke="var(--color-ivory)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="40" r="10" fill="var(--color-accent-500)" />
      <circle cx="43.5" cy="36.5" r="3" fill="rgb(255 255 255 / 0.9)" />
      <path d="M40 4v8M40 68v8M4 40h8M68 40h8" stroke="var(--color-accent-400)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
