/**
 * Lean Booking System V1
 *
 * Storage: local JSON file (data/bookings.json)
 * → Easy to swap for Supabase or another DB later.
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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

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

function readBookings(): Booking[] {
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

function writeBookings(bookings: Booking[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const program = searchParams.get("program");

  const bookings = readBookings();

  if (date && program) {
    const bookedSlots = bookings
      .filter((b) => b.date === date && b.program === program)
      .map((b) => b.time);
    return NextResponse.json({ bookedSlots });
  }

  return NextResponse.json({ bookings });
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

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const bookings = readBookings();

  // Prevent double-booking: same program + date + time
  const conflict = bookings.find(
    (b) => b.date === date && b.time === time && b.program === program
  );
  if (conflict) {
    return NextResponse.json(
      { error: "This time slot is already booked. Please choose a different time." },
      { status: 409 }
    );
  }

  const newBooking: Booking = {
    id: crypto.randomUUID(),
    program,
    date,
    time,
    playerName,
    parentName: body.parentName ?? "",
    phone,
    email,
    ageGroup: body.ageGroup ?? "",
    experience: body.experience ?? "",
    notes: body.notes ?? "",
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  writeBookings(bookings);

  return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
}
