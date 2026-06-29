-- KSR Auto's — complete database setup
-- Run ONCE in the Supabase SQL Editor (New query → paste all → Run).
-- Combined from supabase/migrations/0001_init.sql + 0002_seed.sql

-- KSR Auto's — Initial schema
-- Run in Supabase SQL editor (or via supabase CLI: supabase db push)
--
-- This migration creates:
--   - cars                 (vehicle records)
--   - car_images           (multiple images per car, with sort order + main flag)
--   - inquiries            (contact / test_drive / trade_in / search_request leads)
--   - faq                  (chatbot-grounded FAQ entries)
--   - site_settings        (single-row company/site settings)
-- plus indexes, triggers and Row Level Security policies.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Cars
-- ---------------------------------------------------------------------------
create table if not exists public.cars (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  brand           text not null,
  model           text not null,
  version         text,
  year            integer,
  price           integer not null check (price >= 0),
  mileage         integer check (mileage is null or mileage >= 0),
  fuel_type       text,
  transmission    text,
  body_type       text,
  color           text,
  doors           integer,
  seats           integer,
  power_hp        integer,
  engine_cc       integer,
  apk_until       date,
  license_plate   text,
  vat_type        text default 'marge',         -- 'marge' | 'btw' | 'ex_btw'
  description     text,
  options         jsonb default '[]'::jsonb,
  status          text not null default 'available'
                  check (status in ('draft','available','reserved','sold','hidden')),
  is_featured     boolean not null default false,
  is_published    boolean not null default true,
  sort_score      integer not null default 0,   -- admin manual order helper
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists cars_status_idx          on public.cars (status) where status in ('available','reserved');
create index if not exists cars_brand_idx           on public.cars (lower(brand));
create index if not exists cars_price_idx           on public.cars (price);
create index if not exists cars_year_idx            on public.cars (year);
create index if not exists cars_mileage_idx         on public.cars (mileage);
create index if not exists cars_is_featured_idx     on public.cars (is_featured) where is_featured;
create index if not exists cars_created_at_idx      on public.cars (created_at desc);

-- ---------------------------------------------------------------------------
-- Car images
-- ---------------------------------------------------------------------------
create table if not exists public.car_images (
  id              uuid primary key default gen_random_uuid(),
  car_id          uuid not null references public.cars(id) on delete cascade,
  storage_path    text not null,                  -- supabase storage path (within bucket)
  image_url       text not null,                  -- public URL (cached)
  alt_text        text,
  width           integer,
  height          integer,
  sort_order      integer not null default 0,
  is_main         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists car_images_car_id_idx           on public.car_images (car_id, sort_order);
create unique index if not exists car_images_main_per_car  on public.car_images (car_id) where is_main;

-- ---------------------------------------------------------------------------
-- Inquiries
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  car_id          uuid references public.cars(id) on delete set null,
  type            text not null check (type in ('contact','test_drive','trade_in','search_request')),
  name            text not null,
  email           text not null,
  phone           text,
  message         text,
  metadata        jsonb default '{}'::jsonb,
  status          text not null default 'new' check (status in ('new','contacted','closed','spam')),
  ip_hash         text,
  user_agent      text,
  created_at      timestamptz not null default now()
);

create index if not exists inquiries_status_idx     on public.inquiries (status);
create index if not exists inquiries_type_idx       on public.inquiries (type);
create index if not exists inquiries_created_idx    on public.inquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- FAQ for chatbot grounding
-- ---------------------------------------------------------------------------
create table if not exists public.faq (
  id              uuid primary key default gen_random_uuid(),
  question        text not null,
  answer          text not null,
  topic           text,                            -- e.g. 'opening', 'garantie', 'inruil'
  is_published    boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists faq_published_idx       on public.faq (is_published) where is_published;
create index if not exists faq_topic_idx           on public.faq (topic);

-- ---------------------------------------------------------------------------
-- Site settings (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id              integer primary key default 1 check (id = 1),
  company_name    text not null default 'KSR Auto''s',
  street          text not null default 'Havenkade 4',
  postal_code     text not null default '2984 AA',
  city            text not null default 'Ridderkerk',
  phone           text not null default '06 185 800 91',
  whatsapp_url    text not null default 'https://wa.me/31618580091',
  email           text not null default 'ksrautos@hotmail.com',
  kvk             text not null default '78053404',
  announcement    text,                            -- optional banner text
  updated_at      timestamptz not null default now()
);

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tg_cars_updated_at on public.cars;
create trigger tg_cars_updated_at
  before update on public.cars
  for each row execute function public.tg_touch_updated_at();

drop trigger if exists tg_faq_updated_at on public.faq;
create trigger tg_faq_updated_at
  before update on public.faq
  for each row execute function public.tg_touch_updated_at();

drop trigger if exists tg_site_settings_updated_at on public.site_settings;
create trigger tg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Ensure only one main image per car
-- ---------------------------------------------------------------------------
create or replace function public.tg_single_main_image()
returns trigger language plpgsql as $$
begin
  if new.is_main then
    update public.car_images
       set is_main = false
     where car_id = new.car_id
       and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists tg_single_main_image on public.car_images;
create trigger tg_single_main_image
  before insert or update of is_main on public.car_images
  for each row execute function public.tg_single_main_image();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.cars            enable row level security;
alter table public.car_images      enable row level security;
alter table public.inquiries       enable row level security;
alter table public.faq             enable row level security;
alter table public.site_settings   enable row level security;

-- ---- Cars ----------------------------------------------------------------
drop policy if exists cars_public_read on public.cars;
create policy cars_public_read on public.cars
  for select
  using (is_published and status in ('available','reserved','sold'));

drop policy if exists cars_authed_all on public.cars;
create policy cars_authed_all on public.cars
  for all
  to authenticated
  using (true)
  with check (true);

-- ---- Car images ----------------------------------------------------------
drop policy if exists car_images_public_read on public.car_images;
create policy car_images_public_read on public.car_images
  for select
  using (
    exists (
      select 1 from public.cars c
       where c.id = car_images.car_id
         and c.is_published
         and c.status in ('available','reserved','sold')
    )
  );

drop policy if exists car_images_authed_all on public.car_images;
create policy car_images_authed_all on public.car_images
  for all
  to authenticated
  using (true)
  with check (true);

-- ---- Inquiries -----------------------------------------------------------
-- Anonymous users may INSERT a lead but never read others' leads.
drop policy if exists inquiries_anon_insert on public.inquiries;
create policy inquiries_anon_insert on public.inquiries
  for insert
  to anon, authenticated
  with check (
    length(coalesce(name, ''))  between 2 and 200
    and length(coalesce(email, '')) between 5 and 200
    and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
    and length(coalesce(message, '')) <= 4000
  );

drop policy if exists inquiries_authed_read on public.inquiries;
create policy inquiries_authed_read on public.inquiries
  for select
  to authenticated
  using (true);

drop policy if exists inquiries_authed_update on public.inquiries;
create policy inquiries_authed_update on public.inquiries
  for update
  to authenticated
  using (true)
  with check (true);

-- ---- FAQ -----------------------------------------------------------------
drop policy if exists faq_public_read on public.faq;
create policy faq_public_read on public.faq
  for select
  using (is_published);

drop policy if exists faq_authed_all on public.faq;
create policy faq_authed_all on public.faq
  for all
  to authenticated
  using (true)
  with check (true);

-- ---- Site settings -------------------------------------------------------
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select
  using (true);

drop policy if exists site_settings_authed_update on public.site_settings;
create policy site_settings_authed_update on public.site_settings
  for update
  to authenticated
  using (true)
  with check (true);

-- ===========================================================================
-- Storage bucket setup (run separately if needed)
-- ===========================================================================
-- In Supabase Studio:
--   1. Create a public bucket called  `car-images`.
--   2. Add storage RLS:
--       - public can read all objects in `car-images`
--       - authenticated users can insert/update/delete objects in `car-images`
-- (Storage policies live in the `storage.objects` table and are best managed
--  via the Supabase dashboard so we do not duplicate them here.)


-- ─────────────── seed data ───────────────

-- KSR Auto's — Optional seed data
-- Inserts ~8 representative occasions and a small FAQ list.
-- Safe to skip in production; intended for staging/demo databases.

-- ---------------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------------
insert into public.faq (question, answer, topic, sort_order) values
  ('Wat zijn jullie openingstijden?',
   'Wij zijn van maandag tot en met zaterdag geopend van 09:00 tot 17:00 uur. Op zondag werken wij op afspraak. Buiten de openingstijden zijn wij geopend op afspraak.',
   'opening', 10),
  ('Waar zijn jullie gevestigd?',
   'KSR Auto''s is gevestigd aan de Havenkade 4, 2984 AA Ridderkerk.',
   'locatie', 20),
  ('Hoe kan ik snel contact opnemen?',
   'U kunt ons bellen op 06 185 800 91 of direct via WhatsApp bereiken. Mailen kan via ksrautos@hotmail.com.',
   'contact', 30),
  ('Bieden jullie garantie?',
   'Ja, wij werken samen met Autotrust. Afhankelijk van leeftijd en kilometerstand zijn er verschillende garantiepakketten beschikbaar. Bekijk de garantie-pagina of neem contact op voor de mogelijkheden bij een specifieke auto.',
   'garantie', 40),
  ('Kan ik mijn auto inruilen?',
   'Ja, gebruik het inruil/inkoopformulier op de pagina "Auto verkopen" of vraag het aan via WhatsApp. Wij kopen ook auto''s rechtstreeks in.',
   'inruil', 50),
  ('Kan ik een proefrit aanvragen?',
   'Zeker. Op iedere voertuigpagina kunt u een proefrit aanvragen. Wij werken bij voorkeur op afspraak.',
   'proefrit', 60)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Cars
-- (Note: these are seeded from the scraped overview snapshot at June 2026.
--  In production the CMS will be authoritative. Image rows are created in
--  car_images with the original CDN URL — replace via the admin upload flow.)
-- ---------------------------------------------------------------------------
with seed (slug, title, brand, model, version, year, price, mileage,
           fuel_type, transmission, body_type, color, doors, seats, power_hp,
           apk_until, license_plate, vat_type, status, is_featured, image_url,
           description, options) as (
  values
    ('audi-a1-3393770',
     'Audi A1 1.2 TFSI Attraction 3DR | APK | LM velgen',
     'Audi', 'A1', '1.2 TFSI Attraction 3DR',
     2012, 4995, 233533,
     'Benzine', 'Handmatig', 'Hatchback', 'Paars', 3, 4, 86,
     date '2026-08-01', 'P-988-GG', 'marge',
     'available', true, 'https://media-cdn.vwe.nl/Images/164669066.jpg',
     'Compacte stadsauto met cruise, airco, navigatie full map en lichtmetalen velgen. APK gekeurd, technisch in goede staat. Bel of app vooraf voor een afspraak.',
     '["Airbag bestuurder","Airbag passagier","Airco","Cruise control","Elektrische ramen voor","Navigatie full map","Stuurbekrachtiging","Verwarmde voorstoelen"]'::jsonb),

    ('bmw-3-serie-3437096',
     'BMW 3-serie 335i Business Line M Sport 306 PK',
     'BMW', '3-serie', '335i Business Line M Sport 306 PK',
     2011, 13995, 217228,
     'Benzine', 'Automaat', 'Sedan', 'Zwart', 4, 5, 306,
     date '2026-07-05', '44-TKV-6', 'marge',
     'available', true, 'https://media-cdn.vwe.nl/Images/164669200.jpg',
     'Krachtige 335i met M Sport pakket. Zorgvuldig onderhouden en netjes gehouden. Comfortabele rijder, soepele automaat. Een auto die je instapt en geniet.',
     '["M Sport","Bi-xenon","Adaptieve cruise control","Sportstoelen","Leder bekleding","Schuifdak","18 inch velgen","Navigatie","Climate control","Parkeersensoren","Stoelverwarming"]'::jsonb),

    ('audi-a6-avant-3574299',
     'Audi A6 Avant 2.0 TFSI Business Edition Automaat | NAP | APK',
     'Audi', 'A6', 'Avant 2.0 TFSI Business Edition Automaat',
     2014, 13950, 203259,
     'Benzine', 'Automaat', 'Stationwagen', 'Zilver', 5, 5, 180,
     date '2026-06-30', null, 'marge',
     'available', false, 'https://media-cdn.vwe.nl/Images/164670001.jpg',
     'Ruime, comfortabele Audi A6 Avant. Goed onderhouden, klaar voor gebruik. Ideale gezinsstationwagen met automaat en ruime laadruimte.',
     '["Navigatie","Climate control","Cruise control","Trekhaak","Parkeersensoren","Lederen interieur","Xenon verlichting"]'::jsonb),

    ('mercedes-benz-b-klasse-3653773',
     'Mercedes-Benz B-klasse 170 Automaat | APK',
     'Mercedes', 'B-klasse', '170 Automaat',
     2007, 2795, 219440,
     'Benzine', 'Automaat', 'MPV', 'Grijs', 5, 5, 116,
     date '2026-10-21', '23-ZRBS', 'marge',
     'available', true, 'https://media-cdn.vwe.nl/Images/170195100.jpg',
     'Comfortabele Mercedes B-klasse met automaat. Praktische hoogzit. Let op: rondom beschadigingen aanwezig — eerlijke prijsstelling.',
     '["Airco","Cruise control","Automaat","Hoogzit","Elektrische ramen"]'::jsonb),

    ('ford-galaxy-3518938',
     'Ford Galaxy 2.0 SCTi Titanium Automaat | 7-pers | Leer | APK',
     'Ford', 'Galaxy', '2.0 SCTi Titanium Automaat 7-pers',
     2011, 1495, 318443,
     'Benzine', 'Automaat', 'MPV', 'Grijs', 5, 7, 203,
     date '2026-07-08', '45-PDT-7', 'marge',
     'available', false, 'https://media-cdn.vwe.nl/Images/170195043.jpg',
     'Ruime 7-persoons Ford Galaxy met leer en luxe Titanium uitvoering. Let op: de automaat gaat in storing, auto rijdt en schakelt nog. Eerlijke prijs — ideaal voor handige sleutelaar of als project.',
     '["7 persoons","Lederen interieur","Airco","Cruise control","Trekhaak"]'::jsonb),

    ('opel-corsa-3658161',
     'Opel Corsa 1.2-16V BlitZ | APK | Airco | Cruise',
     'Opel', 'Corsa', '1.2-16V BlitZ',
     2014, 1995, 261633,
     'Benzine', 'Handmatig', 'Hatchback', 'Rood', 5, 5, 70,
     date '2026-09-15', null, 'marge',
     'available', false, 'https://media-cdn.vwe.nl/Images/164670500.jpg',
     'Compacte, zuinige Opel Corsa BlitZ-uitvoering. Met airco en cruise. Ideale stadsauto of starter. APK gekeurd.',
     '["Airco","Cruise control","Centrale vergrendeling","Elektrische ramen voor"]'::jsonb),

    ('ford-c-max-3490128',
     'Ford C-Max 1.8-16V Limited | NAP | APK | Trekhaak',
     'Ford', 'C-Max', '1.8-16V Limited',
     2009, 2995, 189638,
     'Benzine', 'Handmatig', 'MPV', 'Blauw', 5, 5, 125,
     date '2026-05-20', null, 'marge',
     'reserved', false, 'https://media-cdn.vwe.nl/Images/164670600.jpg',
     'Praktische gezinsauto met trekhaak. Goed onderhouden en op NAP. Op dit moment gereserveerd — neem contact op voor de status.',
     '["Trekhaak","Airco","Cruise control","NAP","Centrale vergrendeling"]'::jsonb),

    ('volkswagen-fox-3658169',
     'Volkswagen Fox 1.4 Trendline | APK | NAP | Hoogzit',
     'Volkswagen', 'Fox', '1.4 Trendline',
     2007, 2295, 120377,
     'Benzine', 'Handmatig', 'Hatchback', 'Zilver', 3, 4, 75,
     date '2026-08-10', null, 'marge',
     'available', false, 'https://media-cdn.vwe.nl/Images/164670700.jpg',
     'Compacte, zuinige Volkswagen Fox met hoogzit. Lage kilometerstand voor het bouwjaar. Goede instapauto.',
     '["Hoogzit","NAP","APK","Centrale vergrendeling"]'::jsonb)
)
insert into public.cars (
  slug, title, brand, model, version, year, price, mileage, fuel_type,
  transmission, body_type, color, doors, seats, power_hp, apk_until,
  license_plate, vat_type, status, is_featured, description, options
)
select
  slug, title, brand, model, version, year, price, mileage, fuel_type,
  transmission, body_type, color, doors, seats, power_hp, apk_until,
  license_plate, vat_type, status, is_featured, description, options
from seed
on conflict (slug) do nothing;

-- Add a single main image per seeded car (using original CDN URL until
-- replaced via the admin upload flow).
insert into public.car_images (car_id, storage_path, image_url, is_main, sort_order)
select c.id, 'external/' || c.slug || '/main', s.image_url, true, 0
from public.cars c
join (
  values
    ('audi-a1-3393770', 'https://media-cdn.vwe.nl/Images/164669066.jpg'),
    ('bmw-3-serie-3437096', 'https://media-cdn.vwe.nl/Images/164669200.jpg'),
    ('audi-a6-avant-3574299', 'https://media-cdn.vwe.nl/Images/164670001.jpg'),
    ('mercedes-benz-b-klasse-3653773', 'https://media-cdn.vwe.nl/Images/170195100.jpg'),
    ('ford-galaxy-3518938', 'https://media-cdn.vwe.nl/Images/170195043.jpg'),
    ('opel-corsa-3658161', 'https://media-cdn.vwe.nl/Images/164670500.jpg'),
    ('ford-c-max-3490128', 'https://media-cdn.vwe.nl/Images/164670600.jpg'),
    ('volkswagen-fox-3658169', 'https://media-cdn.vwe.nl/Images/164670700.jpg')
) as s(slug, image_url) on s.slug = c.slug
on conflict do nothing;
