"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  images: { src: string; alt?: string }[];
  altBase: string;
}

export function ImageGallery({ images, altBase }: Props) {
  const [index, setIndex] = useState(0);
  const main = images[index] ?? images[0];
  const trackRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = (i + delta + images.length) % images.length;
        return next;
      });
    },
    [images.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    const thumb = trackRef.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  if (!main) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-card overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-line)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={main.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={main.src}
              alt={main.alt ?? `${altBase} foto ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 720px, (min-width: 768px) 90vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Vorige foto"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-card focus-ring inline-flex items-center justify-center"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Volgende foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-card focus-ring inline-flex items-center justify-center"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-[var(--color-ink)]/80 backdrop-blur text-white rounded-[var(--radius-sm)] px-2.5 py-1 text-[12px] font-bold tabular select-none">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          ref={trackRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1"
          role="listbox"
          aria-label="Foto thumbnails"
        >
          {images.map((img, i) => (
            <button
              key={i}
              data-thumb={i}
              type="button"
              role="option"
              aria-selected={i === index}
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "shrink-0 relative w-24 sm:w-28 aspect-card rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors",
                i === index
                  ? "border-[var(--color-red)]"
                  : "border-transparent hover:border-[var(--color-line-strong)]",
              )}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
