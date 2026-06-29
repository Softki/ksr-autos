/**
 * Car images data layer — Supabase Storage (bucket `car-images`) + the
 * `car_images` table. All writes go through the service-role admin client, so
 * callers MUST authenticate the admin before invoking these (the API route does).
 *
 * Model: a car's images are displayed [is_main first, then sort_order asc]
 * (matching `fromRow` in lib/data/cars.ts and the public ImageGallery).
 * Position 0 is the cover photo — `reorderCarImages` keeps `is_main` on the
 * first id so "set as cover" is simply "move to front".
 */

import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/config";
import type { CarImage } from "@/lib/types";
import type { CarImageRow } from "@/lib/supabase/database.types";

const BUCKET = "car-images";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fromRow(row: CarImageRow): CarImage {
  return {
    id: row.id,
    car_id: row.car_id,
    image_url: row.image_url,
    storage_path: row.storage_path,
    alt_text: row.alt_text ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    sort_order: row.sort_order,
    is_main: row.is_main,
  };
}

export interface UploadFile {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

/** Upload files to Storage and attach them to a car. New images append after
 *  existing ones; the very first image of a car with no photos becomes cover. */
export async function uploadCarImages(carId: string, files: UploadFile[]): Promise<CarImage[]> {
  if (!hasServiceRole) return [];
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  // Self-provision the bucket (idempotent — no-op if it already exists).
  await supabase.storage
    .createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"],
    })
    .catch(() => {});

  const { data: existing, error: existingErr } = await supabase
    .from("car_images")
    .select("id,sort_order")
    .eq("car_id", carId);
  const existingRows = existing ?? [];
  let nextOrder = existingRows.reduce((m, r) => Math.max(m, r.sort_order), -1) + 1;
  // Only claim cover for a genuinely empty car. If the read FAILED we must not
  // assume "empty" — that would set is_main on the new photo and the
  // single-main trigger would silently demote the car's real existing cover.
  const carHadNoImages = !existingErr && existingRows.length === 0;

  const created: CarImage[] = [];
  for (const f of files) {
    if (f.buffer.length === 0 || f.buffer.length > MAX_BYTES) continue;
    const path = `${carId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${f.ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f.buffer, {
      contentType: f.contentType,
      upsert: false,
    });
    if (upErr) continue;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const isMain = carHadNoImages && created.length === 0;
    const { data: row, error: insErr } = await supabase
      .from("car_images")
      .insert({ car_id: carId, storage_path: path, image_url: pub.publicUrl, sort_order: nextOrder++, is_main: isMain })
      .select("*")
      .single();

    if (insErr || !row) {
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {}); // avoid orphaned object
      continue;
    }
    created.push(fromRow(row as CarImageRow));
  }
  return created;
}

/** Delete one image (Storage object + row). Promotes a new cover if needed. */
export async function deleteCarImage(imageId: string): Promise<void> {
  if (!hasServiceRole) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const { data: row } = await supabase
    .from("car_images")
    .select("storage_path,car_id,is_main")
    .eq("id", imageId)
    .maybeSingle();
  if (!row) return;

  if (row.storage_path) await supabase.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});
  await supabase.from("car_images").delete().eq("id", imageId);

  // If we removed the cover, promote the lowest-sorted remaining image.
  if (row.is_main) {
    const { data: rest } = await supabase
      .from("car_images")
      .select("id")
      .eq("car_id", row.car_id)
      .order("sort_order", { ascending: true })
      .limit(1);
    if (rest && rest[0]) await supabase.from("car_images").update({ is_main: true }).eq("id", rest[0].id);
  }
}

/** Persist a new order. Index 0 becomes the cover (`is_main`). */
export async function reorderCarImages(carId: string, orderedIds: string[]): Promise<void> {
  if (!hasServiceRole || orderedIds.length === 0) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  // Clear all cover flags first so the single-main unique index never conflicts.
  await supabase.from("car_images").update({ is_main: false }).eq("car_id", carId);
  // Then set sort_order = index, and is_main on the first.
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("car_images").update({ sort_order: i, is_main: i === 0 }).eq("id", id).eq("car_id", carId),
    ),
  );
}
