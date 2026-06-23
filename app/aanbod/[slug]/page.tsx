import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ImageGallery } from "@/components/public/ImageGallery";
import { SpecGrid } from "@/components/public/SpecGrid";
import { StatusBadge } from "@/components/public/StatusBadge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { CarCard } from "@/components/public/CarCard";
import { getCarBySlug, getRelatedCars } from "@/lib/data/cars";
import { BUSINESS, DISCLAIMER, STANDARD_APPOINTMENT_TEXT } from "@/lib/constants";
import { formatKm, formatPrice, formatDate, carHeadline, whatsAppLink } from "@/lib/utils/format";
import type { Car } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Occasion niet gevonden" };

  const title = `${carHeadline(car.brand, car.model, car.version)} — ${formatPrice(car.price)}`;
  const description = `${car.brand} ${car.model}${car.year ? `, ${car.year}` : ""}, ${formatKm(car.mileage)}, ${car.fuel_type ?? ""}. Bekijk foto's, specificaties en vraag een proefrit aan bij KSR Auto's Ridderkerk.`;

  return {
    title,
    description,
    alternates: { canonical: `/aanbod/${car.slug}` },
    openGraph: { title, description, images: car.main_image ? [{ url: car.main_image }] : [] },
  };
}

export default async function CarDetail({ params }: Props) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const related = await getRelatedCars(car, 3);

  const images = car.images && car.images.length > 0
    ? car.images.map((i) => ({ src: i.image_url, alt: i.alt_text ?? `${car.brand} ${car.model}` }))
    : car.main_image
      ? [{ src: car.main_image, alt: `${car.brand} ${car.model}` }]
      : [];
  if (images.length === 0) images.push({ src: "/placeholder-car.jpg", alt: car.title });

  const headline = carHeadline(car.brand, car.model, car.version);
  const vatNote = car.vat_type === "btw" ? "Prijs incl. BTW · BTW-auto" : "Margeauto — BTW niet verrekenbaar";
  const waMessage = `Hallo KSR Auto's, ik heb een vraag over de ${headline}. Is deze nog beschikbaar?`;
  const productJsonLd = buildVehicleJsonLd(car);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(car);

  return (
    <article className="bg-[var(--color-canvas)]">
      <div className="container py-6 md:py-10">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/aanbod", label: "Aanbod" },
            { label: car.brand },
            { label: car.model },
          ]}
        />

        <Link
          href="/aanbod"
          className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-steel)] hover:text-[var(--color-red)] transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden /> Terug naar aanbod
        </Link>

        <div className="mt-6 grid gap-9 lg:gap-10 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-9">
            <ImageGallery images={images} altBase={headline} />

            {car.description && (
              <section aria-labelledby="omschrijving-heading">
                <h2 id="omschrijving-heading" className="font-display text-[24px] md:text-[26px] font-extrabold tracking-tight">
                  Omschrijving
                </h2>
                <p className="mt-3 text-[15.5px] leading-[1.7] text-[var(--color-charcoal)] whitespace-pre-line max-w-prose">
                  {car.description}
                </p>
                <div className="mt-4 card border-l-[3px] border-l-[var(--color-red)] p-5 text-[14px] leading-relaxed text-[var(--color-charcoal)]">
                  {STANDARD_APPOINTMENT_TEXT}
                </div>
              </section>
            )}

            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="font-display text-[24px] md:text-[26px] font-extrabold tracking-tight mb-4">
                Specificaties
              </h2>
              <SpecGrid car={car} />
            </section>

            {car.options && car.options.length > 0 && (
              <section aria-labelledby="opties-heading">
                <h2 id="opties-heading" className="font-display text-[24px] md:text-[26px] font-extrabold tracking-tight mb-4">
                  Opties &amp; uitrusting
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-[14px]">
                  {car.options.map((o) => (
                    <li key={o} className="flex gap-2 items-start">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-red)] shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div id="proefrit" className="card p-6 md:p-8 scroll-mt-24">
              <Eyebrow>Proefrit</Eyebrow>
              <h2 className="font-display text-[22px] font-extrabold mt-3">Proefrit aanvragen</h2>
              <p className="mt-2 text-[var(--color-charcoal)]">Vul het formulier in — we nemen zo snel mogelijk contact met u op.</p>
              <div className="mt-5">
                <InquiryForm type="test_drive" carId={car.id} carTitle={car.title} />
              </div>
            </div>

            <div id="inruil" className="card p-6 md:p-8 scroll-mt-24">
              <Eyebrow>Inruilen</Eyebrow>
              <h2 className="font-display text-[22px] font-extrabold mt-3">Uw huidige auto inruilen?</h2>
              <p className="mt-2 text-[var(--color-charcoal)]">Vul uw gegevens in. Foto&apos;s van uw auto kunt u na het indienen sturen via WhatsApp of e-mail.</p>
              <div className="mt-5">
                <InquiryForm type="trade_in" carId={car.id} carTitle={car.title} />
              </div>
            </div>

            <p className="text-[12.5px] text-[var(--color-steel)] max-w-prose">{DISCLAIMER}</p>
          </div>

          {/* RIGHT — sticky aside */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-[90px] space-y-4">
              <div className="card card-elevated p-6">
                <div className="lbl text-[10px] text-[var(--color-tan)]">
                  {car.body_type ?? "Occasion"}{car.year ? ` · ${car.year}` : ""}
                </div>
                <h1 className="font-display text-[22px] md:text-[23px] font-extrabold leading-tight mt-2">{headline}</h1>

                <div className="font-display font-extrabold text-[34px] md:text-[38px] text-[var(--color-red)] mt-4 leading-none tabular">
                  {formatPrice(car.price)}
                </div>
                <div className="mt-1.5 text-[12px] text-[var(--color-mute)] font-semibold">{vatNote}</div>

                <dl className="grid grid-cols-2 gap-2.5 mt-5">
                  <StatBox label="Km-stand" value={formatKm(car.mileage)} />
                  <StatBox label="Bouwjaar" value={car.year ? String(car.year) : "—"} />
                  <StatBox label="Brandstof" value={car.fuel_type ?? "—"} />
                  <StatBox label="APK tot" value={car.apk_until ? formatDate(car.apk_until) : "—"} />
                </dl>

                <a
                  href={whatsAppLink(waMessage, BUSINESS.whatsapp)}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary btn-lg w-full mt-5 gap-2.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
                  </svg>
                  App over deze auto
                </a>

                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                  <a href="#proefrit" className="btn btn-secondary">Proefrit</a>
                  <a href="#inruil" className="btn btn-secondary">Inruilen</a>
                </div>
                <a href={BUSINESS.telHref} className="btn btn-dark w-full mt-2.5 gap-2 tabular">
                  <Phone className="size-4" aria-hidden /> Bel {BUSINESS.phone}
                </a>

                <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--color-mute)]">
                  Hoewel de informatie met zorg is samengesteld, kunnen gegevens afwijken. Neem contact op voor
                  exacte uitvoering en beschikbaarheid.
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <Eyebrow>Bezoekadres</Eyebrow>
                  <StatusBadge status={car.status} />
                </div>
                <div className="mt-3 text-[14px]">
                  <div className="font-semibold">{BUSINESS.name}</div>
                  <div>{BUSINESS.address}</div>
                  <div>{BUSINESS.postal} {BUSINESS.city}</div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.fullAddress)}`}
                  target="_blank"
                  rel="noopener"
                  className="link mt-3 inline-block text-[13px]"
                >
                  Routebeschrijving →
                </a>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
              <div>
                <Eyebrow>Vergelijkbaar</Eyebrow>
                <h2 className="display-2 mt-3">Meer {car.brand}&apos;s in voorraad</h2>
              </div>
              <Link href={`/aanbod?brand=${encodeURIComponent(car.brand)}`} className="btn btn-secondary btn-sm">
                Bekijk alle {car.brand}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {related.map((rc) => (
                <CarCard key={rc.id} car={rc} />
              ))}
            </div>
          </section>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </article>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[var(--radius-md)] px-3.5 py-3">
      <dt className="lbl text-[9.5px] text-[var(--color-mute)]">{label}</dt>
      <dd className="font-bold text-[15px] mt-1 tabular">{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Structured data                                                           */
/* -------------------------------------------------------------------------- */

function buildVehicleJsonLd(car: Car) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ksrautos.nl";
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: car.title,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: car.year ? String(car.year) : undefined,
    bodyType: car.body_type ?? undefined,
    fuelType: car.fuel_type ?? undefined,
    vehicleTransmission: car.transmission ?? undefined,
    mileageFromOdometer: car.mileage
      ? { "@type": "QuantitativeValue", value: car.mileage, unitCode: "KMT" }
      : undefined,
    color: car.color ?? undefined,
    numberOfDoors: car.doors ?? undefined,
    image: car.main_image,
    url: `${siteUrl}/aanbod/${car.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: car.price,
      itemCondition: "https://schema.org/UsedCondition",
      availability:
        car.status === "available"
          ? "https://schema.org/InStock"
          : car.status === "reserved"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      seller: { "@id": `${siteUrl}#dealer` },
      url: `${siteUrl}/aanbod/${car.slug}`,
    },
  };
}

function buildBreadcrumbJsonLd(car: Car) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ksrautos.nl";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Aanbod", item: `${siteUrl}/aanbod` },
      { "@type": "ListItem", position: 3, name: `${car.brand} ${car.model}`, item: `${siteUrl}/aanbod/${car.slug}` },
    ],
  };
}
