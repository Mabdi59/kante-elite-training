-- Add phone and emergency_contact to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);

-- Create booking_series table for recurring schedules
CREATE TABLE IF NOT EXISTS booking_series (
    id BIGSERIAL PRIMARY KEY,
    coach_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    program_id BIGINT REFERENCES programs(id) ON DELETE SET NULL,
    title VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,
    weekdays VARCHAR(50) NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Link bookings to series (optional - existing bookings stay unchanged)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS series_id BIGINT REFERENCES booking_series(id) ON DELETE SET NULL;

-- Add stable player and coach linkage to bookings (optional FKs)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS player_profile_id BIGINT REFERENCES player_profiles(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coach_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Junction table: which players belong to a booking_series
CREATE TABLE IF NOT EXISTS booking_series_players (
    series_id BIGINT NOT NULL REFERENCES booking_series(id) ON DELETE CASCADE,
    player_profile_id BIGINT NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (series_id, player_profile_id)
);
