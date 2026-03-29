-- V1: Create programs table
CREATE TABLE programs (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100)   NOT NULL,
    slug             VARCHAR(50)    NOT NULL UNIQUE,
    description      TEXT,
    short_description VARCHAR(255),
    price            NUMERIC(10, 2) NOT NULL,
    price_label      VARCHAR(50),
    duration_minutes INTEGER,
    features         TEXT,
    icon             VARCHAR(10),
    who_its_for      TEXT,
    active           BOOLEAN        NOT NULL DEFAULT TRUE,
    display_order    INTEGER        NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_programs_active_order ON programs (active, display_order);
