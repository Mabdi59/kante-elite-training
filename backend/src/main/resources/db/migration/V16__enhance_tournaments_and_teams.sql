-- V16: Enhance tournaments and teams tables

-- Add extra fields to tournaments
ALTER TABLE tournaments
    ADD COLUMN age_group              VARCHAR(50),
    ADD COLUMN registration_deadline  DATE,
    ADD COLUMN division               VARCHAR(100),
    ADD COLUMN entry_fee              NUMERIC(10, 2),
    ADD COLUMN notes                  TEXT;

-- Link teams to a registered user (captain ownership)
ALTER TABLE teams
    ADD COLUMN owner_user_id  BIGINT REFERENCES users (id) ON DELETE SET NULL,
    ADD COLUMN phone          VARCHAR(30),
    ADD COLUMN club_name      VARCHAR(150);

CREATE INDEX idx_teams_owner ON teams (owner_user_id);
CREATE INDEX idx_tournaments_status ON tournaments (status);
-- Note: idx_tournaments_start_date already exists from V8
