"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { createInquiry } from "@/lib/data/inquiries";
import { rateLimit, hashIdentifier } from "@/lib/rate-limit";
import { SUCCESS_MESSAGE } from "@/lib/constants";
import type { InquiryActionState } from "./state";

const baseSchema = z.object({
  type: z.enum(["contact", "test_drive", "trade_in", "search_request"]),
  name: z.string().trim().min(2, "Vul uw naam in").max(120),
  email: z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  car_id: z.string().max(64).optional().or(z.literal("")),
  // Trade-in / search extras
  brand: z.string().trim().max(60).optional().or(z.literal("")),
  model: z.string().trim().max(60).optional().or(z.literal("")),
  mileage: z.string().trim().max(20).optional().or(z.literal("")),
  condition: z.string().trim().max(60).optional().or(z.literal("")),
  asking_price: z.string().trim().max(40).optional().or(z.literal("")),
  budget: z.string().trim().max(40).optional().or(z.literal("")),
  kenteken: z.string().trim().max(12).optional().or(z.literal("")),
  year: z.string().trim().max(10).optional().or(z.literal("")),
  // JSON array of uploaded photo URLs (from /api/sell-photos)
  photos: z.string().max(8000).optional().or(z.literal("")),
  // Honeypot (must remain empty)
  website: z.string().max(0, { message: "spam" }).optional().or(z.literal("")),
  // Form timing — submissions faster than 1s after page load are suspect
  ts: z.string().optional(),
});

export async function submitInquiryAction(
  _prev: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = baseSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") errors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Controleer onderstaande velden en probeer het opnieuw.",
      errors,
    };
  }

  const data = parsed.data;

  if ((data.website ?? "").length > 0) {
    return { ok: false, message: "Verzoek geweigerd." };
  }

  if (data.ts) {
    const ts = Number(data.ts);
    if (Number.isFinite(ts) && Date.now() - ts < 1500) {
      return { ok: false, message: "Even geduld — probeer het opnieuw." };
    }
  }

  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    reqHeaders.get("x-real-ip") ||
    "unknown";

  const rl = rateLimit(`inq:${ip}`, { limit: 8, windowSec: 60 * 10 });
  if (!rl.ok) {
    return {
      ok: false,
      message: "U heeft veel berichten gestuurd. Probeer het later opnieuw of bel ons direct.",
    };
  }

  const userAgent = reqHeaders.get("user-agent") ?? undefined;
  const ip_hash = await hashIdentifier(`${ip}|${userAgent ?? ""}`);

  const metadata: Record<string, string> = {};
  if (data.brand) metadata.brand = data.brand;
  if (data.model) metadata.model = data.model;
  if (data.mileage) metadata.mileage = data.mileage;
  if (data.condition) metadata.condition = data.condition;
  if (data.asking_price) metadata.asking_price = data.asking_price;
  if (data.budget) metadata.budget = data.budget;
  if (data.kenteken) metadata.kenteken = data.kenteken.toUpperCase();
  if (data.year) metadata.year = data.year;
  if (data.photos) metadata.photos = data.photos;

  try {
    await createInquiry({
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message || undefined,
      car_id: data.car_id || undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      ip_hash,
      user_agent: userAgent,
    });

    return { ok: true, message: SUCCESS_MESSAGE };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[inquiry-action]", err);
    return {
      ok: false,
      message: "Er ging iets mis bij het versturen. Probeer het opnieuw of bel ons direct via 06 185 800 91.",
    };
  }
}

