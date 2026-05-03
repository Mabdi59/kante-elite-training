WITH playing_media AS (
    INSERT INTO media_posts (
        media_url,
        media_type,
        caption,
        alt_text,
        media_category,
        created_at
    )
    SELECT
        '/images/coach-kante-playing-background.png',
        'IMAGE',
        'Coach Kante playing background photo',
        'Coach Kante warming up with teammates on the field',
        'TRAINING_PHOTO',
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
        SELECT 1
        FROM media_posts
        WHERE media_url = '/images/coach-kante-playing-background.png'
    )
    RETURNING id
),
existing_media AS (
    SELECT id
    FROM media_posts
    WHERE media_url = '/images/coach-kante-playing-background.png'
    UNION
    SELECT id FROM playing_media
),
hero_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'ABOUT_HERO', 1
    FROM existing_media
    WHERE NOT EXISTS (
        SELECT 1
        FROM media_placements
        WHERE media_post_id = existing_media.id
          AND placement_key = 'ABOUT_HERO'
    )
),
gallery_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'ABOUT_GALLERY', 1
    FROM existing_media
    WHERE NOT EXISTS (
        SELECT 1
        FROM media_placements
        WHERE media_post_id = existing_media.id
          AND placement_key = 'ABOUT_GALLERY'
    )
)
INSERT INTO media_placements (media_post_id, placement_key, display_order)
SELECT id, 'MEDIA_LIBRARY', 895
FROM existing_media
WHERE NOT EXISTS (
    SELECT 1
    FROM media_placements
    WHERE media_post_id = existing_media.id
      AND placement_key = 'MEDIA_LIBRARY'
);
