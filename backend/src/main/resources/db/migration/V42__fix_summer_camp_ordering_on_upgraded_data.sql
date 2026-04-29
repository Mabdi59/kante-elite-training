-- Harden the collaborative summer camp ordering for databases that already had legacy event seed data.
-- Match on stable schedule fields instead of title punctuation so upgraded environments stay consistent.

UPDATE events
SET
    coach_name = 'Coach Kante & Coach Tony',
    status = 'UPCOMING',
    display_order = 1
WHERE start_date = DATE '2026-07-07'
  AND title LIKE 'Kante Elite Summer Camp%';

UPDATE events
SET
    coach_name = 'Coach Kante & Coach Tony',
    status = 'UPCOMING',
    display_order = 1
WHERE start_date = DATE '2026-07-14'
  AND title LIKE 'Kante Elite Summer Camp%';

UPDATE events
SET
    status = 'COMPLETED',
    display_order = 90
WHERE title = 'Summer Elite Camp 2026'
  AND venue = 'Walnut Ridge Athletic Complex'
  AND EXISTS (
      SELECT 1
      FROM events collaborative
      WHERE collaborative.start_date = DATE '2026-07-07'
        AND collaborative.title LIKE 'Kante Elite Summer Camp%'
  )
  AND status <> 'COMPLETED';
