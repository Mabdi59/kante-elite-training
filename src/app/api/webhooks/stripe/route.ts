/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. The primary event is `checkout.session.completed`,
 * which fires after a customer successfully pays. This is the most reliable way
 * to confirm a booking — it works even if the customer closes the browser before
 * the success page loads.
 *
 * Required env var: STRIPE_WEBHOOK_SECRET
 * Set this to the signing secret shown in Stripe Dashboard → Webhooks.
 *
 * For local testing: install the Stripe CLI and run:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { saveBooking } from "@/lib/bookings";
import { sendBookingConfirmation } from "@/lib/email";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET is not set — skipping signature verification.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  // Read raw body — required for Stripe signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook/stripe] signature verification failed", err);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process sessions that were paid (not still pending for e.g. bank transfers)
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    try {
      await createBookingFromSession(stripe, session);
    } catch (err) {
      console.error("[webhook/stripe] failed to create booking", err);
      // Return 500 so Stripe retries the webhook delivery
      return NextResponse.json({ error: "Booking creation failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

/** Creates a booking from a completed Stripe Checkout Session (idempotent). */
async function createBookingFromSession(
  _stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<void> {
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
    // Slot conflict — two customers paid for the same slot concurrently.
    // Log this prominently; a manual refund is required.
    console.error(
      `[webhook/stripe] SLOT CONFLICT — payment received but slot already booked. ` +
      `Stripe session: ${session.id}. ` +
      `Slot: ${meta.program} / ${meta.date} / ${meta.time}. ` +
      `Issue a refund in the Stripe Dashboard.`
    );
    return;
  }

  await sendBookingConfirmation(booking);
}
