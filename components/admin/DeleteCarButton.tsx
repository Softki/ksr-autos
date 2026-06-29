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
      <button type="submit" className="admin-icon-btn admin-icon-btn-danger" title="Verwijderen" aria-label="Verwijderen">
        <Trash2 className="size-[17px]" aria-hidden />
      </button>
    </form>
  );
}
