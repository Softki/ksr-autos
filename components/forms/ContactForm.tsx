"use client";

import { useState } from "react";
import { InquiryForm } from "./InquiryForm";

type InquiryType = "contact" | "test_drive" | "trade_in";

const TABS: { label: string; type: InquiryType }[] = [
  { label: "Contact", type: "contact" },
  { label: "Proefrit", type: "test_drive" },
  { label: "Inruilen", type: "trade_in" },
];

export function ContactForm() {
  const [type, setType] = useState<InquiryType>("contact");

  return (
    <>
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setType(t.type)}
            aria-pressed={type === t.type}
            className="chip flex-1"
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Remount on type change so the action state resets cleanly. */}
      <InquiryForm key={type} type={type} />
    </>
  );
}
