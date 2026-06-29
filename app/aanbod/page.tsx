import Link from "next/link";
import { Metadata } from "next";

import { CarCard } from "@/components/public/CarCard";
import { ClosingCTA } from "@/components/public/ClosingCTA";
import { CarFilters } from "@/components/public/CarFilters";
import { SortSelect } from "@/components/public/SortSelect";
import { WhatsAppCTA } from "@/components/public/WhatsAppCTA";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { listPublicCars, getFilterOptions } from "@/lib/data/cars";
import { BUSINESS, DISCLAIMER } from "@/lib/constants";
import type { CarSort } from "@/lib/types";

export const metadata: Metadata = {
  title: "Aanbod occasions",
  description:
    "Bekijk het actuele aanbod tweedehands auto's bij KSR Auto's in Ridderkerk. Filter op merk, prijs, bouwjaar, brandstof en transmissie.",
  alternates: { canonical: "/aanbod" },
};

interface SearchParams {
  brand?: string;
  priceMin?: string;
  priceMax?: string;
  yearMin?: string;
  yearMax?: string;
  mileageMax?: string;
  fuel?: string;
  transmission?: string;
  body?: string;
  q?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

export default async function AanbodPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const sort = (sp.sort ?? "newest") as CarSort;

  const filters = {
    brand: sp.brand,
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
    yearMin: sp.yearMin ? Number(sp.yearMin) : undefined,
    yearMax: sp.yearMax ? Number(sp.yearMax) : undefined,
    mileageMax: sp.mileageMax ? Number(sp.mileageMax) : undefined,
    fuel: sp.fuel,
    transmission: sp.transmission,
    body: sp.body,
    q: sp.q,
  };

  const [{ cars, total }, options] = await Promise.all([
    listPublicCars({
      filters: { ...filters, includeReserved: true },
      sort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    getFilterOptions(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
    <div className="container py-8 md:py-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Aanbod" }]} />

      <div className="mt-5 mb-7">
        <div className="eyebrow">Het aanbod</div>
        <h1 className="display-2 mt-3">Occasions in Ridderkerk</h1>
      </div>

      <CarFilters
        brands={options.brands}
        fuels={options.fuels}
        transmissions={options.transmissions}
        bodies={options.bodies}
      />

      <div className="mt-6 mb-5 flex items-center justify-between gap-3">
        <span className="text-[14px] text-[var(--color-steel)]">
          <b className="font-display text-[var(--color-ink)] tabular">{total}</b>{" "}
          {total === 1 ? "auto" : "auto's"} gevonden
          {sp.brand ? ` · ${sp.brand}` : ""}
        </span>
        <SortSelect />
      </div>

      {cars.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 list-none p-0">
          {cars.map((c, i) => (
            <li key={c.id}>
              <CarCard car={c} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-10 text-center">
          <div className="eyebrow justify-center">Geen resultaten</div>
          <h2 className="h3 mt-3">Geen auto&apos;s gevonden met deze filters</h2>
          <p className="mt-2 text-[var(--color-steel)] max-w-md mx-auto">
            Probeer een andere combinatie van filters of laat ons weten waar u naar zoekt.
          </p>
          <div className="mt-6 inline-flex flex-wrap gap-3 justify-center">
            <Link href="/aanbod" className="btn btn-secondary">Reset filters</Link>
            <Link href="/auto-zoeken" className="btn btn-primary">Zoekopdracht plaatsen</Link>
            <WhatsAppCTA className="!inline-flex w-auto px-5" />
          </div>
        </div>
      )}

      {pageCount > 1 && <Pagination page={page} pageCount={pageCount} searchParams={sp} />}

      <div className="mt-12 pt-8 border-t border-[var(--color-line)] text-center">
        <p className="text-[12.5px] text-[var(--color-steel)] max-w-2xl mx-auto">
          {DISCLAIMER} Auto&apos;s kunnen snel verkocht zijn — bel of app altijd vooraf via{" "}
          <a href={BUSINESS.telHref} className="link tabular">{BUSINESS.phone}</a>.
        </p>
      </div>
    </div>
    <ClosingCTA
      title="Niet gevonden wat u zoekt?"
      subtitle="Plaats een gratis zoekopdracht of bel ons — wij vinden de juiste occasion binnen ons netwerk."
    />
    </>
  );
}

function Pagination({ page, pageCount, searchParams }: { page: number; pageCount: number; searchParams: SearchParams }) {
  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v) params.set(k, String(v));
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    return `/aanbod${params.size ? `?${params.toString()}` : ""}`;
  }

  return (
    <nav className="mt-10 flex items-center justify-between border-t border-[var(--color-line)] pt-6 text-sm" aria-label="Paginering">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="btn btn-secondary btn-sm">← Vorige</Link>
      ) : (
        <span />
      )}

      <span className="lbl text-[10.5px] text-[var(--color-mute)] tabular">
        Pagina {page} van {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className="btn btn-secondary btn-sm">Volgende →</Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
