import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, MessageCircle, MapPin, FileText, CalendarClock } from "lucide-react";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCTA } from "@/components/public/ClosingCTA";
import { BRANDS, BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Maak kennis met KSR Auto's. Occasiondealer in Ridderkerk, gespecialiseerd in jonge auto's met heldere voertuiginformatie.",
  alternates: { canonical: "/over-ons" },
};

const POSITIONING = [
  {
    label: "Locatie",
    value: "Ridderkerk",
    sub: "Havenkade 4",
    Icon: MapPin,
  },
  {
    label: "KVK",
    value: BUSINESS.kvk,
    sub: "Kamer van Koophandel",
    Icon: FileText,
  },
  {
    label: "Werkwijze",
    value: "Op afspraak",
    sub: "Altijd persoonlijk",
    Icon: CalendarClock,
  },
] as const;

export default function OverOnsPage() {
  return (
    <>
      <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="container py-10 md:py-16">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Over ons" }]} />

          {/* ── Hero grid ─────────────────────────────────────────────── */}
          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-10 items-start">

            {/* Left column — intro copy */}
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>Over KSR Auto&apos;s</Eyebrow>
                <h1 className="display-2 mt-3 max-w-[18ch]">
                  Een toegankelijke occasiondealer in Ridderkerk
                </h1>
                <p className="lead mt-5 text-[var(--color-charcoal)] max-w-prose">
                  Bij KSR Auto&apos;s vindt u een ruime keuze occasions van
                  verschillende merken — overwegend jonge auto&apos;s die APK
                  gekeurd zijn en goed onderhouden. Wij geloven in eerlijke
                  voertuiginformatie en heldere communicatie, zodat u snel
                  weet of een auto bij u past.
                </p>
              </Reveal>

              <Reveal delay={0.08} className="mt-7 space-y-5 text-[15.5px] leading-relaxed text-[var(--color-charcoal)] max-w-prose">
                <p>
                  Wij werken bij voorkeur op afspraak. Een deel van onze
                  voorraad staat op een tweede locatie en het team is
                  regelmatig onderweg voor inkoop of een proefrit. Door
                  vooraf even te bellen of appen, kunnen wij u de aandacht
                  geven die u verdient en staat de auto die u zoekt voor u
                  klaar.
                </p>
                <p>
                  Naast verkoop helpen wij u bij{" "}
                  <Link href="/auto-verkopen" className="link">
                    het inruilen of inkopen van uw huidige auto
                  </Link>
                  . Heeft u een specifieke auto in gedachten die we niet in
                  voorraad hebben?{" "}
                  <Link href="/auto-zoeken" className="link">
                    Plaats een zoekopdracht
                  </Link>{" "}
                  en wij gaan voor u op zoek binnen ons netwerk. Voor extra
                  zekerheid bieden wij — in samenwerking met Autotrust —
                  verschillende garantiemogelijkheden.
                </p>
              </Reveal>

              {/* ── Positioning cards ─────────────────────────────────── */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {POSITIONING.map((p, i) => (
                  <Reveal key={p.label} delay={0.05 + i * 0.07}>
                    <div className="ksr-card group flex flex-col gap-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-paper)]">
                      {/* icon tile */}
                      <div className="flex items-center justify-center h-14 bg-[var(--color-red)] text-white transition-colors duration-200 group-hover:bg-[var(--color-red-strong)]">
                        <p.Icon className="size-5" strokeWidth={1.8} aria-hidden />
                      </div>
                      {/* content */}
                      <div className="flex flex-col gap-1 px-5 py-4">
                        <span
                          className="font-['var(--font-display)'] text-[1.2rem] font-bold leading-tight tracking-tight text-[var(--color-ink)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {p.value}
                        </span>
                        <span className="label-mono text-[var(--color-mute)] normal-case text-[11px]">
                          {p.sub}
                        </span>
                        <span className="mt-1 text-[11.5px] font-semibold uppercase tracking-widest text-[var(--color-steel)]">
                          {p.label}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* ── CTA buttons ───────────────────────────────────────── */}
              <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
                <Link href="/aanbod" className="btn btn-dark">
                  Bekijk het aanbod <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Maak een afspraak
                </Link>
              </Reveal>
            </div>

            {/* Right column — image + aside cards */}
            <aside className="lg:col-span-5 flex flex-col gap-5">

              {/* Hero image */}
              <Reveal className="relative aspect-[4/5] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[var(--shadow-card)]">
                <Image
                  src="https://ksrautos.nl/wp-content/uploads/2025/12/HeaderfotoKSR-scaled.webp"
                  alt="Showroom KSR Auto's aan de Havenkade in Ridderkerk"
                  fill
                  sizes="(min-width: 1024px) 460px, 100vw"
                  className="object-cover"
                  priority
                />
                {/* subtle bottom scrim for potential caption space */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-[var(--color-graphite)]/30 to-transparent"
                />
              </Reveal>

              {/* Brand focus card */}
              <Reveal delay={0.1} className="card card-elevated p-6">
                <Eyebrow>Merkfocus</Eyebrow>
                <p className="mt-2 text-[13px] text-[var(--color-steel)] leading-relaxed">
                  Wij specialiseren ons in de meest gevraagde merken — altijd met keurige documentatie.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {BRANDS.map((b) => (
                    <li key={b}>
                      <Link
                        href={`/aanbod?brand=${encodeURIComponent(b)}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-1 text-[12.5px] font-semibold text-[var(--color-charcoal)] hover:border-[var(--color-red)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-tint)] transition-colors duration-150"
                      >
                        {b}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Contact card */}
              <Reveal delay={0.15} className="card card-elevated p-6">
                <Eyebrow>Direct contact</Eyebrow>
                <p className="mt-2 text-[13px] text-[var(--color-steel)] leading-relaxed">
                  Bel of app ons voor een afspraak — wij staan altijd voor u klaar.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={BUSINESS.telHref}
                    className="group flex items-center gap-3.5 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 hover:border-[var(--color-red)] hover:bg-[var(--color-red-tint)] transition-colors duration-150"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-red)] text-white group-hover:bg-[var(--color-red-strong)] transition-colors duration-150">
                      <Phone className="size-3.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-mute)]">Bellen</span>
                      <span className="block font-bold tabular text-[var(--color-ink)]">{BUSINESS.phone}</span>
                    </span>
                  </a>

                  <a
                    href={BUSINESS.whatsapp}
                    target="_blank"
                    rel="noopener"
                    className="group flex items-center gap-3.5 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 hover:border-[var(--color-whatsapp)] hover:bg-[var(--color-success-tint)] transition-colors duration-150"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-whatsapp)] text-white group-hover:bg-[var(--color-whatsapp-strong)] transition-colors duration-150">
                      <MessageCircle className="size-3.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-mute)]">WhatsApp</span>
                      <span className="block font-bold text-[var(--color-ink)]">WhatsApp ons</span>
                    </span>
                  </a>
                </div>
              </Reveal>

            </aside>
          </div>
        </div>
      </div>

      <ClosingCTA
        title="Kom kennismaken"
        subtitle="Bel of app ons voor een afspraak — dan staat de juiste occasion voor u klaar aan de Havenkade."
      />
    </>
  );
}
