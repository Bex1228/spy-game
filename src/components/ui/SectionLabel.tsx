import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  trailing?: ReactNode;
}

export function SectionLabel({ children, trailing }: SectionLabelProps) {
  return (
    <div className="mb-2.5 flex items-end justify-between px-1">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">{children}</h2>
      {trailing ? <div className="text-xs">{trailing}</div> : null}
    </div>
  );
}
