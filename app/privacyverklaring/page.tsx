import { Metadata } from "next";
import Link from "next/link";
import { Building2, Mail, Phone, ShieldCheck } from "lucide-react";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description:
    "Privacyverklaring KSR Auto’s — Ridderkerk. Hoe wij omgaan met uw persoonsgegevens conform de AVG (GDPR).",
  alternates: { canonical: "/privacyverklaring" },
};

const LAST_UPDATED = "juni 2026";

const SECTIONS = [
  { id: "inleiding", title: "Inleiding" },
  { id: "categorieen", title: "Categorieën van persoonsgegevens" },
  { id: "doeleinden", title: "Doeleinden voor de verwerking" },
  { id: "grondslag", title: "Grondslag voor de verwerking" },
  { id: "cookies", title: "Cookies" },
  { id: "bewaartermijnen", title: "Bewaartermijnen" },
  { id: "ontvangers", title: "Ontvangers" },
  { id: "beveiliging", title: "Beveiliging" },
  { id: "uw-rechten", title: "Uw rechten" },
  { id: "wijzigingen", title: "Wijzigingen" },
];

export default function PrivacyPage() {
  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="container py-10 md:py-16 max-w-3xl">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Privacy" }]} />

        {/* ── Header ── */}
        <Eyebrow className="mt-4">Juridisch · AVG</Eyebrow>
        <h1 className="display-2 mt-4">Privacyverklaring</h1>
        <p className="lead mt-4 text-[var(--color-charcoal)]">
          Wij gaan zorgvuldig om met uw persoonsgegevens. Hieronder leest u welke gegevens wij
          verwerken, met welk doel en welke rechten u heeft onder de Algemene Verordening
          Gegevensbescherming (AVG).
        </p>
        <p className="mt-3 text-[12.5px] text-[var(--color-steel)]">
          Laatst bijgewerkt: {LAST_UPDATED}
        </p>

        {/* ── Identiteit / verwerkingsverantwoordelijke ── */}
        <div className="mt-8 card p-5 md:p-6">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-red-tint)] text-[var(--color-red)]">
              <Building2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="label-mono text-[var(--color-steel)]">Verwerkingsverantwoordelijke</p>
              <p className="mt-1 text-[15px] font-bold text-[var(--color-ink)]">{BUSINESS.name}</p>
              <p className="mt-0.5 text-[14px] text-[var(--color-charcoal)]">
                {BUSINESS.address}, {BUSINESS.postal} {BUSINESS.city}
              </p>
              <p className="mt-0.5 text-[14px] text-[var(--color-charcoal)]">
                KVK: <span className="tabular">{BUSINESS.kvk}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
                <a className="link inline-flex items-center gap-1.5" href={`mailto:${BUSINESS.email}`}>
                  <Mail className="size-4" aria-hidden /> {BUSINESS.email}
                </a>
                <a className="link tabular inline-flex items-center gap-1.5" href={BUSINESS.telHref}>
                  <Phone className="size-4" aria-hidden /> {BUSINESS.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Inhoudsopgave ── */}
        <nav aria-label="Inhoudsopgave" className="mt-6 card p-5 md:p-6">
          <p className="label-mono mb-3 text-[var(--color-steel)]">Inhoud</p>
          <ol className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex items-baseline gap-2 text-[14px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-red)]"
                >
                  <span className="tabular text-[12px] text-[var(--color-mute)] group-hover:text-[var(--color-red)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="underline-offset-2 group-hover:underline">{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Inhoud ── */}
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-[var(--color-charcoal)]">
          <Section id="inleiding" n={1} title="Inleiding">
            <p>
              De AUTOBEDRIJF privacyverklaring heeft betrekking op de verwerking van persoonsgegevens
              in de zin van de Verordening (EU) 2016/679 Algemene Verordening Gegevensbescherming
              (hierna: “AVG”) door de besloten vennootschap {BUSINESS.name}, evenals de aan haar
              gelieerde vennootschappen, ingeschreven bij de Kamer van Koophandel onder
              registratienummer <span className="tabular">{BUSINESS.kvk}</span> (hierna:
              “AUTOBEDRIJF”, “ons”, “wij” en “we”) via de huidige website (hierna: “website”).
              AUTOBEDRIJF is verantwoordelijk voor de verwerking van uw persoonsgegevens in de zin
              van de AVG.
            </p>
            <p>
              Uw persoonsgegevens kunnen door AUTOBEDRIJF worden verwerkt, bijvoorbeeld in het kader
              van uw afname van AUTOBEDRIJF Producten en Diensten, uw bezoek aan onze website of in
              verband met uw contact met ons.
            </p>
            <p>
              In deze privacyverklaring kunt u informatie vinden over de manier waarop AUTOBEDRIJF
              persoonsgegevens verwerkt en hoe u contact kunt opnemen met AUTOBEDRIJF om uw rechten
              in te roepen. Ook staat in de privacyverklaring aanvullende informatie die voor u
              eventueel relevant kan zijn. Voor verdere vragen en/of opmerkingen over deze
              privacyverklaring kunt u contact opnemen via{" "}
              <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
            </p>
            <p>
              Op onze website zijn links opgenomen naar andere websites. Wij zijn echter niet
              verantwoordelijk voor het privacybeleid van deze websites. Voor meer informatie
              daarover verwijzen wij u naar de betreffende websites.
            </p>
          </Section>

          <Section id="categorieen" n={2} title="Categorieën van persoonsgegevens">
            <p>Wij kunnen één of meer van de volgende categorieën van persoonsgegevens over u verwerken:</p>
            <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--color-red-soft)]">
              <li><strong>Personalia</strong> — voor- en achternaam; geslacht; geboortedatum.</li>
              <li><strong>Persoonlijke contactgegevens</strong> — adresgegevens; telefoonnummer; e-mailadres.</li>
              <li><strong>Zakelijke contactgegevens</strong> — zakelijk e-mailadres; zakelijk telefoonnummer; overige gegevens over werkgever.</li>
              <li><strong>Bedrijfsgegevens</strong> — bankrekeningnummer; KVK-nummer; btw-nummer.</li>
              <li><strong>Apparaatgegevens</strong> — IP-adres; locatiegegevens; internetbrowser en apparaattype.</li>
              <li><strong>Online activiteit</strong> — gegevens over uw activiteit op onze website; gegevens over uw surfgedrag over verschillende websites heen wanneer deze onderdeel zijn van een advertentienetwerk; aan- of afmelding voor nieuwsbrieven.</li>
              <li><strong>Overige persoonsgegevens</strong> die u zelf aan ons verstrekt.</li>
            </ul>
            <p>
              Wij verwerken geen bijzondere categorieën van persoonsgegevens, zoals ras of etnische
              afkomst, politieke opvattingen, religieuze of levensbeschouwelijke overtuigingen, het
              lidmaatschap van een vakbond, genetische gegevens, biometrische gegevens met het oog op
              de unieke identificatie, gegevens over gezondheid, of gegevens met betrekking tot
              seksueel gedrag of seksuele gerichtheid.
            </p>
            <p>
              Wij hebben niet de intentie om gegevens te verzamelen over personen jonger dan 16 jaar.
              We hebben echter geen technologie beschikbaar om te controleren of een persoon ouder is
              dan 16 jaar. Wij raden ouders aan betrokken te zijn bij de online activiteiten van hun
              kinderen, om te voorkomen dat persoonsgegevens over kinderen verzameld worden zonder
              ouderlijke toestemming. Vermoedt u dat wij zonder ouderlijke toestemming
              persoonsgegevens hebben verwerkt over een minderjarige, neem dan direct contact met ons
              op, dan zullen wij die persoonsgegevens verwijderen.
            </p>
          </Section>

          <Section id="doeleinden" n={3} title="Doeleinden voor de verwerking van persoonsgegevens">
            <p>
              Wij mogen uw persoonsgegevens uitsluitend gebruiken voor de doeleinden waarvoor deze
              persoonsgegevens zijn verzameld.
            </p>
            <p>
              Wij verwerken doorgaans voornamelijk contactgegevens, om contact met u op te nemen
              en/of te onderhouden en om onze afspraken over het gebruik van de AUTOBEDRIJF Producten
              en Diensten te kunnen uitvoeren en handhaven.
            </p>
            <p>Wij verwerken persoonsgegevens voor de volgende doeleinden, om:</p>
            <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--color-red-soft)]">
              <li>u te kunnen bellen, e-mailen of op een andere manier contact met u op te nemen, indien dit nodig is om onze dienstverlening uit te kunnen voeren;</li>
              <li>u goederen te kunnen leveren bij het door u opgegeven adres;</li>
              <li>u antwoord te kunnen geven op door u aan ons gestelde vragen;</li>
              <li>u te informeren over wijzigingen van AUTOBEDRIJF Producten en Diensten;</li>
              <li>u onze nieuwsbrief en/of reclamefolders te verzenden, wanneer u hiervoor toestemming heeft gegeven.</li>
            </ul>
            <p>AUTOBEDRIJF analyseert bezoekersgedrag op onze website om daarmee de website te verbeteren.</p>
            <p>
              AUTOBEDRIJF analyseert bezoekersgedrag om ons website-aanbod van AUTOBEDRIJF Producten
              en Diensten af te stemmen op de voorkeuren van de websitebezoeker, indien de
              websitebezoeker hiervoor met zijn of haar (cookie-)instellingen toestemming heeft
              gegeven. AUTOBEDRIJF analyseert surfgedrag van bezoekers van onze website over
              verschillende websites om aanbiedingen af te stemmen op de voorkeuren van de
              websitebezoeker, indien de websitebezoeker hiervoor met zijn of haar
              (cookie-)instellingen toestemming heeft gegeven.
            </p>
            <p>
              Verwerking van uw persoonsgegevens is geen wettelijke verplichting voor u. Wij kunnen
              wettelijk verplicht zijn om uw persoonsgegevens te verwerken om te voldoen aan fiscale
              en andere wettelijke verplichtingen.
            </p>
          </Section>

          <Section id="grondslag" n={4} title="Grondslag voor de verwerking van persoonsgegevens">
            <p>
              Wij mogen op grond van de AVG uw persoonsgegevens uitsluitend verwerken wanneer hiervoor
              een wettelijke grondslag bestaat. De grondslagen voor de verwerkingen van uw
              persoonsgegevens zijn in de meeste gevallen als volgt: een wettelijke verplichting van
              AUTOBEDRIJF om bepaalde (persoons)gegevens te bewaren, het uitvoeren van de overeenkomst
              met u voor het afnemen van AUTOBEDRIJF Producten en Diensten, of met uw toestemming.
            </p>
            <p>
              In uitzonderlijke gevallen kan de grondslag zijn dat AUTOBEDRIJF een gerechtvaardigd
              belang heeft bij de verwerking van uw persoonsgegevens. In dit geval heeft u het recht
              om bezwaar te maken. U kunt in uw bezwaar aangeven waarom, in uw situatie, wij geen
              gerechtvaardigd belang hebben bij de verwerking van uw persoonsgegevens of waarom, in uw
              situatie, uw privacybelang zwaarder weegt. Kijk onder{" "}
              <a className="link" href="#uw-rechten">“Uw rechten”</a> om te zien hoe u schriftelijk een
              gemotiveerd bezwaar kunt indienen bij AUTOBEDRIJF.
            </p>
            <p>Voor het sturen van de nieuwsbrief is de grondslag altijd uw toestemming.</p>
            <p>
              U heeft te allen tijde het recht om uw toestemming voor het verwerken van uw
              persoonsgegevens in te trekken. Intrekking van toestemming doet niet af aan de
              rechtmatigheid van de op toestemming gebaseerde verwerkingen die plaatsvonden vóór deze
              intrekking.
            </p>
            <p>
              Bij het niet verstrekken van benodigde gegevens of het intrekken van toestemming kunnen
              sommige AUTOBEDRIJF Producten en Diensten niet of niet optimaal meer worden geboden.
            </p>
          </Section>

          <Section id="cookies" n={5} title="Cookies">
            <p>
              Op onze website maken wij gebruik van technologie die informatie uit uw randapparatuur
              kan lezen of informatie op uw apparatuur kan opslaan (hierna: “cookies”). Een cookie is
              een klein tekstbestand dat bij het eerste bezoek aan deze website wordt opgeslagen in de
              browser van uw computer, tablet of smartphone. Lees voor meer informatie onze{" "}
              <Link className="link" href="/cookies">cookieverklaring</Link>.
            </p>
          </Section>

          <Section id="bewaartermijnen" n={6} title="Bewaartermijnen">
            <p>
              AUTOBEDRIJF zal uw persoonsgegevens niet langer bewaren dan noodzakelijk is voor de
              doeleinden vermeld onder{" "}
              <a className="link" href="#doeleinden">“Doeleinden voor de verwerking”</a>.
            </p>
            <p>
              In uitzondering op de hiervoor genoemde hoofdregel kan AUTOBEDRIJF uw persoonsgegevens
              langer bewaren voor zover dit noodzakelijk is om te voldoen aan een wettelijke
              verplichting, zoals fiscale bewaartermijnen.
            </p>
          </Section>

          <Section id="ontvangers" n={7} title="Ontvangers">
            <p>
              AUTOBEDRIJF kan uw persoonsgegevens onder omstandigheden delen met derden wanneer
              hiervoor een grondslag bestaat, bijvoorbeeld als dit noodzakelijk is voor het uitvoeren
              van een overeenkomst met u, of om te kunnen voldoen aan een eventuele wettelijke
              verplichting.
            </p>
            <p>
              AUTOBEDRIJF maakt als bedrijf gebruik van externe dienstverleners. Externe
              dienstverleners kunnen uw persoonsgegevens ontvangen en verwerken voor zover dat
              noodzakelijk is voor de uitvoering van hun taken in onze opdracht. Externe
              dienstverleners ontvangen van ons niet meer persoonsgegevens dan noodzakelijk om hun
              opdracht uit te kunnen voeren. Externe dienstverleners waar AUTOBEDRIJF gebruik van
              maakt zijn onder andere: hostingproviders, IT-leveranciers, betaaldienstverleners,
              onderaannemers en externe salaris- en urenregistratie.
            </p>
            <p>
              AUTOBEDRIJF sluit met bedrijven die in onze opdracht uw persoonsgegevens verwerken een
              verwerkersovereenkomst, op de in de AVG voorgeschreven wijze, bijvoorbeeld om ervoor
              zorg te dragen dat externe dienstverleners uw persoonsgegevens vertrouwelijk behandelen
              en passende technologische en organisatorische beveiligingsmaatregelen hebben getroffen.
            </p>
          </Section>

          <Section id="beveiliging" n={8} title="Beveiliging">
            <p>
              AUTOBEDRIJF neemt de bescherming van uw gegevens serieus en neemt passende maatregelen
              om misbruik, verlies, onbevoegde toegang, ongewenste openbaarmaking en ongeoorloofde
              wijziging tegen te gaan. Als u de indruk heeft dat uw gegevens niet goed beveiligd zijn
              of er zijn aanwijzingen van misbruik, neem dan contact met ons op via{" "}
              <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
            </p>
            <p>
              AUTOBEDRIJF heeft onder meer de volgende maatregelen genomen om uw persoonsgegevens te
              beveiligen:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--color-red-soft)]">
              <li>Beveiligde (TLS/HTTPS-)verbindingen tussen uw browser en onze website.</li>
              <li>Toegang tot persoonsgegevens is beperkt tot daartoe bevoegde personen.</li>
              <li>Opslag en verwerking bij gerenommeerde, gecertificeerde dienstverleners.</li>
              <li>Periodieke evaluatie van onze technische en organisatorische maatregelen.</li>
            </ul>
          </Section>

          <Section id="uw-rechten" n={9} title="Uw rechten">
            <p>
              U heeft het recht AUTOBEDRIJF te verzoeken om inzage in en correctie, verwijdering en
              afscherming van uw persoonsgegevens, of om bezwaar te maken tegen de verwerking van uw
              persoonsgegevens op grond van de gerechtvaardigde belangen van AUTOBEDRIJF. U heeft
              onder omstandigheden recht op dataportabiliteit.
            </p>
            <p>
              U heeft het recht een klacht in te dienen bij de{" "}
              <a
                className="link"
                href="https://autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Autoriteit Persoonsgegevens
              </a>
              .
            </p>
            <p>
              U heeft het recht uw eventuele toestemming voor het verwerken van persoonsgegevens te
              allen tijde in te trekken. Intrekking van toestemming doet niet af aan de rechtmatigheid
              van de op toestemming gebaseerde verwerkingen die plaatsvonden vóór deze intrekking.
              Intrekking van uw toestemming kan ertoe leiden dat AUTOBEDRIJF bepaalde diensten niet
              meer aan u kan leveren.
            </p>
            <p>
              Wilt u gebruikmaken van uw recht op bezwaar en/of recht op gegevensoverdraagbaarheid of
              heeft u andere vragen/opmerkingen over de gegevensverwerking, stuur dan een
              gespecificeerd verzoek naar{" "}
              <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
            </p>
            <p>
              AUTOBEDRIJF zal zo snel mogelijk, maar in ieder geval binnen vier weken, op uw verzoek
              reageren. Houd er rekening mee dat als u een verzoek indient, wij graag zeker willen
              zijn dat u het ook werkelijk bent. Dit betekent dat wij uw identiteit zullen verifiëren
              door bijvoorbeeld extra vragen te stellen.
            </p>
          </Section>

          <Section id="wijzigingen" n={10} title="Wijzigingen">
            <p>
              Deze privacyverklaring kan op ieder moment worden gewijzigd. Wij publiceren de meest
              recente versie van deze verklaring op onze website.
            </p>
          </Section>
        </div>

        {/* ── Slot-CTA ── */}
        <div className="mt-10 card p-6 md:p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-red-tint)] text-[var(--color-red)]">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-bold text-[var(--color-ink)]">Vragen over uw privacy?</p>
              <p className="mt-0.5 text-[14px] text-[var(--color-charcoal)]">
                Wij reageren binnen vier weken op uw verzoek.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${BUSINESS.email}`} className="btn btn-dark btn-sm gap-2">
              <Mail className="size-4" aria-hidden /> Mail ons
            </a>
            <a href={BUSINESS.telHref} className="btn btn-secondary btn-sm gap-2 tabular">
              <Phone className="size-4" aria-hidden /> {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="tabular text-[13px] font-bold text-[var(--color-red)]">
          {String(n).padStart(2, "0")}
        </span>
        <h2 className="h3">{title}</h2>
      </div>
      <div className="mt-3 space-y-3.5 border-l-2 border-[var(--color-line)] pl-4 md:pl-5">
        {children}
      </div>
    </section>
  );
}
