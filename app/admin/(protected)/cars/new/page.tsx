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
          <h1 className="admin-title mt-2">Nieuwe auto toevoegen</h1>
          <p className="mt-2 !text-[14px] text-[var(--color-steel)]">
            Vul de gegevens in en sla op — daarna voeg je direct foto&apos;s toe.
          </p>
        </div>
        <Link href="/admin/cars" className="btn btn-secondary btn-sm">Terug naar overzicht</Link>
      </div>

      <CarForm />
    </>
  );
}
