WITH kante_media AS (
    INSERT INTO media_posts (
        media_url,
        media_type,
        caption,
        alt_text,
        media_category,
        created_at
    )
    SELECT
        '/images/coach-kante-profile.png',
        'IMAGE',
        'Coach Kante official profile photo',
        'Coach Kante wearing a white soccer jersey',
        'TRAINING_PHOTO',
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
        SELECT 1
        FROM media_posts
        WHERE media_url = '/images/coach-kante-profile.png'
    )
    RETURNING id
),
existing_media AS (
    SELECT id
    FROM media_posts
    WHERE media_url = '/images/coach-kante-profile.png'
    UNION
    SELECT id FROM kante_media
),
about_profile_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'ABOUT_PROFILE', 1
    FROM existing_media
    WHERE NOT EXISTS (
        SELECT 1
        FROM media_placements
        WHERE placement_key = 'ABOUT_PROFILE'
          AND media_post_id = existing_media.id
    )
),
library_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'MEDIA_LIBRARY', 900
    FROM existing_media
    WHERE NOT EXISTS (
        SELECT 1
        FROM media_placements
        WHERE placement_key = 'MEDIA_LIBRARY'
          AND media_post_id = existing_media.id
    )
)
UPDATE coach_profiles
SET
    headshot_media_post_id = (SELECT id FROM existing_media ORDER BY id LIMIT 1),
    role_title = 'Founder & Elite Trainer',
    active = TRUE,
    featured = TRUE,
    display_order = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(display_name) LIKE '%kante%';
