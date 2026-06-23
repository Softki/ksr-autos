import Link from "next/link";

import { listInquiries } from "@/lib/data/inquiries";
import { updateInquiryStatusAction } from "@/lib/actions/inquiries-admin";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { InquiryStatus, InquiryType } from "@/lib/types";

export const metadata = { title: "Aanvragen" };

interface SearchParams {
  status?: InquiryStatus | "all";
  type?: InquiryType | "all";
}

const TYPE_LABEL: Record<InquiryType, string> = {
  contact: "Contact",
  test_drive: "Proefrit",
  trade_in: "Inruil",
  search_request: "Zoekopdracht",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "Nieuw",
  contacted: "Gecontacteerd",
  closed: "Afgesloten",
  spam: "Spam",
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const status = sp.status === "all" || !sp.status ? undefined : sp.status;
  const type = sp.type === "all" || !sp.type ? undefined : sp.type;

  const inquiries = await listInquiries({ status, type });

  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <Eyebrow>Aanvragen</Eyebrow>
          <h1 className="display-2 mt-2">Klantaanvragen</h1>
          <p className="mt-2 text-[14px] text-[var(--color-steel)]">
            <span className="tabular">{inquiries.length}</span> resultaten
          </p>
        </div>
      </div>

      <form className="mb-6 flex flex-wrap gap-3 items-end" action="/admin/inquiries">
        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? "all"} className="select">
            <option value="all">Alle</option>
            <option value="new">Nieuw</option>
            <option value="contacted">Gecontacteerd</option>
            <option value="closed">Afgesloten</option>
            <option value="spam">Spam</option>
          </select>
        </div>
        <div>
          <label htmlFor="type" className="field-label">Type</label>
          <select id="type" name="type" defaultValue={sp.type ?? "all"} className="select">
            <option value="all">Alle</option>
            <option value="contact">Contact</option>
            <option value="test_drive">Proefrit</option>
            <option value="trade_in">Inruil</option>
            <option value="search_request">Zoekopdracht</option>
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" type="submit">Filteren</button>
      </form>

      <div className="grid gap-4">
        {inquiries.length === 0 && (
          <div className="card p-10 text-center text-[var(--color-steel)]">Geen aanvragen gevonden.</div>
        )}

        {inquiries.map((i) => (
          <article key={i.id} className="card p-5 md:p-6">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-line)] pb-3">
              <div>
                <h2 className="font-semibold text-[15.5px]">{i.name}</h2>
                <div className="text-[13.5px] text-[var(--color-steel)] flex flex-wrap gap-x-3">
                  <a className="link" href={`mailto:${i.email}`}>{i.email}</a>
                  {i.phone && <a className="link tabular" href={`tel:${i.phone}`}>{i.phone}</a>}
                  <span>· {TYPE_LABEL[i.type]}</span>
                </div>
              </div>
              <div className="text-[12.5px] text-[var(--color-steel)] tabular text-right shrink-0">
                {new Date(i.created_at).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
                <div className="mt-1">
                  <span className="label-mono">{STATUS_LABEL[i.status]}</span>
                </div>
              </div>
            </header>

            {i.message && (
              <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-line text-[var(--color-charcoal)]">{i.message}</p>
            )}

            {i.metadata && Object.keys(i.metadata).length > 0 && (
              <dl className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px]">
                {Object.entries(i.metadata).map(([k, v]) => (
                  <div key={k}>
                    <dt className="label-mono">{k.replace(/_/g, " ")}</dt>
                    <dd className="tabular">{String(v ?? "—")}</dd>
                  </div>
                ))}
              </dl>
            )}

            {i.car_id && (
              <div className="mt-3 text-[12.5px] text-[var(--color-steel)]">
                Auto referentie:{" "}
                <Link href={`/admin/cars/${i.car_id}/edit`} className="link">
                  {i.car_id}
                </Link>
              </div>
            )}

            <form action={updateInquiryStatusAction} className="mt-4 flex items-center gap-2">
              <input type="hidden" name="id" value={i.id} />
              <select name="status" defaultValue={i.status} className="select py-1.5 text-[13px] min-h-[36px]">
                <option value="new">Nieuw</option>
                <option value="contacted">Gecontacteerd</option>
                <option value="closed">Afgesloten</option>
                <option value="spam">Spam</option>
              </select>
              <button className="btn btn-secondary btn-sm" type="submit">Status opslaan</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
