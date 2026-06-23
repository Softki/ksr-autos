import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  level?: 2 | 3;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  level = 2,
  action,
  className,
}: Props) {
  const Heading = level === 2 ? "h2" : "h3";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        action && "md:flex-row md:items-end md:justify-between md:gap-8",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading className={cn(level === 2 ? "h2" : "h3", "max-w-2xl")}>
          {title}
        </Heading>
        {description && (
          <p className={cn("text-[var(--color-charcoal)] max-w-2xl", level === 2 ? "lead" : "text-base")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
