import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, Mail, Clock } from "lucide-react";

import { ContactForm } from "@/components/forms/ContactForm";
import { ClosingCTA } from "@/components/public/ClosingCTA";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { LazyMap } from "@/components/public/LazyMap";
import { Reveal } from "@/components/ui/Reveal";
import { BUSINESS, OPENING_HOURS, OPENING_NOTE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Neem direct contact op met KSR Auto's in Ridderkerk. Adres, telefoon, WhatsApp, e-mail en openingstijden.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.fullAddress)}&z=15&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.fullAddress)}`;

  const contactMethods = [
    {
      icon: Phone,
      label: "Telefoon",
      value: BUSINESS.phone,
      href: BUSINESS.telHref,
      cta: "Bel direct",
      target: undefined as string | undefined,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: BUSINESS.phone,
      href: BUSINESS.whatsapp,
      cta: "App ons",
      target: "_blank",
    },
    {
      icon: Mail,
      label: "E-mail",
      value: BUSINESS.email,
      href: `mailto:${BUSINESS.email}`,
      cta: "Stuur e-mail",
      target: undefined,
    },
    {
      icon: MapPin,
      label: "Adres",
      value: `${BUSINESS.address}, ${BUSINESS.postal} ${BUSINESS.city}`,
      href: mapsUrl,
      cta: "Route plannen",
      target: "_blank",
    },
  ];

  return (
    <div className="bg-[var(--color-canvas)]">
      <div className="container py-9 md:py-14">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Contact" }]} />

        {/* Header */}
        <Reveal className="mt-5 mb-10 md:mb-12 max-w-[38em]">
          <div className="eyebrow">Contact</div>
          <h1 className="display-2 mt-3">Kom langs aan de Havenkade</h1>
          <p className="lead mt-4">
            Wij helpen u graag persoonlijk. Bel, app, of stuur een bericht — we reageren snel.
          </p>
        </Reveal>

        {/* Contact method cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
          {contactMethods.map(({ icon: Icon, label, value, href, cta, target }, i) => (
            <Reveal key={label} delay={i * 0.07}>
              <a
                href={href}
                target={target}
                rel={target === "_blank" ? "noopener" : undefined}
                className="ksr-card group flex flex-col gap-3 p-5 md:p-6 rounded-[var(--radius-xl)] bg-[var(--color-paper)] shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-200 h-full"
              >
                {/* Icon tile */}
                <span className="grid place-items-center size-11 rounded-[var(--radius-md)] bg-[var(--color-red)] text-white shrink-0">
                  <Icon className="size-5" aria-hidden />
                </span>

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="lbl text-[10.5px] text-[var(--color-mute)]">{label}</div>
                  <div className="text-[14px] font-semibold text-[var(--color-ink)] break-all leading-snug mt-0.5">
                    {value}
                  </div>
                </div>

                <div className="text-[12.5px] font-semibold text-[var(--color-red)] flex items-center gap-1 mt-auto">
                  {cta}
                  <span aria-hidden className="group-hover:translate-x-0.5 transition-transform duration-150">→</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Main two-column: opening hours + form */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-start">
          {/* Left — opening hours */}
          <Reveal>
            <div className="card p-6 md:p-7">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid place-items-center size-9 rounded-[var(--radius-sm)] bg-[var(--color-red-tint)] text-[var(--color-red)] shrink-0">
                  <Clock className="size-4.5" aria-hidden />
                </span>
                <div className="lbl text-[10.5px] text-[var(--color-mute)]">Openingstijden</div>
              </div>
              <dl className="text-[14px]">
                {OPENING_HOURS.map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between py-2.5 border-b border-[var(--color-line)] last:border-0"
                  >
                    <dt className="text-[var(--color-charcoal)]">{h.day}</dt>
                    <dd className="font-bold tabular">{h.hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[12.5px] text-[var(--color-mute)] leading-relaxed">{OPENING_NOTE}</p>
            </div>
          </Reveal>

          {/* Right — message form */}
          <Reveal delay={0.1}>
            <div className="card p-6 md:p-8">
              <h2 className="font-display text-[24px] md:text-[26px] font-extrabold tracking-tight">
                Stuur ons een bericht
              </h2>
              <p className="mt-2 text-[14.5px] text-[var(--color-charcoal)]">
                Vul onderstaand formulier in. Wij reageren meestal binnen één werkdag — voor een directe
                reactie kunt u ons ook bellen of appen.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
              <p className="mt-5 text-[13px] text-[var(--color-steel)]">
                Een specifieke auto in gedachten?{" "}
                <Link href="/auto-zoeken" className="link">Plaats een zoekopdracht</Link>. KVK{" "}
                <span className="tabular">{BUSINESS.kvk}</span>.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Full-width map with floating location card */}
      <div className="relative mt-8 md:mt-12">
        <LazyMap
          src={mapEmbed}
          title="Locatie KSR Auto's"
          className="block w-full h-[400px] md:h-[540px] [filter:grayscale(0.2)_contrast(1.02)]"
        />
        <div className="absolute left-1/2 top-6 md:top-9 -translate-x-1/2 bg-[var(--color-paper)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] px-4 py-3.5 md:px-5 md:py-4 flex items-center gap-3 md:gap-4 max-w-[92%]">
          <span className="grid place-items-center size-11 rounded-[var(--radius-md)] bg-[var(--color-red)] text-white shrink-0">
            <MapPin className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[15px] md:text-[16px]">KSR Auto&rsquo;s</div>
            <div className="text-[12.5px] md:text-[13px] text-[var(--color-steel)] truncate">{BUSINESS.fullAddress}</div>
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener" className="btn btn-dark btn-sm whitespace-nowrap">
            Route
          </a>
        </div>
      </div>

      <ClosingCTA
        flush
        title="Tot ziens aan de Havenkade"
        subtitle="Bel of app vooraf voor de beste service — dan staat alles voor u klaar."
      />
    </div>
  );
}
