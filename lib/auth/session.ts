import "server-only";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Returns `true` when the current request is from an authenticated admin.
 *
 * - When Supabase is configured: checks the Supabase Auth session.
 * - When Supabase is NOT configured: falls back to the `ksr_admin=1`
 *   cookie that the demo login route sets.
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return false;
    const { data } = await supabase.auth.getUser();
    return Boolean(data.user);
  }

  const store = await cookies();
  return store.get("ksr_admin")?.value === "1";
}

export async function getCurrentAdminEmail(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export interface AdminIdentity {
  email: string | null;
  /** Owner's real name from user_metadata.full_name, if set. */
  name: string | null;
}

/** Current admin's email + display name (from Supabase user_metadata). */
export async function getCurrentAdmin(): Promise<AdminIdentity> {
  if (!isSupabaseConfigured) return { email: null, name: null };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { email: null, name: null };
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  const raw = u?.user_metadata?.full_name;
  const name = typeof raw === "string" && raw.trim() ? raw.trim() : null;
  return { email: u?.email ?? null, name };
}
