import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BRANDS, BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Maak kennis met KSR Auto's. Occasiondealer in Ridderkerk, gespecialiseerd in jonge auto's met heldere voertuiginformatie.",
  alternates: { canonical: "/over-ons" },
};

const POSITIONING = [
  { label: "Locatie", value: "Ridderkerk" },
  { label: "KVK", value: BUSINESS.kvk },
  { label: "Werkwijze", value: "Op afspraak" },
];

export default function OverOnsPage() {
  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="container py-10 md:py-16">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Over ons" }]} />

        <div className="mt-4 grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 max-w-2xl">
            <Eyebrow>Over KSR Auto&apos;s</Eyebrow>
            <h1 className="display-2 mt-4">
              Een toegankelijke occasiondealer in Ridderkerk
            </h1>
            <p className="lead mt-5 text-[var(--color-charcoal)]">
              Bij KSR Auto&apos;s vindt u een ruime keuze occasions van verschillende merken — overwegend jonge auto&apos;s die APK gekeurd zijn en goed onderhouden. Wij geloven in eerlijke voertuiginformatie en heldere communicatie, zodat u snel weet of een auto bij u past.
            </p>

            <div className="mt-8 space-y-5 text-[15.5px] leading-relaxed text-[var(--color-charcoal)] max-w-prose">
              <p>
                Wij werken bij voorkeur op afspraak. Een deel van onze voorraad staat op een tweede locatie en het team is regelmatig onderweg voor inkoop of een proefrit. Door vooraf even te bellen of appen, kunnen wij u de aandacht geven die u verdient en staat de auto die u zoekt voor u klaar.
              </p>
              <p>
                Naast verkoop helpen wij u bij <Link href="/auto-verkopen" className="link">het inruilen of inkopen van uw huidige auto</Link>. Heeft u een specifieke auto in gedachten die we niet in voorraad hebben? <Link href="/auto-zoeken" className="link">Plaats een zoekopdracht</Link> en wij gaan voor u op zoek binnen ons netwerk. Voor extra zekerheid bieden wij — in samenwerking met Autotrust — verschillende garantiemogelijkheden.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {POSITIONING.map((p) => (
                <div key={p.label} className="stat">
                  <dd className="stat-value">{p.value}</dd>
                  <dt className="stat-label">{p.label}</dt>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/aanbod" className="btn btn-dark">
                Bekijk het aanbod <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Maak een afspraak
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-5">
            <div className="relative aspect-[4/5] rounded-md overflow-hidden border border-[var(--color-line)] bg-[var(--color-paper)]">
              <Image
                src="https://ksrautos.nl/wp-content/uploads/2025/12/HeaderfotoKSR-scaled.webp"
                alt="Showroom KSR Auto's aan de Havenkade in Ridderkerk"
                fill
                sizes="(min-width: 1024px) 460px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="card p-6">
              <Eyebrow>Merkfocus</Eyebrow>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-[14px]">
                {BRANDS.map((b) => (
                  <li key={b}>
                    <Link href={`/aanbod?brand=${encodeURIComponent(b)}`} className="text-[var(--color-charcoal)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5">
                      <span aria-hidden className="h-1 w-2 bg-[var(--color-red)] rounded-[1px]" />
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <Eyebrow>Direct contact</Eyebrow>
              <div className="mt-4 space-y-3 text-[14.5px]">
                <a href={BUSINESS.telHref} className="flex items-center gap-3 hover:text-[var(--color-ink)]">
                  <Phone className="size-4 text-[var(--color-mute)]" aria-hidden />
                  <span className="font-semibold tabular">{BUSINESS.phone}</span>
                </a>
                <a href={BUSINESS.whatsapp} target="_blank" rel="noopener" className="flex items-center gap-3 hover:text-[var(--color-whatsapp)]">
                  <MessageCircle className="size-4 text-[var(--color-mute)]" aria-hidden />
                  <span className="font-semibold">WhatsApp ons</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
