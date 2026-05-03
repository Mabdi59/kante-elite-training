WITH kante_media AS (
    INSERT INTO media_posts (media_url, media_type, caption, alt_text, media_category, created_at)
    SELECT
        'https://github.com/user-attachments/assets/c11a0a39-8a1f-470c-83a1-354b0085e4e4',
        'IMAGE',
        'Coach Kante public profile headshot',
        'Coach Kante profile image',
        'TRAINING_PHOTO',
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
        SELECT 1 FROM coach_profiles WHERE display_name = 'Coach Kante'
    )
    RETURNING id
),
kante_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'MEDIA_LIBRARY', 910 FROM kante_media
),
kante_profile AS (
    INSERT INTO coach_profiles (
        display_name,
        role_title,
        bio,
        headshot_media_post_id,
        specialties,
        certifications,
        instagram_url,
        booking_url,
        featured,
        display_order,
        active,
        created_at,
        updated_at
    )
    SELECT
        'Coach Kante',
        'Founder & Elite Trainer',
        'Founder of Kante Elite Training. Coach Kante brings competitive playing experience, clear technical standards, and a development-first training style for players who want to improve with purpose.',
        id,
        'Technical development|Private training|Game-ready habits|Player confidence',
        'Former Division 2 player at Ohio Dominican University|G-MAC All-Conference honoree|Somali National Team player|USSF licensed coach',
        'https://www.instagram.com/kanteelitetraining_/',
        '/book',
        TRUE,
        10,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    FROM kante_media
),
tony_media AS (
    INSERT INTO media_posts (media_url, media_type, caption, alt_text, media_category, created_at)
    SELECT
        'https://github.com/user-attachments/assets/5c4c6725-8476-4a1c-a6f7-72a940c60d0d',
        'IMAGE',
        'Coach Tony public profile headshot',
        'Coach Tony profile image',
        'TRAINING_PHOTO',
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
        SELECT 1 FROM coach_profiles WHERE display_name = 'Coach Tony'
    )
    RETURNING id
),
tony_placement AS (
    INSERT INTO media_placements (media_post_id, placement_key, display_order)
    SELECT id, 'MEDIA_LIBRARY', 920 FROM tony_media
)
INSERT INTO coach_profiles (
    display_name,
    role_title,
    bio,
    headshot_media_post_id,
    specialties,
    certifications,
    booking_url,
    featured,
    display_order,
    active,
    created_at,
    updated_at
)
SELECT
    'Coach Tony',
    'Elite Trainer',
    'Elite trainer supporting Kante Elite players through high-level technical detail, competitive standards, and focused summer development work.',
    id,
    'Technical training|Summer development|Competitive preparation|Player movement',
    'Former Division 1 player at Wright State University|Semi-professional playing experience|USSF and UEFA licensed coach',
    '/book',
    FALSE,
    20,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tony_media;
