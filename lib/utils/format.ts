const NL = "nl-NL";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(NL, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatKm(km?: number | null): string {
  if (km == null) return "—";
  return new Intl.NumberFormat(NL).format(km) + " km";
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat(NL).format(n);
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(NL, { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export function formatMonth(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(NL, { year: "numeric", month: "long" }).format(d);
}

export function carHeadline(brand: string, model: string, version?: string | null) {
  return `${brand} ${model}${version ? ` ${version}` : ""}`.trim();
}

export function whatsAppLink(message: string, base = "https://wa.me/31618580091") {
  return `${base}?text=${encodeURIComponent(message)}`;
}
