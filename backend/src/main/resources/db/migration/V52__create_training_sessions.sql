CREATE TABLE IF NOT EXISTS training_sessions (
    id                 BIGSERIAL PRIMARY KEY,
    program_id          BIGINT      NOT NULL REFERENCES programs(id),
    booking_series_id   BIGINT      REFERENCES booking_series(id),
    scheduled_date      DATE        NOT NULL,
    start_time          VARCHAR(20) NOT NULL,
    end_time            VARCHAR(20),
    timezone            VARCHAR(80) NOT NULL DEFAULT 'America/Chicago',
    location            VARCHAR(200),
    coach_user_id       BIGINT      REFERENCES users(id),
    capacity            INTEGER     NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    notes               TEXT,
    legacy_booking_id   BIGINT      UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_program_slot
    ON training_sessions(program_id, scheduled_date, start_time);
CREATE INDEX IF NOT EXISTS idx_training_sessions_coach
    ON training_sessions(coach_user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status
    ON training_sessions(status);

ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS training_session_id BIGINT REFERENCES training_sessions(id);

CREATE INDEX IF NOT EXISTS idx_registrations_training_session
    ON registrations(training_session_id);

ALTER TABLE attendance_records
    ALTER COLUMN booking_id DROP NOT NULL;

ALTER TABLE attendance_records
    ADD COLUMN IF NOT EXISTS training_session_id BIGINT REFERENCES training_sessions(id),
    ADD COLUMN IF NOT EXISTS registration_id BIGINT REFERENCES registrations(id);

CREATE INDEX IF NOT EXISTS idx_attendance_training_session
    ON attendance_records(training_session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_registration
    ON attendance_records(registration_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_session_registration
    ON attendance_records(training_session_id, registration_id)
    WHERE training_session_id IS NOT NULL AND registration_id IS NOT NULL;

ALTER TABLE player_progress_notes
    ADD COLUMN IF NOT EXISTS training_session_id BIGINT REFERENCES training_sessions(id),
    ADD COLUMN IF NOT EXISTS registration_id BIGINT REFERENCES registrations(id);

CREATE INDEX IF NOT EXISTS idx_progress_notes_training_session
    ON player_progress_notes(training_session_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_registration
    ON player_progress_notes(registration_id);

INSERT INTO training_sessions (
    program_id,
    booking_series_id,
    scheduled_date,
    start_time,
    timezone,
    location,
    coach_user_id,
    capacity,
    status,
    notes,
    legacy_booking_id,
    created_at,
    updated_at
)
SELECT
    b.program_id,
    b.series_id,
    b.booking_date,
    b.booking_time,
    'America/Chicago',
    p.location,
    b.coach_user_id,
    1,
    CASE b.booking_status
        WHEN 'COMPLETED' THEN 'COMPLETED'
        WHEN 'CANCELLED' THEN 'CANCELLED'
        ELSE 'SCHEDULED'
    END,
    b.notes,
    b.id,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN programs p ON p.id = b.program_id
WHERE NOT EXISTS (
    SELECT 1 FROM training_sessions s WHERE s.legacy_booking_id = b.id
);

UPDATE registrations r
SET training_session_id = s.id
FROM training_sessions s
WHERE r.legacy_booking_id = s.legacy_booking_id
  AND r.training_session_id IS NULL;

UPDATE attendance_records a
SET training_session_id = s.id,
    registration_id = r.id
FROM training_sessions s
JOIN registrations r ON r.training_session_id = s.id
WHERE a.booking_id = s.legacy_booking_id
  AND (a.training_session_id IS NULL OR a.registration_id IS NULL);

UPDATE player_progress_notes n
SET training_session_id = s.id,
    registration_id = r.id
FROM training_sessions s
JOIN registrations r ON r.training_session_id = s.id
WHERE n.booking_id = s.legacy_booking_id
  AND (n.training_session_id IS NULL OR n.registration_id IS NULL);
