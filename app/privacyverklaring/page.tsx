import { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Privacyverklaring KSR Auto's — Ridderkerk. Hoe wij omgaan met uw persoonsgegevens.",
  alternates: { canonical: "/privacyverklaring" },
};

export default function PrivacyPage() {
  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="container py-10 md:py-16 max-w-3xl">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Privacy" }]} />

        <Eyebrow className="mt-4">Juridisch</Eyebrow>
        <h1 className="display-2 mt-4">Privacyverklaring</h1>
        <p className="lead mt-4 text-[var(--color-charcoal)]">
          Wij gaan zorgvuldig om met uw persoonsgegevens. Hieronder leest u welke gegevens wij verwerken, waarom en wat uw rechten zijn.
        </p>

        <div className="mt-10 card p-6 md:p-8 space-y-6 text-[15px] leading-relaxed text-[var(--color-charcoal)]">
          <section>
            <h2 className="h3 mb-2">1. Verantwoordelijke</h2>
            <p>
              {BUSINESS.name}, {BUSINESS.fullAddress} — KVK <span className="tabular">{BUSINESS.kvk}</span>.
              Voor vragen of verzoeken kunt u ons bereiken via{" "}
              <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> of <a className="link tabular" href={BUSINESS.telHref}>{BUSINESS.phone}</a>.
            </p>
          </section>

          <section>
            <h2 className="h3 mb-2">2. Welke gegevens verwerken wij?</h2>
            <p>
              Wij verwerken gegevens die u zelf aan ons doorgeeft (zoals naam, e-mailadres, telefoonnummer en de inhoud van uw bericht) en — voor zover nodig — gegevens over uw bezoek aan onze website (zoals apparaat- en sessie-informatie ten behoeve van het correct functioneren van de site).
            </p>
          </section>

          <section>
            <h2 className="h3 mb-2">3. Waarom verwerken wij gegevens?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Beantwoorden van uw vraag of aanvraag (offerte, proefrit, inruil).</li>
              <li>Uitvoering van een eventuele overeenkomst (verkoop, inkoop, garantie).</li>
              <li>Wettelijke verplichtingen (zoals administratie en kentekenregistratie).</li>
              <li>Verbetering van onze dienstverlening en website.</li>
            </ul>
          </section>

          <section>
            <h2 className="h3 mb-2">4. Bewaartermijnen</h2>
            <p>
              Wij bewaren uw gegevens niet langer dan nodig is voor het doel waarvoor ze zijn verzameld of waarvoor wij wettelijk verplicht zijn. Aanvragen die niet leiden tot een overeenkomst worden in beginsel na maximaal 12 maanden verwijderd.
            </p>
          </section>

          <section>
            <h2 className="h3 mb-2">5. Beveiliging en ontvangers</h2>
            <p>
              Wij nemen passende technische en organisatorische maatregelen. Wij delen uw gegevens uitsluitend met partijen die nodig zijn om onze dienstverlening uit te voeren (zoals onze hostingpartner, betaaldienstverleners of Autotrust ten behoeve van garantie). Met deze partijen sluiten wij verwerkers&shy;overeenkomsten waar dat van toepassing is.
            </p>
          </section>

          <section>
            <h2 className="h3 mb-2">6. Uw rechten</h2>
            <p>
              U heeft het recht op inzage, correctie, verwijdering, beperking, bezwaar en gegevens&shy;overdraagbaarheid. Stuur uw verzoek naar <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. U kunt ook een klacht indienen bij de <a className="link" href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener">Autoriteit Persoonsgegevens</a>.
            </p>
          </section>

          <section>
            <h2 className="h3 mb-2">7. Cookies</h2>
            <p>
              Voor cookies en vergelijkbare technieken verwijzen wij naar onze <Link className="link" href="/cookies">cookieverklaring</Link>.
            </p>
          </section>

          <p className="text-[12.5px] text-[var(--color-steel)]">
            Deze verklaring wordt periodiek herzien. De meest recente versie is op deze pagina beschikbaar.
          </p>
        </div>
      </div>
    </div>
  );
}
