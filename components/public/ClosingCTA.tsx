"use client";

import { Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { whatsAppLink } from "@/lib/utils/format";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

interface Props {
  /** Heading — keep it short. */
  title?: string;
  /** One-line supporting copy. */
  subtitle?: string;
  /** Prefilled WhatsApp message. */
  waMessage?: string;
  /** Drop the top margin so the section sits flush against the preceding block (e.g. a full-width map). */
  flush?: boolean;
}

/**
 * The unified closing section that ends EVERY public page, directly above the
 * footer. Terracotta background with a clean dot pattern + soft corner glow.
 * Identical layout/colours on every page — only the copy changes. Fixed vertical
 * padding so the spacing into the footer is the same site-wide.
 *
 * Buttons: phone (white outline) + WhatsApp (ink). The footer's dark wave sits
 * on top of the bottom edge, giving the terracotta → dark transition.
 */
export function ClosingCTA({
  title = "Liever even langskomen?",
  subtitle = "Bel of app vooraf voor de beste service — dan zorgen we dat uw auto klaarstaat aan de Havenkade 4 in Ridderkerk.",
  waMessage = "Hallo KSR Auto's, ik wil graag langskomen aan de Havenkade. Wanneer kan dat?",
  flush = false,
}: Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[var(--color-red)] text-white",
        !flush && "mt-16 md:mt-24",
      )}
    >
      {/* clean dot pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.13)_1.5px,transparent_1.5px)] [background-size:26px_26px]"
      />
      {/* soft corner glow */}
      <div
        aria-hidden
        className="absolute w-[520px] h-[520px] rounded-full left-[-160px] bottom-[-260px] pointer-events-none [background:radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)]"
      />

      <div className="relative container py-20 md:py-24 flex flex-col items-center text-center gap-7">
        <Reveal className="flex flex-col items-center">
          <h2 className="text-white max-w-[16ch]">{title}</h2>
          <p className="mt-3.5 text-white/[0.86] text-[16px] md:text-[16.5px] max-w-[34em]">
            {subtitle}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-wrap gap-3 justify-center">
          <a
            href={BUSINESS.telHref}
            className="btn btn-lg btn-outline-white tabular gap-2"
          >
            <Phone className="size-[17px]" aria-hidden />
            {BUSINESS.phone}
          </a>
          <a
            href={whatsAppLink(waMessage, BUSINESS.whatsapp)}
            target="_blank"
            rel="noopener"
            className="btn btn-lg btn-dark"
          >
            WhatsApp ons
          </a>
        </Reveal>
      </div>
    </section>
  );
}
