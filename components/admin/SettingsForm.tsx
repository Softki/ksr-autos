"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { User, Mail, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Save } from "lucide-react";

import { updateProfileAction, updateEmailAction, updatePasswordAction, initialSettingsState, type SettingsState } from "@/lib/actions/settings";

export function SettingsForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialSettingsState);
  const [emailState, emailAction] = useActionState(updateEmailAction, initialSettingsState);
  const [pwState, pwAction] = useActionState(updatePasswordAction, initialSettingsState);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="space-y-5">
      {/* Profile / name */}
      <section className="card p-5 md:p-6">
        <SectionHead icon={User} title="Profiel" desc="Je naam verschijnt in het beheerpaneel." />
        <form action={profileAction} className="mt-5 space-y-4">
          <label className="block">
            <span className="field-label">Volledige naam</span>
            <input
              name="full_name"
              defaultValue={initialName}
              placeholder="Bijv. Jan Jansen"
              maxLength={80}
              required
              className="input"
              autoComplete="name"
            />
          </label>
          <Notice state={profileState} />
          <SaveButton>Naam opslaan</SaveButton>
        </form>
      </section>

      {/* Login e-mail */}
      <section className="card p-5 md:p-6">
        <SectionHead icon={Mail} title="Inlog e-mailadres" desc="Het adres waarmee je inlogt op het beheerpaneel." />
        <form action={emailAction} className="mt-5 space-y-4">
          <label className="block">
            <span className="field-label">E-mailadres</span>
            <input
              name="email"
              type="email"
              defaultValue={initialEmail}
              placeholder="naam@voorbeeld.nl"
              maxLength={200}
              required
              className="input"
              autoComplete="email"
            />
          </label>
          <Notice state={emailState} />
          <SaveButton>E-mailadres opslaan</SaveButton>
        </form>
      </section>

      {/* Password */}
      <section className="card p-5 md:p-6">
        <SectionHead icon={KeyRound} title="Wachtwoord wijzigen" desc="Minimaal 8 tekens. Kies iets dat lastig te raden is." />
        <form action={pwAction} className="mt-5 space-y-4">
          <label className="block">
            <span className="field-label">Nieuw wachtwoord</span>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                minLength={8}
                required
                autoComplete="new-password"
                className="input !pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="admin-icon-btn absolute right-1.5 top-1/2 -translate-y-1/2"
                aria-label={showPw ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
              >
                {showPw ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="field-label">Herhaal wachtwoord</span>
            <input
              name="confirm"
              type={showPw ? "text" : "password"}
              minLength={8}
              required
              autoComplete="new-password"
              className="input"
            />
          </label>
          <Notice state={pwState} />
          <SaveButton>Wachtwoord wijzigen</SaveButton>
        </form>
      </section>
    </div>
  );
}

function SectionHead({ icon: Icon, title, desc }: { icon: typeof User; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-red-tint)] text-[var(--color-red)]">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="mt-0.5 !text-[13px] leading-snug text-[var(--color-steel)]">{desc}</p>
      </div>
    </div>
  );
}

function Notice({ state }: { state: SettingsState }) {
  if (state.ok && state.message) {
    return (
      <div role="status" className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success-tint)] px-3.5 py-2.5 text-[13.5px] font-medium text-[var(--color-success)]">
        <CheckCircle2 className="size-[18px] shrink-0" aria-hidden /> {state.message}
      </div>
    );
  }
  if (state.error) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)]/25 bg-[var(--color-error-tint)] px-3.5 py-2.5 text-[13.5px] font-medium text-[var(--color-error)]">
        <AlertCircle className="size-[18px] shrink-0" aria-hidden /> {state.error}
      </div>
    );
  }
  return null;
}

function SaveButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-dark gap-2">
      <Save className="size-4" aria-hidden />
      {pending ? "Opslaan…" : children}
    </button>
  );
}
