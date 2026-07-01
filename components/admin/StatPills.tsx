import Link from "next/link";
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
  href,
}: {
  value: number | string;
  label: string;
  tone?: Tone;
  dot?: boolean;
  href?: string;
}) {
  const color = TONE[tone];
  const base =
    "inline-flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-2.5 shadow-[var(--shadow-card)] transition-colors";

  const inner = (
    <>
      {dot && <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />}
      <span className="tabular text-[19px] font-extrabold leading-none" style={{ color }}>
        {value}
      </span>
      <span className="text-[12.5px] font-semibold text-[var(--color-steel)]">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, "hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface)]")}
      >
        {inner}
      </Link>
    );
  }

  return <div className={cn(base, "hover:border-[var(--color-line-strong)]")}>{inner}</div>;
}
