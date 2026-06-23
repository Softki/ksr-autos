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
