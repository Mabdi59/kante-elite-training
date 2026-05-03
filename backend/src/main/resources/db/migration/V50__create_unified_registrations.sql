ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS allow_waitlist BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS allow_waitlist BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE registrations (
    id                            BIGSERIAL PRIMARY KEY,
    registration_code             VARCHAR(32)  NOT NULL UNIQUE,
    offering_type                 VARCHAR(20)  NOT NULL,
    program_id                    BIGINT REFERENCES programs(id),
    event_id                      BIGINT REFERENCES events(id),
    registration_type             VARCHAR(30)  NOT NULL,
    status                        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    payment_status                VARCHAR(30)  NOT NULL DEFAULT 'UNPAID',
    source                        VARCHAR(20)  NOT NULL DEFAULT 'PUBLIC',
    participant_name              VARCHAR(120) NOT NULL,
    participant_age               VARCHAR(20),
    participant_email             VARCHAR(150),
    participant_phone             VARCHAR(30),
    guardian_name                 VARCHAR(120),
    guardian_email                VARCHAR(150) NOT NULL,
    guardian_phone                VARCHAR(30),
    emergency_contact_name        VARCHAR(120),
    emergency_contact_phone       VARCHAR(30),
    medical_notes                 TEXT,
    experience_level              VARCHAR(50),
    scheduled_date                DATE,
    scheduled_start_time          VARCHAR(20),
    scheduled_end_time            VARCHAR(20),
    timezone                      VARCHAR(80)  NOT NULL DEFAULT 'America/Chicago',
    price_amount                  NUMERIC(10, 2),
    currency                      VARCHAR(3)   NOT NULL DEFAULT 'USD',
    amount_paid                   NUMERIC(10, 2) DEFAULT 0,
    waiver_accepted               BOOLEAN      NOT NULL DEFAULT FALSE,
    waiver_accepted_at            TIMESTAMPTZ,
    customer_notes                TEXT,
    admin_notes                   TEXT,
    waitlist_position             INTEGER,
    waitlisted_at                 TIMESTAMPTZ,
    cancelled_at                  TIMESTAMPTZ,
    cancelled_by_type             VARCHAR(20),
    cancelled_by_label            VARCHAR(150),
    cancellation_reason           TEXT,
    confirmed_at                  TIMESTAMPTZ,
    completed_at                  TIMESTAMPTZ,
    legacy_booking_id             BIGINT UNIQUE,
    legacy_event_participant_id   BIGINT UNIQUE,
    legacy_program_participant_id BIGINT UNIQUE,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_registrations_single_offering CHECK (
        (offering_type = 'PROGRAM' AND program_id IS NOT NULL AND event_id IS NULL)
        OR
        (offering_type = 'EVENT' AND event_id IS NOT NULL AND program_id IS NULL)
    )
);

