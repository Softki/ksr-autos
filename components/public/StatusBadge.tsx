import { CarStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const MAP: Record<CarStatus, { label: string; cls: string }> = {
  draft: { label: "Concept", cls: "badge-hidden" },
  available: { label: "Beschikbaar", cls: "badge-available" },
  reserved: { label: "Gereserveerd", cls: "badge-reserved" },
  sold: { label: "Verkocht", cls: "badge-sold" },
  hidden: { label: "Verborgen", cls: "badge-hidden" },
};

interface Props {
  status: CarStatus;
  className?: string;
  featured?: boolean;
}

export function StatusBadge({ status, className, featured }: Props) {
  if (featured && status === "available") {
    return (
      <span className={cn("badge badge-featured", className)}>
        <span className="badge-dot" aria-hidden /> Uitgelicht
      </span>
    );
  }
  const m = MAP[status];
  return (
    <span className={cn("badge", m.cls, className)}>
      <span className="badge-dot" aria-hidden /> {m.label}
    </span>
  );
}
