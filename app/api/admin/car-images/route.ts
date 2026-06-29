import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAuthenticatedAdmin } from "@/lib/auth/session";
import {
  uploadCarImages,
  deleteCarImage,
  reorderCarImages,
  type UploadFile,
} from "@/lib/data/car-images";

export const runtime = "nodejs";

const MAX_FILES = 15;
const MAX_BYTES = 10 * 1024 * 1024;

// Allow-list keyed by the declared MIME. The extension and the stored
// content-type are taken from here (NOT the filename), and the canonical MIME
// matches the bucket's allowedMimeTypes so Storage accepts the upload.
const ALLOWED: Record<string, { ext: string; mime: string }> = {
  "image/jpeg": { ext: "jpg", mime: "image/jpeg" },
  "image/jpg": { ext: "jpg", mime: "image/jpeg" },
  "image/png": { ext: "png", mime: "image/png" },
  "image/webp": { ext: "webp", mime: "image/webp" },
  "image/heic": { ext: "heic", mime: "image/heic" },
  "image/heif": { ext: "heic", mime: "image/heic" },
  "image/avif": { ext: "avif", mime: "image/avif" },
};

async function requireAdmin() {
  return isAuthenticatedAdmin();
}

function revalidatePublic() {
  // Home shows featured cars (static); detail + listing are dynamic.
  revalidatePath("/");
  revalidatePath("/aanbod");
}

/** Upload one or more images and attach them to a car. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const carId = form.get("carId");
  if (typeof carId !== "string" || !carId) {
    return NextResponse.json({ ok: false, error: "no-car" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ ok: false, error: "no-files" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ ok: false, error: "too-many" }, { status: 400 });

  const prepared: UploadFile[] = [];
  for (const file of files) {
    const allowed = ALLOWED[file.type.toLowerCase()];
    if (!allowed || file.size === 0 || file.size > MAX_BYTES) continue;
    prepared.push({ buffer: Buffer.from(await file.arrayBuffer()), contentType: allowed.mime, ext: allowed.ext });
  }
  if (prepared.length === 0) return NextResponse.json({ ok: false, error: "no-valid-images" }, { status: 400 });

  const images = await uploadCarImages(carId, prepared);
  if (images.length === 0) return NextResponse.json({ ok: false, error: "upload-failed" }, { status: 500 });

  revalidatePublic();
  return NextResponse.json({ ok: true, images });
}

/** Delete a single image. Body: { imageId }. */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { imageId } = await req.json().catch(() => ({}));
  if (typeof imageId !== "string" || !imageId) {
    return NextResponse.json({ ok: false, error: "no-id" }, { status: 400 });
  }
  await deleteCarImage(imageId);
  revalidatePublic();
  return NextResponse.json({ ok: true });
}

/** Reorder / set cover. Body: { carId, orderedIds: string[] } (index 0 = cover). */
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { carId, orderedIds } = body ?? {};
  if (typeof carId !== "string" || !carId || !Array.isArray(orderedIds) || orderedIds.some((x) => typeof x !== "string")) {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  await reorderCarImages(carId, orderedIds);
  revalidatePublic();
  return NextResponse.json({ ok: true });
}
