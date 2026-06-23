// KSR Auto's - Confirmed business constants from scraped content + redesign.md
// Use these everywhere for consistency. Do not hardcode contact info elsewhere.

export const BUSINESS = {
  name: "KSR Auto's",
  address: "Havenkade 4",
  postal: "2984 AA",
  city: "Ridderkerk",
  fullAddress: "Havenkade 4, 2984 AA Ridderkerk",
  phone: "06 185 800 91",
  phoneRaw: "0618580091",
  telHref: "tel:0618580091",
  email: "ksrautos@hotmail.com",
  whatsapp: "https://wa.me/31618580091",
  whatsappNumber: "+31618580091",
  kvk: "78053404",
  website: "https://ksrautos.nl", // for reference / canonicals
} as const;

export const OPENING_HOURS = [
  { day: "Maandag", hours: "09:00 - 17:00" },
  { day: "Dinsdag", hours: "09:00 - 17:00" },
  { day: "Woensdag", hours: "09:00 - 17:00" },
  { day: "Donderdag", hours: "09:00 - 17:00" },
  { day: "Vrijdag", hours: "09:00 - 17:00" },
  { day: "Zaterdag", hours: "09:00 - 17:00" },
  { day: "Zondag", hours: "Op afspraak" },
] as const;

export const OPENING_NOTE = "Buiten de openingstijden zijn wij geopend op afspraak.";

export const STANDARD_APPOINTMENT_TEXT =
  "Wij zijn van maandag tot en met zaterdag van 09:00 tot 17:00 uur geopend. Voor de beste service werken wij het liefst op afspraak. Bel of app ons vooraf, dan zorgen we dat de auto klaarstaat. Omdat wij vaak onderweg zijn voor nieuwe auto's en een deel van onze voorraad op een tweede locatie staat, adviseren wij altijd om vooraf even contact met ons op te nemen.";

export const BRANDS = [
  "Opel",
  "Hyundai",
  "Renault",
  "Seat",
  "BMW",
  "Audi",
  "Mercedes",
  "Volkswagen",
] as const;

export const FUEL_TYPES = ["Benzine", "Diesel", "Electric", "Hybrid"] as const;
export const TRANSMISSIONS = ["Handmatig", "Automaat"] as const;

export const STATUS = {
  available: "Beschikbaar",
  reserved: "Gereserveerd",
  sold: "Verkocht",
  hidden: "Verborgen",
} as const;

export type CarStatus = keyof typeof STATUS;

// Primary CTAs and messages
export const CTA = {
  viewOffer: "Bekijk aanbod",
  whatsapp: "WhatsApp ons",
  call: "Bel ons",
  requestTestDrive: "Proefrit aanvragen",
  tradeIn: "Inruilen",
  contact: "Contact",
  submit: "Verstuur bericht",
} as const;

export const SUCCESS_MESSAGE =
  "Bedankt, we hebben uw aanvraag ontvangen. Voor directe vragen kunt u ons ook bellen of appen via 06 185 800 91.";

export const DISCLAIMER =
  "Hoewel de informatie met zorg is samengesteld, kunnen gegevens afwijken. Neem contact op voor exacte uitvoering, beschikbaarheid en voorwaarden.";

// For chatbot context
export const COMPANY_CONTEXT = `
KSR Auto's is gevestigd aan de Havenkade 4, 2984 AA Ridderkerk.
Telefoon: 06 185 800 91. WhatsApp: https://wa.me/31618580091.
E-mail: ksrautos@hotmail.com. KVK: 78053404.
Openingstijden: maandag t/m zaterdag 09:00-17:00, zondag op afspraak.
Specialisaties: occasions in Opel, Hyundai, Renault, Seat, BMW, Audi, Mercedes, Volkswagen.
Diensten: occasions verkopen, auto inkoop, zoekopdracht, Autotrust garantie.
Wij werken graag op afspraak.
`;
