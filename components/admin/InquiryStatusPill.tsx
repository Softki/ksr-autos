import { cn } from "@/lib/cn";
import { INQUIRY_STATUS_LABEL } from "@/lib/utils/inquiry-format";
import type { InquiryStatus } from "@/lib/types";

const TONE: Record<InquiryStatus, string> = {
  new: "bg-[var(--color-red-tint)] text-[var(--color-red-strong)]",
  contacted: "bg-[var(--color-amber-tint)] text-[var(--color-amber)]",
  closed: "bg-[var(--color-success-tint)] text-[var(--color-success)]",
  spam: "bg-[var(--color-sand)] text-[var(--color-steel)]",
};

export function InquiryStatusPill({ status, className }: { status: InquiryStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold",
        TONE[status],
        className,
      )}
    >
      {status === "new" && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {INQUIRY_STATUS_LABEL[status]}
    </span>
  );
}
