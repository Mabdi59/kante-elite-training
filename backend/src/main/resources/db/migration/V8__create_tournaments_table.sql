-- V8: Create tournaments table
CREATE TABLE tournaments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150)  NOT NULL,
    location    VARCHAR(200)  NOT NULL,
    start_date  DATE          NOT NULL,
    end_date    DATE,
    max_teams   INTEGER       NOT NULL,
    description TEXT,
    status      VARCHAR(20)   NOT NULL DEFAULT 'UPCOMING',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tournaments_start_date ON tournaments (start_date);
