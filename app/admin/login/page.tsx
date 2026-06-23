import { redirect } from "next/navigation";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAuthenticatedAdmin } from "@/lib/auth/session";
import { signInAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/Logo";
import { BUSINESS } from "@/lib/constants";

export const metadata = { title: "Admin login" };

interface SearchParams { redirect?: string; error?: string }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  if (await isAuthenticatedAdmin()) {
    redirect(sp.redirect ?? "/admin");
  }

  async function action(formData: FormData) {
    "use server";
    const result = await signInAction(formData);
    const search = new URLSearchParams();
    if (!result.ok) {
      if (sp.redirect) search.set("redirect", sp.redirect);
      search.set("error", result.error ?? "login");
      redirect(`/admin/login?${search.toString()}`);
    }
    redirect((formData.get("redirect") as string) || sp.redirect || "/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-6">
      <div className="card p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <Logo height={32} />
          <span className="label-mono pl-3 border-l border-[var(--color-line-strong)]">Admin</span>
        </div>

        <h1 className="h3 mb-4">Inloggen</h1>

        {sp.error && (
          <div className="field-error mb-4 rounded-md bg-[var(--color-error-tint)] border border-[var(--color-error)]/30 px-3 py-2">
            Inloggen mislukt. Controleer uw gegevens en probeer opnieuw.
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="redirect" value={sp.redirect ?? "/admin"} />

          {isSupabaseConfigured && (
            <div>
              <label className="field-label" htmlFor="email">E-mailadres</label>
              <input id="email" name="email" type="email" autoComplete="username" required className="input" />
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="password">Wachtwoord</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
          </div>

          <button className="btn btn-dark w-full" type="submit">Inloggen</button>

          {!isSupabaseConfigured && (
            <p className="field-help">
              Demo-modus actief. Gebruik <code className="font-mono text-[12px]">ADMIN_PASSWORD</code> (of <code>ksr-demo-2026</code>) zolang er nog geen Supabase-project gekoppeld is.
            </p>
          )}
        </form>

        <div className="mt-6 border-t border-[var(--color-line)] pt-4 text-sm flex justify-between text-[var(--color-steel)]">
          <Link href="/" className="link-quiet hover:text-[var(--color-ink)]">← Naar website</Link>
          <a href={BUSINESS.telHref} className="link-quiet hover:text-[var(--color-ink)] tabular">{BUSINESS.phone}</a>
        </div>
      </div>
    </div>
  );
}
