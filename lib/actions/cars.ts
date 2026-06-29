"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isAuthenticatedAdmin } from "@/lib/auth/session";
import {
  buildSlug,
  deleteCar,
  updateCarStatus,
  upsertCar,
  type CarUpsertInput,
} from "@/lib/data/cars";
import type { Car, CarStatus } from "@/lib/types";
import type { CarFormState } from "./state";

const STATUS_VALUES = ["draft", "available", "reserved", "sold", "hidden"] as const;

const carSchema = z.object({
  id: z.string().max(64).optional().or(z.literal("")),
  brand: z.string().trim().min(1, "Merk is verplicht").max(60),
  model: z.string().trim().min(1, "Model is verplicht").max(80),
  version: z.string().trim().max(200).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  price: z.coerce.number().int().min(0, "Prijs is verplicht").max(10_000_000),
  mileage: z.coerce.number().int().min(0).max(2_000_000).optional(),
  fuel_type: z.string().max(40).optional().or(z.literal("")),
  transmission: z.string().max(40).optional().or(z.literal("")),
  body_type: z.string().max(40).optional().or(z.literal("")),
  color: z.string().max(40).optional().or(z.literal("")),
  doors: z.coerce.number().int().min(0).max(10).optional(),
  seats: z.coerce.number().int().min(0).max(20).optional(),
  power_hp: z.coerce.number().int().min(0).max(2000).optional(),
  engine_cc: z.coerce.number().int().min(0).max(10000).optional(),
  apk_until: z.string().max(20).optional().or(z.literal("")),
  license_plate: z.string().trim().toUpperCase().max(20).optional().or(z.literal("")),
  vat_type: z.enum(["marge", "btw", "ex_btw"]).optional(),
  description: z.string().max(8000).optional().or(z.literal("")),
  options_text: z.string().max(4000).optional().or(z.literal("")),
  main_image: z.string().max(600).optional().or(z.literal("")),
  status: z.enum(STATUS_VALUES).default("available"),
  is_featured: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).optional(),
  is_published: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).optional(),
});

async function requireAdmin(): Promise<CarFormState | null> {
  if (!(await isAuthenticatedAdmin())) {
    return { ok: false, message: "Niet geautoriseerd" };
  }
  return null;
}

export async function upsertCarAction(
  _prev: CarFormState,
  formData: FormData,
): Promise<CarFormState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const raw = Object.fromEntries(formData.entries());
  const parsed = carSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") errors[key] = issue.message;
    }
    return { ok: false, message: "Controleer de gegevens en probeer opnieuw.", errors };
  }

  const data = parsed.data;

  const options = (data.options_text ?? "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const input: CarUpsertInput = {
    id: data.id || undefined,
    brand: data.brand,
    model: data.model,
    version: data.version || undefined,
    year: data.year,
    price: data.price,
    mileage: data.mileage,
    fuel_type: data.fuel_type || undefined,
    transmission: data.transmission || undefined,
    body_type: data.body_type || undefined,
    color: data.color || undefined,
    doors: data.doors,
    seats: data.seats,
    power_hp: data.power_hp,
    engine_cc: data.engine_cc,
    apk_until: data.apk_until || undefined,
    license_plate: data.license_plate || undefined,
    vat_type: data.vat_type ?? "marge",
    description: data.description || undefined,
    options,
    status: data.status as CarStatus,
    is_featured: Boolean(data.is_featured),
    is_published: data.is_published == null ? true : Boolean(data.is_published),
    main_image: data.main_image || undefined,
  };

  const isNew = !input.id;
  if (isNew) {
    input.slug = buildSlug({
      brand: input.brand,
      model: input.model,
      year: input.year,
      license_plate: input.license_plate,
    });
  }

  let saved: Car;
  try {
    saved = await upsertCar(input);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[upsertCarAction]", err);
    return { ok: false, message: "Opslaan mislukt. Probeer opnieuw." };
  }

  revalidatePath("/admin/cars");
  revalidatePath(`/aanbod/${saved.slug}`);
  revalidatePath("/aanbod");
  revalidatePath("/");
  // redirect() must live OUTSIDE the try/catch above: it throws NEXT_REDIRECT,
  // which the catch would otherwise swallow and report as a save failure.
  // New cars go to their edit page so photos can be added right away.
  redirect(isNew ? `/admin/cars/${saved.id}/edit?created=1` : "/admin/cars?saved=1");
}

export async function deleteCarAction(formData: FormData): Promise<void> {
  const denied = await requireAdmin();
  if (denied) return;
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteCar(id);
  revalidatePath("/admin/cars");
  revalidatePath("/aanbod");
  redirect("/admin/cars?deleted=1");
}

export async function updateCarStatusAction(formData: FormData): Promise<void> {
  const denied = await requireAdmin();
  if (denied) return;
  const id = formData.get("id") as string;
  const status = formData.get("status") as CarStatus;
  if (!id || !STATUS_VALUES.includes(status)) return;
  await updateCarStatus(id, status);
  revalidatePath("/admin/cars");
  revalidatePath("/aanbod");
}
