-- V9: Create teams and team_registrations tables
CREATE TABLE teams (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    captain_name  VARCHAR(100)  NOT NULL,
    contact_email VARCHAR(150)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE team_registrations (
    id             BIGSERIAL PRIMARY KEY,
    tournament_id  BIGINT        NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
    team_id        BIGINT        NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    status         VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_team_tournament UNIQUE (tournament_id, team_id)
);

CREATE INDEX idx_team_registrations_tournament ON team_registrations (tournament_id);
