"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface Props {
  src: string;
  title?: string;
  className?: string;
}

export function LazyMap({ src, title = "Kaart", className }: Props) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {loaded ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          aria-label="Kaart laden"
          onClick={() => setLoaded(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[var(--color-surface)] rounded-[inherit] cursor-pointer group"
        >
          <span className="grid place-items-center size-12 rounded-[var(--radius-md)] bg-[var(--color-red)] text-white group-hover:scale-105 transition-transform duration-150">
            <MapPin className="size-5" aria-hidden />
          </span>
          <span className="text-[13.5px] font-medium text-[var(--color-steel)]">
            Bekijk de locatie
          </span>
        </button>
      )}
    </div>
  );
}
