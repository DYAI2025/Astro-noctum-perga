-- Supabase schema for Astro Noctum
-- Run this in the Supabase SQL editor

create table if not exists users (
  id uuid primary key,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- 1. birth_data: Historie der Eingaben
create table if not exists birth_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  birth_utc text not null,
  lat double precision not null,
  lon double precision not null,
  place_label text,
  tz_id text,
  created_at timestamptz default now()
);

-- 2. natal_charts: Archiv für vorberechnete BAFE-Rohdaten (ersetzt charts)
create table if not exists natal_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  birth_date text not null,
  birth_time text not null,
  location_name text not null,
  tz_id text not null,
  geo_lon_deg double precision not null,
  geo_lat_deg double precision not null,
  local_datetime text not null,
  chart_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 3. astro_profiles: Speichert Berechnungen + Gemini-Interpretation (Write-Once / Upsert fähig)
create table if not exists astro_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  sun_sign text,
  moon_sign text,
  ascendant text,
  bazi_year text,
  bazi_year_char text,
  bazi_month text,
  bazi_month_char text,
  day_master text,
  day_master_char text,
  hour_master text,
  hour_master_char text,
  astro_json jsonb,
  astro_computed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id)
);

-- 4. insights: (Bestehend) Verweist auf natal_charts
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid references natal_charts(id) on delete cascade,
  content text not null,
  model text not null,
  prompt_type text not null default 'synthesis',
  tokens_used integer not null default 0,
  created_at timestamptz default now()
);

-- 5. agent_conversations: ElevenLabs Memory
create table if not exists agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  summary text not null,
  topics jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_birth_data_user_id on birth_data(user_id);
create index if not exists idx_natal_charts_user_id on natal_charts(user_id);
create index if not exists idx_astro_profiles_user_id on astro_profiles(user_id);
create index if not exists idx_agent_conversations_user_id on agent_conversations(user_id);
create index if not exists idx_insights_chart_id on insights(chart_id);

-- RLS: enabled with open policies (for dev)
alter table users enable row level security;
alter table birth_data enable row level security;
alter table natal_charts enable row level security;
alter table astro_profiles enable row level security;
alter table insights enable row level security;
alter table agent_conversations enable row level security;

create policy "Allow all on users" on users for all using (true) with check (true);
create policy "Allow all on birth_data" on birth_data for all using (true) with check (true);
create policy "Allow all on natal_charts" on natal_charts for all using (true) with check (true);
create policy "Allow all on astro_profiles" on astro_profiles for all using (true) with check (true);
create policy "Allow all on insights" on insights for all using (true) with check (true);
create policy "Allow all on agent_conversations" on agent_conversations for all using (true) with check (true);
