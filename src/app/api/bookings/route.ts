/**
 * Lean Booking System — API Route
 *
 * Storage:
 *   • Supabase (production)  — used when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
 *   • data/bookings.json     — automatic fallback for local development
 *
 * GET  /api/bookings?date=YYYY-MM-DD&program=<id>
 *      Returns { bookedSlots: string[] } for the given date+program.
 *
 * POST /api/bookings
 *      Body: { program, date, time, playerName, parentName, phone, email, ageGroup, experience, notes }
 *      Returns { success: true, booking: {...} } or { error: string }
 *      409 if the slot is already taken.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured, type BookingRow } from "@/lib/supabase";
import { sendBookingConfirmation } from "@/lib/email";

// ─── Shared booking shape (camelCase, used throughout the app) ────────────────

interface Booking {
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
  createdAt: string;
}

// ─── File-based storage (local dev fallback) ───────────────────────────────────

const DATA_DIR  = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

function fileReadBookings(): Booking[] {
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

function fileWriteBookings(bookings: Booking[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

// ─── Supabase storage ─────────────────────────────────────────────────────────

/** Fetch booked time slots from Supabase for a given date + program. */
async function supabaseGetBookedSlots(date: string, program: string): Promise<string[]> {
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("bookings")
    .select("time")
    .eq("date", date)
    .eq("program", program);

  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{ time: string }>).map((row) => row.time);
}

/** Insert a new booking into Supabase.
 *  Returns null if the slot is already taken (unique constraint violation).
 *  Throws on any other error.
 */
async function supabaseCreateBooking(booking: Omit<Booking, "id" | "createdAt">): Promise<Booking | null> {
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      program:     booking.program,
      date:        booking.date,
      time:        booking.time,
      player_name: booking.playerName,
      parent_name: booking.parentName,
      phone:       booking.phone,
      email:       booking.email,
      age_group:   booking.ageGroup,
      experience:  booking.experience,
      notes:       booking.notes,
    })
    .select()
    .single();

  // Postgres unique violation code = 23505
  if (error?.code === "23505") return null;
  if (error) throw new Error(error.message);

  const row = data as unknown as BookingRow;
  return {
    id:         row.id,
    program:    row.program,
    date:       row.date,
    time:       row.time,
    playerName: row.player_name,
    parentName: row.parent_name,
    phone:      row.phone,
    email:      row.email,
    ageGroup:   row.age_group,
    experience: row.experience,
    notes:      row.notes,
    createdAt:  row.created_at,
  };
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date    = searchParams.get("date");
  const program = searchParams.get("program");

  if (!date || !program) {
    return NextResponse.json({ bookedSlots: [] });
  }

  try {
    if (isSupabaseConfigured()) {
      const bookedSlots = await supabaseGetBookedSlots(date, program);
      return NextResponse.json({ bookedSlots });
    }

    // File fallback
    const bookings   = fileReadBookings();
    const bookedSlots = bookings
      .filter((b) => b.date === date && b.program === program)
      .map((b) => b.time);
    return NextResponse.json({ bookedSlots });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Failed to fetch availability." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Partial<Booking>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { program, date, time, playerName, phone, email } = body;

  if (!program || !date || !time || !playerName || !phone || !email) {
    return NextResponse.json(
      { error: "Missing required fields: program, date, time, playerName, phone, email." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const newBookingData = {
    program,
    date,
    time,
    playerName,
    parentName: body.parentName ?? "",
    phone,
    email,
    ageGroup:   body.ageGroup ?? "",
    experience: body.experience ?? "",
    notes:      body.notes ?? "",
  };

  try {
    if (isSupabaseConfigured()) {
      const created = await supabaseCreateBooking(newBookingData);
      if (!created) {
        return NextResponse.json(
          { error: "This time slot is already booked. Please choose a different time." },
          { status: 409 }
        );
      }
      await sendBookingConfirmation(created);
      return NextResponse.json({ success: true, booking: created }, { status: 201 });
    }

    // File fallback
    const bookings = fileReadBookings();
    const conflict  = bookings.find(
      (b) => b.date === date && b.time === time && b.program === program
    );
    if (conflict) {
      return NextResponse.json(
        { error: "This time slot is already booked. Please choose a different time." },
        { status: 409 }
      );
    }

    const newBooking: Booking = {
      id:        crypto.randomUUID(),
      ...newBookingData,
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    fileWriteBookings(bookings);

    await sendBookingConfirmation(newBooking);
    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Failed to save booking. Please try again." }, { status: 500 });
  }
}

