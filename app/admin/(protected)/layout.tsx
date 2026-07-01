import { redirect } from "next/navigation";

import { isAuthenticatedAdmin, getCurrentAdmin } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Beheer",
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
  const admin = await getCurrentAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
