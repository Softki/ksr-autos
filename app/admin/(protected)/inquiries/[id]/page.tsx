import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MessageCircle, Calendar, Images } from "lucide-react";

import { getInquiryById } from "@/lib/data/inquiries";
import { getCarById } from "@/lib/data/cars";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CarThumb } from "@/components/admin/CarThumb";
import { InquiryGallery } from "@/components/admin/InquiryGallery";
import { InquiryStatusSelect } from "@/components/admin/InquiryStatusSelect";
import { InquiryStatusPill } from "@/components/admin/InquiryStatusPill";
import {
  INQUIRY_TYPE_LABEL,
  metaLabel,
  metaValue,
  parseInquiryPhotos,
  inquiryDetailEntries,
} from "@/lib/utils/inquiry-format";

export const metadata = { title: "Aanvraag" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);
  if (!inquiry) notFound();

  const photos = parseInquiryPhotos(inquiry.metadata);
  const entries = inquiryDetailEntries(inquiry.metadata);
  const car = inquiry.car_id ? await getCarById(inquiry.car_id) : null;
  const waNumber = inquiry.phone ? inquiry.phone.replace(/[^\d]/g, "").replace(/^0/, "31") : null;

  return (
    <>
      <Link
        href="/admin/inquiries"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-steel)] transition-colors hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="size-4" aria-hidden /> Terug naar aanvragen
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_336px]">
        {/* ── Main column ── */}
        <div className="space-y-5">
          <div className="card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Eyebrow>{INQUIRY_TYPE_LABEL[inquiry.type]}</Eyebrow>
                <h1 className="admin-title mt-2 break-words">{inquiry.name}</h1>
              </div>
              <InquiryStatusPill status={inquiry.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${inquiry.email}`} className="btn btn-secondary btn-sm gap-1.5">
                <Mail className="size-4" aria-hidden /> E-mail
              </a>
              {inquiry.phone && (
                <a href={`tel:${inquiry.phone}`} className="btn btn-secondary btn-sm gap-1.5 tabular">
                  <Phone className="size-4" aria-hidden /> {inquiry.phone}
                </a>
              )}
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-whatsapp btn-sm gap-1.5"
                >
                  <MessageCircle className="size-4" aria-hidden /> WhatsApp
                </a>
              )}
            </div>

            <div className="mt-4 flex items-center gap-1.5 border-t border-[var(--color-line)] pt-3 text-[12.5px] text-[var(--color-steel)]">
              <Calendar className="size-3.5" aria-hidden />
              {new Date(inquiry.created_at).toLocaleString("nl-NL", { dateStyle: "full", timeStyle: "short" })}
            </div>
          </div>

          {inquiry.message && (
            <section className="card p-5 md:p-6">
              <h2 className="label-mono mb-2.5">Bericht</h2>
              <p className="whitespace-pre-line !text-[15px] leading-relaxed text-[var(--color-charcoal)]">
                {inquiry.message}
              </p>
            </section>
          )}

          {photos.length > 0 && (
            <section className="card p-5 md:p-6">
              <h2 className="label-mono mb-3 flex items-center gap-2">
                <Images className="size-4" aria-hidden /> Foto&rsquo;s ({photos.length})
              </h2>
              <InquiryGallery photos={photos} />
            </section>
          )}
        </div>

        {/* ── Sidebar column ── */}
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="label-mono mb-3">Status</h2>
            <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
          </section>

          <section className="card p-5">
            <h2 className="label-mono mb-3">Contactgegevens</h2>
            <dl className="space-y-3 text-[14px]">
              <Row label="Naam">{inquiry.name}</Row>
              <Row label="E-mail">
                <a className="link break-all" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
              </Row>
              {inquiry.phone && (
                <Row label="Telefoon">
                  <a className="link tabular" href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
                </Row>
              )}
            </dl>
          </section>

          {entries.length > 0 && (
            <section className="card p-5">
              <h2 className="label-mono mb-3">Details</h2>
              <dl className="space-y-3 text-[14px]">
                {entries.map(([k, v]) => (
                  <Row key={k} label={metaLabel(k)}>{metaValue(k, v)}</Row>
                ))}
              </dl>
            </section>
          )}

          {car && (
            <section className="card p-5">
              <h2 className="label-mono mb-3">Gekoppelde auto</h2>
              <Link
                href={`/admin/cars/${car.id}/edit`}
                className="group flex items-center gap-3 rounded-[var(--radius-md)] p-1 transition-colors hover:bg-[var(--color-surface)]"
              >
                <CarThumb src={car.main_image} alt={`${car.brand} ${car.model}`} size={48} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold">{car.brand} {car.model}</div>
                  <div className="truncate text-[12.5px] text-[var(--color-steel)]">{car.version ?? car.slug}</div>
                </div>
              </Link>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[12.5px] font-medium text-[var(--color-steel)]">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-[var(--color-ink)]">{children}</dd>
    </div>
  );
}
