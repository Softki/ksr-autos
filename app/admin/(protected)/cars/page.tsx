import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";

import { adminListCars } from "@/lib/data/cars";
import { updateCarStatusAction } from "@/lib/actions/cars";
import { DeleteCarButton } from "@/components/admin/DeleteCarButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusBadge } from "@/components/public/StatusBadge";
import { formatKm, formatPrice } from "@/lib/utils/format";
import type { CarStatus } from "@/lib/types";

export const metadata = { title: "Auto's beheren" };

interface SearchParams {
  q?: string;
  status?: CarStatus | "all";
  saved?: string;
  deleted?: string;
}

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cars = await adminListCars();

  const q = (sp.q ?? "").trim().toLowerCase();
  const status = sp.status;
  const filtered = cars.filter((c) => {
    if (status && status !== "all" && c.status !== status) return false;
    if (q && !`${c.brand} ${c.model} ${c.version ?? ""} ${c.title}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <Eyebrow>Voorraad</Eyebrow>
          <h1 className="display-2 mt-2">Auto&apos;s beheren</h1>
          <p className="mt-2 text-[14px] text-[var(--color-steel)]">
            <span className="tabular">{cars.length}</span> auto&apos;s in totaal — <span className="tabular">{filtered.length}</span> getoond
          </p>
        </div>
        <Link href="/admin/cars/new" className="btn btn-dark"><Plus className="size-4" /> Nieuwe auto</Link>
      </div>

      {(sp.saved || sp.deleted) && (
        <div className="mb-6 rounded-md bg-[var(--color-success-tint)] border border-[var(--color-success)]/30 text-[var(--color-success)] px-4 py-3 text-[14px]">
          {sp.saved ? "Auto opgeslagen." : "Auto verwijderd."}
        </div>
      )}

      <form className="mb-5 flex flex-wrap gap-3 items-end" action="/admin/cars">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="q" className="field-label">Zoeken</label>
          <input id="q" name="q" defaultValue={sp.q ?? ""} className="input" placeholder="Op merk, model of titel…" />
        </div>
        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? "all"} className="select">
            <option value="all">Alle</option>
            <option value="draft">Concept</option>
            <option value="available">Beschikbaar</option>
            <option value="reserved">Gereserveerd</option>
            <option value="sold">Verkocht</option>
            <option value="hidden">Verborgen</option>
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" type="submit">Filteren</button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Auto</th>
                <th>Status</th>
                <th>Prijs</th>
                <th>Km</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="align-top">
                    <div className="font-semibold">{c.brand} {c.model}</div>
                    <div className="text-[12.5px] text-[var(--color-steel)] line-clamp-1 max-w-md">{c.version ?? c.title}</div>
                    <div className="text-[12px] text-[var(--color-mute)] tabular">{c.year ?? "—"} · {c.fuel_type ?? "—"} · {c.transmission ?? "—"}</div>
                  </td>
                  <td>
                    <form action={updateCarStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <select name="status" defaultValue={c.status} className="select py-1.5 text-[13px] min-h-[36px]">
                        <option value="draft">Concept</option>
                        <option value="available">Beschikbaar</option>
                        <option value="reserved">Gereserveerd</option>
                        <option value="sold">Verkocht</option>
                        <option value="hidden">Verborgen</option>
                      </select>
                      <button className="btn btn-ghost btn-sm" type="submit">Opslaan</button>
                    </form>
                    <div className="mt-1"><StatusBadge status={c.status} /></div>
                  </td>
                  <td className="tabular align-top whitespace-nowrap">{formatPrice(c.price)}</td>
                  <td className="tabular align-top whitespace-nowrap">{formatKm(c.mileage)}</td>
                  <td className="align-top">
                    <div className="flex flex-col gap-1.5 text-[13px]">
                      <Link href={`/admin/cars/${c.id}/edit`} className="inline-flex items-center gap-1 hover:text-[var(--color-ink)]">
                        <Pencil className="size-3.5" /> Bewerk
                      </Link>
                      <Link href={`/aanbod/${c.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 link-quiet hover:text-[var(--color-ink)]">
                        <ExternalLink className="size-3.5" /> Bekijk
                      </Link>
                      <DeleteCarButton id={c.id} title={c.title} />
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[var(--color-steel)]">
                    Geen auto&apos;s gevonden met deze filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
