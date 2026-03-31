ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS location VARCHAR(200),
    ADD COLUMN IF NOT EXISTS start_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS end_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'UPCOMING';

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS start_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS end_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS capacity INTEGER;

UPDATE events
SET capacity = COALESCE(capacity, spots_total, 20);

ALTER TABLE events
    ALTER COLUMN capacity SET NOT NULL,
    ALTER COLUMN capacity SET DEFAULT 20;

UPDATE events
SET status = CASE
    WHEN UPPER(COALESCE(status, '')) IN ('UPCOMING', 'ACTIVE', 'COMPLETED') THEN UPPER(status)
    WHEN UPPER(COALESCE(status, '')) IN ('OPEN', 'DRAFT', 'FULL', 'CLOSED') THEN 'UPCOMING'
    WHEN UPPER(COALESCE(status, '')) = 'CANCELLED' THEN 'COMPLETED'
    ELSE 'UPCOMING'
END;

CREATE TABLE IF NOT EXISTS program_participants (
    id BIGSERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    player_profile_id BIGINT REFERENCES player_profiles(id) ON DELETE SET NULL,
    manual_name VARCHAR(100),
    manual_email VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_participants (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    player_profile_id BIGINT REFERENCES player_profiles(id) ON DELETE SET NULL,
    manual_name VARCHAR(100),
    manual_email VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_program_participants_program_id ON program_participants(program_id);
CREATE INDEX IF NOT EXISTS idx_program_participants_user_id ON program_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_program_participants_player_profile_id ON program_participants(player_profile_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_player_profile_id ON event_participants(player_profile_id);
