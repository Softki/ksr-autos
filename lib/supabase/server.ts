import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  hasServiceRole,
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./config";
import type { Database } from "./database.types";
import { createClient } from "@supabase/supabase-js";

/**
 * SSR-friendly Supabase client bound to the current request's cookies.
 * Use this in Server Components, Server Actions and Route Handlers when you
 * need the user's auth session (admin pages).
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  const store = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return store.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options as CookieOptions);
          }
        } catch {
          // Setting cookies is only allowed in Server Actions / Route
          // Handlers. Reading-only Server Components will throw — swallow.
        }
      },
    },
  });
}

/**
 * Service-role client. Never use this in a Client Component. Only call from
 * trusted server contexts (Server Actions, Route Handlers, API routes).
 * Bypasses RLS — use sparingly.
 */
export function createSupabaseAdminClient() {
  if (!hasServiceRole) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
