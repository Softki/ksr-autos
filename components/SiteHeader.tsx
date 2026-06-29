"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Phone, ArrowRight, CalendarPlus } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { drawerVariants, overlayVariants } from "@/lib/motion";

const NAV = [
  { href: "/aanbod", label: "Aanbod" },
  { href: "/auto-verkopen", label: "Auto verkopen" },
  { href: "/auto-zoeken", label: "Zoekopdracht" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
function getScrollSnapshot() {
  return window.scrollY > 8;
}
function getServerScrollSnapshot() {
  return false;
}

export function SiteHeader() {
  const scrolled = useSyncExternalStore(subscribeScroll, getScrollSnapshot, getServerScrollSnapshot);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.toggle("scroll-lock", open);
    return () => document.body.classList.remove("scroll-lock");
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-shadow duration-200",
          "bg-[var(--color-canvas)]/88 backdrop-blur-[14px] supports-[backdrop-filter]:bg-[var(--color-canvas)]/82 border-[var(--color-line)]",
          scrolled ? "shadow-[0_10px_30px_-24px_rgb(20_18_16/0.5)]" : "",
        )}
      >
        <div className="container flex items-center justify-between gap-3 md:gap-6 h-[var(--header-h)] md:h-[var(--header-h-md)]">
          <Link
            href="/"
            aria-label="KSR Auto's home"
            className="flex items-center gap-3 focus-ring -ml-1 pl-1 rounded-sm shrink-0"
          >
            <Logo priority height={34} />
            <span className="hidden xl:flex flex-col leading-none pl-3 ml-1 border-l border-[var(--color-line-strong)]">
              <span className="lbl text-[9px] tracking-[0.22em] text-[var(--color-mute)]">
                Occasions · Ridderkerk
              </span>
            </span>
          </Link>

          <nav aria-label="Hoofdnavigatie" className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-7">
            {NAV.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[13px] lg:text-[14.5px] font-semibold tracking-tight transition-colors whitespace-nowrap",
                    active ? "text-[var(--color-red)]" : "text-[var(--color-charcoal)] hover:text-[var(--color-ink)]",
                  )}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[var(--color-red)] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Visibility is set on these WRAPPERS, not on the buttons: the
                unlayered `.btn { display: inline-flex }` rule in globals.css
                outranks Tailwind's `hidden`/`md:*` (utilities layer), so a
                `md:hidden` directly on a `.btn` is ignored. */}
            {/* Desktop: appointment CTA → contactpagina (icon-only at md, full label lg+) */}
            <div className="hidden md:block">
              <Link
                href="/contact"
                aria-label="Afspraak maken"
                className="btn btn-primary btn-sm gap-2 whitespace-nowrap focus-ring"
              >
                <CalendarPlus className="size-4" aria-hidden />
                <span className="hidden lg:inline">Afspraak maken</span>
              </Link>
            </div>
            {/* Mobile: designed primary appointment pill, in the action area next
                to the hamburger. (Not a `.btn`, so md:hidden works directly.) */}
            <Link
              href="/contact"
              className="md:hidden inline-flex items-center gap-1.5 rounded-full bg-[var(--color-red)] py-2 pl-2.5 pr-3.5 text-[12.5px] font-bold leading-none text-white shadow-[0_8px_18px_-8px_rgba(209,87,40,0.85)] transition-transform active:scale-95 focus-ring"
            >
              <CalendarPlus className="size-[15px]" aria-hidden />
              Afspraak maken
            </Link>
            {/* Mobile: hamburger */}
            <div className="md:hidden">
              <button
                type="button"
                aria-expanded={open}
                aria-controls="mobile-drawer"
                aria-label={open ? "Sluit menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
                className="btn btn-ghost btn-icon focus-ring"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-[var(--color-ink)]/40 backdrop-blur-sm md:hidden"
              aria-hidden
            />
            <motion.aside
              id="mobile-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="fixed inset-y-0 left-0 z-50 w-[min(86vw,360px)] bg-[var(--color-canvas)] flex flex-col md:hidden shadow-elevated"
              role="dialog"
              aria-modal="true"
              aria-label="Navigatie"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-line)]">
                <Logo height={32} />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon focus-ring"
                  aria-label="Sluit menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Mobiele navigatie">
                {NAV.map((l) => {
                  const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-[var(--radius-md)] px-3 py-3 text-[16px] font-semibold",
                        active
                          ? "bg-[var(--color-red-tint)] text-[var(--color-red)]"
                          : "text-[var(--color-charcoal)] hover:bg-[var(--color-surface)]",
                      )}
                    >
                      {l.label}
                      <ArrowRight className="size-4 text-[var(--color-mute)]" aria-hidden />
                    </Link>
                  );
                })}
              </nav>

              <div className="p-5 border-t border-[var(--color-line)] grid gap-2">
                <a href={BUSINESS.telHref} className="btn btn-dark w-full">
                  <Phone className="size-4" /> Bel {BUSINESS.phone}
                </a>
                <a href={BUSINESS.whatsapp} target="_blank" rel="noopener" className="btn btn-whatsapp w-full">
                  WhatsApp
                </a>
                <p className="label-mono mt-2 text-center">{BUSINESS.fullAddress}</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
