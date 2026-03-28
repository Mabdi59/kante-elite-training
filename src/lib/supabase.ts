/**
 * Server-side Supabase client.
 *
 * Uses the SERVICE ROLE key (never exposed to the browser) so the API route
 * can bypass Row Level Security and read/write bookings freely.
 *
 * Required environment variables (set in .env.local or your hosting dashboard):
 *   SUPABASE_URL          — your project URL (e.g. https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — service role secret key
 */

import { createClient } from "@supabase/supabase-js";

/** Shape of a row in the `bookings` table. */
export interface BookingRow {
  id: string;
  program: string;
  date: string;
  time: string;
  player_name: string;
  parent_name: string;
  phone: string;
  email: string;
  age_group: string;
  experience: string;
  notes: string;
  stripe_session_id: string | null;
  created_at: string;
}

/** Returns a Supabase client, or null if env vars are not configured. */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

