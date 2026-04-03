CREATE TABLE player_progress_notes (
    id                BIGSERIAL PRIMARY KEY,
    player_email      VARCHAR(150) NOT NULL,
    player_name       VARCHAR(100),
    coach_email       VARCHAR(150) NOT NULL,
    coach_name        VARCHAR(100),
    session_date      DATE         NOT NULL,
    note_type         VARCHAR(30)  NOT NULL DEFAULT 'GENERAL',
    title             VARCHAR(255),
    content           TEXT         NOT NULL,
    rating            INTEGER,
    visible_to_parent BOOLEAN      NOT NULL DEFAULT TRUE,
    booking_id        BIGINT       REFERENCES bookings(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_progress_notes_player ON player_progress_notes(player_email);
CREATE INDEX idx_progress_notes_coach  ON player_progress_notes(coach_email);
CREATE INDEX idx_progress_notes_date   ON player_progress_notes(session_date DESC);
