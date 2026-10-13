-- Restore of EpoxArt site content as it was on 2026-10-13 (before the owner's requested changes).
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.

begin;

insert into public.site_settings (key, value, updated_at) values ('images', '{"hero":"https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/hero.jpg","about":null,"instagram":["https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-1.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-2.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-3.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-4.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-5.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-6.jpg"],"categories":{"stoly":"https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/stoly-tile.jpg","hodiny":null,"doplnky":null,"prkenka":"https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/prkenka-board.jpg"}}'::jsonb, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.site_settings (key, value, updated_at) values ('configurator', '{"woods":[{"color":"#5a3a22","label":"Ořech"},{"color":"#b08850","label":"Dub"},{"color":"#c9ab78","label":"Jasan"}],"resins":[{"color":"#1c5c78","label":"Oceánská modř"},{"color":"#1f6e63","label":"Smaragd"},{"color":"#c88a3a","label":"Jantar"},{"color":"#17140f","label":"Uhlová čerň"},{"color":"#d8c7a2","label":"Čirá"}]}'::jsonb, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.site_settings (key, value, updated_at) values ('shipping', '{"cost":149,"freeFrom":2500}'::jsonb, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.site_settings (key, value, updated_at) values ('texts', '{"ico":"23052431","email":"info@epoxart.cz","owner":"Jakub Havrlík","phone1":"+420 732 861 160","phone2":"+420 721 157 990","aboutP1":"V EpoxArt tvoříme originální designové produkty z masivního dřeva a epoxidové pryskyřice. Každý kus — ať už jde o stůl, prkénko, hodiny nebo dekoraci — je ručně vyrobený a jedinečný.","aboutP2":"Spojujeme surovou přírodu s moderním designem. Používáme jen české dřevo s jasným původem a prémiové pryskyřice, které vydrží generace.","address":"Čenkov 163, 262 23","facebook":"https://www.facebook.com/profile.php?id=61573065113314","heroText":"Originální nábytek z českého masivu a prémiové pryskyřice. Každý kus je jediný svého druhu.","subStoly":"Jídelní & konferenční","instagram":"https://www.instagram.com/epoxart19/","aboutTitle":"Poctivé řemeslo z dílny v Čenkově.","configText":"Sestavte si vlastní kus. Vyberte dřevo, odstín pryskyřice, tvar a směr řeky — náhled se mění podle vás. Na závěr nám pošlete nezávaznou poptávku.","customText":"Vyberte dřevo, odstín pryskyřice, tvar hrany i podnoží — a my z toho vytvoříme originál.","footerText":"Ruční výroba unikátního nábytku z masivu a epoxidové pryskyřice. Každý kus je originál vytvořený s láskou k řemeslu.","heroTitle1":"Řemeslo, které","heroTitle2":"přežije generace.","subKuchyne":"Z melaminu","subPrkenka":"Kuchyňská & servírovací","configTitle":"Konfigurátor stolu","customTitle":"Navrhněte si kus, který bude jen váš.","galleryText":"Výběr z naší dílny — stoly, prkénka a další kousky, které jsme ručně vyrobili.","heroEyebrow":"MASIV · EPOXID · RUČNÍ PRÁCE","contactTitle":"Ozvěte se nám","galleryTitle":"Galerie","aboutCtaTitle":"Máte nápad? Pojďme ho vyrobit.","productsTitle":"Naše produkty","collectionsTitle":"Co vyrábíme"}'::jsonb, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.site_settings (key, value, updated_at) values ('blocks', '{"why":[{"body":"Jen české dřevo s jasným původem.","title":"Poctivý masiv"},{"body":"Originál, který nikdo jiný nemá.","title":"Unikátnost"},{"body":"Oleje a pryskyřice na generace.","title":"Odolnost"},{"body":"Barva, tvar i podnoží dle vás.","title":"Na míru"}],"process":[{"body":"Vybíráme kvalitní český masiv s výrazným charakterem.","title":"Výběr dřeva"},{"body":"Ruční míchání odstínů a pečlivé lití bez bublin.","title":"Zalití pryskyřicí"},{"body":"Postupné broušení do hedvábně hladkého povrchu.","title":"Broušení"},{"body":"Ochranné oleje, které povrch chrání na generace.","title":"Finální olej"}]}'::jsonb, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.site_settings (key, value, updated_at) values ('gallery', '{"photos":["https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/hero.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/t1-vltava.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/new-jantar.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/t3-berounka.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/t2-sazava.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/prkenka-board.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/stoly-tile.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-1.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-2.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-3.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-4.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-5.jpg","https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/ig-6.jpg"]}'::jsonb, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('ee9342fa-d121-4eee-b2dd-c3f1868bee86', 'Jídelní stůl Vltava', 'stoly', 'River stůl z ořechu, epoxidová řeka na míru.', null, 'https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/t1-vltava.jpg', 10, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('f59e1248-9ac7-49cc-b4b4-73c419b5d23f', 'Konferenční stolek Sázava', 'stoly', 'Masivní dub s tmavou pryskyřicí.', null, 'https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/t2-sazava.jpg', 20, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('5f46f590-9961-4c68-877d-9836949c35ba', 'River stůl Berounka', 'stoly', 'Jasan, oceánská modř, ocelové podnoží.', null, 'https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/t3-berounka.jpg', 30, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('ddaec61b-b24c-4c58-bb90-bf9bfa3b5c75', 'Servírovací prkénko Dub', 'prkenka', 'Masivní dub s úchopem, potravinový olej.', 1290, null, 50, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('242272f3-dcf6-41e1-b85b-7f6f12e127c6', 'Prkénko s epoxidovou řekou', 'prkenka', 'Dřevo a černá pryskyřice, každý kus originál.', 1650, 'https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/prkenka-board.jpg', 60, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('9ebfc079-05a3-4907-855d-99b1dbbd7436', 'Nástěnné hodiny Kruh', 'hodiny', 'Kruhové hodiny z masivu s pryskyřicí.', 2490, null, 70, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('cc8a5c27-63a6-440c-8c95-9d576662c18b', 'Hodiny Měsíc epoxid', 'hodiny', 'Tichý strojek, matný povrch.', 3200, null, 80, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('64018e0e-b0d3-48a5-a473-4317ce930ea4', 'Svícen z masivu', 'doplnky', 'Dřevěný svícen s epoxidovým detailem.', 690, null, 90, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('aab65d51-5029-4908-90e7-7e9af01ed7bd', 'Podtácky (sada 4)', 'doplnky', 'Sada čtyř podtácků, dřevo + pryskyřice.', 790, null, 100, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('0d359812-fa6a-4fd9-9564-e19d21dffdc2', 'Dekorativní miska', 'doplnky', 'Ruční miska z ořechu a čiré pryskyřice.', 1100, null, 110, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('d7df9dec-2200-4d50-b84a-f17684ecb784', 'Klíčenka epoxid', 'doplnky', 'Drobný dárek z odřezků a pryskyřice.', 350, null, 120, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

insert into public.products (id, name, category, description, price, image_url, sort_order, visible)
  values ('1ea2b47c-c457-4a2c-8816-fd95f9eedcf7', 'Konferenční stolek Jantar', 'stoly', 'Kulatý stolek, dub a jantarová pryskyřice, geometrické kovové podnoží.', null, 'https://tiqyjtofyneaecjookcx.supabase.co/storage/v1/object/public/media/new-jantar.jpg', 130, true)
  on conflict (id) do update set name=excluded.name, category=excluded.category, description=excluded.description, price=excluded.price, image_url=excluded.image_url, sort_order=excluded.sort_order, visible=excluded.visible;

-- products that were added AFTER this snapshot are not touched.
commit;
