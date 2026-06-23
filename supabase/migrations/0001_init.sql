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
