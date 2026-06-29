import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { BUSINESS, OPENING_HOURS } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { HideOnAdmin } from "@/components/HideOnAdmin";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Toaster } from "sonner";

// Sora — display / headings. Manrope — body text. Both variable Google fonts.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KSR Auto's | Occasions in Ridderkerk",
    template: "%s | KSR Auto's",
  },
  description:
    "Bekijk de actuele voorraad occasions van KSR Auto's in Ridderkerk. Bel of app voor beschikbaarheid, proefrit of inruil. Havenkade 4, Ridderkerk.",
  applicationName: "KSR Auto's",
  authors: [{ name: "KSR Auto's" }],
  keywords: [
    "occasions Ridderkerk",
    "tweedehands auto Ridderkerk",
    "KSR Auto's",
    "auto kopen Ridderkerk",
    "auto inkoop",
    "Autotrust garantie",
  ],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: siteUrl,
    siteName: "KSR Auto's",
    title: "KSR Auto's | Occasions in Ridderkerk",
    description:
      "Actuele voorraad occasions in Ridderkerk. Bel of app voor beschikbaarheid, proefrit of inruil.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KSR Auto's | Occasions in Ridderkerk",
    description: "Actuele voorraad occasions in Ridderkerk.",
  },
  alternates: { canonical: siteUrl },
  icons: { icon: "/favicon.ico" },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F1" },
    { media: "(prefers-color-scheme: dark)", color: "#16140F" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": `${siteUrl}#dealer`,
  name: BUSINESS.name,
  image: `${siteUrl}/opengraph-image`,
  url: siteUrl,
  telephone: `+31${BUSINESS.phoneRaw.replace(/^0/, "")}`,
  email: BUSINESS.email,
  vatID: undefined,
  taxID: BUSINESS.kvk,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.address,
    postalCode: BUSINESS.postal,
    addressLocality: BUSINESS.city,
    addressCountry: "NL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.866,
    longitude: 4.617,
  },
  openingHoursSpecification: OPENING_HOURS.filter((o) => !o.hours.toLowerCase().includes("afspraak")).map((o) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: dutchDayToSchema(o.day),
    opens: "09:00",
    closes: "17:00",
  })),
  sameAs: [BUSINESS.whatsapp],
  knowsAbout: ["Opel", "Hyundai", "Renault", "Seat", "BMW", "Audi", "Mercedes", "Volkswagen"],
};

function dutchDayToSchema(day: string): string {
  const map: Record<string, string> = {
    Maandag: "Monday",
    Dinsdag: "Tuesday",
    Woensdag: "Wednesday",
    Donderdag: "Thursday",
    Vrijdag: "Friday",
    Zaterdag: "Saturday",
    Zondag: "Sunday",
  };
  return map[day] ?? day;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <a href="#main" className="skip-link">Spring naar inhoud</a>

        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <HideOnAdmin>
          <Footer />
        </HideOnAdmin>
        <ChatWidget />
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            className: "font-sans",
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </body>
    </html>
  );
}
