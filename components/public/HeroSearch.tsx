"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FUEL_TYPES, TRANSMISSIONS } from "@/lib/constants";

const PRICE_TIERS = [
  { label: "Geen maximum", val: "" },
  { label: "tot € 3.000", val: "3000" },
  { label: "tot € 5.000", val: "5000" },
  { label: "tot € 10.000", val: "10000" },
  { label: "tot € 15.000", val: "15000" },
  { label: "tot € 20.000", val: "20000" },
];

const SELECT_CLS =
  "fsel select h-12 bg-[var(--color-surface)] text-[14px] font-semibold";

export function HeroSearch({ total, brands }: { total: number; brands: string[] }) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function submit() {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (fuel) p.set("fuel", fuel);
    if (transmission) p.set("transmission", transmission);
    if (priceMax) p.set("priceMax", priceMax);
    const qs = p.toString();
    router.push(qs ? `/aanbod?${qs}` : "/aanbod");
  }

  return (
    <div className="search-panel bg-[var(--color-paper)] rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] border border-[var(--color-line)] p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="relative h-2 w-2 shrink-0">
          <span className="ksr-pulse absolute inset-0 rounded-full bg-[var(--color-red)]" />
        </span>
        <span className="lbl text-[10.5px] text-[var(--color-mute)]">Snel zoeken in onze voorraad</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-[repeat(4,1fr)_auto] gap-3 items-end">
        <Field label="Merk">
          <select aria-label="Merk" value={brand} onChange={(e) => setBrand(e.target.value)} className={SELECT_CLS}>
            <option value="">Alle merken</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Brandstof">
          <select aria-label="Brandstof" value={fuel} onChange={(e) => setFuel(e.target.value)} className={SELECT_CLS}>
            <option value="">Alle brandstof</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Transmissie">
          <select aria-label="Transmissie" value={transmission} onChange={(e) => setTransmission(e.target.value)} className={SELECT_CLS}>
            <option value="">Alle transmissies</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Prijs tot">
          <select aria-label="Prijs tot" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={SELECT_CLS}>
            {PRICE_TIERS.map((p) => (
              <option key={p.label} value={p.val}>{p.label}</option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={submit}
          className="shine btn btn-primary h-12 col-span-2 md:col-span-1 gap-2"
        >
          <Search className="size-[17px]" aria-hidden />
          Zoek — {total} auto&rsquo;s
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-[var(--color-steel)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}
