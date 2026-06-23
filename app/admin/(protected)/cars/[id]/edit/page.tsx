import Link from "next/link";
import { notFound } from "next/navigation";

import { CarForm } from "@/components/admin/CarForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCarById } from "@/lib/data/cars";
import { StatusBadge } from "@/components/public/StatusBadge";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Auto bewerken" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: Props) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div className="min-w-0">
          <Eyebrow>Bewerk auto</Eyebrow>
          <h1 className="display-2 mt-2 truncate max-w-2xl">{car.brand} {car.model}</h1>
          <div className="mt-2 flex items-center gap-2 text-[13.5px] text-[var(--color-steel)]">
            <StatusBadge status={car.status} />
            <span className="label-mono">Slug: {car.slug}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/aanbod/${car.slug}`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm gap-1">
            <ExternalLink className="size-3.5" /> Bekijk publiek
          </Link>
          <Link href="/admin/cars" className="btn btn-secondary btn-sm">Terug</Link>
        </div>
      </div>

      <CarForm car={car} />
    </>
  );
}
