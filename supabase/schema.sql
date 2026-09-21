-- EpoxArt database schema.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: everything is idempotent.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin allow-list. Only emails listed here can change anything, even if
-- someone manages to create a Supabase account. Add the owner with:
--   insert into public.admins (email) values ('owner@example.com');
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- no policies on purpose: the table is only readable through is_admin() below

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    join public.admins a on lower(a.email) = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (category in ('stoly', 'prkenka', 'hodiny', 'doplnky')),
  description text not null default '' check (char_length(description) <= 600),
  price integer check (price is null or price >= 0),  -- null = "Cena na dotaz"
  image_url text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (visible or public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site settings: texts, images, shipping, configurator options (one row each)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key check (key in ('texts', 'images', 'shipping', 'configurator')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings
  for select using (true);

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Inquiries (contact form + custom-table configurator)
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'custom')),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320 and email like '%_@_%'),
  subject text check (subject is null or char_length(subject) <= 300),
  message text check (message is null or char_length(message) <= 5000),
  config jsonb check (config is null or pg_column_size(config) < 4096),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;

-- Visitors may only INSERT. They can never read anyone's messages.
drop policy if exists "inquiries anyone can send" on public.inquiries;
create policy "inquiries anyone can send" on public.inquiries
  for insert to anon, authenticated with check (is_read = false);

drop policy if exists "inquiries admin read" on public.inquiries;
create policy "inquiries admin read" on public.inquiries
  for select using (public.is_admin());

drop policy if exists "inquiries admin update" on public.inquiries;
create policy "inquiries admin update" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries admin delete" on public.inquiries;
create policy "inquiries admin delete" on public.inquiries
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Photo storage (public bucket: anyone can view, only the admin can change)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 8388608,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

drop policy if exists "media admin read" on storage.objects;
create policy "media admin read" on storage.objects
  for select using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Starter products (only inserted while the table is empty)
-- ---------------------------------------------------------------------------
insert into public.products (name, category, description, price, sort_order)
select * from (values
  ('Jídelní stůl Vltava',        'stoly',   'River stůl z ořechu, epoxidová řeka na míru.',        null::integer, 10),
  ('Konferenční stolek Sázava',  'stoly',   'Masivní dub s tmavou pryskyřicí.',                    null, 20),
  ('River stůl Berounka',        'stoly',   'Jasan, oceánská modř, ocelové podnoží.',              null, 30),
  ('Prkénko Ořech kulaté',       'prkenka', 'Servírovací prkénko z olejovaného ořechu.',           890,  40),
  ('Servírovací prkénko Dub',    'prkenka', 'Masivní dub s úchopem, potravinový olej.',            1290, 50),
  ('Prkénko s epoxidovou řekou', 'prkenka', 'Dřevo a modrá pryskyřice, každý kus originál.',       1650, 60),
  ('Nástěnné hodiny Kruh',       'hodiny',  'Kruhové hodiny z masivu s pryskyřicí.',               2490, 70),
  ('Hodiny Měsíc epoxid',        'hodiny',  'Tichý strojek, matný povrch.',                        3200, 80),
  ('Svícen z masivu',            'doplnky', 'Dřevěný svícen s epoxidovým detailem.',               690,  90),
  ('Podtácky (sada 4)',          'doplnky', 'Sada čtyř podtácků, dřevo + pryskyřice.',             790,  100),
  ('Dekorativní miska',          'doplnky', 'Ruční miska z ořechu a čiré pryskyřice.',             1100, 110),
  ('Klíčenka epoxid',            'doplnky', 'Drobný dárek z odřezků a pryskyřice.',                350,  120)
) as seed(name, category, description, price, sort_order)
where not exists (select 1 from public.products);
