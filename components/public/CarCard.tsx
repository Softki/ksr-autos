import Image from "next/image";
import Link from "next/link";
import { Calendar, Gauge, Cog, Eye } from "lucide-react";
import type { Car } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/cn";

interface Props {
  car: Car;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

function kmShort(km?: number): string {
  if (km == null) return "—";
  if (km < 1000) return `${km} km`;
  return `${Math.round(km / 1000)}K km`;
}

export function CarCard({ car, priority, sizes, className }: Props) {
  const image = car.main_image;
  const altText = `${car.brand} ${car.model}${car.version ? " " + car.version : ""} bij KSR Auto's`;

  return (
    <Link
      href={`/aanbod/${car.slug}`}
      aria-label={`${car.title} — bekijk auto`}
      className={cn(
        "ksr-card group block bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[var(--radius-xl)] overflow-hidden",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        className,
      )}
    >
      <div className="relative aspect-card overflow-hidden bg-[linear-gradient(140deg,#EFE7DA,#E0D4C2)]">
        {image ? (
          <Image
            src={image}
            alt={altText}
            fill
            sizes={sizes ?? "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
            className="ksr-img object-cover"
            priority={priority}
          />
        ) : (
          <div className="ksr-img absolute inset-0 grid place-items-center" aria-hidden>
            <span className="font-display font-extrabold text-[46px] text-[rgb(22_20_15/0.09)]">
              {car.brand}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <StatusBadge status={car.status} featured={car.is_featured} />
        </div>

        <div className="absolute left-3 bottom-3 bg-[var(--color-ink)] text-white rounded-[var(--radius-sm)] px-3 py-2 font-display font-extrabold text-[16px] leading-none tabular whitespace-nowrap">
          {formatPrice(car.price)}
        </div>

        <div className="ksr-actions absolute top-3 right-3">
          <span className="grid place-items-center size-[34px] rounded-[9px] bg-white/95 text-[var(--color-ink)] shadow-sm">
            <Eye className="size-4" aria-hidden />
          </span>
        </div>
      </div>

      <div className="p-4 md:p-[18px]">
        <div className="lbl text-[10px] text-[var(--color-tan)]">{car.body_type ?? car.vat_type ?? "Occasion"}</div>
        <h3 className="mt-1.5 font-display text-[16px] font-bold leading-tight tracking-tight line-clamp-2 min-h-[42px]">
          {car.title}
        </h3>

        <div className="mt-3.5 pt-3.5 border-t border-[var(--color-line)] flex items-center justify-between gap-1">
          <Meta icon={Calendar}>{car.year ?? "—"}</Meta>
          <Meta icon={Gauge}>{kmShort(car.mileage)}</Meta>
          <Meta icon={Cog}>{car.transmission ?? "—"}</Meta>
        </div>
      </div>
    </Link>
  );
}

function Meta({ icon: Icon, children }: { icon: typeof Calendar; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <Icon className="size-[15px] shrink-0 text-[var(--color-red)]" aria-hidden />
      <span className="text-[12.5px] font-bold tabular whitespace-nowrap">{children}</span>
    </span>
  );
}
