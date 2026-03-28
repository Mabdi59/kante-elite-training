/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for a booking and returns the redirect URL.
 *
 * Body: { program, date, time, playerName, parentName, phone, email, ageGroup, experience, notes }
 * Returns: { url: string }  — the Stripe-hosted checkout page URL
 *
 * All booking details are stored in Stripe session metadata so they can be
 * retrieved by the webhook handler and the confirmation endpoint without
 * needing to pass data through the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured, PROGRAM_PRICES } from "@/lib/stripe";
import { getBookedSlots } from "@/lib/bookings";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  let body: Record<string, string>;
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

  const priceInfo = PROGRAM_PRICES[program];
  if (!priceInfo) {
    return NextResponse.json({ error: "Unknown program." }, { status: 400 });
  }

  // Pre-check availability before sending the user to Stripe — avoids them
  // paying for an already-booked slot. The DB constraint is the ultimate guard.
  try {
    const bookedSlots = await getBookedSlots(date, program);
    if (bookedSlots.includes(time)) {
      return NextResponse.json(
        { error: "This time slot is already booked. Please choose a different time." },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("[POST /api/checkout] availability check failed", err);
    // Don't block checkout on availability check failure; DB constraint is the safety net
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const stripe = getStripeClient()!;

  try {
    const session = await stripe.checkout.sessions.create({
      mode:           "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency:     priceInfo.currency,
            unit_amount:  priceInfo.amount,
            product_data: { name: priceInfo.name },
          },
          quantity: 1,
        },
      ],
      metadata: {
        program,
        date,
        time,
        player_name:  playerName,
        parent_name:  body.parentName  ?? "",
        phone,
        email,
        age_group:    body.ageGroup    ?? "",
        experience:   body.experience  ?? "",
        // Truncate notes to 500 chars (Stripe metadata value limit)
        notes:        (body.notes ?? "").slice(0, 500),
      },
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/book`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session. Please try again." }, { status: 500 });
  }
}
