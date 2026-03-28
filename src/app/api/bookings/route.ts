/**
 * Booking API Route
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
 *
 * Note: When Stripe is configured, bookings are created via the webhook handler
 * or /api/bookings/confirm after payment. This POST route is used for the
 * direct (no-payment) flow in local development.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBookedSlots, saveBooking, type NewBookingData } from "@/lib/bookings";
import { sendBookingConfirmation } from "@/lib/email";

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date    = searchParams.get("date");
  const program = searchParams.get("program");

  if (!date || !program) {
    return NextResponse.json({ bookedSlots: [] });
  }

  try {
    const bookedSlots = await getBookedSlots(date, program);
    return NextResponse.json({ bookedSlots });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Failed to fetch availability." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Partial<NewBookingData & { stripeSessionId?: string }>;
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

  const newBookingData: NewBookingData = {
    program,
    date,
    time,
    playerName,
    parentName:      body.parentName      ?? "",
    phone,
    email,
    ageGroup:        body.ageGroup        ?? "",
    experience:      body.experience      ?? "",
    notes:           body.notes           ?? "",
    stripeSessionId: body.stripeSessionId ?? null,
  };

  try {
    const created = await saveBooking(newBookingData);
    if (!created) {
      return NextResponse.json(
        { error: "This time slot is already booked. Please choose a different time." },
        { status: 409 }
      );
    }
    await sendBookingConfirmation(created);
    return NextResponse.json({ success: true, booking: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Failed to save booking. Please try again." }, { status: 500 });
  }
}


