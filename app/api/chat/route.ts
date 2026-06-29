import { type NextRequest } from "next/server";
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

const encoder = new TextEncoder();

/** Wrap a plain string in a ReadableStream of UTF-8 chunks (a few words at a time). */
function streamRuleBased(text: string): ReadableStream<Uint8Array> {
  const words = text.split(" ");
  // Emit small bursts of 3–5 words with slight delay to feel alive.
  const CHUNK = 4;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < words.length; i += CHUNK) {
        const slice = words.slice(i, i + CHUNK).join(" ");
        controller.enqueue(encoder.encode(i === 0 ? slice : " " + slice));
        // Tiny delay between bursts makes it feel like live typing.
        await new Promise<void>((r) => setTimeout(r, 30));
      }
      controller.close();
    },
  });
}

/** Forward the OpenAI-compatible SSE stream from DeepSeek to the client as plain text. */
async function streamDeepSeek(
  apiKey: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  cars: import("@/lib/types").Car[],
  faq: import("@/lib/types").FaqEntry[],
): Promise<ReadableStream<Uint8Array> | null> {
  const carContext = cars
    .slice(0, 25)
    .map(
      (c, i) =>
        `${i + 1}. ${c.brand} ${c.model}${c.version ? ` ${c.version}` : ""} — ${c.year ?? ""}, ${formatKm(c.mileage)}, ${c.fuel_type ?? ""}, ${c.transmission ?? ""}. Prijs ${formatPrice(c.price)}. Status: ${c.status}. URL: /aanbod/${c.slug}`,
    )
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

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: MAX_OUTPUT,
        temperature: 0.2,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
      }),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!upstreamRes.ok || !upstreamRes.body) return null;

  const upstreamBody = upstreamRes.body;

  // Transform the SSE stream (data: {...}\n\n) into plain UTF-8 text chunks.
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      const dec = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += dec.decode(value, { stream: true });

          // SSE lines are separated by \n; events by \n\n.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } catch {
        // upstream read error — close gracefully
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache, no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function POST(req: NextRequest) {
  // — Validate input —
  let payload: z.infer<typeof messageSchema>;
  try {
    const json = await req.json();
    payload = messageSchema.parse(json);
  } catch {
    return new Response("Ongeldig verzoek", { status: 400 });
  }

  // — Rate limit —
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon";
  const key = await hashIdentifier(`chat:${ip}`);
  const rl = rateLimit(`chat:${key}`, { limit: 20, windowSec: 60 });
  if (!rl.ok) {
    const msg = `Bedankt voor uw vragen. Probeer het over ${rl.retryAfter} sec opnieuw of bel ons direct via ${BUSINESS.phone}.`;
    return new Response(streamRuleBased(msg), { status: 200, headers: STREAM_HEADERS });
  }

  const userMsg = payload.message.trim();
  const [cars, faq] = await Promise.all([
    listPublicCars({ filters: { includeReserved: true }, limit: 30 }),
    getPublishedFaq(),
  ]);

  // — Try DeepSeek streaming —
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (apiKey) {
    try {
      const stream = await streamDeepSeek(
        apiKey,
        userMsg,
        payload.history?.slice(-MAX_HISTORY) ?? [],
        cars.cars,
        faq,
      );
      if (stream) {
        return new Response(stream, { status: 200, headers: STREAM_HEADERS });
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[deepseek]", err);
    }
  }

  // — Rule-based streamed fallback —
  const fallback = ruleBased(userMsg, cars.cars, faq);
  return new Response(streamRuleBased(fallback), { status: 200, headers: STREAM_HEADERS });
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
      const top = matches
        .slice(0, 3)
        .map((c) => `${c.brand} ${c.model}`)
        .join(", ");
      return `In onze huidige voorraad met automaat: ${top}${matches.length > 3 ? `, en meer.` : "."} Zie /aanbod?transmission=Automaat.`;
    }
    return `Op dit moment hebben we geen auto met automaat op de website. ${HUMAN_FALLBACK}`;
  }

  return `Ik kan u helpen met vragen over onze voorraad, openingstijden, locatie en garantie. ${HUMAN_FALLBACK}`;
}
