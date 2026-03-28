/**
 * Email confirmation helper — powered by Resend.
 *
 * Required environment variables (set in .env.local or your hosting dashboard):
 *   RESEND_API_KEY  — your Resend API key (from resend.com → API Keys)
 *   EMAIL_FROM      — verified sender address (e.g. "Kante Elite <bookings@yourdomain.com>")
 *
 * When RESEND_API_KEY is absent the helper is a no-op, so local dev works
 * without any email setup.
 */

import { Resend } from "resend";

interface BookingDetails {
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
}

function formatDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildConfirmationHtml(booking: BookingDetails): string {
  const shortId = booking.id.slice(0, 8).toUpperCase();
  const rows = [
    ["Program",     booking.program],
    ["Date",        formatDate(booking.date)],
    ["Time",        booking.time],
    ["Player",      booking.playerName],
    ...(booking.parentName ? [["Parent / Guardian", booking.parentName]] : []),
    ["Phone",       booking.phone],
    ...(booking.ageGroup  ? [["Age Group",  booking.ageGroup]]  : []),
    ...(booking.experience ? [["Experience", booking.experience]] : []),
    ...(booking.notes     ? [["Notes",      booking.notes]]     : []),
  ] as [string, string][];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#d97706;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:8px 12px;color:#e5e7eb;">${value}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222222;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:32px 32px 24px;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">⚽</p>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#000;letter-spacing:-0.5px;">Booking Confirmed</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#78350f;font-weight:600;">Kante Elite Training Academy</p>
          </td>
        </tr>

        <!-- Booking ID -->
        <tr>
          <td style="padding:20px 32px 0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
            <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#f59e0b;letter-spacing:2px;">KE-${shortId}</p>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:20px 32px;">
            <table role="presentation" width="100%" style="border-collapse:collapse;background:#1a1a1a;border-radius:8px;overflow:hidden;">
              ${tableRows}
            </table>
          </td>
        </tr>

        <!-- What to bring -->
        <tr>
          <td style="padding:0 32px 20px;">
            <table role="presentation" width="100%" style="background:#1c1a0e;border:1px solid #d97706;border-radius:8px;padding:16px;">
              <tr>
                <td>
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#d97706;">📋 What to bring</p>
                  <ul style="margin:0;padding:0 0 0 18px;color:#d1d5db;font-size:13px;line-height:1.8;">
                    <li>Athletic footwear (cleats or turf shoes)</li>
                    <li>Water bottle</li>
                    <li>Personal football (if you have one)</li>
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #222222;">
            <p style="margin:0;font-size:12px;color:#4b5563;">
              Questions? Reply to this email or contact us directly.<br>
              <span style="color:#d97706;font-weight:600;">Kante Elite Training Academy</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildConfirmationText(booking: BookingDetails): string {
  const shortId = booking.id.slice(0, 8).toUpperCase();
  return [
    "BOOKING CONFIRMED — Kante Elite Training Academy",
    "",
    `Booking Reference: KE-${shortId}`,
    "",
    `Program:  ${booking.program}`,
    `Date:     ${formatDate(booking.date)}`,
    `Time:     ${booking.time}`,
    `Player:   ${booking.playerName}`,
    ...(booking.parentName ? [`Parent:   ${booking.parentName}`] : []),
    `Phone:    ${booking.phone}`,
    ...(booking.ageGroup  ? [`Age:      ${booking.ageGroup}`]  : []),
    ...(booking.experience ? [`Level:    ${booking.experience}`] : []),
    ...(booking.notes     ? [`Notes:    ${booking.notes}`]     : []),
    "",
    "What to bring: athletic footwear, water bottle, personal football.",
    "",
    "Questions? Reply to this email.",
    "— Kante Elite Training Academy",
  ].join("\n");
}

/**
 * Sends a booking confirmation email to the customer.
 * Silently skips if RESEND_API_KEY is not configured (e.g. local dev).
 */
export async function sendBookingConfirmation(booking: BookingDetails): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // graceful no-op in local dev

  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.warn(
      "[sendBookingConfirmation] EMAIL_FROM is not set — skipping confirmation email. " +
      "Add EMAIL_FROM to your environment variables (e.g. 'Kante Elite <bookings@yourdomain.com>')."
    );
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to:      [booking.email],
    subject: `Booking Confirmed — KE-${booking.id.slice(0, 8).toUpperCase()} | ${booking.program}`,
    html:    buildConfirmationHtml(booking),
    text:    buildConfirmationText(booking),
  });

  if (error) {
    // Log but don't throw — a failed email must never break a successful booking
    console.error("[sendBookingConfirmation]", error);
  }
}
