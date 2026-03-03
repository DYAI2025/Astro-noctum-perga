-- Supabase schema for Astro Noctum
-- Run this in the Supabase SQL editor

create table if not exists users (
  id uuid primary key,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create table if not exists charts (
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

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid references charts(id) on delete cascade,
  content text not null,
  model text not null,
  prompt_type text not null default 'synthesis',
  tokens_used integer not null default 0,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_charts_user_id on charts(user_id);
create index if not exists idx_insights_chart_id on insights(chart_id);

-- Astro Profile: stores the default/demo profile for the dashboard display
create table if not exists astro_profile (
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
  created_at timestamptz default now()
);

create index if not exists idx_astro_profile_user_id on astro_profile(user_id);

-- RLS: enabled with open policies (no auth yet)
alter table users enable row level security;
alter table charts enable row level security;
alter table insights enable row level security;
alter table astro_profile enable row level security;

create policy "Allow all on users" on users for all using (true) with check (true);
create policy "Allow all on charts" on charts for all using (true) with check (true);
create policy "Allow all on insights" on insights for all using (true) with check (true);
create policy "Allow all on astro_profile" on astro_profile for all using (true) with check (true);
