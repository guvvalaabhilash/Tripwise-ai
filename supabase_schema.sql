-- ============================================================
-- TripWise AI — Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables.
-- ============================================================

-- ── 1. profiles ──────────────────────────────────────────────
-- Mirrors auth.users so the app can store editable profile data.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ── 2. trips ──────────────────────────────────────────────────
create table if not exists public.trips (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  trip_name        text not null,
  destination      text not null,
  start_date       date,
  end_date         date,
  budget           numeric(12, 2) default 0,
  spent            numeric(12, 2) default 0,
  travelers        int default 1,
  transport        text,
  accommodation    text,
  food_preference  text,
  status           text default 'planned',  -- planned | active | completed
  image            text,
  created_at       timestamptz default now()
);

alter table public.trips enable row level security;

create policy "Users can read own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete
  using (auth.uid() = user_id);


-- ── 3. expenses ───────────────────────────────────────────────
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid not null references public.trips(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  amount          numeric(12, 2) not null default 0,
  category        text not null default 'other',  -- food | transport | accommodation | activities | shopping | other
  expense_date    date not null default current_date,
  paid_by         uuid not null references auth.users(id),
  paid_by_name    text,
  split_between   uuid[] default '{}',
  status          text default 'paid',            -- paid | pending
  created_at      timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Users can read expenses for their trips"
  on public.expenses for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.trips t
      where t.id = expenses.trip_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can insert expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);


-- ── 4. user_settings ─────────────────────────────────────────
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  theme      text default 'dark',
  toggles    jsonb default '{}',
  selects    jsonb default '{}',
  updated_at timestamptz default now()
);

alter table public.user_settings enable row level security;

create policy "Users can read own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can upsert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);


-- ── 5. Enable realtime for live updates ──────────────────────
-- Run these in the Supabase dashboard → Database → Replication
-- or uncomment and execute here:

-- alter publication supabase_realtime add table public.trips;
-- alter publication supabase_realtime add table public.expenses;
