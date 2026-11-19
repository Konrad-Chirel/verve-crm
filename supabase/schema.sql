-- ============================================================================
-- VERVE CRM — Schéma PostgreSQL & Row Level Security (Supabase)
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase.
-- Les tables sont préfixées par `verve_` pour cohabiter sans conflit.
-- ============================================================================

-- 1. PROFILS D'ASSOCIÉS & CABINETS
create table if not exists public.verve_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  name text not null default 'Konrad B.',
  role text not null default 'Associé gérant',
  agency text not null default 'Atelier Nova',
  monthly_target numeric not null default 50000,
  quarterly_target numeric not null default 160000,
  updated_at timestamptz not null default now()
);

alter table public.verve_profiles enable row level security;

drop policy if exists "verve_profiles_self_all" on public.verve_profiles;
create policy "verve_profiles_self_all"
  on public.verve_profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. SOCIÉTÉS / COMPTES CLIENTS
create table if not exists public.verve_companies (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary_deal_id text not null default '',
  name text not null,
  sector text not null default 'Services & Tech B2B',
  city text not null default 'Paris',
  initials text not null default 'VC',
  color text not null default 'bg-primary text-white',
  primary_contact jsonb not null default '{}'::jsonb,
  active_deals_count integer not null default 1,
  active_deals_description text not null default '',
  cumulative_value numeric not null default 0,
  payment_terms text not null default 'Échéance 30j',
  status text not null default 'Offre en cours',
  status_color text not null default 'primary',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.verve_companies enable row level security;

drop policy if exists "verve_companies_owner_all" on public.verve_companies;
create policy "verve_companies_owner_all"
  on public.verve_companies
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. MANDATS / OPPORTUNITÉS DU PIPELINE
create table if not exists public.verve_deals (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company_id text not null default '',
  company_name text not null,
  company_city text default 'Paris',
  company_sector text default 'Conseil & Tech B2B',
  contact_name text not null default '',
  contact_role text not null default 'Directeur Général',
  contact_email text not null default '',
  contact_phone text not null default '',
  company_initials text not null default 'VC',
  company_color text not null default 'bg-primary text-white',
  amount numeric not null default 0,
  probability integer not null default 25,
  stage_id text not null default 'lead',
  status_badge text not null default 'Nouveau dossier',
  badge_type text default 'normal',
  next_action text default '',
  next_action_date text default '',
  meta_info jsonb not null default '[]'::jsonb,
  notes text default '',
  document_name text default '',
  document_size text default '',
  document_path text default '',
  position integer not null default 0,
  created_at text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.verve_deals enable row level security;

drop policy if exists "verve_deals_owner_all" on public.verve_deals;
create policy "verve_deals_owner_all"
  on public.verve_deals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. RELANCES & FEUILLE DE ROUTE DU JOUR
create table if not exists public.verve_relances (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id text not null default '',
  time_slot text not null default '10:00',
  time_label text not null default 'Matinée',
  contact_name text not null default '',
  contact_role text not null default '',
  company_name text not null default '',
  company_initials text not null default 'VC',
  company_color text not null default 'bg-primary text-white',
  avatar_url text not null default '',
  deal_title text not null default '',
  context_line text not null default '',
  amount numeric not null default 0,
  status_tag text not null default 'Relance',
  action_type text not null default 'call',
  action_label text not null default 'Appeler',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.verve_relances enable row level security;

drop policy if exists "verve_relances_owner_all" on public.verve_relances;
create policy "verve_relances_owner_all"
  on public.verve_relances
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. JOURNAL D'ACTIVITÉS & INTERACTIONS
create table if not exists public.verve_activities (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id text default '',
  company_name text default '',
  type text not null default 'note',
  title text not null,
  badge_text text not null default 'Note interne',
  badge_style text not null default 'mint',
  timestamp text not null default 'À l’instant',
  duration text,
  content text not null default '',
  assigned_to text,
  attachment jsonb,
  status text,
  author text not null default 'Konrad B.',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.verve_activities enable row level security;

drop policy if exists "verve_activities_owner_all" on public.verve_activities;
create policy "verve_activities_owner_all"
  on public.verve_activities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. TRIGGER AUTOMATIQUE D'INITIALISATION DE PROFIL (AVEC SEARCH_PATH VERROUILLÉ)
create or replace function public.handle_new_verve_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.verve_profiles (id, email, name, role, agency)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', 'Associé Verve'),
    coalesce(new.raw_user_meta_data->>'role', 'Associé gérant'),
    coalesce(new.raw_user_meta_data->>'agency_name', 'Atelier Nova')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Migration idempotente pour les bases déjà créées
alter table public.verve_deals
  add column if not exists document_path text default '';

-- 7. BUCKET PRIVÉ SUPABASE STORAGE POUR LES PIÈCES CONTRACTUELLES (verve-documents)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verve-documents',
  'verve-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do nothing;

drop policy if exists "verve_docs_select_own" on storage.objects;
create policy "verve_docs_select_own"
  on storage.objects for select
  using (bucket_id = 'verve-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verve_docs_insert_own" on storage.objects;
create policy "verve_docs_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'verve-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verve_docs_update_own" on storage.objects;
create policy "verve_docs_update_own"
  on storage.objects for update
  using (bucket_id = 'verve-documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'verve-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verve_docs_delete_own" on storage.objects;
create policy "verve_docs_delete_own"
  on storage.objects for delete
  using (bucket_id = 'verve-documents' and (storage.foldername(name))[1] = auth.uid()::text);

