import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface Props extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

export function Container({ size = "default", className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "container",
        size === "narrow" && "container-narrow",
        className,
      )}
      {...rest}
    />
  );
}
