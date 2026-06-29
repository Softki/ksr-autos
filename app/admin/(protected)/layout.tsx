import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

import { isAuthenticatedAdmin, getCurrentAdminEmail } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticatedAdmin())) {
    redirect("/admin/login");
  }
  const email = await getCurrentAdminEmail();

  return (
    <div className="min-h-[100dvh] bg-[var(--color-sand)] text-[var(--color-ink)] lg:grid lg:grid-cols-[260px_1fr]">
      {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-[var(--color-line)] bg-[var(--color-canvas)] p-5 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3 px-2">
          <Logo height={30} />
          <span className="border-l border-[var(--color-line-strong)] pl-3 text-[14px] font-semibold">Admin</span>
        </Link>

        <AdminNav orientation="vertical" />

        <div className="mt-auto space-y-2 border-t border-[var(--color-line)] pt-4">
          {email && (
            <div className="truncate px-3 text-[12.5px] text-[var(--color-steel)]" title={email}>
              {email}
            </div>
          )}
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-[13.5px] font-medium text-[var(--color-steel)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
          >
            <ExternalLink className="size-[18px]" aria-hidden />
            Bekijk website
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-secondary btn-sm w-full gap-2">
              <LogOut className="size-4" aria-hidden />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      {/* ── Topbar (mobile) ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo height={26} />
            <span className="text-[13px] font-semibold">Admin</span>
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-ghost btn-sm gap-1.5">
              <LogOut className="size-4" aria-hidden />
              Uitloggen
            </button>
          </form>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <AdminNav orientation="horizontal" />
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[1240px] px-5 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
