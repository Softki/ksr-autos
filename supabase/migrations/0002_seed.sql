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
