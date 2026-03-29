-- V13: Availability rules and blocked slots
CREATE TABLE availability_rules (
    id           BIGSERIAL PRIMARY KEY,
    day_of_week  INTEGER      NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time   TIME         NOT NULL,
    end_time     TIME         NOT NULL,
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN availability_rules.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';

CREATE TABLE blocked_slots (
    id         BIGSERIAL PRIMARY KEY,
    slot_date  DATE         NOT NULL,
    slot_time  VARCHAR(20),
    reason     VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN blocked_slots.slot_time IS 'NULL means the entire day is blocked';

CREATE INDEX idx_blocked_slots_date ON blocked_slots (slot_date);
