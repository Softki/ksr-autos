import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, CheckCircle2 } from "lucide-react";

import { CarForm } from "@/components/admin/CarForm";
import { CarImageManager } from "@/components/admin/CarImageManager";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCarById } from "@/lib/data/cars";
import { StatusBadge } from "@/components/public/StatusBadge";

export const metadata = { title: "Auto bewerken" };

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}

export default async function EditCarPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [sp, car] = await Promise.all([searchParams, getCarById(id)]);
  if (!car) notFound();

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Bewerk auto</Eyebrow>
          <h1 className="admin-title mt-2 max-w-2xl truncate">{car.brand} {car.model}</h1>
          <div className="mt-2 flex items-center gap-2 text-[13.5px] text-[var(--color-steel)]">
            <StatusBadge status={car.status} />
            <span className="label-mono">{car.slug}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/aanbod/${car.slug}`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm gap-1">
            <ExternalLink className="size-3.5" aria-hidden /> Bekijk publiek
          </Link>
          <Link href="/admin/cars" className="btn btn-secondary btn-sm">Terug</Link>
        </div>
      </div>

      {(sp.created || sp.saved) && (
        <div className="mb-6 flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success-tint)] px-4 py-3 text-[14px] font-medium text-[var(--color-success)]">
          <CheckCircle2 className="size-[18px] shrink-0" aria-hidden />
          {sp.created ? "Auto aangemaakt — voeg hieronder foto’s toe." : "Wijzigingen opgeslagen."}
        </div>
      )}

      {/* Photos */}
      <section className="mb-8">
        <h2 className="label-mono mb-3">Foto&rsquo;s</h2>
        <div className="card p-5 md:p-6">
          <CarImageManager carId={car.id} initialImages={car.images ?? []} />
        </div>
      </section>

      <CarForm car={car} />
    </>
  );
}
