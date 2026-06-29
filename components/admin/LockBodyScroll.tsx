"use client";

import { useEffect } from "react";

/**
 * Locks page scrolling for as long as it is mounted. Used by the full-viewport
 * admin login so the page can never scroll — vertically or horizontally — on
 * any device, regardless of the shared root layout's sticky-footer body sizing.
 */
export function LockBodyScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.body.classList.add("scroll-lock");
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.classList.remove("scroll-lock");
    };
  }, []);

  return null;
}
