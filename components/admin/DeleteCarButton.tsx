"use client";

import { Trash2 } from "lucide-react";
import { deleteCarAction } from "@/lib/actions/cars";

interface Props {
  id: string;
  title: string;
}

export function DeleteCarButton({ id, title }: Props) {
  return (
    <form
      action={deleteCarAction}
      onSubmit={(e) => {
        if (!confirm(`Weet u zeker dat u "${title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-[var(--color-error)] hover:underline inline-flex items-center gap-1 text-[13px]">
        <Trash2 className="size-3.5" aria-hidden /> Verwijder
      </button>
    </form>
  );
}
