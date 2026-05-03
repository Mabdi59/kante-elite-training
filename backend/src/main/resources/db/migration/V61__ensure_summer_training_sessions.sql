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
),
weeks AS (
    SELECT 'Week 1' AS title, DATE '2026-07-07' AS start_date, DATE '2026-07-11' AS end_date
    UNION ALL
    SELECT 'Week 2', DATE '2026-07-14', DATE '2026-07-18'
    UNION ALL
    SELECT 'Week 3', DATE '2026-07-21', DATE '2026-07-25'
),
series_rows AS (
    SELECT
        s.id,
        s.title,
        s.start_date,
        s.end_date
    FROM session_series s
    JOIN weeks w ON w.title = s.title
    WHERE s.event_id = (SELECT id FROM summer_event)
      AND s.program_id = (SELECT id FROM summer_program)
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
    FROM series_rows s
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
