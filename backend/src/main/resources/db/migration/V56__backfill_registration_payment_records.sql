-- Close payment coverage gaps before Booking can be retired.
-- Creates a PaymentRecord for paid/refunded/waived registrations and any legacy
-- Stripe booking mirrors that predate the canonical payment_records ledger.

INSERT INTO payment_records (
    registration_id,
    provider,
    stripe_session_id,
    amount,
    amount_refunded,
    currency,
    status,
    paid_at,
    refunded_at,
    created_at,
    updated_at
)
SELECT
    r.id,
    CASE WHEN b.stripe_session_id IS NOT NULL THEN 'STRIPE' ELSE 'MANUAL' END,
    b.stripe_session_id,
    COALESCE(r.price_amount, 0),
    CASE WHEN r.payment_status = 'REFUNDED' THEN COALESCE(r.amount_paid, r.price_amount, 0) ELSE 0 END,
    COALESCE(NULLIF(r.currency, ''), 'USD'),
    r.payment_status,
    CASE WHEN r.payment_status = 'PAID' THEN COALESCE(r.confirmed_at, r.updated_at, r.created_at) ELSE NULL END,
    CASE WHEN r.payment_status = 'REFUNDED' THEN COALESCE(r.updated_at, r.created_at) ELSE NULL END,
    COALESCE(r.created_at, CURRENT_TIMESTAMP),
    COALESCE(r.updated_at, CURRENT_TIMESTAMP)
FROM registrations r
LEFT JOIN bookings b ON b.id = r.legacy_booking_id
WHERE NOT EXISTS (
        SELECT 1 FROM payment_records pr WHERE pr.registration_id = r.id
    )
  AND (
        r.payment_status IN ('PAID', 'REFUNDED', 'WAIVED', 'PARTIALLY_PAID')
        OR b.stripe_session_id IS NOT NULL
    )
ON CONFLICT (stripe_session_id) DO NOTHING;
