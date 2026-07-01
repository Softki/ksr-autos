import { cn } from "@/lib/cn";

type Tone = "ink" | "success" | "amber" | "red" | "steel";

const TONE: Record<Tone, string> = {
  ink: "var(--color-ink)",
  success: "var(--color-success)",
  amber: "var(--color-amber)",
  red: "var(--color-red-strong)",
  steel: "var(--color-steel)",
};

/** Horizontal row of compact summary stats — shared across admin list pages. */
export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2.5", className)}>{children}</div>;
}

export function StatPill({
  value,
  label,
  tone = "ink",
  dot = false,
}: {
  value: number | string;
  label: string;
  tone?: Tone;
  dot?: boolean;
}) {
  const color = TONE[tone];
  return (
    <div className="inline-flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-2.5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-line-strong)]">
      {dot && <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />}
      <span className="tabular text-[19px] font-extrabold leading-none" style={{ color }}>
        {value}
      </span>
      <span className="text-[12.5px] font-semibold text-[var(--color-steel)]">{label}</span>
    </div>
  );
}
