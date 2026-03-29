-- V14: Expand role model and add coach_profiles table
-- The users.role column is already VARCHAR(20) so no DDL change needed for existing data.
-- New roles: STAFF, COACH, PARENT, PLAYER, TEAM_CAPTAIN (add alongside ADMIN, USER)

CREATE TABLE coach_profiles (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    bio            TEXT,
    specialties    TEXT,
    certifications TEXT,
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coach_profiles_user_id ON coach_profiles (user_id);
CREATE INDEX idx_coach_profiles_active  ON coach_profiles (active);
