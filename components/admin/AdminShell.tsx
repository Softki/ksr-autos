"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  Car,
  Inbox,
  SlidersHorizontal,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { signOutAction } from "@/lib/auth/actions";
import { BUSINESS } from "@/lib/constants";
import type { AdminIdentity } from "@/lib/auth/session";

const NAV = [
  { href: "/admin", label: "Overzicht", icon: LayoutDashboard, exact: true },
  { href: "/admin/cars", label: "Voorraad", icon: Car, exact: false },
  { href: "/admin/inquiries", label: "Aanvragen", icon: Inbox, exact: false },
  { href: "/admin/settings", label: "Instellingen", icon: SlidersHorizontal, exact: false },
] as const;

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KSR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminShell({ admin, children }: { admin: AdminIdentity; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Close the drawer on any route change (covers every current/future nav element).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentionally dismiss the transient drawer on navigation
    setOpen(false);
  }, [pathname]);

  // Scroll-lock + move focus into the drawer when it opens.
  useEffect(() => {
    document.body.classList.toggle("scroll-lock", open);
    if (open) {
      const first = drawerRef.current?.querySelector<HTMLElement>("button,a[href]");
      first?.focus();
    }
    return () => document.body.classList.remove("scroll-lock");
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onDrawerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
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

  const displayName = admin.name || "Beheerder";

  return (
    <div className="min-h-[100dvh] bg-[var(--color-sand)] text-[var(--color-ink)] lg:grid lg:grid-cols-[264px_1fr]">
      {/* ── Desktop sidebar ── */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-[var(--color-line)] bg-[var(--color-canvas)] px-4 py-5 lg:flex">
        <Link href="/admin" className="mb-7 flex items-center gap-3 px-2 focus-ring rounded-sm">
          <Logo height={28} />
          <span className="lbl border-l border-[var(--color-line-strong)] pl-3 text-[10px] tracking-[0.2em] text-[var(--color-steel)]">
            Beheer
          </span>
        </Link>
        <SidebarBody admin={admin} displayName={displayName} pathname={pathname} />
      </aside>

      {/* ── Mobile topbar ── */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-canvas)]/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5 focus-ring rounded-sm">
          <Logo height={26} />
          <span className="lbl text-[9px] tracking-[0.2em] text-[var(--color-steel)]">Beheer</span>
        </Link>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu openen"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="admin-icon-btn"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[var(--color-ink)]/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              aria-hidden
            />
            <motion.aside
              ref={drawerRef}
              id="admin-drawer"
              onKeyDown={onDrawerKeyDown}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col bg-[var(--color-canvas)] px-4 py-5 shadow-elevated lg:hidden"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 40 }}
              role="dialog"
              aria-modal="true"
              aria-label="Beheer navigatie"
            >
              <div className="mb-7 flex items-center justify-between">
                <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 focus-ring rounded-sm">
                  <Logo height={28} />
                  <span className="lbl text-[9px] tracking-[0.2em] text-[var(--color-steel)]">Beheer</span>
                </Link>
                <button type="button" onClick={close} aria-label="Menu sluiten" className="admin-icon-btn">
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <SidebarBody admin={admin} displayName={displayName} pathname={pathname} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main (fades in per navigation; inert behind the open drawer) ── */}
      <div
        key={pathname}
        inert={open || undefined}
        className="admin-fade-in mx-auto w-full max-w-[1180px] px-5 py-7 md:px-8 md:py-10"
      >
        {children}
      </div>
    </div>
  );
}

function SidebarBody({
  admin,
  displayName,
  pathname,
  onNavigate,
}: {
  admin: AdminIdentity;
  displayName: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Beheer navigatie">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] font-semibold transition-colors duration-150",
                active
                  ? "bg-[var(--color-ink)] text-white shadow-[0_12px_26px_-16px_rgb(20_18_16/0.8)]"
                  : "text-[var(--color-steel)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110",
                  active ? "text-white" : "text-[var(--color-steel)] group-hover:text-[var(--color-red)]",
                )}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-2.5 border-t border-[var(--color-line)] pt-4">
        <Link
          href="/admin/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-paper)] px-3 py-2.5 transition-colors hover:bg-[var(--color-surface)]"
          title="Ga naar instellingen"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--color-red)] text-[12.5px] font-bold text-white">
            {initials(displayName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-bold leading-tight text-[var(--color-ink)]">
              {displayName}
            </span>
            <span className="block truncate text-[11.5px] text-[var(--color-steel)]">{BUSINESS.name}</span>
          </span>
        </Link>

        {admin.email && (
          <div className="truncate px-3 text-[11.5px] text-[var(--color-steel)]" title={admin.email}>
            {admin.email}
          </div>
        )}

        <div className="grid gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[13px] font-medium text-[var(--color-steel)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
          >
            <ExternalLink className="size-4" aria-hidden />
            Bekijk website
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[13px] font-medium text-[var(--color-steel)] transition-colors hover:bg-[var(--color-error-tint)] hover:text-[var(--color-error)]"
            >
              <LogOut className="size-4" aria-hidden />
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
