import { NextResponse, type NextRequest } from "next/server";
import { signInAction } from "@/lib/auth/actions";

/**
 * Legacy compatibility route. New code should call the Server Action
 * directly. Kept so existing client-side fetches keep working.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const fd = new FormData();
  if (body?.email) fd.set("email", String(body.email));
  fd.set("password", String(body?.password ?? ""));

  const result = await signInAction(fd);
  if (result.ok) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false, error: result.error ?? "invalid" }, { status: 401 });
}
