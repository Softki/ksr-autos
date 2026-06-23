import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/lib/data/inquiries";
import { z } from "zod";

const InquirySchema = z.object({
  type: z.enum(["contact", "test_drive", "trade_in", "search_request"]),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  message: z.string().max(4000).optional(),
  car_id: z.string().max(64).optional(),
  metadata: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const inquiry = await createInquiry(parsed.data);
    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch {
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
