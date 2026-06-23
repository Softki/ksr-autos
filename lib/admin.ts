// Backwards-compatibility shim: existing imports of "@/lib/admin" continue
// to work but delegate to the new auth helpers in "@/lib/auth/*".
//
// New code should import from `@/lib/auth/session` and `@/lib/auth/actions`.

export { isAuthenticatedAdmin as isAdmin } from "@/lib/auth/session";
export { signOutAction as logoutAdmin } from "@/lib/auth/actions";

import { signInAction } from "@/lib/auth/actions";

/**
 * @deprecated Use the `signInAction` Server Action with a FormData payload.
 * This helper is retained so the legacy `/api/admin/login` route continues
 * to function until callers migrate.
 */
export async function loginAdmin(password: string): Promise<boolean> {
  const fd = new FormData();
  fd.set("password", password);
  const r = await signInAction(fd);
  return r.ok;
}
