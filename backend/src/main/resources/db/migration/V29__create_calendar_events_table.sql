CREATE TABLE calendar_events (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    event_type   VARCHAR(50)  NOT NULL,
    start_at     TIMESTAMPTZ  NOT NULL,
    end_at       TIMESTAMPTZ,
    location     VARCHAR(255),
    owner_email  VARCHAR(150),
    entity_type  VARCHAR(100),
    entity_id    BIGINT,
    all_day      BOOLEAN      NOT NULL DEFAULT FALSE,
    color        VARCHAR(20),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_calendar_owner    ON calendar_events(owner_email);
CREATE INDEX idx_calendar_start    ON calendar_events(start_at);
CREATE INDEX idx_calendar_type     ON calendar_events(event_type);
