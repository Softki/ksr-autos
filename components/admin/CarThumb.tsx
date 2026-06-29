import { Car } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  src?: string;
  alt: string;
  /** Square side in px. */
  size?: number;
  className?: string;
}

/** Square car thumbnail with a neutral icon fallback when no image is set. */
export function CarThumb({ src, alt, size = 48, className }: Props) {
  const base = cn("shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-surface)]", className);

  if (!src) {
    return (
      <span
        className={cn("grid place-items-center text-[var(--color-mute)]", base)}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Car style={{ width: size * 0.42, height: size * 0.42 }} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={cn("object-cover", base)}
      style={{ width: size, height: size }}
    />
  );
}
