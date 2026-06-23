import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { adminListCars } from "@/lib/data/cars";
import { listInquiries } from "@/lib/data/inquiries";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = { title: "Admin overzicht" };

export default async function AdminDashboard() {
  const [cars, inquiries] = await Promise.all([adminListCars(), listInquiries({ limit: 6 })]);
  const newInq = inquiries.filter((i) => i.status === "new").length;
  const stats = [
    { label: "Beschikbaar", value: cars.filter((c) => c.status === "available").length, color: "var(--color-success)" },
    { label: "Gereserveerd", value: cars.filter((c) => c.status === "reserved").length, color: "var(--color-warning)" },
    { label: "Verkocht", value: cars.filter((c) => c.status === "sold").length, color: "var(--color-ink)" },
    { label: "Nieuwe aanvragen", value: newInq, color: "var(--color-red)" },
  ];

  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <Eyebrow>Dashboard</Eyebrow>
          <h1 className="display-2 mt-2">Overzicht</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/cars" className="btn btn-secondary btn-sm">Auto&apos;s beheren</Link>
          <Link href="/admin/cars/new" className="btn btn-primary btn-sm"><Plus className="size-4" /> Nieuwe auto</Link>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <dt className="lbl text-[10.5px] text-[var(--color-mute)]">{s.label}</dt>
            <dd className="mt-2.5 font-display text-[38px] font-extrabold tabular leading-none" style={{ color: s.color }}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold">Recente aanvragen</h2>
            <Link href="/admin/inquiries" className="text-[13px] inline-flex items-center gap-1 link-quiet hover:text-[var(--color-ink)]">
              Alle aanvragen <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="card divide-line">
            {inquiries.length === 0 && (
              <p className="p-5 text-[14px] text-[var(--color-steel)]">Nog geen aanvragen.</p>
            )}
            {inquiries.map((i) => (
              <div key={i.id} className="p-4 flex justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-[14px] truncate">{i.name}</div>
                  <div className="text-[12.5px] text-[var(--color-steel)] truncate">{i.email} · {i.type}</div>
                </div>
                <div className="text-[12.5px] text-[var(--color-steel)] tabular shrink-0">
                  {new Date(i.created_at).toLocaleDateString("nl-NL")}
                </div>
              </div>
            ))}
            {newInq > 0 && (
              <div className="p-4 text-[12.5px] text-[var(--color-steel)] bg-[var(--color-surface)]">
                <strong className="text-[var(--color-ink)] tabular">{newInq}</strong> nieuwe {newInq === 1 ? "aanvraag" : "aanvragen"} wachten op opvolging.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold">Recent toegevoegde auto&apos;s</h2>
            <Link href="/admin/cars" className="text-[13px] inline-flex items-center gap-1 link-quiet hover:text-[var(--color-ink)]">
              Alle auto&apos;s <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="card divide-line">
            {cars.slice(0, 6).map((c) => (
              <div key={c.id} className="p-4 flex justify-between gap-4">
                <Link href={`/admin/cars/${c.id}/edit`} className="min-w-0 hover:text-[var(--color-ink)]">
                  <div className="font-medium text-[14px] truncate">{c.brand} {c.model}</div>
                  <div className="text-[12.5px] text-[var(--color-steel)] truncate">{c.version ?? c.title}</div>
                </Link>
                <div className="text-[12.5px] tabular text-[var(--color-steel)] shrink-0">€ {c.price.toLocaleString("nl-NL")}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
