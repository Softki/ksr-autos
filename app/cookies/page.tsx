import { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Cookieverklaring",
  description: "Cookieverklaring KSR Auto's — hoe wij cookies en vergelijkbare technieken gebruiken op onze website.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="container py-10 md:py-16 max-w-3xl">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Cookies" }]} />

        <Eyebrow className="mt-4">Juridisch</Eyebrow>
        <h1 className="display-2 mt-4">Cookieverklaring</h1>
        <p className="lead mt-4 text-[var(--color-charcoal)]">
          Onze website gebruikt cookies en vergelijkbare technieken om correct te functioneren, het gebruik te analyseren en — alleen met uw toestemming — voor marketingdoeleinden.
        </p>

        <div className="mt-10 card p-6 md:p-8 space-y-6 text-[15px] leading-relaxed text-[var(--color-charcoal)]">
          <Section title="Functionele cookies">
            Noodzakelijk voor het functioneren van de website (bijvoorbeeld het onthouden van uw sessie of formulier-instellingen). Voor deze cookies is geen toestemming nodig.
          </Section>

          <Section title="Analytische cookies">
            Wij gebruiken geanonimiseerde of geaggregeerde analytics om onze website te verbeteren. Deze cookies bevatten geen persoonsgegevens die direct tot u te herleiden zijn.
          </Section>

          <Section title="Tracking & marketing cookies">
            Op dit moment plaatsen wij geen marketing- of advertentiecookies van derden. Mocht dit veranderen, dan vragen wij eerst expliciet uw toestemming.
          </Section>

          <Section title="Externe content">
            Indien u externe content bekijkt (bijvoorbeeld kaarten of garantiedocumenten van Autotrust), dan kunnen de bijbehorende partijen eigen cookies plaatsen via hun platform. Wij hebben geen invloed op deze cookies.
          </Section>

          <Section title="Cookies beheren">
            U kunt cookies te allen tijde verwijderen of blokkeren via uw browserinstellingen (Chrome, Edge, Safari, Firefox). Zie ook onze{" "}
            <Link href="/privacyverklaring" className="link">privacyverklaring</Link> voor meer informatie over uw rechten en onze contactgegevens.
          </Section>

          <p className="text-[12.5px] text-[var(--color-steel)]">
            Wij beoordelen onze cookie-instellingen periodiek. De meest recente versie van deze verklaring is op deze pagina beschikbaar.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="h3 mb-2">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
