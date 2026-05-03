CREATE TABLE IF NOT EXISTS payment_records (
    id                 BIGSERIAL PRIMARY KEY,
    registration_id    BIGINT      NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    provider           VARCHAR(40) NOT NULL DEFAULT 'STRIPE',
    stripe_session_id  VARCHAR(255) UNIQUE,
    payment_intent_id  VARCHAR(255),
    amount             NUMERIC(10, 2),
    amount_refunded    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency           VARCHAR(3) NOT NULL DEFAULT 'USD',
    status             VARCHAR(30) NOT NULL,
    checkout_url       TEXT,
    paid_at            TIMESTAMPTZ,
    refunded_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_registration
    ON payment_records(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status
    ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_intent
    ON payment_records(payment_intent_id);

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
    'STRIPE',
    b.stripe_session_id,
    r.price_amount,
    CASE WHEN r.payment_status = 'REFUNDED' THEN COALESCE(r.amount_paid, r.price_amount, 0) ELSE 0 END,
    COALESCE(NULLIF(r.currency, ''), 'USD'),
    r.payment_status,
    CASE WHEN r.payment_status = 'PAID' THEN COALESCE(r.confirmed_at, r.updated_at, r.created_at) ELSE NULL END,
    CASE WHEN r.payment_status = 'REFUNDED' THEN COALESCE(r.updated_at, r.created_at) ELSE NULL END,
    r.created_at,
    r.updated_at
FROM registrations r
JOIN bookings b ON b.id = r.legacy_booking_id
WHERE b.stripe_session_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM payment_records pr WHERE pr.stripe_session_id = b.stripe_session_id
  );
