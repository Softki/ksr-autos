import { Car } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  src?: string;
  alt: string;
  /** Square side in px. Ignored when `sizeClass` is set. */
  size?: number;
  /** Tailwind size classes (e.g. "size-[76px] sm:size-14") for responsive sizing. */
  sizeClass?: string;
  className?: string;
}

/** Square car thumbnail with a neutral icon fallback when no image is set. */
export function CarThumb({ src, alt, size = 48, sizeClass, className }: Props) {
  const base = cn(
    "shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface)]",
    sizeClass,
    className,
  );
  const style = sizeClass ? undefined : { width: size, height: size };

  if (!src) {
    return (
      <span className={cn("grid place-items-center text-[var(--color-mute)]", base)} style={style} aria-hidden>
        <Car
          className={sizeClass ? "size-[42%]" : undefined}
          style={sizeClass ? undefined : { width: size * 0.42, height: size * 0.42 }}
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={cn("object-cover", base)} style={style} />
  );
}
