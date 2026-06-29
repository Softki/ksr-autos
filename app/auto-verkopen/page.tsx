import { Metadata } from "next";

import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ClosingCTA } from "@/components/public/ClosingCTA";
import { VerkoopForm } from "@/components/forms/VerkoopForm";

export const metadata: Metadata = {
  title: "Auto verkopen of inruilen",
  description:
    "Verkoop of ruil uw auto in bij KSR Auto's in Ridderkerk. Vul uw kenteken in voor een snelle check en ontvang vrijblijvend een eerlijke prijsindicatie.",
  alternates: { canonical: "/auto-verkopen" },
};

export default function AutoVerkopenPage() {
  return (
    <>
      <div className="bg-[var(--color-canvas)]">
        <div className="container py-9 md:py-14">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Auto verkopen" }]} />

          <header className="mt-5 mb-8 md:mb-10 max-w-3xl">
            <div className="eyebrow">Auto inkoop</div>
            <h1 className="display-2 mt-3">Verkoop of ruil uw auto in</h1>
            <p className="lead mt-3.5">
              Vul onderstaande gegevens in en ontvang vrijblijvend een eerlijke prijsindicatie. Wij kopen
              vrijwel alle merken in — ook als uw auto mankementen of schade heeft.
            </p>
          </header>

          <VerkoopForm />
        </div>
      </div>
      <ClosingCTA
        title="Uw auto direct verkopen?"
        subtitle="Bel of app ons voor een snelle, eerlijke prijsindicatie — ook bij schade of mankementen."
      />
    </>
  );
}
