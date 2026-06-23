import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * RDW open-data kenteken lookup. Returns the brand, model (handelsbenaming),
 * year and colour for a Dutch license plate so the sell form can pre-fill.
 * Dataset: https://opendata.rdw.nl/resource/m9d7-ebf2.json
 */
function titleCase(s: unknown): string {
  if (typeof s !== "string" || !s) return "";
  return s
    .toLowerCase()
    .replace(/\b[\p{L}]/gu, (c) => c.toUpperCase())
    .trim();
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("kenteken") ?? "";
  const kenteken = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (kenteken.length < 4 || kenteken.length > 8) {
    return NextResponse.json({ found: false, error: "invalid" }, { status: 400 });
  }

  try {
    const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${encodeURIComponent(kenteken)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Cache RDW lookups for a day — vehicle base data rarely changes.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ found: false }, { status: 502 });

    const rows = (await res.json()) as Array<Record<string, unknown>>;
    const r = Array.isArray(rows) ? rows[0] : null;
    if (!r) return NextResponse.json({ found: false });

    const dvt = typeof r.datum_eerste_toelating === "string" ? r.datum_eerste_toelating : "";
    const year = dvt.length >= 4 ? dvt.slice(0, 4) : "";

    return NextResponse.json({
      found: true,
      brand: titleCase(r.merk),
      model: titleCase(r.handelsbenaming),
      year,
      color: titleCase(r.eerste_kleur),
    });
  } catch {
    return NextResponse.json({ found: false }, { status: 500 });
  }
}
