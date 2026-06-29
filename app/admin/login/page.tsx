import { redirect } from "next/navigation";
import { Phone, ShieldCheck } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAuthenticatedAdmin } from "@/lib/auth/session";
import { signInAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/Logo";
import { LoginForm, type LoginState } from "@/components/admin/LoginForm";
import { LockBodyScroll } from "@/components/admin/LockBodyScroll";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

interface SearchParams {
  redirect?: string;
  error?: string;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  if (await isAuthenticatedAdmin()) {
    redirect(sp.redirect ?? "/admin");
  }

  const redirectTo = sp.redirect ?? "/admin";

  async function action(_prev: LoginState, formData: FormData): Promise<LoginState> {
    "use server";
    const result = await signInAction(formData);
    if (!result.ok) {
      return { error: result.error ?? "Inloggen mislukt. Controleer uw gegevens en probeer opnieuw." };
    }
    redirect((formData.get("redirect") as string) || "/admin");
  }

  return (
    <div className="grid h-[100dvh] w-full overflow-hidden bg-[var(--color-canvas)] lg:grid-cols-[1.05fr_1fr]">
      <LockBodyScroll />

      {/* ── Left: brand showcase (desktop only) ───────────────────────────── */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-ink)] p-12 text-white lg:flex xl:p-16">
        {/* dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.55] pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]"
        />
        {/* terracotta corner glow */}
        <div
          aria-hidden
          className="absolute right-[-180px] top-[-220px] h-[560px] w-[560px] rounded-full pointer-events-none [background:radial-gradient(circle,rgba(209,87,40,0.22),transparent_70%)]"
        />
        {/* plate-yellow glow */}
        <div
          aria-hidden
          className="absolute bottom-[-200px] left-[-160px] h-[420px] w-[420px] rounded-full pointer-events-none [background:radial-gradient(circle,rgba(247,208,0,0.10),transparent_70%)]"
        />

        <div className="relative">
          <Logo onDark height={36} priority />
        </div>

        <div className="relative max-w-[24ch]">
          <div className="mb-6 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-red-soft)]">
            <span className="h-[2px] w-7 bg-[var(--color-plate)]" />
            Beheeromgeving
          </div>

          <h1 className="font-display text-[clamp(30px,3.4vw,46px)] font-extrabold leading-[1.04] tracking-tight text-white">
            Welkom terug.
          </h1>
          <p className="mt-5 text-[15.5px] leading-relaxed text-white/65">
            Log in om de voorraad, aanvragen en content van KSR Auto&rsquo;s te beheren.
          </p>

          {/* kentekenlijn — license-plate brand signature */}
          <div className="mt-9 inline-flex h-[46px] items-stretch overflow-hidden rounded-[8px] border-[2px] border-black/85 bg-[var(--color-plate)] shadow-[0_16px_34px_-14px_rgba(247,208,0,0.55)]">
            <div className="flex w-8 flex-col items-center justify-center gap-[2px] bg-[var(--color-plate-eu)]">
              <span className="text-[7px] leading-none tracking-[-0.05em] text-[var(--color-plate)]">★★★</span>
              <span className="font-display text-[11px] font-extrabold leading-none text-white">NL</span>
            </div>
            <div className="flex items-center px-4 font-display text-[19px] font-extrabold tracking-[0.12em] text-[#111]">
              KSR·ADMIN
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[12.5px] text-white/45">
          <ShieldCheck className="size-4" aria-hidden />
          Beveiligde omgeving · {BUSINESS.city}
        </div>
      </aside>

      {/* ── Right: login form ─────────────────────────────────────────────── */}
      <main className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-8 sm:px-10">
        <div className="w-full max-w-[400px]">
          {/* mobile logo */}
          <div className="mb-9 flex justify-center lg:hidden">
            <Logo height={34} priority />
          </div>

          <div className="mb-7">
            <div className="eyebrow mb-2.5">Admin</div>
            <h2 className="font-display text-[26px] font-extrabold tracking-tight">Inloggen</h2>
            <p className="mt-1.5 text-[14.5px] text-[var(--color-steel)]">
              Voer uw gegevens in om verder te gaan.
            </p>
          </div>

          <LoginForm
            action={action}
            showEmail={isSupabaseConfigured}
            redirectTo={redirectTo}
          />

          <div className="mt-7 flex items-center justify-center border-t border-[var(--color-line)] pt-5 text-[13px]">
            <a
              href={BUSINESS.telHref}
              className="tabular inline-flex items-center gap-1.5 font-medium text-[var(--color-steel)] transition-colors hover:text-[var(--color-ink)]"
            >
              <Phone className="size-3.5" aria-hidden />
              {BUSINESS.phone}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
