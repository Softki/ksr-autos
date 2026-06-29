import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Car, Handshake, Search } from "lucide-react";

import { CarCard } from "@/components/public/CarCard";
import { ClosingCTA } from "@/components/public/ClosingCTA";
import { HeroSearch } from "@/components/public/HeroSearch";
import { WhatsAppCTA } from "@/components/public/WhatsAppCTA";
import { getFeaturedCars, listPublicCars } from "@/lib/data/cars";
import { BRANDS, BUSINESS } from "@/lib/constants";
import { formatPrice, whatsAppLink } from "@/lib/utils/format";
import type { Car as CarType } from "@/lib/types";

const HERO_PHOTO = "https://ksrautos.nl/wp-content/uploads/2025/12/HeaderfotoKSR-scaled.webp";

export default async function HomePage() {
  const [featured, { total }] = await Promise.all([
    getFeaturedCars(6),
    listPublicCars({ filters: { includeReserved: true } }),
  ]);

  const showcase = featured[0];

  return (
    <>
      <Hero showcase={showcase} />
      <div className="relative z-20 container -mt-11 md:-mt-12">
        <HeroSearch total={total} brands={[...BRANDS]} />
      </div>
      <FeatureBoxes />
      <FeaturedSection featured={featured} />
      <BrandGrid />
      <WhyKsr total={total} />
      <ClosingCTA />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero({ showcase }: { showcase?: CarType }) {
  const message = "Hallo KSR Auto's, ik heb een vraag over jullie aanbod.";
  return (
    <section className="relative overflow-hidden text-[var(--color-canvas)] bg-[linear-gradient(120deg,#16140F_0%,#241A12_60%,#33241A_100%)]">
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(90%_120%_at_78%_25%,rgba(209,87,40,0.30),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute right-[-2%] top-[8%] font-display font-extrabold leading-[0.8] tracking-[-0.04em] text-white/[0.035] select-none pointer-events-none text-[clamp(160px,26vw,360px)]"
      >
        KSR
      </div>

      <div className="relative container">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 items-center min-h-[500px] md:min-h-[520px] pt-12 md:pt-16 pb-24 md:pb-28">
          <div className="ksr-up">
            <div className="eyebrow on-dark mb-5">Occasions in Ridderkerk</div>
            <h1 className="display-1 text-[var(--color-canvas)]">
              Vind de auto
              <br />
              die bij u past.
            </h1>
            <p className="mt-5 text-[17px] md:text-[18px] leading-relaxed max-w-[30em] text-[#C4BBAE]">
              Een zorgvuldig samengestelde voorraad jonge occasions — allemaal APK gekeurd, eerlijk
              omschreven en klaar voor een proefrit.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/aanbod" className="btn btn-primary btn-lg gap-2.5">
                Bekijk het aanbod
                <ArrowRight className="size-[18px]" aria-hidden />
              </Link>
              <a
                href={whatsAppLink(message, BUSINESS.whatsapp)}
                target="_blank"
                rel="noopener"
                className="btn btn-lg bg-white/[0.07] text-[var(--color-canvas)] border border-white/[0.18] hover:bg-white/[0.12]"
              >
                Stel uw vraag via WhatsApp
              </a>
            </div>
          </div>

          <div className="ksr-up relative">
            <ShowcaseCard car={showcase} fallback={HERO_PHOTO} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ car, fallback }: { car?: CarType; fallback: string }) {
  return (
    <div className="relative aspect-[5/4] rounded-[var(--radius-xl)] overflow-hidden border border-white/[0.08] bg-[linear-gradient(135deg,#2C2620,#15110D)]">
      <Image
        src={car?.main_image || fallback}
        alt={car ? `${car.brand} ${car.model} bij KSR Auto's` : "Showroom KSR Auto's"}
        fill
        sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
        priority
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(120%_90%_at_65%_25%,rgba(209,87,40,0.22),transparent_60%)]"
      />
      {car && (
        <Link
          href={`/aanbod/${car.slug}`}
          className="absolute left-4 bottom-4 right-4 sm:right-auto bg-[rgba(20,17,13,0.55)] backdrop-blur border border-white/[0.12] rounded-[var(--radius-md)] px-4 py-3 text-white"
        >
          <div className="lbl text-[9.5px] text-white/55">Uitgelicht</div>
          <div className="text-[15px] font-bold mt-0.5 truncate">
            {car.brand} {car.model} · {formatPrice(car.price)}
          </div>
        </Link>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feature boxes                                                             */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  { title: "Occasions", href: "/aanbod", icon: Car, desc: "Een ruime keuze jonge occasions, allemaal APK gekeurd en goed onderhouden." },
  { title: "Auto inkoop", href: "/auto-verkopen", icon: Handshake, desc: "Uw auto verkopen of inruilen? Ontvang snel een eerlijke prijsindicatie." },
  { title: "Zoekopdracht", href: "/auto-zoeken", icon: Search, desc: "Specifieke auto in gedachten? Wij gaan voor u op zoek naar de juiste occasion." },
] as const;

function FeatureBoxes() {
  return (
    <section className="container pt-16 pb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ title, href, icon: Icon, desc }) => (
          <Link key={title} href={href} className="ksr-feat card p-6 flex flex-col gap-3.5">
            <span className="ksr-fi grid place-items-center size-[50px] rounded-[13px] bg-[var(--color-red-tint)] text-[var(--color-red)]">
              <Icon className="size-6" aria-hidden />
            </span>
            <h3 className="text-[17px] font-bold">{title}</h3>
            <p className="text-[14px] leading-relaxed text-[var(--color-steel)]">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Featured cars                                                             */
/* -------------------------------------------------------------------------- */

function FeaturedSection({ featured }: { featured: CarType[] }) {
  return (
    <section className="section pt-14">
      <div className="container">
        <div className="flex justify-between items-end gap-6 mb-8">
          <div>
            <div className="eyebrow">Nieuw binnen</div>
            <h2 className="display-2 mt-3">Uitgelicht uit de showroom</h2>
          </div>
          <Link href="/aanbod" className="ksr-link hidden sm:inline-flex font-bold text-[14.5px] shrink-0">
            Bekijk alles →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, i) => (
              <CarCard key={car.id} car={car} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-[var(--color-steel)]">
              Nieuwe voorraad wordt binnenkort toegevoegd. App ons voor actuele beschikbaarheid.
            </p>
            <WhatsAppCTA className="mt-4 inline-flex" />
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Browse by brand (dark)                                                    */
/* -------------------------------------------------------------------------- */

function BrandGrid() {
  return (
    <section className="brand-sec surface-ink">
      <div className="relative container py-16 md:py-20">
        <div className="text-center mb-9">
          <div className="lbl text-[12px] text-[var(--color-red-soft)]">Onze specialisaties</div>
          <h2 className="mt-2.5 text-[var(--color-canvas)]">Blader op merk</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {BRANDS.map((b) => (
            <Link
              key={b}
              href={`/aanbod?brand=${encodeURIComponent(b)}`}
              className="brand-card relative h-[108px] rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] flex flex-col items-start justify-end gap-1.5 p-4"
            >
              <span className="absolute right-1.5 top-[-18px] font-display font-extrabold text-[78px] leading-none text-white/[0.05] pointer-events-none">
                {b[0]}
              </span>
              <span className="relative font-display font-bold text-[18px] text-[#E6DDD0]">{b}</span>
              <span className="ba relative inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-red-soft)]">
                Bekijk aanbod <ArrowRight className="size-3" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Why KSR + counters                                                        */
/* -------------------------------------------------------------------------- */

const CHECKS = [
  "Voornamelijk jonge auto's",
  "APK gekeurd en goed onderhouden",
  "Eerlijke, complete voertuigomschrijvingen",
  "Direct bereikbaar via telefoon en WhatsApp",
];

function WhyKsr({ total }: { total: number }) {
  const counters = [
    { v: `${total}+`, l: "Occasions op voorraad" },
    { v: `${BRANDS.length}`, l: "Merkspecialisaties" },
    { v: "6", l: "Dagen per week open" },
  ];
  return (
    <section className="section">
      <div className="container grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
        <div className="relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden bg-[linear-gradient(140deg,#E0D4C2,#EFE7DA)]">
          <Image
            src={HERO_PHOTO}
            alt="Showroom KSR Auto's aan de Havenkade 4 in Ridderkerk"
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
          />
          <div className="absolute left-5 bottom-5 bg-[var(--color-red)] text-white rounded-[var(--radius-lg)] px-5 py-4">
            <div className="font-display font-extrabold text-[30px] leading-none">100%</div>
            <div className="lbl text-[9.5px] mt-1 text-white/85">APK gekeurd</div>
          </div>
        </div>
        <div>
          <div className="eyebrow">Waarom KSR Auto&rsquo;s</div>
          <h2 className="display-2 mt-3">Eerlijk, bereikbaar en goed onderhouden</h2>
          <p className="lead mt-4">
            Ons aanbod bestaat voornamelijk uit jonge auto&rsquo;s, allemaal APK gekeurd en goed
            onderhouden. In onze showroom vindt u een ruime keuze in verschillende merken.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {CHECKS.map((c) => (
              <div key={c} className="flex items-center gap-3 text-[15px] font-semibold">
                <span className="size-6 rounded-[8px] bg-[var(--color-red-tint)] text-[var(--color-red)] grid place-items-center shrink-0">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                {c}
              </div>
            ))}
          </div>
          <div className="mt-7 pt-7 border-t border-[var(--color-line)] flex gap-9">
            {counters.map((ct) => (
              <div key={ct.l}>
                <div className="font-display font-extrabold text-[34px] leading-none">{ct.v}</div>
                <div className="lbl text-[10px] text-[var(--color-mute)] mt-1.5">{ct.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

