WITH ranked_event_registrations AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY event_id, LOWER(guardian_email)
            ORDER BY created_at ASC, id ASC
        ) AS duplicate_rank
    FROM registrations
    WHERE event_id IS NOT NULL
      AND guardian_email IS NOT NULL
      AND status <> 'CANCELLED'
)
UPDATE registrations r
SET status = 'CANCELLED',
    cancelled_at = NOW(),
    cancelled_by_type = 'SYSTEM',
    cancelled_by_label = 'migration',
    cancellation_reason = 'Duplicate legacy event registration deactivated during registration cleanup.',
    updated_at = NOW()
FROM ranked_event_registrations ranked
WHERE r.id = ranked.id
  AND ranked.duplicate_rank > 1;

INSERT INTO registration_history (
    registration_id,
    event_type,
    message,
    previous_status,
    new_status,
    actor_type,
    actor_label,
    created_at
)
SELECT
    r.id,
    'CANCELLED',
    'Duplicate legacy event registration deactivated during registration cleanup.',
    'CONFIRMED',
    'CANCELLED',
    'SYSTEM',
    'migration',
    NOW()
FROM registrations r
WHERE r.cancelled_by_label = 'migration'
  AND r.cancellation_reason = 'Duplicate legacy event registration deactivated during registration cleanup.'
  AND NOT EXISTS (
      SELECT 1
      FROM registration_history h
      WHERE h.registration_id = r.id
        AND h.event_type = 'CANCELLED'
        AND h.actor_label = 'migration'
        AND h.message = 'Duplicate legacy event registration deactivated during registration cleanup.'
  );
