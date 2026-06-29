"use client";

import { useRef } from "react";
import { updateCarStatusAction } from "@/lib/actions/cars";
import type { CarStatus } from "@/lib/types";

const OPTIONS: { value: CarStatus; label: string }[] = [
  { value: "draft", label: "Concept" },
  { value: "available", label: "Beschikbaar" },
  { value: "reserved", label: "Gereserveerd" },
  { value: "sold", label: "Verkocht" },
  { value: "hidden", label: "Verborgen" },
];

/** Compact status dropdown that saves immediately on change (no extra button). */
export function QuickStatusSelect({ id, status }: { id: string; status: CarStatus }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateCarStatusAction}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`status-${id}`}>Status wijzigen</label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="select min-h-[38px] py-1.5 text-[13px] font-semibold"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </form>
  );
}