CREATE INDEX idx_registrations_program ON registrations(program_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_guardian_email ON registrations(guardian_email);
CREATE INDEX idx_registrations_program_slot ON registrations(program_id, scheduled_date, scheduled_start_time);

CREATE TABLE registration_history (
    id                      BIGSERIAL PRIMARY KEY,
    registration_id          BIGINT       NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    event_type               VARCHAR(50)  NOT NULL,
    message                  TEXT,
    previous_status          VARCHAR(20),
    new_status               VARCHAR(20),
    previous_payment_status  VARCHAR(30),
    new_payment_status       VARCHAR(30),
    actor_type               VARCHAR(20)  NOT NULL,
    actor_label              VARCHAR(150),
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registration_history_registration ON registration_history(registration_id);

INSERT INTO registrations (
    registration_code,
    offering_type,
    program_id,
    registration_type,
    status,
    payment_status,
    source,
    participant_name,
    participant_age,
    guardian_name,
    guardian_email,
    guardian_phone,
    experience_level,
    scheduled_date,
    scheduled_start_time,
    price_amount,
    customer_notes,
    confirmed_at,
    completed_at,
    legacy_booking_id,
    created_at,
    updated_at
)
SELECT
    'BKG-' || b.id,
    'PROGRAM',
    b.program_id,
    'PROGRAM_BOOKING',
    CASE b.booking_status
        WHEN 'RESERVED' THEN 'PENDING'
        WHEN 'CONFIRMED' THEN 'CONFIRMED'
        WHEN 'COMPLETED' THEN 'COMPLETED'
        WHEN 'CANCELLED' THEN 'CANCELLED'
        ELSE 'PENDING'
    END,
    CASE b.payment_status
        WHEN 'PAID' THEN 'PAID'
        WHEN 'REFUNDED' THEN 'REFUNDED'
        WHEN 'NOT_REQUIRED' THEN 'NOT_REQUIRED'
        WHEN 'FAILED' THEN 'UNPAID'
        WHEN 'SUBMITTED' THEN 'PENDING'
        ELSE 'PENDING'
    END,
    'MIGRATION',
    b.player_name,
    b.player_age,
    b.parent_name,
    b.email,
    b.phone,
    b.experience_level,
    b.booking_date,
    b.booking_time,
    p.price,
    b.notes,
    CASE WHEN b.booking_status = 'CONFIRMED' THEN b.created_at ELSE NULL END,
    CASE WHEN b.booking_status = 'COMPLETED' THEN b.updated_at ELSE NULL END,
    b.id,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN programs p ON p.id = b.program_id
WHERE NOT EXISTS (
    SELECT 1 FROM registrations r WHERE r.legacy_booking_id = b.id
);

INSERT INTO registrations (
    registration_code,
    offering_type,
    event_id,
    registration_type,
    status,
    payment_status,
    source,
    participant_name,
    guardian_email,
    price_amount,
    confirmed_at,
    legacy_event_participant_id,
    created_at,
    updated_at
)
SELECT
    'EVT-' || ep.id,
    'EVENT',
    ep.event_id,
    'EVENT_REGISTRATION',
    'CONFIRMED',
    CASE WHEN COALESCE(e.price, 0) > 0 THEN 'UNPAID' ELSE 'NOT_REQUIRED' END,
    'MIGRATION',
    COALESCE(ep.manual_name, pp.name, u.name, 'Registered Player'),
    COALESCE(ep.manual_email, parent.email, u.email),
    e.price,
    ep.created_at,
    ep.id,
    ep.created_at,
    ep.created_at
FROM event_participants ep
JOIN events e ON e.id = ep.event_id
LEFT JOIN users u ON u.id = ep.user_id
LEFT JOIN player_profiles pp ON pp.id = ep.player_profile_id
LEFT JOIN users parent ON parent.id = pp.parent_user_id
WHERE COALESCE(ep.manual_email, parent.email, u.email) IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM registrations r WHERE r.legacy_event_participant_id = ep.id
  );

INSERT INTO registrations (
    registration_code,
    offering_type,
    program_id,
    registration_type,
    status,
    payment_status,
    source,
    participant_name,
    guardian_email,
    price_amount,
    confirmed_at,
    legacy_program_participant_id,
    created_at,
    updated_at
)
SELECT
    'PGM-' || ppn.id,
    'PROGRAM',
    ppn.program_id,
    'ADMIN_ENTRY',
    'CONFIRMED',
    CASE WHEN COALESCE(p.price, 0) > 0 THEN 'UNPAID' ELSE 'NOT_REQUIRED' END,
    'MIGRATION',
    COALESCE(ppn.manual_name, profile.name, u.name, 'Registered Player'),
    COALESCE(ppn.manual_email, parent.email, u.email),
    p.price,
    ppn.created_at,
    ppn.id,
    ppn.created_at,
    ppn.created_at
FROM program_participants ppn
JOIN programs p ON p.id = ppn.program_id
LEFT JOIN users u ON u.id = ppn.user_id
LEFT JOIN player_profiles profile ON profile.id = ppn.player_profile_id
LEFT JOIN users parent ON parent.id = profile.parent_user_id
WHERE COALESCE(ppn.manual_email, parent.email, u.email) IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM registrations r WHERE r.legacy_program_participant_id = ppn.id
  );

INSERT INTO registration_history (
    registration_id,
    event_type,
    message,
    new_status,
    new_payment_status,
    actor_type,
    actor_label,
    created_at
)
SELECT
    id,
    'MIGRATED',
    'Registration created from legacy booking/participant data.',
    status,
    payment_status,
    'MIGRATION',
    'system',
    created_at
FROM registrations
WHERE source = 'MIGRATION';
