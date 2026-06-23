import { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { ContactForm } from "@/components/forms/ContactForm";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
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

  return (
    <div className="bg-[var(--color-canvas)]">
      <div className="container py-9 md:py-14">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Contact" }]} />

        <div className="mt-5 mb-8 md:mb-9">
          <div className="eyebrow">Contact</div>
          <h1 className="display-2 mt-3">Kom langs of stuur een bericht</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-start">
          {/* Left — contact details + hours */}
          <div className="flex flex-col gap-4">
            <div className="surface-ink rounded-[var(--radius-xl)] p-7 dark-section">
              <div className="flex flex-col gap-[18px]">
                <div>
                  <div className="lbl text-[10.5px] text-[#B3A899]">Adres</div>
                  <div className="text-[17px] font-semibold mt-1.5 leading-snug">
                    {BUSINESS.address}
                    <br />
                    {BUSINESS.postal} {BUSINESS.city}
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <div className="lbl text-[10.5px] text-[#B3A899]">Telefoon &amp; WhatsApp</div>
                  <div className="text-[17px] font-semibold mt-1.5 tabular">{BUSINESS.phone}</div>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <div className="lbl text-[10.5px] text-[#B3A899]">E-mail</div>
                  <div className="text-[17px] font-semibold mt-1.5 break-all">{BUSINESS.email}</div>
                </div>
              </div>
              <div className="flex gap-2.5 mt-6">
                <a
                  href={BUSINESS.telHref}
                  className="flex-1 btn border border-white/20 text-white hover:bg-white/10"
                >
                  Bel ons
                </a>
                <a
                  href={BUSINESS.whatsapp}
                  target="_blank"
                  rel="noopener"
                  className="flex-1 btn btn-primary"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="card p-6">
              <div className="lbl text-[10.5px] text-[var(--color-mute)] mb-3.5">Openingstijden</div>
              <dl className="text-[14px]">
                {OPENING_HOURS.map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between py-2 border-b border-[var(--color-line)] last:border-0"
                  >
                    <dt className="text-[var(--color-charcoal)]">{h.day}</dt>
                    <dd className="font-bold tabular">{h.hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12.5px] text-[var(--color-mute)]">{OPENING_NOTE}</p>
            </div>
          </div>

          {/* Right — message form */}
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
        </div>
      </div>

      {/* Full-width map with floating location card */}
      <div className="relative mt-4 md:mt-8">
        <iframe
          title="Locatie KSR Auto's"
          src={mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full h-[400px] md:h-[540px] border-0 [filter:grayscale(0.2)_contrast(1.02)]"
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
    </div>
  );
}
