/**
 * The /admin tree has two layouts:
 *   - /admin/login                 → just inherits the root layout (no auth)
 *   - /admin (protected pages)     → wrapped by app/admin/(protected)/layout.tsx
 *
 * This file is intentionally pass-through so the login page can render
 * without triggering the auth check.
 */

export const metadata = { robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
