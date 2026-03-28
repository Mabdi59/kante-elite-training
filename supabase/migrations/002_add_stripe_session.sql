-- Migration 002: Add Stripe session tracking to bookings
-- Run this in your Supabase project via: Supabase Dashboard → SQL Editor → New query
-- Or using the Supabase CLI: supabase db push

-- Add Stripe Checkout Session ID column (nullable — existing/dev bookings won't have it)
alter table bookings
  add column if not exists stripe_session_id text;

-- Unique index on stripe_session_id (partial — only when not null) for idempotency:
-- prevents duplicate booking creation if both the webhook and success page fire at once.
create unique index if not exists bookings_stripe_session_id_unique
  on bookings (stripe_session_id)
  where stripe_session_id is not null;

-- Index for quick lookup by session id
create index if not exists bookings_stripe_session_id_idx
  on bookings (stripe_session_id)
  where stripe_session_id is not null;
