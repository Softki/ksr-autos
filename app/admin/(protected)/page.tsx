import Link from "next/link";
import {
  Plus, ArrowRight, Car, CircleCheck, Clock, BadgeCheck, Star, Inbox, Pencil,
} from "lucide-react";

import { adminListCars } from "@/lib/data/cars";
import { listInquiries } from "@/lib/data/inquiries";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusBadge } from "@/components/public/StatusBadge";
import { CarThumb } from "@/components/admin/CarThumb";
import { formatPrice } from "@/lib/utils/format";
import { INQUIRY_TYPE_LABEL } from "@/lib/utils/inquiry-format";

export const metadata = { title: "Overzicht" };

export default async function AdminDashboard() {
  const [cars, inquiries] = await Promise.all([adminListCars(), listInquiries({})]);

  const count = (s: string) => cars.filter((c) => c.status === s).length;
  const newInq = inquiries.filter((i) => i.status === "new").length;

  const stats = [
    { label: "Totaal", value: cars.length, icon: Car, tint: "var(--color-surface)", fg: "var(--color-ink)" },
    { label: "Beschikbaar", value: count("available"), icon: CircleCheck, tint: "var(--color-success-tint)", fg: "var(--color-success)" },
    { label: "Gereserveerd", value: count("reserved"), icon: Clock, tint: "#FBF1DF", fg: "#B4690E" },
    { label: "Verkocht", value: count("sold"), icon: BadgeCheck, tint: "var(--color-red-tint)", fg: "var(--color-red)" },
    { label: "Uitgelicht", value: cars.filter((c) => c.is_featured).length, icon: Star, tint: "#FCF6DD", fg: "#8A6D0B" },
    { label: "Nieuwe aanvragen", value: newInq, icon: Inbox, tint: "var(--color-red-tint)", fg: "var(--color-red)" },
  ];

  const recentCars = cars.slice(0, 6);
  const recentInq = inquiries.slice(0, 6);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Dashboard</Eyebrow>
          <h1 className="display-2 mt-2">Overzicht</h1>
        </div>
        <Link href="/admin/cars/new" className="btn btn-primary btn-sm gap-1.5">
          <Plus className="size-4" aria-hidden /> Nieuwe auto
        </Link>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center justify-between gap-3 p-4 md:p-5">
            <div className="min-w-0">
              <dt className="lbl truncate text-[10px] text-[var(--color-steel)]">{s.label}</dt>
              <dd className="tabular mt-1.5 font-display text-[28px] font-extrabold leading-none" style={{ color: s.fg }}>
                {s.value}
              </dd>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]" style={{ background: s.tint, color: s.fg }}>
              <s.icon className="size-5" aria-hidden />
            </span>
          </div>
        ))}
      </dl>

      <div className="mt-9 grid gap-6 lg:grid-cols-2">
        {/* Recent inquiries */}
        <section className="card flex flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="text-[15px] font-bold">Recente aanvragen</h2>
            <Link href="/admin/inquiries" className="link-quiet inline-flex items-center gap-1 text-[13px] hover:text-[var(--color-ink)]">
              Alle <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </header>
          <div className="divide-y divide-[var(--color-line)]">
            {recentInq.length === 0 && (
              <p className="px-5 py-8 text-center text-[14px] text-[var(--color-steel)]">Nog geen aanvragen.</p>
            )}
            {recentInq.map((i) => (
              <Link
                key={i.id}
                href={`/admin/inquiries/${i.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface)]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold">{i.name}</span>
                    {i.status === "new" && <span className="size-1.5 shrink-0 rounded-full bg-[var(--color-red)]" aria-label="Nieuw" />}
                  </div>
                  <div className="truncate text-[12.5px] text-[var(--color-steel)]">{i.email}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="text-[12px] font-semibold text-[var(--color-charcoal)]">{INQUIRY_TYPE_LABEL[i.type]}</div>
                    <div className="tabular text-[11.5px] text-[var(--color-steel)]">
                      {new Date(i.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-[var(--color-mute)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent cars */}
        <section className="card flex flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="text-[15px] font-bold">Recente auto&apos;s</h2>
            <Link href="/admin/cars" className="link-quiet inline-flex items-center gap-1 text-[13px] hover:text-[var(--color-ink)]">
              Alle <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </header>
          <div className="divide-y divide-[var(--color-line)]">
            {recentCars.length === 0 && (
              <p className="px-5 py-8 text-center text-[14px] text-[var(--color-steel)]">Nog geen auto&apos;s.</p>
            )}
            {recentCars.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cars/${c.id}/edit`}
                className="group flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-[var(--color-surface)]"
              >
                <CarThumb src={c.main_image} alt={`${c.brand} ${c.model}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold">{c.brand} {c.model}</div>
                  <div className="truncate text-[12.5px] text-[var(--color-steel)]">{c.version ?? c.title}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="tabular text-[13.5px] font-bold">{formatPrice(c.price)}</div>
                  <div className="mt-1"><StatusBadge status={c.status} /></div>
                </div>
                <Pencil className="size-4 shrink-0 text-[var(--color-mute)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Manage content */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ManageCard href="/admin/cars" icon={Car} title="Voorraad beheren" desc={`${cars.length} auto's — toevoegen, bewerken, status & publicatie`} />
        <ManageCard href="/admin/inquiries" icon={Inbox} title="Aanvragen beheren" desc={`${inquiries.length} aanvragen — ${newInq} nieuw`} />
      </div>
    </>
  );
}

function ManageCard({
  href, icon: Icon, title, desc,
}: { href: string; icon: typeof Car; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="card group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-red-tint)] text-[var(--color-red)]">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold">{title}</div>
        <div className="truncate text-[13px] text-[var(--color-steel)]">{desc}</div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-[var(--color-mute)] transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
