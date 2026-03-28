/**
 * Stripe server-side client.
 *
 * Required environment variables (set in .env.local or your hosting dashboard):
 *   STRIPE_SECRET_KEY         — secret key from Stripe Dashboard → Developers → API keys
 *   STRIPE_WEBHOOK_SECRET     — webhook signing secret from Stripe Dashboard → Webhooks
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — publishable key (exposed to browser, safe to share)
 *
 * When STRIPE_SECRET_KEY is absent the helpers return null/false and the
 * booking flow falls back to the direct (no-payment) path automatically.
 */

import Stripe from "stripe";

/** Returns a Stripe client, or null if STRIPE_SECRET_KEY is not set. */
export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Numeric prices in cents (USD) for each program. */
export const PROGRAM_PRICES: Record<string, { name: string; amount: number; currency: string }> = {
  private:   { name: "Private Training — 1-on-1 personalized coaching",   amount: 7500,  currency: "usd" },
  group:     { name: "Small Group Training — 2–4 players, team dynamics",  amount: 4000,  currency: "usd" },
  speed:     { name: "Speed & Agility — Athletic performance development",  amount: 5000,  currency: "usd" },
  technical: { name: "Technical Development — Ball mastery & skills",       amount: 4500,  currency: "usd" },
  camp:      { name: "Training Camp — Intensive week-long program",         amount: 20000, currency: "usd" },
};
