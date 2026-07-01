"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAuthenticatedAdmin } from "@/lib/auth/session";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export interface SettingsState {
  ok: boolean;
  message?: string;
  error?: string;
}

export const initialSettingsState: SettingsState = { ok: false };

const nameSchema = z.object({
  full_name: z.string().trim().min(1, "Vul een naam in").max(80),
});

/** Update the owner's display name (Supabase user_metadata.full_name). */
export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!(await isAuthenticatedAdmin())) return { ok: false, error: "Niet geautoriseerd" };
  const parsed = nameSchema.safeParse({ full_name: formData.get("full_name") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige naam" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Niet beschikbaar" };
  const { error } = await supabase.auth.updateUser({ data: { full_name: parsed.data.full_name } });
  if (error) return { ok: false, error: "Opslaan mislukt. Probeer opnieuw." };

  revalidatePath("/admin", "layout");
  return { ok: true, message: "Naam opgeslagen." };
}

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vul een e-mailadres in")
    .max(200)
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Vul een geldig e-mailadres in"),
});

function emailErrorMessage(msg: string): string {
  return /already|exists|registered|in use|taken/i.test(msg)
    ? "Dit e-mailadres is al in gebruik."
    : "Wijzigen mislukt. Probeer opnieuw.";
}

/** Change the owner's login e-mail. */
export async function updateEmailAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!(await isAuthenticatedAdmin())) return { ok: false, error: "Niet geautoriseerd" };
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldig e-mailadres" };
  const email = parsed.data.email.toLowerCase();

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Niet beschikbaar" };
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { ok: false, error: "Sessie verlopen. Log opnieuw in." };

  if (user.email?.toLowerCase() === email) {
    return { ok: true, message: "Dit is al je huidige e-mailadres." };
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    // Service-role change applies immediately — no confirmation e-mail needed.
    const { error } = await admin.auth.admin.updateUserById(user.id, { email, email_confirm: true });
    if (error) return { ok: false, error: emailErrorMessage(error.message) };
    revalidatePath("/admin", "layout");
    return { ok: true, message: "E-mailadres bijgewerkt." };
  }

  // Fallback without service role: user-scoped change may need confirmation.
  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { ok: false, error: "Wijzigen mislukt. Probeer opnieuw." };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Controleer je inbox om het nieuwe e-mailadres te bevestigen." };
}

const pwSchema = z
  .object({
    password: z.string().min(8, "Minimaal 8 tekens").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirm"],
  });

/** Change the owner's password (Supabase auth). */
export async function updatePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!(await isAuthenticatedAdmin())) return { ok: false, error: "Niet geautoriseerd" };
  const parsed = pwSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldig wachtwoord" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Niet beschikbaar" };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: "Wijzigen mislukt. Log opnieuw in en probeer het nogmaals." };
  }
  return { ok: true, message: "Wachtwoord gewijzigd." };
}
