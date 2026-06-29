import { NextRequest, NextResponse } from "next/server";
import { adminUpsertCar } from "@/lib/data/cars";
import { isAuthenticatedAdmin } from "@/lib/auth/session";

/**
 * Legacy compatibility route. The admin UI uses the `upsertCarAction` Server
 * Action directly; this endpoint is guarded so it cannot be used while
 * unauthenticated (the proxy only matches `/admin/*`, not `/api/*`).
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const saved = await adminUpsertCar(body);
  return NextResponse.json({ ok: true, car: saved });
}
