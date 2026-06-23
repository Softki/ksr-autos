"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";
import { BUSINESS } from "@/lib/constants";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <section className="min-h-[60vh] flex items-center bg-[var(--color-surface)] border-t border-[var(--color-line)]">
      <div className="container py-20 max-w-2xl">
        <Logo />
        <Eyebrow className="mt-6">Foutmelding</Eyebrow>
        <h1 className="display-2 mt-3">Er ging iets mis aan onze kant</h1>
        <p className="lead mt-4 text-[var(--color-charcoal)]">
          Onze excuses voor het ongemak. Probeer de pagina opnieuw te laden of neem direct contact met ons op — wij staan voor u klaar.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={reset} className="btn btn-dark">Probeer opnieuw</button>
          <Link href="/" className="btn btn-secondary">Naar de homepage</Link>
          <a href={BUSINESS.telHref} className="btn btn-ghost tabular">{BUSINESS.phone}</a>
        </div>

        {error.digest && (
          <p className="mt-6 text-[12px] text-[var(--color-mute)] tabular">Referentie: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
