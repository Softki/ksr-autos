"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Search, RotateCcw } from "lucide-react";
import { FUEL_TYPES, TRANSMISSIONS } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface FilterOption {
  value: string;
  count?: number;
}

interface Props {
  brands?: FilterOption[] | readonly string[];
  fuels?: FilterOption[];
  transmissions?: FilterOption[];
  bodies?: FilterOption[];
  className?: string;
  onApplied?: () => void;
}

const PRICE_TIERS = [
  { label: "Geen maximum", val: "" },
  { label: "tot € 3.000", val: "3000" },
  { label: "tot € 5.000", val: "5000" },
  { label: "tot € 10.000", val: "10000" },
  { label: "tot € 15.000", val: "15000" },
  { label: "tot € 20.000", val: "20000" },
];

const SELECT_CLS = "fsel select font-semibold text-[14px]";

export function CarFilters({ brands, fuels, transmissions, bodies, className, onApplied }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const urlQ = sp.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the search box in sync when the URL's `q` changes externally (reset,
  // browser back/forward). Adjusting state during render is React's documented
  // alternative to a syncing effect — and avoids a post-paint flash.
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  const value = (key: string, fallback = "") => sp.get(key) ?? fallback;

  function push(params: URLSearchParams) {
    params.delete("page");
    startTransition(() => {
      router.push(`/aanbod${params.size ? `?${params.toString()}` : ""}`);
      onApplied?.();
    });
  }

  function update(partial: Record<string, string | undefined>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(partial)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    push(params);
  }

  function onSearchChange(next: string) {
    setQ(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ q: next.trim() || undefined }), 350);
  }

  function reset() {
    setQ("");
    startTransition(() => {
      router.push("/aanbod");
      onApplied?.();
    });
  }

  const brandOptions: FilterOption[] = (() => {
    if (!brands) return [];
    const first = brands[0];
    if (typeof first === "string") return (brands as readonly string[]).map((b) => ({ value: b }));
    return brands as FilterOption[];
  })();
  const fuelOptions: FilterOption[] = fuels ?? FUEL_TYPES.map((f) => ({ value: f }));
  const transmissionOptions: FilterOption[] = transmissions ?? TRANSMISSIONS.map((t) => ({ value: t }));

  const nowYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = nowYear; y >= 2006; y -= 2) years.push(y);

  return (
    <div className={cn("filter-panel card p-5 md:p-6", className)}>
      <div className="flex flex-wrap items-center gap-4 mb-5 pb-[18px] border-b border-[var(--color-line)]">
        <span className="lbl text-[11px] text-[var(--color-ink)]">Filters</span>
        <div className="relative flex-1 min-w-[200px] max-w-[440px]">
          <Search className="size-4 text-[var(--color-mute)] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Zoeken…"
            aria-label="Zoek in aanbod"
            // !pl-11: the unlayered `.input { padding: 11px 14px }` rule overrides
            // a normal `pl-*`, so the placeholder sat under the search icon.
            className="input !pl-11"
          />
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto inline-flex items-center gap-2 text-[13px] font-bold text-[var(--color-red)] hover:text-[var(--color-red-strong)]"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset filters
        </button>
      </div>

      <div className={cn("grid grid-cols-2 lg:grid-cols-3 gap-4", pending && "opacity-70 pointer-events-none")}>
        <Field label="Merk">
          <select className={SELECT_CLS} value={value("brand")} onChange={(e) => update({ brand: e.target.value })}>
            <option value="">Alle merken</option>
            {brandOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.value}{b.count ? ` (${b.count})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Carrosserie">
          <select className={SELECT_CLS} value={value("body")} onChange={(e) => update({ body: e.target.value })}>
            <option value="">Alle carrosserie</option>
            {(bodies ?? []).map((b) => (
              <option key={b.value} value={b.value}>
                {b.value}{b.count ? ` (${b.count})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Brandstof">
          <select className={SELECT_CLS} value={value("fuel")} onChange={(e) => update({ fuel: e.target.value })}>
            <option value="">Alle brandstof</option>
            {fuelOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value}{o.count ? ` (${o.count})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Transmissie">
          <select className={SELECT_CLS} value={value("transmission")} onChange={(e) => update({ transmission: e.target.value })}>
            <option value="">Alle transmissies</option>
            {transmissionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value}{o.count ? ` (${o.count})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Bouwjaar vanaf">
          <select className={SELECT_CLS} value={value("yearMin")} onChange={(e) => update({ yearMin: e.target.value })}>
            <option value="">Alle bouwjaren</option>
            {years.map((y) => (
              <option key={y} value={y}>vanaf {y}</option>
            ))}
          </select>
        </Field>

        <Field label="Prijs tot">
          <select className={SELECT_CLS} value={value("priceMax")} onChange={(e) => update({ priceMax: e.target.value })}>
            {PRICE_TIERS.map((p) => (
              <option key={p.label} value={p.val}>{p.label}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="lbl text-[10.5px] text-[var(--color-mute)] mb-2">{label}</div>
      {children}
    </label>
  );
}
