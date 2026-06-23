import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/config";

export const runtime = "nodejs";

const BUCKET = "inquiry-uploads";
const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Uploads sell-form photos to a public Supabase Storage bucket and returns the
 * public URLs. Degrades gracefully ({ configured: false }) when no service-role
 * key is set — the client then asks the user to send photos via WhatsApp.
 */
export async function POST(req: NextRequest) {
  if (!hasServiceRole) {
    return NextResponse.json({ ok: false, configured: false });
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: false, configured: false });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ ok: false, error: "no-files" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ ok: false, error: "too-many" }, { status: 400 });

  // Self-provision the bucket on first use (no-op if it already exists).
  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  });

  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/") || file.size > MAX_BYTES) continue;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `sell/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    }
  }

  return NextResponse.json({ ok: true, configured: true, urls });
}
