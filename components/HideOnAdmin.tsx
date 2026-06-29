"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides its children on the /admin surface. The admin area has its own chrome
 * (and a full-viewport login), so the public Footer must not render there.
 * Keeps the wrapped tree as a server component — only the gate is client-side.
 */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
