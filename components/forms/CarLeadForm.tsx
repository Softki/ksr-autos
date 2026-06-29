"use client";

import { useState } from "react";
import { InquiryForm } from "./InquiryForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Mode = "proefrit" | "inruilen";

const TABS: { label: string; mode: Mode }[] = [
  { label: "Proefrit", mode: "proefrit" },
  { label: "Inruilen", mode: "inruilen" },
];

interface Props {
  carId: string;
  carTitle: string;
}

export function CarLeadForm({ carId, carTitle }: Props) {
  const [mode, setMode] = useState<Mode>("proefrit");

  return (
    <div id="lead" className="card p-6 md:p-8 scroll-mt-24">
      <Eyebrow>Afspraak maken</Eyebrow>
      <h2 className="font-display text-[22px] font-extrabold mt-3">
        {mode === "proefrit" ? "Proefrit aanvragen" : "Uw huidige auto inruilen?"}
      </h2>
      <p className="mt-2 text-[var(--color-charcoal)]">
        {mode === "proefrit"
          ? "Vul het formulier in — we nemen zo snel mogelijk contact met u op."
          : "Vul uw gegevens in. Foto’s van uw auto kunt u na het indienen sturen via WhatsApp of e-mail."}
      </p>

      <div className="flex gap-2 mt-5">
        {TABS.map((t) => (
          <button
            key={t.mode}
            type="button"
            onClick={() => setMode(t.mode)}
            aria-pressed={mode === t.mode}
            className="chip flex-1"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {/* Remount on mode change so the action state resets cleanly. */}
        <InquiryForm
          key={mode}
          type={mode === "proefrit" ? "test_drive" : "trade_in"}
          carId={carId}
          carTitle={carTitle}
        />
      </div>
    </div>
  );
}
