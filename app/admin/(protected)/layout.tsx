import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticatedAdmin, getCurrentAdminEmail } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/Logo";

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
    <div className="min-h-screen flex flex-col bg-[var(--color-sand)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-4 px-6 h-14">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo height={30} />
            <span className="font-semibold text-[15px] pl-3 border-l border-[var(--color-line-strong)]">Admin</span>
          </Link>

          <nav aria-label="Admin navigatie" className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/admin" className="text-[var(--color-charcoal)] hover:text-[var(--color-ink)]">Overzicht</Link>
            <Link href="/admin/cars" className="text-[var(--color-charcoal)] hover:text-[var(--color-ink)]">Auto&apos;s</Link>
            <Link href="/admin/inquiries" className="text-[var(--color-charcoal)] hover:text-[var(--color-ink)]">Aanvragen</Link>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {email && <span className="hidden md:inline text-[var(--color-steel)]">{email}</span>}
            <form action={signOutAction}>
              <button className="btn btn-ghost btn-sm" type="submit">Uitloggen</button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-[1400px] w-full px-6 py-10">{children}</main>
    </div>
  );
}
