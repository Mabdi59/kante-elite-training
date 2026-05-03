ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS secondary_media_post_id BIGINT,
    ADD COLUMN IF NOT EXISTS coach_names TEXT,
    ADD COLUMN IF NOT EXISTS season_label VARCHAR(80),
    ADD COLUMN IF NOT EXISTS campaign_label VARCHAR(120);

DO $$ BEGIN
    ALTER TABLE programs
        ADD CONSTRAINT fk_programs_secondary_media_post
        FOREIGN KEY (secondary_media_post_id) REFERENCES media_posts(id)
        ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

WITH tony_media AS (
    INSERT INTO media_posts (media_url, media_type, caption, alt_text, media_category, created_at)
    SELECT
        '/images/summer-training-tony.jpg',
        'IMAGE',
        'Summer Training promotional banner with Coach Tony',
        'Summer Training promotional banner for Coach Tony and the Train hard Improve Compete campaign',
        'TRAINING_PHOTO',
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
        SELECT 1 FROM media_posts WHERE media_url = '/images/summer-training-tony.jpg'
    )
    RETURNING id
),
tony_media_selected AS (
    SELECT id FROM tony_media
    UNION
    SELECT id FROM media_posts WHERE media_url = '/images/summer-training-tony.jpg'
    LIMIT 1
),
kante_media AS (
    INSERT INTO media_posts (media_url, media_type, caption, alt_text, media_category, created_at)
    SELECT
        '/images/summer-training-kante.jpg',
        'IMAGE',
        'Summer Training promotional banner with Coach Kante credentials',
        'Summer Training promotional banner for Coach Kante credentials and playing experience',
        'TRAINING_PHOTO',
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
        SELECT 1 FROM media_posts WHERE media_url = '/images/summer-training-kante.jpg'
    )
    RETURNING id
),
kante_media_selected AS (
    SELECT id FROM kante_media
    UNION
    SELECT id FROM media_posts WHERE media_url = '/images/summer-training-kante.jpg'
    LIMIT 1
),
tony_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'MEDIA_LIBRARY', 930 FROM tony_media_selected
    ON CONFLICT DO NOTHING
),
kante_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'MEDIA_LIBRARY', 931 FROM kante_media_selected
    ON CONFLICT DO NOTHING
)
INSERT INTO programs (
    name,
    slug,
    description,
    short_description,
    category,
    media_post_id,
    secondary_media_post_id,
    coach_names,
    season_label,
    campaign_label,
    location,
    capacity,
    status,
    price,
    duration_minutes,
    price_label,
    features,
    icon,
    who_its_for,
    cta_label,
    cta_url,
    featured,
    active,
    allow_waitlist,
    display_order,
    created_at,
    updated_at
)
SELECT
    'Summer Training',
    'summer-training',
    'Train hard. Improve. Compete. Summer Training is a collaborative seasonal program led by Coach Kante and Coach Tony for players who want focused technical, athletic, tactical, and mental development in a competitive training environment.',
    'A featured summer program with Coach Kante and Coach Tony focused on technical, athletic, tactical, and mental development.',
    'Seasonal Program',
    (SELECT id FROM tony_media_selected),
    (SELECT id FROM kante_media_selected),
    'Coach Kante|Coach Tony',
    'Summer',
    'Train hard. Improve. Compete.',
    'Columbus, Ohio',
    24,
    'ACTIVE',
    0.00,
    90,
    'Registration open',
    'Coach Kante and Coach Tony collaborative training|Coach Kante: USSF licensed, former Division 2 Ohio Dominican player, G-MAC All-Conference honoree, Somali National Team player|Coach Tony: Adidas All American, USSF and UEFA licensed, former Division 1 Wright State player, semi-pro experience|Technical ball mastery, first touch, and finishing detail|Athletic speed, agility, and movement standards|Tactical decision-making and game intelligence|Mental confidence, composure, and competitive habits|Train hard. Improve. Compete.',
    'Summer',
    'Players ready for focused summer development with competitive standards',
    'Register for Summer Training',
    '/book?program=summer-training',
    TRUE,
    TRUE,
    TRUE,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    category = EXCLUDED.category,
    media_post_id = EXCLUDED.media_post_id,
    secondary_media_post_id = EXCLUDED.secondary_media_post_id,
    coach_names = EXCLUDED.coach_names,
    season_label = EXCLUDED.season_label,
    campaign_label = EXCLUDED.campaign_label,
    location = EXCLUDED.location,
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status,
    price = EXCLUDED.price,
    duration_minutes = EXCLUDED.duration_minutes,
    price_label = EXCLUDED.price_label,
    features = EXCLUDED.features,
    icon = EXCLUDED.icon,
    who_its_for = EXCLUDED.who_its_for,
    cta_label = EXCLUDED.cta_label,
    cta_url = EXCLUDED.cta_url,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active,
    allow_waitlist = EXCLUDED.allow_waitlist,
    display_order = EXCLUDED.display_order,
    updated_at = CURRENT_TIMESTAMP;
