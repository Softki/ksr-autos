import { NextRequest, NextResponse } from "next/server";
import { adminUpsertCar } from "@/lib/data/cars";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const saved = await adminUpsertCar(body);
  return NextResponse.json({ ok: true, car: saved });
}
