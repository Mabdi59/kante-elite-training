CREATE TABLE attendance_records (
    id              BIGSERIAL PRIMARY KEY,
    booking_id      BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    player_email    VARCHAR(150) NOT NULL,
    player_name     VARCHAR(100) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ABSENT',
    coach_notes     TEXT,
    session_date    DATE         NOT NULL,
    recorded_by     VARCHAR(150),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_attendance_booking     ON attendance_records(booking_id);
CREATE INDEX idx_attendance_player      ON attendance_records(player_email);
CREATE INDEX idx_attendance_session_date ON attendance_records(session_date);
CREATE UNIQUE INDEX uq_attendance_booking_player ON attendance_records(booking_id, player_email);
