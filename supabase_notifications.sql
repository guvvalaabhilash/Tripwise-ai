-- ============================================================
-- TripWise AI — Notifications Table + Triggers
-- Run this ONCE in your Supabase SQL Editor.
-- This does NOT touch any existing tables.
-- ============================================================

-- ── 1. notifications table ────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  message    text not null,
  type       text not null default 'info',   -- info | success | warning | expense
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ── 2. Enable realtime ────────────────────────────────────────
alter publication supabase_realtime add table public.notifications;

-- ── 3. Trigger function — fires when a trip is inserted ───────
create or replace function public.notify_on_trip_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    new.user_id,
    '✈️ Trip Created',
    'Your trip to ' || new.destination || ' has been planned.',
    'success'
  );
  return new;
end;
$$;

drop trigger if exists trip_created_notification on public.trips;
create trigger trip_created_notification
  after insert on public.trips
  for each row execute function public.notify_on_trip_insert();

-- ── 4. Trigger function — fires when a trip is updated ────────
create or replace function public.notify_on_trip_update()
returns trigger language plpgsql security definer as $$
begin
  -- Only notify on meaningful status changes
  if old.status is distinct from new.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.user_id,
      '🗺️ Trip Updated',
      'Your trip to ' || new.destination || ' status changed to ' || new.status || '.',
      'info'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trip_updated_notification on public.trips;
create trigger trip_updated_notification
  after update on public.trips
  for each row execute function public.notify_on_trip_update();

-- ── 5. Trigger function — fires when an expense is inserted ───
create or replace function public.notify_on_expense_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    new.user_id,
    '💸 Expense Added',
    'New expense "' || new.title || '" of ₹' || new.amount::text || ' recorded.',
    'expense'
  );
  return new;
end;
$$;

drop trigger if exists expense_created_notification on public.expenses;
create trigger expense_created_notification
  after insert on public.expenses
  for each row execute function public.notify_on_expense_insert();

-- ── 6. Trigger function — fires when an expense is deleted ────
create or replace function public.notify_on_expense_delete()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    old.user_id,
    '🗑️ Expense Removed',
    'Expense "' || old.title || '" has been deleted.',
    'warning'
  );
  return old;
end;
$$;

drop trigger if exists expense_deleted_notification on public.expenses;
create trigger expense_deleted_notification
  after delete on public.expenses
  for each row execute function public.notify_on_expense_delete();

-- ── 7. Trigger — profile updated ──────────────────────────────
create or replace function public.notify_on_profile_update()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    new.id,
    '👤 Profile Updated',
    'Your profile information has been updated.',
    'info'
  );
  return new;
end;
$$;

drop trigger if exists profile_updated_notification on public.profiles;
create trigger profile_updated_notification
  after update on public.profiles
  for each row execute function public.notify_on_profile_update();
