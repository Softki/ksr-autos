"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Send } from "lucide-react";

import { submitInquiryAction } from "@/lib/actions/inquiries";
import { initialInquiryState } from "@/lib/actions/state";
import { cn } from "@/lib/cn";

type InquiryType = "contact" | "test_drive" | "trade_in" | "search_request";

interface Props {
  type: InquiryType;
  carId?: string;
  carTitle?: string;
  onSuccess?: () => void;
  className?: string;
}

const CONDITIONS = [
  "Zo goed als nieuw",
  "Gebruikte auto",
  "Heeft mankementen",
  "Schade auto",
];

export function InquiryForm({ type, carId, carTitle, onSuccess, className }: Props) {
  const [state, formAction] = useActionState(submitInquiryAction, initialInquiryState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastShownRef = useRef<string | null>(null);
  const [ts, setTs] = useState<string>("");

  useEffect(() => {
    // Hydration-safe timestamp: server cannot know `Date.now()`, so we
    // populate it after mount. This drives the honeypot timing check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTs(String(Date.now()));
  }, []);

  useEffect(() => {
    if (state.ok && state.message && lastShownRef.current !== state.message) {
      lastShownRef.current = state.message;
      toast.success(state.message);
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className={cn("space-y-4", className)}>
      <input type="hidden" name="type" value={type} />
      {carId && <input type="hidden" name="car_id" value={carId} />}
      <input type="hidden" name="ts" value={ts} />

      {/* Honeypot */}
      <div className="hp-field" aria-hidden>
        <label>
          Website (niet invullen)
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {type === "trade_in" && (
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <legend className="sr-only">Uw huidige auto</legend>

          <Field label="Merk" required name="brand" error={state.errors?.brand} />
          <Field label="Model" required name="model" error={state.errors?.model} />
          <Field
            label="Kilometerstand"
            name="mileage"
            placeholder="bv. 145.000"
            inputMode="numeric"
            error={state.errors?.mileage}
          />
          <SelectField label="Conditie" name="condition" defaultValue="Gebruikte auto" options={CONDITIONS} error={state.errors?.condition} />
          <Field label="Uw vraagprijs (€)" name="asking_price" placeholder="bv. 8500" inputMode="numeric" error={state.errors?.asking_price} />
        </fieldset>
      )}

      {type === "search_request" && (
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <legend className="sr-only">Auto waarnaar u zoekt</legend>
          <Field label="Merk" name="brand" placeholder="bv. Volkswagen" error={state.errors?.brand} />
          <Field label="Model" name="model" placeholder="bv. Golf" error={state.errors?.model} />
          <Field label="Budget tot (€)" name="budget" placeholder="bv. 12.000" inputMode="numeric" error={state.errors?.budget} />
          <SelectField label="Gewenste conditie" name="condition" defaultValue="Gebruikte auto" options={CONDITIONS} error={state.errors?.condition} />
        </fieldset>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Naam" required name="name" autoComplete="name" error={state.errors?.name} />
        <Field label="Telefoon" name="phone" type="tel" autoComplete="tel" inputMode="tel" error={state.errors?.phone} />
      </div>

      <Field label="E-mailadres" required name="email" type="email" autoComplete="email" inputMode="email" error={state.errors?.email} />

      <TextareaField
        label={type === "contact" ? "Uw vraag" : "Bericht"}
        name="message"
        required={type !== "trade_in"}
        placeholder={carTitle ? `Vraag over de ${carTitle}…` : ""}
        defaultValue={carTitle && type === "test_drive" ? `Ik wil graag een proefrit maken in de ${carTitle}. ` : undefined}
        error={state.errors?.message}
      />

      {state.message && !state.ok && (
        <div className="rounded-md bg-[var(--color-error-tint)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-[13.5px] px-3 py-2">
          {state.message}
        </div>
      )}

      <SubmitButton />

      <p className="text-[12.5px] text-[var(--color-steel)]">
        Door dit formulier in te dienen gaat u akkoord met onze{" "}
        <a href="/privacyverklaring" className="link">privacyverklaring</a>. Uw gegevens worden alleen gebruikt om contact op te nemen.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  defaultValue?: string;
  error?: string;
}

function Field({ label, name, required, placeholder, type = "text", autoComplete, inputMode, defaultValue, error }: FieldProps) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span aria-hidden className="text-[var(--color-red)] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className="input"
      />
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}

function TextareaField({ label, name, required, placeholder, defaultValue, error }: FieldProps) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span aria-hidden className="text-[var(--color-red)] ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={4}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className="input"
      />
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, defaultValue, options, error }: { label: string; name: string; defaultValue?: string; options: string[]; error?: string }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} name={name} defaultValue={defaultValue} className="select" aria-invalid={error ? "true" : undefined}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending} aria-disabled={pending}>
      {pending ? "Versturen…" : (
        <>
          <Send className="size-4" aria-hidden /> Verstuur bericht
        </>
      )}
    </button>
  );
}
