import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";
import { BUSINESS } from "@/lib/constants";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center bg-[var(--color-surface)] border-t border-[var(--color-line)]">
      <div className="container py-20 max-w-2xl">
        <Logo />
        <Eyebrow className="mt-6">Foutmelding · 404</Eyebrow>
        <h1 className="display-2 mt-3">Deze pagina hebben we niet kunnen vinden</h1>
        <p className="lead mt-4 text-[var(--color-charcoal)]">
          De pagina bestaat niet meer of de auto is mogelijk al verkocht. Bekijk ons actuele aanbod of neem direct contact met ons op.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/aanbod" className="btn btn-dark">Bekijk het aanbod</Link>
          <Link href="/contact" className="btn btn-secondary">Naar contact</Link>
          <a href={BUSINESS.whatsapp} target="_blank" rel="noopener" className="btn btn-whatsapp">WhatsApp ons</a>
        </div>
      </div>
    </section>
  );
}
