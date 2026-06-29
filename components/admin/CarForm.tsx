"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";

import { upsertCarAction } from "@/lib/actions/cars";
import { initialCarFormState } from "@/lib/actions/state";
import { BRANDS, FUEL_TYPES, TRANSMISSIONS } from "@/lib/constants";
import type { Car } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  car?: Car;
  className?: string;
}

const BODY_TYPES = ["Hatchback", "Sedan", "Stationwagen", "SUV", "MPV", "Coupé", "Cabrio", "Bestelauto"];

export function CarForm({ car, className }: Props) {
  const [state, action] = useActionState(upsertCarAction, initialCarFormState);

  const options = car?.options?.join("\n") ?? "";

  return (
    <form action={action} className={cn("space-y-8", className)}>
      {car?.id && <input type="hidden" name="id" value={car.id} />}

      {state.message && !state.ok && (
        <div className="rounded-md border border-[var(--color-error)]/40 bg-[var(--color-error-tint)] text-[var(--color-error)] px-4 py-3 text-[14px]">
          {state.message}
        </div>
      )}

      <Section title="Basisgegevens">
        <Grid>
          <Field label="Merk" name="brand" required error={state.errors?.brand}>
            <select className="select" name="brand" required defaultValue={car?.brand ?? ""}>
              <option value="" disabled>Kies merk…</option>
              {[...BRANDS, "Ford", "Peugeot", "Fiat", "Citroen", "Toyota", "Nissan", "Mitsubishi"].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>

          <Input label="Model" name="model" required error={state.errors?.model} defaultValue={car?.model} />
          <Input label="Uitvoering / versie" name="version" error={state.errors?.version} defaultValue={car?.version} />
          <Input label="Bouwjaar" name="year" type="number" min={1950} max={2100} error={state.errors?.year} defaultValue={car?.year} />
          <Input label="Prijs (€)" name="price" type="number" min={0} required error={state.errors?.price} defaultValue={car?.price} />
          <Input label="Kilometerstand" name="mileage" type="number" min={0} error={state.errors?.mileage} defaultValue={car?.mileage} />
          <Input label="Kenteken" name="license_plate" error={state.errors?.license_plate} defaultValue={car?.license_plate} placeholder="ABC-12-D" />
          <Select label="BTW-type" name="vat_type" defaultValue={car?.vat_type ?? "marge"}>
            <option value="marge">Marge</option>
            <option value="btw">BTW</option>
            <option value="ex_btw">Ex. BTW</option>
          </Select>
        </Grid>
      </Section>

      <Section title="Specificaties">
        <Grid>
          <Select label="Brandstof" name="fuel_type" defaultValue={car?.fuel_type ?? ""}>
            <option value="">—</option>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
          <Select label="Transmissie" name="transmission" defaultValue={car?.transmission ?? ""}>
            <option value="">—</option>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Carrosserie" name="body_type" defaultValue={car?.body_type ?? ""}>
            <option value="">—</option>
            {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
          <Input label="Kleur" name="color" defaultValue={car?.color} />
          <Input label="Vermogen (pk)" name="power_hp" type="number" defaultValue={car?.power_hp} />
          <Input label="Cilinderinhoud (cc)" name="engine_cc" type="number" defaultValue={car?.engine_cc} />
          <Input label="Aantal deuren" name="doors" type="number" defaultValue={car?.doors} />
          <Input label="Aantal stoelen" name="seats" type="number" defaultValue={car?.seats} />
          <Input label="APK tot" name="apk_until" type="date" defaultValue={car?.apk_until?.slice(0, 10)} />
        </Grid>
      </Section>

      <Section title="Status & publicatie">
        <Grid>
          <Select label="Status" name="status" defaultValue={car?.status ?? "available"}>
            <option value="draft">Concept</option>
            <option value="available">Beschikbaar</option>
            <option value="reserved">Gereserveerd</option>
            <option value="sold">Verkocht</option>
            <option value="hidden">Verborgen</option>
          </Select>

          <Toggle label="Publiceren op website" name="is_published" defaultChecked={car?.is_published !== false} />
          <Toggle label="Uitlichten op homepage" name="is_featured" defaultChecked={car?.is_featured} />
        </Grid>
      </Section>

      <Section title="Omschrijving & opties">
        <Textarea label="Omschrijving" name="description" defaultValue={car?.description} rows={8} />
        <Textarea
          label="Opties (één per regel of komma-gescheiden)"
          name="options_text"
          defaultValue={options}
          rows={6}
          placeholder={`Airco\nCruise control\nNavigatie full map`}
        />
      </Section>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--color-line)]">
        <SubmitButton edit={Boolean(car?.id)} />
        <Link href="/admin/cars" className="btn btn-secondary">Annuleren</Link>
      </div>
    </form>
  );
}

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-dark gap-2" type="submit" disabled={pending}>
      <Save className="size-4" aria-hidden />
      {pending ? "Opslaan…" : edit ? "Wijzigingen opslaan" : "Auto toevoegen"}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="label-mono mb-3">{title}</h2>
      <div className="card p-5 md:p-6 space-y-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

interface InputProps {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | undefined | null;
  placeholder?: string;
  error?: string;
}

function Input({ label, name, required, type = "text", defaultValue, placeholder, error, min, max, step }: InputProps) {
  const id = `cf-${name}`;
  return (
    <label htmlFor={id} className="block">
      <span className="field-label">{label}{required && <span className="ml-0.5 text-[var(--color-red)]" aria-hidden>*</span>}</span>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="input"
        aria-invalid={error ? "true" : undefined}
      />
      {error && <p className="field-error">{error}</p>}
    </label>
  );
}

function Textarea({ label, name, defaultValue, rows = 4, placeholder }: { label: string; name: string; defaultValue?: string; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} placeholder={placeholder} className="input" />
    </label>
  );
}

function Select({ label, name, defaultValue, children }: { label: string; name: string; defaultValue?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select name={name} defaultValue={defaultValue} className="select">
        {children}
      </select>
    </label>
  );
}

function Toggle({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 pt-7">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="checkbox" />
      <span className="text-[14px]">{label}</span>
    </label>
  );
}

function Field({ label, name, required, error, children }: { label: string; name: string; required?: boolean; error?: string; children: React.ReactNode }) {
  const id = `cf-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span className="ml-0.5 text-[var(--color-red)]" aria-hidden>*</span>}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
