import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { FaqEntry } from "@/lib/types";
import type { FaqRow } from "@/lib/supabase/database.types";

const FALLBACK: FaqEntry[] = [
  {
    id: "faq-opening",
    question: "Wat zijn jullie openingstijden?",
    answer:
      "Wij zijn van maandag tot en met zaterdag geopend van 09:00 tot 17:00 uur. Op zondag werken wij op afspraak. Buiten de openingstijden zijn wij ook geopend op afspraak.",
    topic: "opening",
    sort_order: 10,
  },
  {
    id: "faq-locatie",
    question: "Waar zijn jullie gevestigd?",
    answer: "KSR Auto's is gevestigd aan de Havenkade 4, 2984 AA Ridderkerk.",
    topic: "locatie",
    sort_order: 20,
  },
  {
    id: "faq-contact",
    question: "Hoe kan ik snel contact opnemen?",
    answer:
      "U kunt ons bellen op 06 185 800 91 of direct via WhatsApp bereiken. Mailen kan via ksrautos@hotmail.com.",
    topic: "contact",
    sort_order: 30,
  },
  {
    id: "faq-garantie",
    question: "Bieden jullie garantie?",
    answer:
      "Ja, wij werken samen met Autotrust. Afhankelijk van leeftijd en kilometerstand zijn er verschillende garantiepakketten. Bekijk de garantie-pagina of neem contact op voor de mogelijkheden bij een specifieke auto.",
    topic: "garantie",
    sort_order: 40,
  },
  {
    id: "faq-inruil",
    question: "Kan ik mijn auto inruilen?",
    answer:
      "Ja. Gebruik het inruil/inkoopformulier op de pagina ‘Auto verkopen’ of stuur ons direct een WhatsApp.",
    topic: "inruil",
    sort_order: 50,
  },
  {
    id: "faq-proefrit",
    question: "Kan ik een proefrit aanvragen?",
    answer: "Zeker. Op iedere voertuigpagina kunt u een proefrit aanvragen. Wij werken bij voorkeur op afspraak.",
    topic: "proefrit",
    sort_order: 60,
  },
];

function fromRow(row: FaqRow): FaqEntry {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    topic: row.topic ?? undefined,
    sort_order: row.sort_order,
  };
}

export async function getPublishedFaq(): Promise<FaqEntry[]> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((r) => fromRow(r as FaqRow));
      }
    }
  }
  return FALLBACK;
}
