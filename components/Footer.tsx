import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { OpenNowBadge } from "@/components/ui/OpenNowBadge";
import { MapPin, Phone, Mail } from "lucide-react";

const NAV = [
  { href: "/aanbod", label: "Aanbod" },
  { href: "/auto-verkopen", label: "Auto verkopen" },
  { href: "/auto-zoeken", label: "Zoekopdracht" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto bg-[#0E0E10] text-[#9A948B] dark-section">
      {/* Curved transition into the footer */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 -translate-y-[99%] leading-[0] pointer-events-none"
      >
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="block w-full h-12 md:h-14">
          <path d="M0,70 L0,38 C220,2 420,2 720,34 C1010,64 1240,64 1440,30 L1440,70 Z" fill="#0E0E10" />
        </svg>
      </div>

      {/* Subtle, clean dot pattern over the dark footer */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.6] [background-image:radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="relative container pt-14 md:pt-16 grid gap-10 md:gap-8 md:grid-cols-12">
        {/* Brand */}
        <div className="md:col-span-4">
          <Logo onDark height={38} />
          <p className="mt-5 text-[14px] leading-relaxed max-w-[30em] text-[#9A948B]">
            De toegankelijke occasiondealer in Ridderkerk. Eerlijke voertuiginformatie, directe
            bereikbaarheid en service rond proefrit, inruil en garantie.
          </p>
        </div>

        {/* Navigation */}
        <div className="md:col-span-2">
          <div className="lbl text-[10.5px] text-[#6B655C] mb-4">Navigatie</div>
          <ul className="flex flex-col gap-2.5 text-[14px]">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="foot-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="md:col-span-3">
          <div className="lbl text-[10.5px] text-[#6B655C] mb-4">Contact</div>
          <div className="flex flex-col gap-3 text-[14px]">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.fullAddress)}`}
              target="_blank"
              rel="noopener"
              className="flex items-start gap-3 text-[#CABFB0] hover:text-[#F7F5F1] transition-colors"
            >
              <MapPin className="size-4 mt-0.5 shrink-0 text-[var(--color-red)]" aria-hidden />
              <span className="leading-snug">
                {BUSINESS.address}
                <br />
                {BUSINESS.postal} {BUSINESS.city}
              </span>
            </a>
            <a
              href={BUSINESS.telHref}
              className="flex items-center gap-3 text-[#CABFB0] hover:text-[#F7F5F1] transition-colors"
            >
              <Phone className="size-4 shrink-0 text-[var(--color-red)]" aria-hidden />
              <span className="tabular">{BUSINESS.phone}</span>
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-3 text-[#CABFB0] hover:text-[#F7F5F1] transition-colors break-all"
            >
              <Mail className="size-4 shrink-0 text-[var(--color-red)]" aria-hidden />
              {BUSINESS.email}
            </a>
          </div>
        </div>

        {/* Hours */}
        <div className="md:col-span-3">
          <div className="lbl text-[10.5px] text-[#6B655C] mb-4">Openingstijden</div>
          <OpenNowBadge />
          <div className="flex items-center justify-between gap-4 text-[14px] py-2 border-b border-white/[0.07]">
            <span className="text-[#9A948B]">Ma &ndash; Za</span>
            <span className="font-semibold text-[#F7F5F1] tabular whitespace-nowrap">09:00 &ndash; 17:00</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[14px] py-2">
            <span className="text-[#9A948B]">Zondag</span>
            <span className="font-semibold text-[#F7F5F1] whitespace-nowrap">Op afspraak</span>
          </div>
        </div>
      </div>

      <div className="relative container mt-10 py-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-[12.5px]">
        <span>
          © {new Date().getFullYear()} {BUSINESS.name} · KVK {BUSINESS.kvk}
        </span>
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex gap-5">
            <Link href="/privacyverklaring" className="foot-link">
              Privacyverklaring
            </Link>
            <Link href="/cookies" className="foot-link">
              Cookies
            </Link>
          </span>
          <div className="flex gap-2.5">
            <a href="https://www.facebook.com" target="_blank" rel="noopener" className="foot-soc" aria-label="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3h-3V9z" />
              </svg>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener" className="foot-soc" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href={BUSINESS.whatsapp} target="_blank" rel="noopener" className="foot-soc" aria-label="WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
