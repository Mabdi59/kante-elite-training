/**
 * GET /api/bookings/confirm?session_id=cs_...
 *
 * Called by the success page after Stripe redirects the customer back.
 * Verifies the Stripe Checkout Session is paid, then creates (or retrieves)
 * the booking idempotently.
 *
 * This endpoint acts as a safety net: in production the webhook usually fires
 * first, so the booking already exists. In local development (no webhook), this
 * endpoint creates the booking directly.
 *
 * Returns: { booking: Booking }
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { saveBooking, findBookingByStripeSession } from "@/lib/bookings";
import { sendBookingConfirmation } from "@/lib/email";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = getStripeClient()!;

  // Retrieve session from Stripe to verify payment
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[GET /api/bookings/confirm] failed to retrieve session", err);
    return NextResponse.json({ error: "Could not verify payment. Please contact support." }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment has not been completed." }, { status: 402 });
  }

  // Check if webhook already created the booking
  const existing = await findBookingByStripeSession(sessionId);
  if (existing) {
    return NextResponse.json({ booking: existing });
  }

  // Webhook hasn't fired yet (or is disabled in local dev) — create booking now
  const meta = session.metadata ?? {};
  const booking = await saveBooking({
    program:         meta.program        ?? "",
    date:            meta.date           ?? "",
    time:            meta.time           ?? "",
    playerName:      meta.player_name    ?? "",
    parentName:      meta.parent_name    ?? "",
    phone:           meta.phone          ?? "",
    email:           meta.email          ?? (session.customer_email ?? ""),
    ageGroup:        meta.age_group      ?? "",
    experience:      meta.experience     ?? "",
    notes:           meta.notes          ?? "",
    stripeSessionId: session.id,
  });

  if (!booking) {
    return NextResponse.json(
      { error: "This time slot was just booked by someone else. Please contact us to arrange a refund." },
      { status: 409 }
    );
  }

  await sendBookingConfirmation(booking);
  return NextResponse.json({ booking });
}
