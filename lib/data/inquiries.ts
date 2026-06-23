/**
 * Inquiries data layer.
 *
 * Adapter pattern matching {@link lib/data/cars.ts}. Public callers write
 * via {@link createInquiry}; admin pages read/update via the helpers below.
 */

import "server-only";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Inquiry, InquiryStatus, InquiryType, InquiryMetadata } from "@/lib/types";
import type { InquiryRow, Json } from "@/lib/supabase/database.types";

const memory: Inquiry[] = [];

function fromRow(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    car_id: row.car_id,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    message: row.message ?? undefined,
    metadata: (row.metadata && typeof row.metadata === "object" ? row.metadata as InquiryMetadata : {}) as InquiryMetadata,
    status: row.status,
    created_at: row.created_at,
  };
}

export interface CreateInquiryInput {
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  car_id?: string | null;
  metadata?: InquiryMetadata;
  ip_hash?: string;
  user_agent?: string;
}

export async function createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  if (isSupabaseConfigured) {
    // Use the admin client when present so RLS does not block server-side
    // inserts; otherwise the anon insert policy still allows submissions.
    const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    if (supabase) {
      const { data, error } = await supabase
        .from("inquiries")
        .insert({
          type: input.type,
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          message: input.message ?? null,
          car_id: input.car_id ?? null,
          metadata: (input.metadata ?? {}) as unknown as Json,
          status: "new",
          ip_hash: input.ip_hash ?? null,
          user_agent: input.user_agent ?? null,
        })
        .select("*")
        .single();
      if (!error && data) return fromRow(data as InquiryRow);
    }
  }

  const inquiry: Inquiry = {
    id: `inq_${Date.now().toString(36)}`,
    car_id: input.car_id ?? null,
    type: input.type,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    metadata: input.metadata,
    status: "new",
    created_at: new Date().toISOString(),
  };
  memory.unshift(inquiry);

  if (process.env.NODE_ENV !== "production") {
    console.info("[INQUIRY]", inquiry.type, inquiry.name, inquiry.email);
  }
  return inquiry;
}

export interface ListInquiriesOptions {
  status?: InquiryStatus;
  type?: InquiryType;
  limit?: number;
}

export async function listInquiries(opts: ListInquiriesOptions = {}): Promise<Inquiry[]> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      let q = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (opts.status) q = q.eq("status", opts.status);
      if (opts.type) q = q.eq("type", opts.type);
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (!error && data) return data.map((r) => fromRow(r as InquiryRow));
    }
  }
  let list = memory.slice();
  if (opts.status) list = list.filter((i) => i.status === opts.status);
  if (opts.type) list = list.filter((i) => i.type === opts.type);
  if (opts.limit) list = list.slice(0, opts.limit);
  return list;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.from("inquiries").update({ status }).eq("id", id);
      return;
    }
  }
  const inq = memory.find((i) => i.id === id);
  if (inq) inq.status = status;
}

// Backwards compatibility
export const getInquiriesAdmin = (opts?: ListInquiriesOptions) => listInquiries(opts);
