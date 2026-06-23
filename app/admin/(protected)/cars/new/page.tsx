import Link from "next/link";

import { CarForm } from "@/components/admin/CarForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = { title: "Nieuwe auto" };

export default function NewCarPage() {
  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <Eyebrow>Voorraad</Eyebrow>
          <h1 className="display-2 mt-2">Nieuwe auto toevoegen</h1>
          <p className="mt-2 text-[14px] text-[var(--color-steel)]">
            Vul de basisgegevens in. U kunt de auto later verder verrijken met extra foto&apos;s en opties.
          </p>
        </div>
        <Link href="/admin/cars" className="btn btn-secondary btn-sm">Terug naar overzicht</Link>
      </div>

      <CarForm />
    </>
  );
}
