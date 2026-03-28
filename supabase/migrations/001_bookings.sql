-- Lean Booking System V1 — Supabase migration
-- Run this in your Supabase project via: Supabase Dashboard → SQL Editor → New query
-- Or using the Supabase CLI: supabase db push

create table if not exists bookings (
  id           uuid primary key default gen_random_uuid(),
  program      text        not null,
  date         date        not null,
  time         text        not null,
  player_name  text        not null,
  parent_name  text        not null default '',
  phone        text        not null,
  email        text        not null,
  age_group    text        not null default '',
  experience   text        not null default '',
  notes        text        not null default '',
  created_at   timestamptz not null default now()
);

-- Prevent double-booking: same program + date + time slot can only be booked once
create unique index if not exists bookings_program_date_time_unique
  on bookings (program, date, time);

-- Index for the most common query (fetch booked slots for a given date + program)
create index if not exists bookings_date_program_idx
  on bookings (date, program);

-- Row Level Security: all access goes through the service role key in the API route,
-- so we lock down direct client access.
alter table bookings enable row level security;

-- No public access — only the server-side service role can read/write
create policy "No public access" on bookings
  for all
  using (false);
