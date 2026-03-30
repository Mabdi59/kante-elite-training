-- V18: Public tournament registration flow improvements

ALTER TABLE team_registrations
    ADD COLUMN guest_access_token         VARCHAR(64),
    ADD COLUMN payment_status             VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    ADD COLUMN payment_method             VARCHAR(50),
    ADD COLUMN payment_reference          VARCHAR(255),
    ADD COLUMN payment_notes              TEXT,
    ADD COLUMN payment_session_id         VARCHAR(255),
    ADD COLUMN payment_submitted_at       TIMESTAMPTZ,
    ADD COLUMN payment_paid_at            TIMESTAMPTZ,
    ADD COLUMN confirmation_email_sent_at TIMESTAMPTZ,
    ADD COLUMN status_email_sent_at       TIMESTAMPTZ,
    ADD COLUMN payment_reminder_sent_at   TIMESTAMPTZ,
    ADD COLUMN roster_reminder_sent_at    TIMESTAMPTZ,
    ADD COLUMN last_follow_up_sent_at     TIMESTAMPTZ,
    ADD COLUMN roster_text                TEXT,
    ADD COLUMN roster_file_name           VARCHAR(255),
    ADD COLUMN roster_file_path           VARCHAR(500),
    ADD COLUMN roster_file_type           VARCHAR(150),
    ADD COLUMN roster_submitted_at        TIMESTAMPTZ;

UPDATE team_registrations
SET guest_access_token = SUBSTRING(md5(random()::text || clock_timestamp()::text || id::text) FROM 1 FOR 32)
WHERE guest_access_token IS NULL;

UPDATE team_registrations tr
SET payment_status = CASE
    WHEN COALESCE(t.entry_fee, 0) > 0 THEN 'PENDING'
    ELSE 'NOT_REQUIRED'
END
FROM tournaments t
WHERE tr.tournament_id = t.id;

ALTER TABLE team_registrations
    ALTER COLUMN guest_access_token SET NOT NULL;

CREATE UNIQUE INDEX uq_team_registrations_guest_access_token
    ON team_registrations (guest_access_token);

CREATE INDEX idx_team_registrations_payment_status
    ON team_registrations (payment_status);

CREATE INDEX idx_team_registrations_payment_session_id
    ON team_registrations (payment_session_id);
