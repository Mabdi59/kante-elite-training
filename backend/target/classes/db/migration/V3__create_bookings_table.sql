-- V3: Create bookings table
CREATE TABLE bookings (
    id                BIGSERIAL PRIMARY KEY,
    program_id        BIGINT         NOT NULL REFERENCES programs (id),
    booking_date      DATE           NOT NULL,
    booking_time      VARCHAR(20)    NOT NULL,
    player_name       VARCHAR(100)   NOT NULL,
    player_age        VARCHAR(20),
    parent_name       VARCHAR(100),
    email             VARCHAR(150)   NOT NULL,
    phone             VARCHAR(30)    NOT NULL,
    experience_level  VARCHAR(50),
    notes             TEXT,
    payment_status    VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    booking_status    VARCHAR(20)    NOT NULL DEFAULT 'RESERVED',
    stripe_session_id VARCHAR(255)   UNIQUE,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookings_program_date_time UNIQUE (program_id, booking_date, booking_time)
);

CREATE INDEX idx_bookings_program_date ON bookings (program_id, booking_date);
CREATE INDEX idx_bookings_stripe_session ON bookings (stripe_session_id);
CREATE INDEX idx_bookings_email ON bookings (email);
