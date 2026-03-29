-- V15: Player profiles table
CREATE TABLE player_profiles (
    id                 BIGSERIAL PRIMARY KEY,
    parent_user_id     BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name               VARCHAR(100)  NOT NULL,
    date_of_birth      DATE,
    age                INTEGER,
    skill_level        VARCHAR(50),
    preferred_position VARCHAR(50),
    notes              TEXT,
    active             BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_player_profiles_parent ON player_profiles (parent_user_id);
CREATE INDEX idx_player_profiles_active ON player_profiles (active);
