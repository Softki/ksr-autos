"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Overzicht", icon: LayoutDashboard, exact: true },
  { href: "/admin/cars", label: "Auto's", icon: Car, exact: false },
  { href: "/admin/inquiries", label: "Aanvragen", icon: Inbox, exact: false },
] as const;

export function AdminNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigatie"
      className={cn(orientation === "vertical" ? "flex flex-col gap-1" : "flex items-center gap-1.5")}
    >
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] font-semibold transition-colors whitespace-nowrap",
              orientation === "horizontal" && "py-2 text-[13.5px]",
              active
                ? "bg-[var(--color-red)] text-white shadow-[0_10px_24px_-12px_rgb(209_87_40/0.6)]"
                : "text-[var(--color-charcoal)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
