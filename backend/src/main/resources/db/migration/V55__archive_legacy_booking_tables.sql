-- Archive legacy booking tables before final retirement.
-- Live tables are intentionally kept in place in this migration.

CREATE TABLE IF NOT EXISTS legacy_bookings AS TABLE bookings WITH NO DATA;
ALTER TABLE legacy_bookings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_legacy_bookings_id ON legacy_bookings (id);

CREATE TABLE IF NOT EXISTS legacy_booking_series AS TABLE booking_series WITH NO DATA;
ALTER TABLE legacy_booking_series ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_legacy_booking_series_id ON legacy_booking_series (id);

CREATE TABLE IF NOT EXISTS legacy_booking_series_players AS TABLE booking_series_players WITH NO DATA;
ALTER TABLE legacy_booking_series_players ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_legacy_booking_series_players_ids
    ON legacy_booking_series_players (series_id, player_profile_id);

DROP TRIGGER IF EXISTS trg_legacy_bookings_read_only ON legacy_bookings;
DROP TRIGGER IF EXISTS trg_legacy_booking_series_read_only ON legacy_booking_series;
DROP TRIGGER IF EXISTS trg_legacy_booking_series_players_read_only ON legacy_booking_series_players;

INSERT INTO legacy_bookings
SELECT b.*, CURRENT_TIMESTAMP
FROM bookings b
ON CONFLICT (id) DO NOTHING;

INSERT INTO legacy_booking_series
SELECT s.*, CURRENT_TIMESTAMP
FROM booking_series s
ON CONFLICT (id) DO NOTHING;

INSERT INTO legacy_booking_series_players
SELECT p.*, CURRENT_TIMESTAMP
FROM booking_series_players p
ON CONFLICT (series_id, player_profile_id) DO NOTHING;

DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT conrelid::regclass AS table_name, conname
        FROM pg_constraint
        WHERE contype = 'f'
          AND confrelid IN ('bookings'::regclass, 'booking_series'::regclass)
          AND conrelid NOT IN (
              'legacy_bookings'::regclass,
              'legacy_booking_series'::regclass,
              'legacy_booking_series_players'::regclass
          )
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', fk.table_name, fk.conname);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION prevent_legacy_booking_archive_write()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Legacy booking archive tables are read-only.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_legacy_bookings_read_only
BEFORE INSERT OR UPDATE OR DELETE ON legacy_bookings
FOR EACH ROW EXECUTE FUNCTION prevent_legacy_booking_archive_write();

CREATE TRIGGER trg_legacy_booking_series_read_only
BEFORE INSERT OR UPDATE OR DELETE ON legacy_booking_series
FOR EACH ROW EXECUTE FUNCTION prevent_legacy_booking_archive_write();

CREATE TRIGGER trg_legacy_booking_series_players_read_only
BEFORE INSERT OR UPDATE OR DELETE ON legacy_booking_series_players
FOR EACH ROW EXECUTE FUNCTION prevent_legacy_booking_archive_write();
