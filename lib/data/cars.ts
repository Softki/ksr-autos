/**
 * Cars data layer.
 *
 * Adapter pattern: when Supabase is configured we read/write the real
 * database (cars + car_images). Otherwise we fall back to the seed list so
 * the project remains functional out of the box. Public callers only ever
 * see normalized {@link Car} objects.
 */

import "server-only";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedCars } from "@/lib/seed/cars";
import type {
  Car,
  CarFilterParams,
  CarListResult,
  CarSort,
  CarStatus,
  CarImage,
  FilterOptions,
} from "@/lib/types";
import type { CarRow, CarImageRow, Json } from "@/lib/supabase/database.types";

type CarRowWithImages = CarRow & { car_images: CarImageRow[] };

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

function normalizeOptions(value: Json | string[] | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string") as string[];
  return [];
}

function fromRow(row: CarRow, images: CarImageRow[] = []): Car {
  const main = images.find((i) => i.is_main) ?? images[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    model: row.model,
    version: row.version ?? undefined,
    year: row.year ?? undefined,
    price: row.price,
    mileage: row.mileage ?? undefined,
    fuel_type: row.fuel_type ?? undefined,
    transmission: row.transmission ?? undefined,
    body_type: row.body_type ?? undefined,
    color: row.color ?? undefined,
    doors: row.doors ?? undefined,
    seats: row.seats ?? undefined,
    power_hp: row.power_hp ?? undefined,
    engine_cc: row.engine_cc ?? undefined,
    apk_until: row.apk_until ?? undefined,
    license_plate: row.license_plate ?? undefined,
    vat_type: row.vat_type ?? undefined,
    description: row.description ?? undefined,
    options: normalizeOptions(row.options),
    status: row.status,
    is_featured: row.is_featured,
    is_published: row.is_published,
    main_image: main?.image_url,
    images: images
      .slice()
      .sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.sort_order - b.sort_order)
      .map((i) => ({
        id: i.id,
        car_id: i.car_id,
        image_url: i.image_url,
        storage_path: i.storage_path,
        alt_text: i.alt_text ?? undefined,
        width: i.width ?? undefined,
        height: i.height ?? undefined,
        sort_order: i.sort_order,
        is_main: i.is_main,
      })),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// In-memory mutations of the seed list so the admin demo behaves correctly
// when there is no Supabase project yet. State is process-local.
const seedMutable: Car[] = seedCars.map((c) => ({ ...c }));

function applySort(list: Car[], sort: CarSort): Car[] {
  const arr = list.slice();
  switch (sort) {
    case "price-asc":   arr.sort((a, b) => a.price - b.price); break;
    case "price-desc":  arr.sort((a, b) => b.price - a.price); break;
    case "mileage-asc": arr.sort((a, b) => (a.mileage ?? 0) - (b.mileage ?? 0)); break;
    case "mileage-desc":arr.sort((a, b) => (b.mileage ?? 0) - (a.mileage ?? 0)); break;
    case "year-asc":    arr.sort((a, b) => (a.year ?? 0) - (b.year ?? 0)); break;
    case "year-desc":   arr.sort((a, b) => (b.year ?? 0) - (a.year ?? 0)); break;
    case "newest":
    default:
      arr.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      break;
  }
  return arr;
}

function applyFilters(list: Car[], f?: CarFilterParams): Car[] {
  if (!f) return list;
  return list.filter((c) => {
    if (f.brand && c.brand.toLowerCase() !== f.brand.toLowerCase()) return false;
    if (f.priceMin != null && c.price < f.priceMin) return false;
    if (f.priceMax != null && c.price > f.priceMax) return false;
    if (f.yearMin != null && (c.year ?? 0) < f.yearMin) return false;
    if (f.yearMax != null && (c.year ?? Number.POSITIVE_INFINITY) > f.yearMax) return false;
    if (f.mileageMax != null && (c.mileage ?? 0) > f.mileageMax) return false;
    if (f.fuel && (c.fuel_type ?? "").toLowerCase() !== f.fuel.toLowerCase()) return false;
    if (f.transmission && (c.transmission ?? "").toLowerCase() !== f.transmission.toLowerCase()) return false;
    if (f.body && (c.body_type ?? "").toLowerCase() !== f.body.toLowerCase()) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      const hay = `${c.title} ${c.brand} ${c.model} ${c.version ?? ""} ${c.description ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function publicStatusFilter(c: Car, opts: { includeReserved: boolean; includeSold: boolean }) {
  if (c.status === "available") return true;
  if (opts.includeReserved && c.status === "reserved") return true;
  if (opts.includeSold && c.status === "sold") return true;
  return false;
}

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

export interface ListOptions {
  filters?: CarFilterParams;
  sort?: CarSort;
  limit?: number;
  offset?: number;
}

export async function listPublicCars(opts: ListOptions = {}): Promise<CarListResult> {
  const filters = opts.filters ?? {};
  const sort = opts.sort ?? "newest";
  const includeReserved = filters.includeReserved ?? true;
  const includeSold = filters.includeSold ?? false;

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const statusList: CarStatus[] = ["available"];
      if (includeReserved) statusList.push("reserved");
      if (includeSold) statusList.push("sold");

      let q = supabase
        .from("cars")
        .select("*, car_images(*)", { count: "exact" })
        .eq("is_published", true)
        .in("status", statusList);

      if (filters.brand) q = q.ilike("brand", filters.brand);
      if (filters.priceMin != null) q = q.gte("price", filters.priceMin);
      if (filters.priceMax != null) q = q.lte("price", filters.priceMax);
      if (filters.yearMin != null) q = q.gte("year", filters.yearMin);
      if (filters.yearMax != null) q = q.lte("year", filters.yearMax);
      if (filters.mileageMax != null) q = q.lte("mileage", filters.mileageMax);
      if (filters.fuel) q = q.ilike("fuel_type", filters.fuel);
      if (filters.transmission) q = q.ilike("transmission", filters.transmission);
      if (filters.body) q = q.ilike("body_type", filters.body);
      if (filters.q) q = q.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);

      switch (sort) {
        case "price-asc":    q = q.order("price", { ascending: true }); break;
        case "price-desc":   q = q.order("price", { ascending: false }); break;
        case "mileage-asc":  q = q.order("mileage", { ascending: true, nullsFirst: false }); break;
        case "mileage-desc": q = q.order("mileage", { ascending: false, nullsFirst: false }); break;
        case "year-asc":     q = q.order("year", { ascending: true, nullsFirst: false }); break;
        case "year-desc":    q = q.order("year", { ascending: false, nullsFirst: false }); break;
        default:             q = q.order("created_at", { ascending: false }); break;
      }

      if (opts.limit) q = q.limit(opts.limit);
      if (opts.offset) q = q.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1);

      const { data, count, error } = await q;
      if (!error && data) {
        return {
          cars: (data as CarRowWithImages[]).map((row) => fromRow(row, row.car_images ?? [])),
          total: count ?? data.length,
        };
      }
    }
  }

  let filtered = seedMutable
    .filter((c) => c.is_published !== false)
    .filter((c) => publicStatusFilter(c, { includeReserved, includeSold }));

  filtered = applyFilters(filtered, filters);
  filtered = applySort(filtered, sort);
  const total = filtered.length;
  if (opts.offset) filtered = filtered.slice(opts.offset);
  if (opts.limit) filtered = filtered.slice(0, opts.limit);
  return { cars: filtered, total };
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(*)")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (!error && data) {
        return fromRow(data as CarRow, ((data as CarRowWithImages).car_images ?? []));
      }
    }
  }
  const car = seedMutable.find((c) => c.slug === slug && c.is_published !== false);
  if (!car) return null;
  if (car.status === "hidden" || car.status === "draft") return null;
  return car;
}

export async function getFeaturedCars(limit = 6): Promise<Car[]> {
  const { cars } = await listPublicCars({
    filters: { includeReserved: true },
    sort: "newest",
    limit,
  });
  const featured = cars.filter((c) => c.is_featured);
  if (featured.length >= 3) return featured.slice(0, limit);
  // Fallback: blend featured with newest available so the homepage always has
  // enough cards to feel populated.
  const rest = cars.filter((c) => !c.is_featured);
  return featured.concat(rest).slice(0, limit);
}

export async function getRelatedCars(car: Car, limit = 3): Promise<Car[]> {
  const { cars } = await listPublicCars({
    filters: { brand: car.brand, includeReserved: true },
    sort: "newest",
    limit: limit + 1,
  });
  return cars.filter((c) => c.id !== car.id).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Filter options (for sidebar facets)
// ---------------------------------------------------------------------------

export async function getFilterOptions(): Promise<FilterOptions> {
  const { cars } = await listPublicCars({ filters: { includeReserved: true } });
  const bucket = (key: keyof Car) => {
    const counts = new Map<string, number>();
    for (const c of cars) {
      const v = c[key];
      if (typeof v === "string" && v.length > 0) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
    return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
      a.value.localeCompare(b.value),
    );
  };

  const prices = cars.map((c) => c.price).filter((n) => Number.isFinite(n));
  const years = cars.map((c) => c.year ?? 0).filter((n) => n > 0);

  return {
    brands: bucket("brand"),
    fuels: bucket("fuel_type"),
    transmissions: bucket("transmission"),
    bodies: bucket("body_type"),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    yearMin: years.length ? Math.min(...years) : 0,
    yearMax: years.length ? Math.max(...years) : new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------------
// Backwards-compatibility helpers used by existing pages
// ---------------------------------------------------------------------------

export async function getPublicCars(filters?: CarFilterParams, sort: string = "newest") {
  const result = await listPublicCars({ filters, sort: (sort as CarSort) || "newest" });
  return result.cars;
}

export async function getAllBrands(): Promise<string[]> {
  const opts = await getFilterOptions();
  return opts.brands.map((b) => b.value);
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function getCarById(id: string): Promise<Car | null> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(*)")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return fromRow(data as CarRow, ((data as CarRowWithImages).car_images ?? []));
    }
  }
  return seedMutable.find((c) => c.id === id) ?? null;
}

export async function adminListCars(): Promise<Car[]> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(*)")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return (data as CarRowWithImages[]).map((row) => fromRow(row, row.car_images ?? []));
      }
    }
  }
  return seedMutable.slice();
}

export type CarUpsertInput = Partial<Car> & {
  brand: string;
  model: string;
  price: number;
};

export async function upsertCar(input: CarUpsertInput): Promise<Car> {
  const supabase = isSupabaseConfigured ? await createSupabaseServerClient() : null;
  const slug = input.slug ?? buildSlug(input);
  const title =
    input.title ??
    `${input.brand} ${input.model} ${input.version ?? ""}`.trim().replace(/\s+/g, " ");

  if (supabase) {
    const payload = {
      slug,
      title,
      brand: input.brand,
      model: input.model,
      version: input.version ?? null,
      year: input.year ?? null,
      price: input.price,
      mileage: input.mileage ?? null,
      fuel_type: input.fuel_type ?? null,
      transmission: input.transmission ?? null,
      body_type: input.body_type ?? null,
      color: input.color ?? null,
      doors: input.doors ?? null,
      seats: input.seats ?? null,
      power_hp: input.power_hp ?? null,
      engine_cc: input.engine_cc ?? null,
      apk_until: input.apk_until ?? null,
      license_plate: input.license_plate ?? null,
      vat_type: input.vat_type ?? "marge",
      description: input.description ?? null,
      options: (input.options ?? []) as unknown as Json,
      status: input.status ?? "available",
      is_featured: input.is_featured ?? false,
      is_published: input.is_published ?? true,
    };

    const { data, error } = input.id
      ? await supabase.from("cars").update(payload).eq("id", input.id).select("*, car_images(*)").single()
      : await supabase.from("cars").insert(payload).select("*, car_images(*)").single();

    if (error) throw error;
    return fromRow(data as CarRow, ((data as CarRowWithImages).car_images ?? []));
  }

  // Seed fallback
  const now = new Date().toISOString();
  if (input.id) {
    const idx = seedMutable.findIndex((c) => c.id === input.id);
    if (idx >= 0) {
      const next: Car = {
        ...seedMutable[idx],
        ...input,
        slug,
        title,
        updated_at: now,
        options: input.options ?? seedMutable[idx].options,
      };
      seedMutable[idx] = next;
      return next;
    }
  }
  const car: Car = {
    id: `c_${Date.now().toString(36)}`,
    slug,
    title,
    brand: input.brand,
    model: input.model,
    version: input.version,
    year: input.year,
    price: input.price,
    mileage: input.mileage,
    fuel_type: input.fuel_type,
    transmission: input.transmission,
    body_type: input.body_type,
    color: input.color,
    doors: input.doors,
    seats: input.seats,
    power_hp: input.power_hp,
    engine_cc: input.engine_cc,
    apk_until: input.apk_until,
    license_plate: input.license_plate,
    vat_type: input.vat_type ?? "marge",
    description: input.description,
    options: input.options ?? [],
    status: input.status ?? "available",
    is_featured: input.is_featured ?? false,
    is_published: input.is_published ?? true,
    main_image: input.main_image,
    created_at: now,
    updated_at: now,
  };
  seedMutable.unshift(car);
  return car;
}

export async function deleteCar(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.from("cars").delete().eq("id", id);
      return;
    }
  }
  const idx = seedMutable.findIndex((c) => c.id === id);
  if (idx >= 0) seedMutable.splice(idx, 1);
}

export async function updateCarStatus(id: string, status: CarStatus): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.from("cars").update({ status }).eq("id", id);
      return;
    }
  }
  const car = seedMutable.find((c) => c.id === id);
  if (car) car.status = status;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function buildSlug(input: { brand: string; model: string; year?: number; license_plate?: string }) {
  const base = `${input.brand}-${input.model}${input.year ? `-${input.year}` : ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = input.license_plate
    ? input.license_plate.toLowerCase().replace(/[^a-z0-9]/g, "")
    : Date.now().toString(36).slice(-6);
  return `${base}-${suffix}`;
}

// Used by storage actions
export async function attachCarImage(
  carId: string,
  data: { storage_path: string; image_url: string; alt_text?: string; sort_order?: number; is_main?: boolean },
): Promise<CarImage | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from("car_images")
    .insert({
      car_id: carId,
      storage_path: data.storage_path,
      image_url: data.image_url,
      alt_text: data.alt_text ?? null,
      sort_order: data.sort_order ?? 0,
      is_main: data.is_main ?? false,
    })
    .select("*")
    .single();
  if (error || !row) return null;
  return {
    id: row.id,
    car_id: row.car_id,
    image_url: row.image_url,
    storage_path: row.storage_path,
    alt_text: row.alt_text ?? undefined,
    sort_order: row.sort_order,
    is_main: row.is_main,
  };
}

// Legacy compatibility aliases used by old admin / api routes.
export const adminGetCars = adminListCars;
export const adminUpsertCar = upsertCar;
export const adminDeleteCar = deleteCar;
export const adminUpdateStatus = updateCarStatus;
