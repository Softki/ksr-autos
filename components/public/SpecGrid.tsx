import { Car } from "@/lib/types";
import { formatDate, formatKm, formatNumber } from "@/lib/utils/format";

interface Props {
  car: Car;
  variant?: "table" | "compact";
}

export function SpecGrid({ car, variant = "table" }: Props) {
  const rows: { label: string; value: string }[] = [
    { label: "Bouwjaar", value: car.year ? String(car.year) : "—" },
    { label: "Kilometerstand", value: formatKm(car.mileage) },
    { label: "Brandstof", value: car.fuel_type ?? "—" },
    { label: "Transmissie", value: car.transmission ?? "—" },
    { label: "Carrosserie", value: car.body_type ?? "—" },
    { label: "Vermogen", value: car.power_hp ? `${formatNumber(car.power_hp)} pk` : "—" },
    { label: "Cilinderinhoud", value: car.engine_cc ? `${formatNumber(car.engine_cc)} cc` : "—" },
    { label: "APK tot", value: formatDate(car.apk_until) },
    { label: "Kleur", value: car.color ?? "—" },
    { label: "Aantal deuren", value: car.doors ? String(car.doors) : "—" },
    { label: "Aantal stoelen", value: car.seats ? String(car.seats) : "—" },
    { label: "BTW / Marge", value: car.vat_type ? capitalize(car.vat_type) : "Marge" },
    { label: "Kenteken", value: car.license_plate ?? "—" },
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
    <dl className="grid sm:grid-cols-2 gap-x-10 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[var(--radius-lg)] px-5 md:px-6">
      {rows.map((r) => (
        <div key={r.label} className="spec-row">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
