import Image from "next/image";
import { cn } from "@/lib/cn";

const RATIO = 253 / 60; // native logo aspect ratio

interface Props {
  /** Use the original (terracotta + white) logo for dark backgrounds. */
  onDark?: boolean;
  /** Rendered height in px (width derived from the brand aspect ratio). */
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Official KSR Auto's wordmark (terracotta "KSR" + "Auto's").
 * The source SVG is built for dark backgrounds; `ksr-logo-ink.svg` recolors the
 * white parts to warm ink so it reads on the cream header.
 */
export function Logo({ onDark = false, height = 34, priority = false, className }: Props) {
  const width = Math.round(RATIO * height);
  return (
    <Image
      src={onDark ? "/ksr-logo.svg" : "/ksr-logo-ink.svg"}
      alt="KSR Auto's"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn("w-auto select-none", className)}
      style={{ height }}
    />
  );
}
