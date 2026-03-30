ALTER TABLE tournaments
    ADD COLUMN IF NOT EXISTS format_type VARCHAR(30) NOT NULL DEFAULT 'ROUND_ROBIN',
    ADD COLUMN IF NOT EXISTS teams_per_group INTEGER,
    ADD COLUMN IF NOT EXISTS advance_per_group INTEGER,
    ADD COLUMN IF NOT EXISTS points_for_win INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN IF NOT EXISTS points_for_draw INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS points_for_loss INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS match_duration_minutes INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS third_place_match_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS team_players (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    jersey_number VARCHAR(20),
    position VARCHAR(80),
    captain BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON team_players(team_id);

CREATE TABLE IF NOT EXISTS tournament_matches (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    home_team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    away_team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    stage_name VARCHAR(100),
    round_name VARCHAR(100),
    match_date DATE,
    kickoff_time TIME,
    venue VARCHAR(150),
    field_name VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    home_score INTEGER,
    away_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_date_time ON tournament_matches(match_date, kickoff_time);
