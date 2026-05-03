-- Final Booking retirement: canonical operations now use registrations,
-- training_sessions, session_series, and payment_records.
-- Read-only archive tables from V55 are intentionally retained.

ALTER TABLE IF EXISTS attendance_records DROP COLUMN IF EXISTS booking_id;
ALTER TABLE IF EXISTS player_progress_notes DROP COLUMN IF EXISTS booking_id;
ALTER TABLE IF EXISTS registrations DROP COLUMN IF EXISTS legacy_booking_id;
ALTER TABLE IF EXISTS training_sessions DROP COLUMN IF EXISTS legacy_booking_id;
ALTER TABLE IF EXISTS training_sessions DROP COLUMN IF EXISTS booking_series_id;
ALTER TABLE IF EXISTS session_series DROP COLUMN IF EXISTS legacy_booking_series_id;

DROP TABLE IF EXISTS booking_series_players;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS booking_series;
