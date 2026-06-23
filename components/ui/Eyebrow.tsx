import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  onDark?: boolean;
}

export function Eyebrow({ onDark, className, children, ...rest }: Props) {
  return (
    <span className={cn("eyebrow", onDark && "on-dark", className)} {...rest}>
      {children}
    </span>
  );
}
