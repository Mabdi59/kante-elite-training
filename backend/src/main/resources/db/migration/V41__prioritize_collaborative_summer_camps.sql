-- Ensure the collaborative summer camps surface first in public event flows.
-- Preserve legacy seed rows by retiring the old placeholder summer event instead of deleting it.

UPDATE events
SET
    coach_name = 'Coach Kante & Coach Tony',
    display_order = 1
WHERE title = 'Kante Elite Summer Camp â€” Week 1';

UPDATE events
SET
    coach_name = 'Coach Kante & Coach Tony',
    display_order = 2
WHERE title = 'Kante Elite Summer Camp â€” Week 2';

UPDATE events
SET
    status = 'COMPLETED',
    display_order = GREATEST(COALESCE(display_order, 0), 90)
WHERE title = 'Summer Elite Camp 2026'
  AND EXISTS (
      SELECT 1
      FROM events collaborative
      WHERE collaborative.title = 'Kante Elite Summer Camp â€” Week 1'
  )
  AND status <> 'COMPLETED';
