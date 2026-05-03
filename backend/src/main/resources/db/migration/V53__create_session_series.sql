CREATE TABLE IF NOT EXISTS session_series (
    id                       BIGSERIAL PRIMARY KEY,
    program_id               BIGINT      NOT NULL REFERENCES programs(id),
    coach_user_id            BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    legacy_booking_series_id BIGINT      UNIQUE REFERENCES booking_series(id) ON DELETE SET NULL,
    title                    VARCHAR(200),
    start_date               DATE        NOT NULL,
    end_date                 DATE        NOT NULL,
    weekdays                 VARCHAR(100) NOT NULL,
    start_time               VARCHAR(20) NOT NULL,
    duration_minutes         INTEGER     NOT NULL DEFAULT 60,
    capacity                 INTEGER     NOT NULL DEFAULT 1,
    location                 VARCHAR(200),
    notes                    TEXT,
    active                   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_series_program
    ON session_series(program_id);
CREATE INDEX IF NOT EXISTS idx_session_series_coach
    ON session_series(coach_user_id);
CREATE INDEX IF NOT EXISTS idx_session_series_active
    ON session_series(active);

CREATE TABLE IF NOT EXISTS session_series_players (
    series_id         BIGINT NOT NULL REFERENCES session_series(id) ON DELETE CASCADE,
    player_profile_id BIGINT NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (series_id, player_profile_id)
);

ALTER TABLE training_sessions
    ADD COLUMN IF NOT EXISTS session_series_id BIGINT REFERENCES session_series(id);

CREATE INDEX IF NOT EXISTS idx_training_sessions_session_series
    ON training_sessions(session_series_id);

INSERT INTO session_series (
    program_id,
    coach_user_id,
    legacy_booking_series_id,
    title,
    start_date,
    end_date,
    weekdays,
    start_time,
    duration_minutes,
    capacity,
    location,
    notes,
    active,
    created_at,
    updated_at
)
SELECT
    bs.program_id,
    bs.coach_user_id,
    bs.id,
    bs.title,
    bs.start_date,
    COALESCE(bs.end_date, bs.start_date + INTERVAL '12 weeks' - INTERVAL '1 day')::DATE,
    bs.weekdays,
    bs.booking_time,
    COALESCE(bs.duration_minutes, 60),
    GREATEST(1, COALESCE(player_counts.player_count, 1)),
    p.location,
    bs.notes,
    bs.active,
    bs.created_at,
    bs.updated_at
FROM booking_series bs
JOIN programs p ON p.id = bs.program_id
LEFT JOIN (
    SELECT series_id, COUNT(*)::INTEGER AS player_count
    FROM booking_series_players
    GROUP BY series_id
) player_counts ON player_counts.series_id = bs.id
WHERE bs.program_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM session_series ss WHERE ss.legacy_booking_series_id = bs.id
  );

INSERT INTO session_series_players (series_id, player_profile_id)
SELECT ss.id, bsp.player_profile_id
FROM booking_series_players bsp
JOIN session_series ss ON ss.legacy_booking_series_id = bsp.series_id
ON CONFLICT DO NOTHING;

UPDATE training_sessions ts
SET session_series_id = ss.id
FROM session_series ss
WHERE ts.booking_series_id = ss.legacy_booking_series_id
  AND ts.session_series_id IS NULL;
