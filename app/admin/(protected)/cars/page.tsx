import Link from "next/link";
import { Plus, Pencil, ExternalLink, Search, Star, CheckCircle2 } from "lucide-react";

import { adminListCars } from "@/lib/data/cars";
import { DeleteCarButton } from "@/components/admin/DeleteCarButton";
import { QuickStatusSelect } from "@/components/admin/QuickStatusSelect";
import { CarThumb } from "@/components/admin/CarThumb";
import { Eyebrow } from "@/components/ui/Eyebrow";
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
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Voorraad</Eyebrow>
          <h1 className="display-2 mt-2">Auto&apos;s beheren</h1>
          <p className="mt-2 text-[14px] text-[var(--color-steel)]">
            <span className="tabular">{cars.length}</span> auto&apos;s in totaal
            {filtered.length !== cars.length && <> · <span className="tabular">{filtered.length}</span> getoond</>}
          </p>
        </div>
        <Link href="/admin/cars/new" className="btn btn-primary gap-1.5">
          <Plus className="size-4" aria-hidden /> Nieuwe auto
        </Link>
      </div>

      {(sp.saved || sp.deleted) && (
        <div className="mb-5 flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success-tint)] px-4 py-3 text-[14px] font-medium text-[var(--color-success)]">
          <CheckCircle2 className="size-[18px] shrink-0" aria-hidden />
          {sp.saved ? "Auto opgeslagen." : "Auto verwijderd."}
        </div>
      )}

      {/* Filters */}
      <form className="card mb-5 flex flex-wrap items-end gap-3 p-4" action="/admin/cars">
        <div className="relative min-w-[200px] flex-1">
          <label htmlFor="q" className="field-label">Zoeken</label>
          <Search className="pointer-events-none absolute bottom-[13px] left-3.5 size-4 text-[var(--color-mute)]" aria-hidden />
          <input id="q" name="q" defaultValue={sp.q ?? ""} className="input pl-10" placeholder="Op merk, model of titel…" />
        </div>
        <div className="min-w-[160px]">
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? "all"} className="select">
            <option value="all">Alle statussen</option>
            <option value="draft">Concept</option>
            <option value="available">Beschikbaar</option>
            <option value="reserved">Gereserveerd</option>
            <option value="sold">Verkocht</option>
            <option value="hidden">Verborgen</option>
          </select>
        </div>
        <button className="btn btn-secondary" type="submit">Filteren</button>
      </form>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[15px] font-semibold">Geen auto&apos;s gevonden</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-[var(--color-steel)]">
            Pas de filters aan of voeg een nieuwe auto toe aan de voorraad.
          </p>
          <Link href="/admin/cars/new" className="btn btn-primary btn-sm mt-5 gap-1.5">
            <Plus className="size-4" aria-hidden /> Nieuwe auto
          </Link>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((c) => (
            <div key={c.id} className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-3.5">
              {/* thumb + info */}
              <div className="flex min-w-0 flex-1 basis-full items-center gap-3.5 sm:basis-[260px]">
                <CarThumb src={c.main_image} alt={`${c.brand} ${c.model}`} size={56} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14.5px] font-bold">{c.brand} {c.model}</span>
                    {c.is_featured && (
                      <Star className="size-[15px] shrink-0 fill-[var(--color-plate-strong)] text-[var(--color-plate-strong)]" aria-label="Uitgelicht" />
                    )}
                  </div>
                  <div className="truncate text-[12.5px] text-[var(--color-steel)]">{c.version ?? c.title}</div>
                  <div className="tabular mt-0.5 truncate text-[12px] text-[var(--color-mute)]">
                    {[c.year, c.fuel_type, c.transmission, c.mileage != null ? formatKm(c.mileage) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              </div>

              {/* price */}
              <div className="tabular order-1 w-[88px] shrink-0 text-[14.5px] font-extrabold sm:text-right">
                {formatPrice(c.price)}
              </div>

              {/* status */}
              <div className="order-2 w-[170px] shrink-0">
                <QuickStatusSelect id={c.id} status={c.status} />
              </div>

              {/* actions */}
              <div className="order-3 ml-auto flex shrink-0 items-center gap-1">
                <Link href={`/admin/cars/${c.id}/edit`} title="Bewerken" aria-label="Bewerken" className="admin-icon-btn">
                  <Pencil className="size-[17px]" aria-hidden />
                </Link>
                <Link href={`/aanbod/${c.slug}`} target="_blank" rel="noopener" title="Bekijk publiek" aria-label="Bekijk publiek" className="admin-icon-btn">
                  <ExternalLink className="size-[17px]" aria-hidden />
                </Link>
                <DeleteCarButton id={c.id} title={c.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
