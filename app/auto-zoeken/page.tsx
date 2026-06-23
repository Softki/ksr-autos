import { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { WhatsAppCTA } from "@/components/public/WhatsAppCTA";

export const metadata: Metadata = {
  title: "Zoekopdracht plaatsen",
  description: "Niet gevonden in het aanbod? Plaats een zoekopdracht bij KSR Auto's en wij gaan voor u op zoek binnen ons netwerk.",
  alternates: { canonical: "/auto-zoeken" },
};

export default function AutoZoekenPage() {
  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="container py-10 md:py-16">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Zoekopdracht" }]} />

        <div className="mt-4 grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 max-w-2xl">
            <Eyebrow>Zoekopdracht</Eyebrow>
            <h1 className="display-2 mt-4">Op zoek naar een specifieke auto?</h1>
            <p className="lead mt-5 text-[var(--color-charcoal)]">
              Vindt u uw ideale auto niet terug in ons aanbod? Plaats een zoekopdracht. Wij gaan binnen ons netwerk gericht voor u op zoek en houden u op de hoogte zodra een passende auto beschikbaar komt.
            </p>

            <div className="mt-8 grid gap-3 text-[14.5px] text-[var(--color-charcoal)] max-w-prose">
              <p>
                Geef ons zo veel mogelijk informatie mee: merk, model, bouwjaar, brandstof, maximaal aantal kilometers en uw budget. Hoe specifieker, hoe beter wij u kunnen helpen.
              </p>
              <p>
                Liever even meedenken? <Link href="/contact" className="link">Neem contact op</Link> of stuur ons direct een bericht via WhatsApp.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/aanbod" className="btn btn-secondary">Bekijk ons huidige aanbod</Link>
              <WhatsAppCTA label="Direct overleggen?" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card p-6 md:p-7 lg:sticky lg:top-[88px]">
              <Eyebrow>Zoekformulier</Eyebrow>
              <h2 className="h3 mt-3">Vertel ons wat u zoekt</h2>
              <p className="mt-2 text-[14px] text-[var(--color-charcoal)]">
                Beschrijf in het berichtveld zo concreet mogelijk waar u naar op zoek bent. We nemen contact op met een voorstel.
              </p>
              <div className="mt-5">
                <InquiryForm type="search_request" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
