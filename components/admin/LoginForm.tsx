"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Lock, Loader2, AlertCircle } from "lucide-react";

export type LoginState = { error?: string };

interface Props {
  /** Server action: returns `{ error }` on failure, redirects on success. */
  action: (prev: LoginState, formData: FormData) => Promise<LoginState>;
  /** Show the e-mail field (only when Supabase Auth is configured). */
  showEmail: boolean;
  /** Where to send the admin after a successful login. */
  redirectTo: string;
}

export function LoginForm({ action, showEmail, redirectTo }: Props) {
  const [state, formAction] = useActionState(action, {});
  const [reveal, setReveal] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-error)]/25 bg-[var(--color-error-tint)] px-3.5 py-3 text-[13.5px] font-medium text-[var(--color-error)]"
        >
          <AlertCircle className="mt-px size-[18px] shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      )}

      {showEmail && (
        <div>
          <label htmlFor="email" className="field-label">E-mailadres</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="naam@ksrautos.nl"
            className="input"
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="field-label">Wachtwoord</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={reveal ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="input pr-12"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Verberg wachtwoord" : "Toon wachtwoord"}
            className="focus-ring absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-[var(--radius-sm)] text-[var(--color-mute)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
          >
            {reveal ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="btn btn-primary btn-lg mt-1 w-full gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="size-[18px] animate-spin" aria-hidden /> Bezig met inloggen…
        </>
      ) : (
        <>
          <Lock className="size-[17px]" aria-hidden /> Inloggen
        </>
      )}
    </button>
  );
}
