import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { listPublicCars } from "@/lib/data/cars";
import { getPublishedFaq } from "@/lib/data/faq";
import { BUSINESS, OPENING_HOURS, OPENING_NOTE, STANDARD_APPOINTMENT_TEXT } from "@/lib/constants";
import { rateLimit, hashIdentifier } from "@/lib/rate-limit";
import { formatKm, formatPrice } from "@/lib/utils/format";

const MAX_INPUT = 600;
const MAX_OUTPUT = 600;
const MAX_HISTORY = 6;

const messageSchema = z.object({
  message: z.string().min(1).max(MAX_INPUT),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(MAX_OUTPUT),
      }),
    )
    .optional(),
});

const HUMAN_FALLBACK = `Liever even iemand persoonlijk spreken? Bel ${BUSINESS.phone} of stuur ons direct een bericht via WhatsApp.`;

export async function POST(req: NextRequest) {
  let payload: z.infer<typeof messageSchema>;
  try {
    const json = await req.json();
    payload = messageSchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "anon";
  const key = await hashIdentifier(`chat:${ip}`);
  const rl = rateLimit(`chat:${key}`, { limit: 20, windowSec: 60 });
  if (!rl.ok) {
    return NextResponse.json(
      { reply: `Bedankt voor uw vragen. Probeer het over ${rl.retryAfter} sec opnieuw of bel ons direct via ${BUSINESS.phone}.` },
      { status: 200 },
    );
  }

  const userMsg = payload.message.trim();
  const [cars, faq] = await Promise.all([
    listPublicCars({ filters: { includeReserved: true }, limit: 30 }),
    getPublishedFaq(),
  ]);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (apiKey) {
    try {
      const reply = await runDeepSeek(apiKey, userMsg, payload.history?.slice(-MAX_HISTORY) ?? [], cars.cars, faq);
      if (reply) return NextResponse.json({ reply });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[deepseek]", err);
    }
  }

  return NextResponse.json({ reply: ruleBased(userMsg, cars.cars, faq) });
}

/* -------------------------------------------------------------------------- */
/*  DeepSeek (OpenAI-compatible API)                                          */
/* -------------------------------------------------------------------------- */

async function runDeepSeek(
  apiKey: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  cars: import("@/lib/types").Car[],
  faq: import("@/lib/types").FaqEntry[],
): Promise<string | null> {
  const carContext = cars
    .slice(0, 25)
    .map((c, i) => `${i + 1}. ${c.brand} ${c.model}${c.version ? ` ${c.version}` : ""} — ${c.year ?? ""}, ${formatKm(c.mileage)}, ${c.fuel_type ?? ""}, ${c.transmission ?? ""}. Prijs ${formatPrice(c.price)}. Status: ${c.status}. URL: /aanbod/${c.slug}`)
    .join("\n");

  const faqContext = faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  const systemPrompt = [
    `Je bent de assistent van KSR Auto's (occasiondealer in Ridderkerk).`,
    `Antwoord in correct Nederlands, kort en feitelijk (max 3 zinnen).`,
    `Beantwoord ALLEEN op basis van onderstaande bedrijfsinformatie + huidige voorraad + FAQ.`,
    `Verzin geen gegevens. Geen beloftes over garantie, beschikbaarheid, prijs of financiering die niet bevestigd zijn.`,
    `Bij twijfel of buiten scope: verwijs naar telefoon ${BUSINESS.phone} of WhatsApp.`,
    `Bedrijfsinformatie: KSR Auto's, ${BUSINESS.fullAddress}. Tel: ${BUSINESS.phone}. WhatsApp: ${BUSINESS.whatsapp}. E-mail: ${BUSINESS.email}. KVK: ${BUSINESS.kvk}.`,
    `Openingstijden: ${OPENING_HOURS.map((h) => `${h.day} ${h.hours}`).join("; ")}. ${OPENING_NOTE}`,
    `Afspraakadvies: ${STANDARD_APPOINTMENT_TEXT}`,
    `\nHuidige voorraad (max 25):\n${carContext}`,
    `\nFAQ:\n${faqContext}`,
  ].join("\n");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: MAX_OUTPUT,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  return content.trim().slice(0, MAX_OUTPUT);
}

/* -------------------------------------------------------------------------- */
/*  Rule-based fallback                                                       */
/* -------------------------------------------------------------------------- */

function ruleBased(
  message: string,
  cars: import("@/lib/types").Car[],
  faq: import("@/lib/types").FaqEntry[],
): string {
  const m = message.toLowerCase();

  for (const entry of faq) {
    if (entry.topic && m.includes(entry.topic)) return entry.answer;
  }

  if (/adres|locatie|waar\s+zijn|gevestigd/.test(m)) {
    return `Wij zijn gevestigd aan ${BUSINESS.fullAddress}. ${HUMAN_FALLBACK}`;
  }
  if (/telefoon|bellen|gsm/.test(m)) {
    return `U kunt ons bellen op ${BUSINESS.phone}.`;
  }
  if (/whatsapp|app\b/.test(m)) {
    return `Direct appen kan via ${BUSINESS.whatsapp}.`;
  }
  if (/openings|geopend|open|zaterdag|zondag/.test(m)) {
    return `Maandag t/m zaterdag 09:00–17:00 uur. Zondag op afspraak. ${OPENING_NOTE}`;
  }
  if (/garantie|autotrust/.test(m)) {
    return `Wij werken samen met Autotrust. Neem contact op voor de exacte garantievoorwaarden voor een specifieke auto.`;
  }
  if (/aantal|voorraad|hoeveel/.test(m)) {
    return `Op dit moment tonen wij ${cars.length} occasions op de website. Op zoek naar iets specifieks? ${HUMAN_FALLBACK}`;
  }
  if (/automaat/.test(m)) {
    const matches = cars.filter((c) => /automaat/i.test(c.transmission ?? ""));
    if (matches.length > 0) {
      const top = matches.slice(0, 3).map((c) => `${c.brand} ${c.model}`).join(", ");
      return `In onze huidige voorraad met automaat: ${top}${matches.length > 3 ? `, en meer.` : "."} Zie /aanbod?transmission=Automaat.`;
    }
    return `Op dit moment hebben we geen auto met automaat op de website. ${HUMAN_FALLBACK}`;
  }

  return `Ik kan u helpen met vragen over onze voorraad, openingstijden, locatie en garantie. ${HUMAN_FALLBACK}`;
}
