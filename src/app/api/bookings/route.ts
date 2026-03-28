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
 *      Accepts new field names:
 *        contactName, contactEmail, contactPhone,
 *        athleteName, athleteAge, experienceLevel
 *      Also accepts legacy field names for backward compatibility:
 *        playerName, parentName, phone, email, ageGroup, experience
 *      Returns { success: true, booking: {...} } or { error: string }
 *      409 if the slot is already taken.
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
  let body: Record<string, string | null | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { program, date, time } = body;

  // Accept new field names (preferred) with legacy fallbacks
  const resolvedAthleteN  = (body.athleteName  ?? body.playerName  ?? "").trim();
  const resolvedContactN  = (body.contactName  ?? body.parentName  ?? "").trim();
  const resolvedEmail     = (body.contactEmail ?? body.email       ?? "").trim();
  const resolvedPhone     = (body.contactPhone ?? body.phone       ?? "").trim();
  const resolvedAge       = (body.athleteAge   ?? body.ageGroup    ?? "").trim();
  const resolvedExp       = (body.experienceLevel ?? body.experience ?? "").trim();
  const resolvedNotes     = (body.notes ?? "").trim();
  const stripeSessionId   = body.stripeSessionId ?? null;

  if (!program || !date || !time || !resolvedAthleteN || !resolvedPhone || !resolvedEmail) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: program, date, time, athlete name, phone, and email are required.",
      },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const newBookingData: NewBookingData = {
    program,
    date,
    time,
    playerName:      resolvedAthleteN,
    parentName:      resolvedContactN,
    phone:           resolvedPhone,
    email:           resolvedEmail,
    ageGroup:        resolvedAge,
    experience:      resolvedExp,
    notes:           resolvedNotes,
    stripeSessionId: stripeSessionId ?? null,
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


