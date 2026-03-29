-- V2: Create events table
CREATE TABLE events (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(150)   NOT NULL,
    description   TEXT,
    location      VARCHAR(200)   NOT NULL,
    venue         VARCHAR(200),
    start_date    DATE           NOT NULL,
    end_date      DATE,
    age_group     VARCHAR(50),
    spots_total   INTEGER,
    spots_left    INTEGER,
    price         NUMERIC(10, 2) NOT NULL,
    status        VARCHAR(50)    NOT NULL DEFAULT 'OPEN',
    type          VARCHAR(50),
    intensity     VARCHAR(50),
    display_order INTEGER        NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_start_date ON events (start_date);
CREATE INDEX idx_events_status ON events (status);
