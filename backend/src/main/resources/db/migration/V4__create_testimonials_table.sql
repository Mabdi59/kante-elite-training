-- V4: Create testimonials table
CREATE TABLE testimonials (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    role_or_context VARCHAR(150),
    quote           TEXT         NOT NULL,
    rating          INTEGER      NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    featured        BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_featured ON testimonials (featured, display_order);
