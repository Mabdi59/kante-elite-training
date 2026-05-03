ALTER TABLE events
    ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO events (
    title,
    description,
    location,
    venue,
    start_date,
    end_date,
    age_group,
    spots_total,
    spots_left,
    capacity,
    price,
    status,
    type,
    intensity,
    coach_name,
    active,
    featured,
    allow_waitlist,
    display_order,
    created_at,
    updated_at
)
SELECT
    'Summer Training',
    'Train hard. Improve. Compete. A focused summer training collaboration led by Coach Kante with Coach Tony for technical, athletic, tactical, and mental development.',
    'Columbus, Ohio',
    'Kante Elite Training',
    DATE '2026-06-01',
    DATE '2026-08-31',
    'Ages 8-18',
    24,
    24,
    24,
    0.00,
    'ACTIVE',
    'PROGRAM',
    'High',
    'Coach Kante and Coach Tony',
    TRUE,
    TRUE,
    TRUE,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM events WHERE LOWER(title) = 'summer training'
);

UPDATE events
SET active = CASE WHEN LOWER(title) = 'summer training' THEN TRUE ELSE FALSE END,
    featured = CASE WHEN LOWER(title) = 'summer training' THEN TRUE ELSE FALSE END,
    status = CASE WHEN LOWER(title) = 'summer training' THEN 'ACTIVE' ELSE status END,
    display_order = CASE WHEN LOWER(title) = 'summer training' THEN 0 ELSE COALESCE(display_order, 100) END,
    updated_at = CURRENT_TIMESTAMP;

UPDATE events
SET description = 'Train hard. Improve. Compete. A focused summer training collaboration led by Coach Kante with Coach Tony for technical, athletic, tactical, and mental development.',
    location = 'Columbus, Ohio',
    venue = 'Kante Elite Training',
    age_group = 'Ages 8-18',
    spots_total = COALESCE(NULLIF(spots_total, 0), 24),
    spots_left = GREATEST(COALESCE(spots_left, 24), 0),
    capacity = COALESCE(NULLIF(capacity, 0), 24),
    price = COALESCE(price, 0.00),
    type = 'PROGRAM',
    intensity = 'High',
    coach_name = 'Coach Kante and Coach Tony',
    allow_waitlist = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(title) = 'summer training';
