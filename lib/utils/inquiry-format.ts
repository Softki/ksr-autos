import type { InquiryType, InquiryStatus, InquiryMetadata } from "@/lib/types";

/** Dutch label for an inquiry type. */
export const INQUIRY_TYPE_LABEL: Record<InquiryType, string> = {
  contact: "Contact",
  test_drive: "Proefrit",
  trade_in: "Inruil / verkoop",
  search_request: "Zoekopdracht",
};

/** Dutch label for an inquiry status. */
export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "Nieuw",
  contacted: "Gecontacteerd",
  closed: "Afgesloten",
  spam: "Spam",
};

/** Dutch labels for metadata keys (was showing raw English keys). */
const META_LABEL: Record<string, string> = {
  brand: "Merk",
  model: "Model",
  year: "Bouwjaar",
  mileage: "Kilometerstand",
  kenteken: "Kenteken",
  condition: "Staat",
  asking_price: "Vraagprijs",
  budget: "Budget",
  notes: "Opmerkingen",
  color: "Kleur",
  fuel: "Brandstof",
  transmission: "Transmissie",
};

const CONDITION_LABEL: Record<string, string> = {
  excellent: "Uitstekend",
  good: "Goed",
  fair: "Redelijk",
  poor: "Matig",
  new: "Nieuwstaat",
};

export function metaLabel(key: string): string {
  return META_LABEL[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function metaValue(key: string, value: unknown): string {
  const s = String(value ?? "").trim();
  if (!s) return "—";
  if (key === "condition" && CONDITION_LABEL[s.toLowerCase()]) return CONDITION_LABEL[s.toLowerCase()];
  if (key === "mileage") {
    const n = Number(s.replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 0 ? `${n.toLocaleString("nl-NL")} km` : s;
  }
  if (key === "asking_price" || key === "budget") {
    const n = Number(s.replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 0 ? `€ ${n.toLocaleString("nl-NL")}` : s;
  }
  return s;
}

/** Parse the `photos` metadata field (JSON string OR array) into a URL list. */
export function parseInquiryPhotos(metadata?: InquiryMetadata | null): string[] {
  const raw = metadata?.photos as unknown;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((u): u is string => typeof u === "string" && u.startsWith("http"));
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((u): u is string => typeof u === "string" && u.startsWith("http"));
    } catch {
      /* not JSON */
    }
    if (raw.startsWith("http")) return [raw];
  }
  return [];
}

/** Metadata entries WITHOUT the photos key, for the details grid (empties dropped). */
export function inquiryDetailEntries(metadata?: InquiryMetadata | null): [string, unknown][] {
  if (!metadata) return [];
  return Object.entries(metadata).filter(
    ([k, v]) => k !== "photos" && v != null && String(v).trim() !== "",
  );
}
