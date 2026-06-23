"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const DEMO_PASSWORD = process.env.ADMIN_PASSWORD || "ksr-demo-2026";

const LoginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1, "Wachtwoord is verplicht").max(200),
});

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const parsed = LoginSchema.safeParse({
    email: (formData.get("email") as string) || undefined,
    password: (formData.get("password") as string) || "",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  if (isSupabaseConfigured) {
    if (!parsed.data.email) {
      return { ok: false, error: "E-mail is verplicht voor Supabase login" };
    }
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, error: "Supabase niet beschikbaar" };

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) return { ok: false, error: "Ongeldige inloggegevens" };
    return { ok: true };
  }

  // Demo-mode fallback (no Supabase). Use the env-defined password.
  if (parsed.data.password !== DEMO_PASSWORD) {
    return { ok: false, error: "Ongeldig wachtwoord" };
  }
  const store = await cookies();
  store.set("ksr_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  } else {
    const store = await cookies();
    store.delete("ksr_admin");
  }
  redirect("/admin/login");
}
