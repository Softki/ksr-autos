"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function InquiryGallery({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;
  const reduce = useReducedMotion();

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(
    () => setIdx((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  // Keyboard: Escape / arrows / Tab-trap while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "Tab") {
        const nodes = overlayRef.current?.querySelectorAll<HTMLElement>("button");
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("scroll-lock");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("scroll-lock");
    };
  }, [open, close, prev, next]);

  // Move focus into the lightbox on open; restore it to the thumbnail on close.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  if (!photos.length) return null;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {photos.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setIdx(i);
              }}
              aria-label={`Foto ${i + 1} vergroten`}
              className="group block aspect-card w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] focus-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.2 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Foto weergave"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Sluiten"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-5" aria-hidden />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Vorige foto"
                  className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Volgende foto"
                  className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}

            <motion.img
              key={idx}
              src={photos[idx as number]}
              alt={`Foto ${(idx as number) + 1}`}
              className="max-h-[85vh] max-w-[92vw] rounded-[var(--radius-md)] object-contain shadow-2xl"
              initial={reduce ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0.12 : 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />

            {photos.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium tabular text-white">
                {(idx as number) + 1} / {photos.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
