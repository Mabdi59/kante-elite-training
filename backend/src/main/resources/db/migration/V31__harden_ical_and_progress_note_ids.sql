-- Add opaque iCal feed token to users so calendar subscriptions are not guessable by email
ALTER TABLE users ADD COLUMN ical_feed_token VARCHAR(64);
CREATE UNIQUE INDEX idx_users_ical_feed_token ON users(ical_feed_token)
    WHERE ical_feed_token IS NOT NULL;

-- Add stable user-ID foreign keys to player_progress_notes.
-- Email columns remain as display/fallback for external players without accounts.
ALTER TABLE player_progress_notes
    ADD COLUMN player_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN coach_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_progress_notes_player_user ON player_progress_notes(player_user_id);
CREATE INDEX idx_progress_notes_coach_user  ON player_progress_notes(coach_user_id);
