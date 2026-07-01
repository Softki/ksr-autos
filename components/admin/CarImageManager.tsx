"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, Star, Trash2, Loader2, ArrowLeft, ArrowRight, ImageOff, Info } from "lucide-react";
import type { CarImage } from "@/lib/types";
import { cn } from "@/lib/cn";

type Item = CarImage & { _uploading?: boolean; _preview?: string };

const MAX_BYTES = 10 * 1024 * 1024; // keep in sync with the API route
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"];

const CTRL =
  "grid size-7 place-items-center rounded-[6px] bg-white/92 text-[var(--color-ink)] transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-40";

function sortDisplay<T extends CarImage>(list: T[]): T[] {
  return [...list].sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.sort_order - b.sort_order);
}

/**
 * Renumber field state so sort_order/is_main always match the array order.
 * This keeps sortDisplay() stable across later setItems calls (e.g. when an
 * in-flight upload resolves) so a manual reorder / cover choice never snaps
 * back. Uploading placeholders keep their temporary values and are ignored.
 */
function renumber(list: Item[]): Item[] {
  let pos = 0;
  return list.map((it) => {
    if (it._uploading) return it;
    const out = { ...it, sort_order: pos, is_main: pos === 0 };
    pos++;
    return out;
  });
}

export function CarImageManager({ carId, initialImages }: { carId: string; initialImages: CarImage[] }) {
  const [items, setItems] = useState<Item[]>(() => sortDisplay(initialImages));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Mirror state in a ref so reorder() reads fresh data without an impure
  // setItems updater, and so we can revoke any pending blob: previews on unmount.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => {
      itemsRef.current.forEach((it) => it._preview && URL.revokeObjectURL(it._preview));
    },
    [],
  );

  // Serialize order persistence: abort an in-flight PATCH before sending a newer
  // one so out-of-order responses can't leave the server on a stale order.
  const orderAbortRef = useRef<AbortController | null>(null);
  // Guard against firing two DELETEs for the same image.
  const deletingRef = useRef<Set<string>>(new Set());

  const uploading = items.some((i) => i._uploading);
  const realCount = items.filter((i) => !i._uploading).length;

  function persistOrder(list: Item[]) {
    const orderedIds = list.filter((i) => !i._uploading).map((i) => i.id);
    if (orderedIds.length === 0) return;
    orderAbortRef.current?.abort();
    const ctrl = new AbortController();
    orderAbortRef.current = ctrl;
    fetch("/api/admin/car-images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId, orderedIds }),
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) setError("Volgorde opslaan mislukt.");
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setError("Volgorde opslaan mislukt.");
      });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setNotice(null);

    const all = Array.from(fileList);
    const files = all.filter((f) => ACCEPTED.includes(f.type.toLowerCase()) && f.size > 0 && f.size <= MAX_BYTES);
    const skipped = all.length - files.length;
    if (!files.length) {
      setError("Geen geldige foto’s. Gebruik JPG, PNG of WEBP — max. 10MB per foto.");
      return;
    }

    const placeholders: Item[] = files.map((f) => ({
      id: "tmp-" + Math.random().toString(36).slice(2),
      car_id: carId,
      storage_path: "",
      image_url: "",
      sort_order: 9999,
      is_main: false,
      _uploading: true,
      _preview: URL.createObjectURL(f),
    }));
    setItems((prev) => [...prev, ...placeholders]);

    const fd = new FormData();
    fd.set("carId", carId);
    files.forEach((f) => fd.append("files", f));

    try {
      const res = await fetch("/api/admin/car-images", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "upload");
      const returned = (data.images as CarImage[]) ?? [];
      setItems((prev) => {
        const cleaned = prev.filter((p) => !placeholders.some((ph) => ph.id === p.id));
        return renumber(sortDisplay([...cleaned, ...returned]));
      });
      placeholders.forEach((p) => p._preview && URL.revokeObjectURL(p._preview));
      const failed = files.length - returned.length;
      const lost = failed + skipped;
      if (lost > 0) {
        setNotice(
          `${lost} foto${lost === 1 ? "" : "’s"} kon${lost === 1 ? "" : "den"} niet worden geüpload — controleer formaat (JPG/PNG/WEBP) en grootte (max. 10MB).`,
        );
      }
    } catch {
      setItems((prev) => prev.filter((p) => !placeholders.some((ph) => ph.id === p.id)));
      placeholders.forEach((p) => p._preview && URL.revokeObjectURL(p._preview));
      setError("Uploaden mislukt. Controleer het formaat (JPG/PNG/WEBP, max 10MB) en probeer opnieuw.");
    }
  }

  async function remove(id: string) {
    if (deletingRef.current.has(id)) return;
    deletingRef.current.add(id);
    const removed = itemsRef.current.find((i) => i.id === id);
    setItems((prev) => renumber(prev.filter((i) => i.id !== id)));

    const res = await fetch("/api/admin/car-images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: id }),
    }).catch(() => null);
    deletingRef.current.delete(id);

    if (!res || !res.ok) {
      // Functional rollback re-inserts only the removed item, so any upload or
      // reorder that landed during the request is preserved.
      if (removed) setItems((prev) => renumber(sortDisplay([...prev, removed])));
      setError("Verwijderen mislukt.");
    }
  }

  function reorder(from: number, to: number) {
    const cur = itemsRef.current;
    if (to < 0 || to >= cur.length || cur[from]?._uploading || cur[to]?._uploading) return;
    const next = cur.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = renumber(next);
    setItems(renumbered);
    persistOrder(renumbered);
  }

  return (
    <div>
      {/* Screen-reader status: upload progress is otherwise only a spinner. */}
      <p className="sr-only" aria-live="polite">
        {uploading ? "Foto’s worden geüpload…" : `${realCount} foto’s in de galerij.`}
      </p>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)]/25 bg-[var(--color-error-tint)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-error)]"
        >
          <ImageOff className="size-4 shrink-0" aria-hidden /> {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-steel)]"
        >
          <Info className="size-4 shrink-0" aria-hidden /> {notice}
        </div>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-[1.5px] border-dashed px-6 py-8 text-center transition-colors focus-within:border-[var(--color-red)] focus-within:ring-2 focus-within:ring-[var(--color-red)]/40",
          dragOver
            ? "border-[var(--color-red)] bg-[var(--color-red-tint)]"
            : "border-[var(--color-line-strong)] bg-[var(--color-surface)] hover:border-[var(--color-red)]",
        )}
      >
        {/* sr-only (not display:none) keeps the input in the tab order so the
            dropzone is operable by keyboard — Tab to focus, Enter/Space opens. */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-[var(--color-red)] text-white">
          <UploadCloud className="size-5" aria-hidden />
        </span>
        <span className="text-[14px] font-bold">Sleep foto&rsquo;s hierheen of klik om te uploaden</span>
        <span className="text-[12.5px] text-[var(--color-steel)]">JPG, PNG of WEBP — max. 10MB per foto, tot 15 stuks</span>
      </label>

      {items.length > 0 && (
        <>
          <div className="mb-2 mt-3.5 flex items-center justify-between text-[12.5px] text-[var(--color-steel)]">
            <span className="tabular font-semibold">{realCount} foto&rsquo;s</span>
            <span>De eerste foto is de hoofdfoto (cover) op de site.</span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((img, i) => {
              const pos = i + 1;
              return (
                <li
                  key={img.id}
                  className="group relative aspect-card overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img._preview ?? img.image_url}
                    alt={img._uploading ? "Foto wordt geüpload" : `Foto ${pos}${i === 0 ? " (hoofdfoto)" : ""}`}
                    className="h-full w-full object-cover"
                  />

                  {img._uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-black/45 text-white">
                      <Loader2 className="size-6 animate-spin" aria-hidden />
                    </div>
                  )}

                  {i === 0 && !img._uploading && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-[var(--radius-xs)] bg-[var(--color-red)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Star className="size-3 fill-white" aria-hidden /> Hoofdfoto
                    </span>
                  )}

                  {!img._uploading && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/65 to-transparent p-1.5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => reorder(i, i - 1)}
                          disabled={i === 0}
                          aria-label={`Foto ${pos} naar voren verplaatsen`}
                          className={CTRL}
                        >
                          <ArrowLeft className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorder(i, i + 1)}
                          disabled={i >= realCount - 1}
                          aria-label={`Foto ${pos} naar achteren verplaatsen`}
                          className={CTRL}
                        >
                          <ArrowRight className="size-4" aria-hidden />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => reorder(i, 0)}
                            aria-label={`Maak foto ${pos} de hoofdfoto`}
                            title="Maak hoofdfoto"
                            className={CTRL}
                          >
                            <Star className="size-4" aria-hidden />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(img.id)}
                          aria-label={`Foto ${pos} verwijderen`}
                          title="Verwijderen"
                          className={cn(CTRL, "hover:bg-[var(--color-error)] hover:text-white")}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
