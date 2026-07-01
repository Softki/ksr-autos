"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Check } from "lucide-react";
import { updateInquiryStatusAction } from "@/lib/actions/inquiries-admin";
import type { InquiryStatus } from "@/lib/types";

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "Nieuw" },
  { value: "contacted", label: "Gecontacteerd" },
  { value: "closed", label: "Afgesloten" },
  { value: "spam", label: "Spam" },
];

/** Status dropdown that saves immediately on change. */
export function InquiryStatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [touched, setTouched] = useState(false);

  return (
    <form ref={formRef} action={updateInquiryStatusAction}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`inq-status-${id}`}>Status wijzigen</label>
      <select
        id={`inq-status-${id}`}
        name="status"
        defaultValue={status}
        onChange={() => {
          setTouched(true);
          formRef.current?.requestSubmit();
        }}
        className="select w-full font-semibold"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <SaveHint touched={touched} />
    </form>
  );
}

function SaveHint({ touched }: { touched: boolean }) {
  const { pending } = useFormStatus();
  return (
    <p
      aria-live="polite"
      className="mt-1.5 flex h-4 items-center gap-1.5 !text-[12px] text-[var(--color-steel)]"
    >
      {!touched ? null : pending ? (
        <>
          <Loader2 className="size-3 animate-spin" aria-hidden /> Opslaan…
        </>
      ) : (
        <>
          <Check className="size-3 text-[var(--color-success)]" aria-hidden /> Opgeslagen
        </>
      )}
    </p>
  );
}
