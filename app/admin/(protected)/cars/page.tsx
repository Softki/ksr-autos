import Link from "next/link";
import { Plus, Pencil, ExternalLink, Search, Star, CheckCircle2, Car, X } from "lucide-react";

import { adminListCars } from "@/lib/data/cars";
import { DeleteCarButton } from "@/components/admin/DeleteCarButton";
import { QuickStatusSelect } from "@/components/admin/QuickStatusSelect";
import { CarThumb } from "@/components/admin/CarThumb";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatRow, StatPill } from "@/components/admin/StatPills";
import { formatKm, formatPrice } from "@/lib/utils/format";
import type { CarStatus } from "@/lib/types";

export const metadata = { title: "Auto's beheren" };

interface SearchParams {
  q?: string;
  status?: CarStatus | "all";
  featured?: string;
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
  const featured = sp.featured === "1" || sp.featured === "true";
  const filtered = cars.filter((c) => {
    if (featured && !c.is_featured) return false;
    if (status && status !== "all" && c.status !== status) return false;
    if (q && !`${c.brand} ${c.model} ${c.version ?? ""} ${c.title}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const byStatus = (s: CarStatus) => cars.filter((c) => c.status === s).length;
  const isFiltered = filtered.length !== cars.length;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Voorraad</Eyebrow>
          <h1 className="admin-title mt-2">Auto&apos;s beheren</h1>
        </div>
        <Link href="/admin/cars/new" className="btn btn-primary gap-1.5">
          <Plus className="size-4" aria-hidden /> Nieuwe auto
        </Link>
      </div>

      <StatRow className="mb-6">
        <StatPill value={cars.length} label="Totaal" tone="ink" href="/admin/cars" />
        <StatPill value={byStatus("available")} label="Beschikbaar" tone="success" dot href="/admin/cars?status=available" />
        <StatPill value={byStatus("reserved")} label="Gereserveerd" tone="amber" dot href="/admin/cars?status=reserved" />
        <StatPill value={byStatus("sold")} label="Verkocht" tone="red" dot href="/admin/cars?status=sold" />
      </StatRow>

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
          <input id="q" name="q" defaultValue={sp.q ?? ""} className="input !pl-11" placeholder="Op merk, model of titel…" />
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

      {featured && (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] py-1.5 pl-3 pr-1.5 text-[12.5px] font-semibold">
            <Star className="size-3.5 fill-[var(--color-plate-strong)] text-[var(--color-plate-strong)]" aria-hidden />
            Uitgelicht
            <Link
              href="/admin/cars"
              aria-label="Filter wissen"
              className="grid size-5 place-items-center rounded-full text-[var(--color-mute)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
            >
              <X className="size-3.5" aria-hidden />
            </Link>
          </span>
        </div>
      )}

      {/* Listings */}
      {isFiltered && filtered.length > 0 && (
        <p className="mb-3 !text-[13px] text-[var(--color-steel)]">
          <span className="tabular font-semibold text-[var(--color-ink)]">{filtered.length}</span> van {cars.length} auto&apos;s getoond
        </p>
      )}
      {filtered.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-mute)]">
            <Car className="size-6" aria-hidden />
          </span>
          <p className="!text-[15px] font-semibold">Geen auto&apos;s gevonden</p>
          <p className="mx-auto max-w-sm !text-[13.5px] text-[var(--color-steel)]">
            Pas de filters aan of voeg een nieuwe auto toe aan de voorraad.
          </p>
          <Link href="/admin/cars/new" className="btn btn-primary btn-sm mt-2 gap-1.5">
            <Plus className="size-4" aria-hidden /> Nieuwe auto
          </Link>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((c) => (
            <div key={c.id} className="card p-3 sm:p-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* image + info (mobile price top-right) */}
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <CarThumb src={c.main_image} alt={`${c.brand} ${c.model}`} sizeClass="size-[72px] sm:size-14" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[15px] font-bold sm:text-[14.5px]">{c.brand} {c.model}</span>
                          {c.is_featured && (
                            <Star className="size-[15px] shrink-0 fill-[var(--color-plate-strong)] text-[var(--color-plate-strong)]" aria-label="Uitgelicht" />
                          )}
                        </div>
                        <div className="truncate text-[12.5px] text-[var(--color-steel)]">{c.version ?? c.title}</div>
                      </div>
                      <div className="tabular shrink-0 text-right text-[15px] font-extrabold sm:hidden">
                        {formatPrice(c.price)}
                      </div>
                    </div>
                    <div className="tabular mt-0.5 truncate text-[12px] text-[var(--color-steel)]">
                      {[c.year, c.fuel_type, c.transmission, c.mileage != null ? formatKm(c.mileage) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                </div>

                {/* desktop price */}
                <div className="tabular hidden w-[96px] shrink-0 text-right text-[14.5px] font-extrabold sm:block">
                  {formatPrice(c.price)}
                </div>

                {/* status + actions */}
                <div className="flex items-center gap-2 border-t border-[var(--color-line)] pt-3 sm:border-0 sm:pt-0">
                  <div className="min-w-0 flex-1 sm:w-[164px] sm:flex-none">
                    <QuickStatusSelect id={c.id} status={c.status} />
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
                    <Link href={`/admin/cars/${c.id}/edit`} title="Bewerken" aria-label="Bewerken" className="admin-icon-btn">
                      <Pencil className="size-[17px]" aria-hidden />
                    </Link>
                    <Link href={`/aanbod/${c.slug}`} target="_blank" rel="noopener" title="Bekijk publiek" aria-label="Bekijk publiek" className="admin-icon-btn">
                      <ExternalLink className="size-[17px]" aria-hidden />
                    </Link>
                    <DeleteCarButton id={c.id} title={c.title} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
