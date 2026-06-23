"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowUpDown } from "lucide-react";

const OPTIONS = [
  { value: "newest", label: "Nieuwste eerst" },
  { value: "price-asc", label: "Prijs laag → hoog" },
  { value: "price-desc", label: "Prijs hoog → laag" },
  { value: "mileage-asc", label: "Kilometers laag → hoog" },
  { value: "year-desc", label: "Bouwjaar nieuw → oud" },
] as const;

export function SortSelect() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = sp.get("sort") || "newest";

  function onChange(v: string) {
    const params = new URLSearchParams(sp.toString());
    if (v === "newest") params.delete("sort");
    else params.set("sort", v);
    params.delete("page");
    startTransition(() => router.push(`/aanbod${params.size ? `?${params.toString()}` : ""}`));
  }

  return (
    <label className="relative inline-flex items-center gap-2">
      <ArrowUpDown className="size-3.5 text-[var(--color-steel)]" aria-hidden />
      <span className="label-mono hidden md:inline">Sorteren</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="select py-2 pr-8 text-[13.5px] min-h-[40px]"
        aria-label="Sorteren"
        disabled={pending}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
