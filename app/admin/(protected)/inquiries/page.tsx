import Link from "next/link";
import { Mail, Car, ArrowLeftRight, Search, Image as ImageIcon, ArrowRight, Inbox } from "lucide-react";

import { listInquiries } from "@/lib/data/inquiries";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatRow, StatPill } from "@/components/admin/StatPills";
import { InquiryStatusPill } from "@/components/admin/InquiryStatusPill";
import { INQUIRY_TYPE_LABEL, parseInquiryPhotos } from "@/lib/utils/inquiry-format";
import type { InquiryStatus, InquiryType } from "@/lib/types";

export const metadata = { title: "Aanvragen" };

interface SearchParams {
  status?: InquiryStatus | "all";
  type?: InquiryType | "all";
}

const TYPE_ICON: Record<InquiryType, typeof Mail> = {
  contact: Mail,
  test_drive: Car,
  trade_in: ArrowLeftRight,
  search_request: Search,
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const status = sp.status === "all" || !sp.status ? undefined : sp.status;
  const type = sp.type === "all" || !sp.type ? undefined : sp.type;

  const [allInquiries, inquiries] = await Promise.all([
    listInquiries({}),
    listInquiries({ status, type }),
  ]);
  const cnt = (s: InquiryStatus) => allInquiries.filter((i) => i.status === s).length;
  const isFiltered = inquiries.length !== allInquiries.length;

  return (
    <>
      <div className="mb-5">
        <Eyebrow>Aanvragen</Eyebrow>
        <h1 className="display-2 mt-2">Klantaanvragen</h1>
      </div>

      <StatRow className="mb-6">
        <StatPill value={allInquiries.length} label="Totaal" tone="ink" />
        <StatPill value={cnt("new")} label="Nieuw" tone="red" dot />
        <StatPill value={cnt("contacted")} label="Gecontacteerd" tone="amber" dot />
        <StatPill value={cnt("closed")} label="Afgesloten" tone="success" dot />
      </StatRow>

      {/* Filters */}
      <form className="card mb-5 flex flex-wrap items-end gap-3 p-4" action="/admin/inquiries">
        <div className="min-w-[150px]">
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? "all"} className="select">
            <option value="all">Alle statussen</option>
            <option value="new">Nieuw</option>
            <option value="contacted">Gecontacteerd</option>
            <option value="closed">Afgesloten</option>
            <option value="spam">Spam</option>
          </select>
        </div>
        <div className="min-w-[150px]">
          <label htmlFor="type" className="field-label">Type</label>
          <select id="type" name="type" defaultValue={sp.type ?? "all"} className="select">
            <option value="all">Alle types</option>
            <option value="contact">Contact</option>
            <option value="test_drive">Proefrit</option>
            <option value="trade_in">Inruil / verkoop</option>
            <option value="search_request">Zoekopdracht</option>
          </select>
        </div>
        <button className="btn btn-secondary" type="submit">Filteren</button>
      </form>

      {isFiltered && inquiries.length > 0 && (
        <p className="mb-3 !text-[13px] text-[var(--color-steel)]">
          <span className="tabular font-semibold text-[var(--color-ink)]">{inquiries.length}</span> van {allInquiries.length} aanvragen getoond
        </p>
      )}
      {inquiries.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-mute)]">
            <Inbox className="size-6" aria-hidden />
          </span>
          <p className="!text-[15px] font-semibold">Geen aanvragen gevonden</p>
          <p className="!text-[13.5px] text-[var(--color-steel)]">Nieuwe aanvragen vanaf de website verschijnen hier.</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {inquiries.map((i) => {
            const Icon = TYPE_ICON[i.type];
            const photoCount = parseInquiryPhotos(i.metadata).length;
            return (
              <Link
                key={i.id}
                href={`/admin/inquiries/${i.id}`}
                className="card group flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-steel)]">
                  <Icon className="size-[18px]" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14.5px] font-bold">{i.name}</span>
                    {i.status === "new" && <span className="size-1.5 shrink-0 rounded-full bg-[var(--color-red)]" aria-label="Nieuw" />}
                  </div>
                  <div className="truncate text-[12.5px] text-[var(--color-steel)]">{i.email}</div>
                </div>

                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="text-[12px] font-semibold text-[var(--color-charcoal)]">{INQUIRY_TYPE_LABEL[i.type]}</span>
                  {photoCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--color-steel)]">
                      <ImageIcon className="size-3" aria-hidden /> {photoCount}
                    </span>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <InquiryStatusPill status={i.status} />
                  <div className="mt-1 tabular text-[11.5px] text-[var(--color-steel)]">
                    {new Date(i.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  </div>
                </div>

                <ArrowRight className="hidden size-4 shrink-0 text-[var(--color-mute)] transition-transform group-hover:translate-x-0.5 md:block" aria-hidden />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
