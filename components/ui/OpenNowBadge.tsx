"use client";

import { useSyncExternalStore } from "react";

/** Ma–Za 09:00–17:00 Europe/Amsterdam. Sunday: op afspraak (counts as closed). */
function isOpenNL(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  if (wd === "Sun") return false;
  return hour >= 9 && hour < 17;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

export function OpenNowBadge() {
  // useSyncExternalStore keeps SSR + hydration aligned (server snapshot is null,
  // so nothing renders until the client knows the real time) and re-checks every
  // minute — no setState inside an effect.
  const open = useSyncExternalStore<boolean | null>(subscribe, isOpenNL, () => null);

  // Render nothing until mounted to avoid SSR/CSR mismatch.
  if (open === null) return null;

  return (
    <div
      className={
        open
          ? "inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-1.5 text-[11px] font-bold mb-3.5 border-[rgb(95_191_126/0.30)] bg-[rgb(95_191_126/0.12)] text-[#7fd49b]"
          : "inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-1.5 text-[11px] font-bold mb-3.5 border-white/12 bg-white/5 text-[#b3a899]"
      }
    >
      <span className="relative h-[7px] w-[7px] shrink-0">
        <span
          className="ksr-pulse absolute inset-0 rounded-full"
          style={{ background: open ? "#5fbf7e" : "#b3a899" }}
        />
      </span>
      {open ? "Nu geopend" : "Nu gesloten"}
    </div>
  );
}
