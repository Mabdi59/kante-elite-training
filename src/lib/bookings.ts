/**
 * Shared booking logic — used by the booking API route, checkout confirmation,
 * and Stripe webhook handler.
 *
 * Supports two storage backends (same as the API route):
 *   • Supabase   — when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
 *   • JSON file  — automatic fallback for local development
 */

import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured, type BookingRow } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  program: string;
  date: string;
  time: string;
  playerName: string;
  parentName: string;
  phone: string;
  email: string;
  ageGroup: string;
  experience: string;
  notes: string;
  stripeSessionId: string | null;
  createdAt: string;
}

export type NewBookingData = Omit<Booking, "id" | "createdAt">;

// ─── File-based storage (local dev fallback) ──────────────────────────────────

const DATA_DIR  = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

export function fileReadBookings(): Booking[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, "[]", "utf-8");
      return [];
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Booking[];
  } catch {
    return [];
  }
}

export function fileWriteBookings(bookings: Booking[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function rowToBooking(row: BookingRow): Booking {
  return {
    id:              row.id,
    program:         row.program,
    date:            row.date,
    time:            row.time,
    playerName:      row.player_name,
    parentName:      row.parent_name,
    phone:           row.phone,
    email:           row.email,
    ageGroup:        row.age_group,
    experience:      row.experience,
    notes:           row.notes,
    stripeSessionId: row.stripe_session_id,
    createdAt:       row.created_at,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch already-booked time slots for a given date + program.
 */
export async function getBookedSlots(date: string, program: string): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from("bookings")
      .select("time")
      .eq("date", date)
      .eq("program", program);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Array<{ time: string }>).map((r) => r.time);
  }

  return fileReadBookings()
    .filter((b) => b.date === date && b.program === program)
    .map((b) => b.time);
}

/**
 * Find a booking by its Stripe Checkout Session ID.
 * Returns null if not found.
 */
export async function findBookingByStripeSession(stripeSessionId: string): Promise<Booking | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("stripe_session_id", stripeSessionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return rowToBooking(data as unknown as BookingRow);
  }

  return fileReadBookings().find((b) => b.stripeSessionId === stripeSessionId) ?? null;
}

/**
 * Create a new booking.
 *
 * Returns the created booking on success.
 * Returns null if the slot is already taken (conflict / double-booking).
 *
 * If stripeSessionId is provided and a booking with that ID already exists,
 * the existing booking is returned (idempotent — safe to call from both the
 * webhook handler and the success-page confirmation endpoint).
 */
export async function saveBooking(data: NewBookingData): Promise<Booking | null> {
  // Idempotency: if we already have a booking for this Stripe session, return it.
  if (data.stripeSessionId) {
    const existing = await findBookingByStripeSession(data.stripeSessionId);
    if (existing) return existing;
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    const { data: row, error } = await supabase
      .from("bookings")
      .insert({
        program:           data.program,
        date:              data.date,
        time:              data.time,
        player_name:       data.playerName,
        parent_name:       data.parentName,
        phone:             data.phone,
        email:             data.email,
        age_group:         data.ageGroup,
        experience:        data.experience,
        notes:             data.notes,
        stripe_session_id: data.stripeSessionId ?? null,
      })
      .select()
      .single();

    // Postgres unique violation code = 23505 (slot already booked)
    if (error?.code === "23505") return null;
    if (error) throw new Error(error.message);

    return rowToBooking(row as unknown as BookingRow);
  }

  // File fallback (local dev)
  const bookings = fileReadBookings();
  const conflict = bookings.find(
    (b) => b.date === data.date && b.time === data.time && b.program === data.program
  );
  if (conflict) return null;

  const newBooking: Booking = {
    id:        crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  fileWriteBookings(bookings);
  return newBooking;
}
