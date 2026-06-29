import { Car } from "@/lib/types";
import { formatDate, formatKm, formatNumber } from "@/lib/utils/format";
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Car as CarIcon,
  Zap,
  Cylinder,
  ShieldCheck,
  Palette,
  DoorOpen,
  Armchair,
  ReceiptEuro,
  Hash,
  type LucideIcon,
} from "lucide-react";

interface Props {
  car: Car;
  variant?: "table" | "compact";
}

export function SpecGrid({ car, variant = "table" }: Props) {
  const rows: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Bouwjaar", value: car.year ? String(car.year) : "—", icon: Calendar },
    { label: "Kilometerstand", value: formatKm(car.mileage), icon: Gauge },
    { label: "Brandstof", value: car.fuel_type ?? "—", icon: Fuel },
    { label: "Transmissie", value: car.transmission ?? "—", icon: Cog },
    { label: "Carrosserie", value: car.body_type ?? "—", icon: CarIcon },
    { label: "Vermogen", value: car.power_hp ? `${formatNumber(car.power_hp)} pk` : "—", icon: Zap },
    { label: "Cilinderinhoud", value: car.engine_cc ? `${formatNumber(car.engine_cc)} cc` : "—", icon: Cylinder },
    { label: "APK tot", value: formatDate(car.apk_until), icon: ShieldCheck },
    { label: "Kleur", value: car.color ?? "—", icon: Palette },
    { label: "Aantal deuren", value: car.doors ? String(car.doors) : "—", icon: DoorOpen },
    { label: "Aantal stoelen", value: car.seats ? String(car.seats) : "—", icon: Armchair },
    { label: "BTW / Marge", value: car.vat_type ? capitalize(car.vat_type) : "Marge", icon: ReceiptEuro },
    { label: "Kenteken", value: car.license_plate ?? "—", icon: Hash },
  ];

  if (variant === "compact") {
    return (
      <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {rows.slice(0, 8).map((r) => (
          <li key={r.label}>
            <div className="label-mono">{r.label}</div>
            <div className="font-semibold tabular">{r.value}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
      {rows.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper)] px-3 sm:px-3.5 py-3 transition-colors hover:border-[var(--color-line-strong)]"
        >
          <span className="grid place-items-center size-9 shrink-0 rounded-[10px] bg-[var(--color-red-tint)] text-[var(--color-red)]">
            <Icon className="size-[18px]" aria-hidden strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <dt className="lbl text-[9.5px] text-[var(--color-mute)] truncate">{label}</dt>
            <dd className="font-bold text-[14px] mt-0.5 tabular text-[var(--color-ink)] break-words">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
