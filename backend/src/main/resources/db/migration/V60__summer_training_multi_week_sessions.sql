ALTER TABLE events
    ADD COLUMN IF NOT EXISTS primary_media_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS secondary_media_url VARCHAR(500);

ALTER TABLE session_series
    ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(id) ON DELETE SET NULL;

ALTER TABLE training_sessions
    ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS coach_label VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_session_series_event
    ON session_series(event_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_event
    ON training_sessions(event_id);

WITH summer_event AS (
    SELECT id
    FROM events
    WHERE LOWER(title) = 'summer training'
    ORDER BY id
    LIMIT 1
),
summer_program AS (
    SELECT id
    FROM programs
    WHERE slug = 'summer-training'
    ORDER BY id
    LIMIT 1
)
UPDATE events
SET
    title = 'Summer Training',
    description = 'Train hard. Improve. Compete. A three-week summer training program with Coach Kante and Coach Tony. Choose a full five-day week or register for individual drop-in sessions focused on technical, athletic, tactical, and mental development.',
    location = 'Columbus, Ohio',
    venue = 'Kante Elite Training',
    start_date = DATE '2026-07-07',
    end_date = DATE '2026-07-25',
    capacity = 270,
    spots_total = 270,
    price = 125.00,
    status = 'ACTIVE',
    type = 'PROGRAM',
    intensity = 'High',
    coach_name = 'Coach Kante and Coach Tony',
    primary_media_url = '/images/summer-training-tony.jpg',
    secondary_media_url = '/images/summer-training-kante.jpg',
    active = TRUE,
    featured = TRUE,
    allow_waitlist = TRUE,
    display_order = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM summer_event);

UPDATE programs
SET
    price = 30.00,
    price_label = 'Drop-in from $30 per day; full week $125',
    duration_minutes = 120,
    capacity = 18,
    cta_label = 'Register for Summer Training',
    cta_url = '/events',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM programs WHERE slug = 'summer-training' ORDER BY id LIMIT 1);

UPDATE events
SET active = FALSE,
    featured = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id <> (SELECT id FROM events WHERE LOWER(title) = 'summer training' ORDER BY id LIMIT 1);

WITH summer_event AS (
    SELECT id FROM events WHERE LOWER(title) = 'summer training' ORDER BY id LIMIT 1
),
summer_program AS (
    SELECT id FROM programs WHERE slug = 'summer-training' ORDER BY id LIMIT 1
),
weeks AS (
    SELECT 'Week 1' AS title, DATE '2026-07-07' AS start_date, DATE '2026-07-11' AS end_date, 1 AS display_order
    UNION ALL
    SELECT 'Week 2', DATE '2026-07-14', DATE '2026-07-18', 2
    UNION ALL
    SELECT 'Week 3', DATE '2026-07-21', DATE '2026-07-25', 3
),
inserted_series AS (
    INSERT INTO session_series (
        program_id,
        event_id,
        title,
        start_date,
        end_date,
        weekdays,
        start_time,
        duration_minutes,
        capacity,
        location,
        notes,
        active,
        created_at,
        updated_at
    )
    SELECT
        (SELECT id FROM summer_program),
        (SELECT id FROM summer_event),
        title,
        start_date,
        end_date,
        'TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
        '09:00',
        120,
        18,
        'Columbus, Ohio',
        title || ' of Summer Training. Five days of technical, athletic, tactical, and mental development.',
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    FROM weeks
    WHERE NOT EXISTS (
        SELECT 1
        FROM session_series existing
        WHERE existing.event_id = (SELECT id FROM summer_event)
          AND existing.title = weeks.title
    )
    RETURNING id
),
all_series AS (
    SELECT id, title, start_date, end_date
    FROM session_series
    WHERE event_id = (SELECT id FROM summer_event)
      AND title IN ('Week 1', 'Week 2', 'Week 3')
),
week_sessions AS (
    SELECT
        s.id AS series_id,
        s.title AS week_title,
        d::DATE AS scheduled_date,
        CASE
            WHEN EXTRACT(ISODOW FROM d) = 2 THEN 'Coach Kante'
            WHEN EXTRACT(ISODOW FROM d) = 3 THEN 'Coach Tony'
            WHEN EXTRACT(ISODOW FROM d) = 4 THEN 'Coach Kante and Coach Tony'
            WHEN EXTRACT(ISODOW FROM d) = 5 THEN 'Coach Kante'
            ELSE 'Coach Kante and Coach Tony'
        END AS coach_label
    FROM all_series s
    CROSS JOIN LATERAL generate_series(s.start_date, s.end_date, INTERVAL '1 day') d
    WHERE EXTRACT(ISODOW FROM d) BETWEEN 2 AND 6
)
INSERT INTO training_sessions (
    program_id,
    event_id,
    session_series_id,
    scheduled_date,
    start_time,
    end_time,
    timezone,
    location,
    coach_label,
    capacity,
    status,
    notes,
    created_at,
    updated_at
)
SELECT
    (SELECT id FROM summer_program),
    (SELECT id FROM summer_event),
    series_id,
    scheduled_date,
    '09:00',
    '11:00',
    'America/Chicago',
    'Columbus, Ohio',
    coach_label,
    18,
    'SCHEDULED',
    week_title || ' Summer Training session. Assigned coaches: ' || coach_label || '.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM week_sessions
WHERE NOT EXISTS (
    SELECT 1
    FROM training_sessions existing
    WHERE existing.event_id = (SELECT id FROM summer_event)
      AND existing.scheduled_date = week_sessions.scheduled_date
      AND existing.start_time = '09:00'
);
