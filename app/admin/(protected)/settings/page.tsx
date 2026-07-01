import { Building2, MapPin, Phone, Mail, Hash } from "lucide-react";

import { getCurrentAdmin } from "@/lib/auth/session";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { BUSINESS } from "@/lib/constants";

export const metadata = { title: "Instellingen" };

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();

  return (
    <>
      <div className="mb-7">
        <Eyebrow>Systeem</Eyebrow>
        <h1 className="display-2 mt-2">Instellingen</h1>
        <p className="mt-2 !text-[14px] text-[var(--color-steel)]">
          Beheer je account en bekijk de bedrijfsgegevens.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <SettingsForm initialName={admin.name ?? ""} initialEmail={admin.email ?? ""} />

        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="section-title mb-4 flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-red-tint)] text-[var(--color-red)]">
                <Building2 className="size-4" aria-hidden />
              </span>
              Bedrijfsgegevens
            </h2>
            <dl className="space-y-3 text-[14px]">
              <InfoRow icon={Building2} label="Naam" value={BUSINESS.name} />
              <InfoRow icon={MapPin} label="Adres" value={`${BUSINESS.address}, ${BUSINESS.postal} ${BUSINESS.city}`} />
              <InfoRow icon={Phone} label="Telefoon" value={BUSINESS.phone} />
              <InfoRow icon={Mail} label="E-mail" value={BUSINESS.email} />
              <InfoRow icon={Hash} label="KVK" value={BUSINESS.kvk} />
            </dl>
            <p className="mt-4 border-t border-[var(--color-line)] pt-3 !text-[12px] leading-relaxed text-[var(--color-steel)]">
              Deze gegevens staan vast in de website. Neem contact op met je websitebeheerder om ze te wijzigen.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-steel)]">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-[11.5px] font-medium text-[var(--color-steel)]">{label}</div>
        <div className="break-words font-semibold text-[var(--color-ink)]">{value}</div>
      </div>
    </div>
  );
}
