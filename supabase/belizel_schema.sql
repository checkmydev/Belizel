-- Belizel : schéma dédié dans le projet Supabase partagé (wzrcrszfubjsfoaxatvo).
-- À exécuter une fois (SQL editor ou API de gestion), puis ajouter `belizel` aux schémas exposés de l'API
-- (Settings › API › Exposed schemas).
-- Sécurité :
--   * contenus publics du guide (histoires, surcharges)  → lecture anonyme, écriture admin
--   * mode d'emploi (wifi, code boîte à clés)            → jamais lisible en direct ; fonction get_manual(code)
--   * concurrence, réservations, dépenses                → admin uniquement (RLS)

create schema if not exists belizel;
grant usage on schema belizel to anon, authenticated, service_role;

-- Administrateurs (adresses e-mail des comptes Supabase Auth autorisés)
create table if not exists belizel.admins (
  email text primary key,
  name  text,
  created_at timestamptz default now()
);

create or replace function belizel.is_admin() returns boolean
language sql stable security definer set search_path = belizel, public as $$
  select exists (select 1 from belizel.admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

-- Contenus publics éditables (clé → JSON) : 'stories', 'listing', 'events_extra'…
create table if not exists belizel.content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now(),
  updated_by text
);

-- Mode d'emploi (une seule ligne) + code invité
create table if not exists belizel.manual (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  guest_code text not null default 'IZEL2027',
  updated_at timestamptz default now()
);

create or replace function belizel.get_manual(p_code text) returns jsonb
language sql stable security definer set search_path = belizel, public as $$
  select m.data from belizel.manual m where upper(trim(p_code)) = upper(m.guest_code);
$$;

-- Instantanés de l'analyse concurrentielle (sortie de tools/build_comps.py)
create table if not exists belizel.comps_snapshots (
  id bigint generated always as identity primary key,
  scraped date not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- Rentrées : réservations (import CSV Airbnb ou saisie manuelle)
create table if not exists belizel.bookings (
  id uuid primary key default gen_random_uuid(),
  ext_ref text unique,             -- code de confirmation Airbnb
  guest text,
  checkin date not null,
  nights int not null check (nights > 0),
  guests int,
  gross numeric(10,2) default 0,   -- montant payé par le voyageur (hors frais voyageur)
  cleaning numeric(10,2) default 0,
  fee numeric(10,2) default 0,     -- frais de service hôte
  payout numeric(10,2) default 0,  -- versé à l'hôte
  tourist_tax numeric(10,2) default 0,
  status text default 'terminée',
  source text default 'Airbnb',
  notes text,
  demo boolean default false,
  created_at timestamptz default now()
);

-- Sorties : travaux, charges, taxes…
create table if not exists belizel.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null,
  label text not null,
  amount numeric(10,2) not null,
  recurring boolean default false,
  supplier text,
  notes text,
  demo boolean default false,
  created_at timestamptz default now()
);

alter table belizel.admins          enable row level security;
alter table belizel.content         enable row level security;
alter table belizel.manual          enable row level security;
alter table belizel.comps_snapshots enable row level security;
alter table belizel.bookings        enable row level security;
alter table belizel.expenses        enable row level security;

drop policy if exists admins_self   on belizel.admins;
drop policy if exists content_read  on belizel.content;
drop policy if exists content_write on belizel.content;
drop policy if exists manual_admin  on belizel.manual;
drop policy if exists comps_admin   on belizel.comps_snapshots;
drop policy if exists bookings_admin on belizel.bookings;
drop policy if exists expenses_admin on belizel.expenses;

create policy admins_self    on belizel.admins          for select to authenticated using (belizel.is_admin());
create policy content_read   on belizel.content         for select to anon, authenticated using (true);
create policy content_write  on belizel.content         for all    to authenticated using (belizel.is_admin()) with check (belizel.is_admin());
create policy manual_admin   on belizel.manual          for all    to authenticated using (belizel.is_admin()) with check (belizel.is_admin());
create policy comps_admin    on belizel.comps_snapshots for all    to authenticated using (belizel.is_admin()) with check (belizel.is_admin());
create policy bookings_admin on belizel.bookings        for all    to authenticated using (belizel.is_admin()) with check (belizel.is_admin());
create policy expenses_admin on belizel.expenses        for all    to authenticated using (belizel.is_admin()) with check (belizel.is_admin());

grant select on belizel.content to anon;
grant select, insert, update, delete on all tables in schema belizel to authenticated;
grant all on all tables in schema belizel to service_role;
grant execute on function belizel.get_manual(text) to anon, authenticated;
grant execute on function belizel.is_admin() to authenticated;
