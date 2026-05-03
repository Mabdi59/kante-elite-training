ALTER TABLE coach_profiles
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS role_title VARCHAR(120),
    ADD COLUMN IF NOT EXISTS headshot_media_post_id BIGINT,
    ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS booking_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

UPDATE coach_profiles cp
SET display_name = COALESCE(NULLIF(cp.display_name, ''), u.name),
    role_title = COALESCE(NULLIF(cp.role_title, ''), 'Coach')
FROM users u
WHERE cp.user_id = u.id;

UPDATE coach_profiles
SET display_name = COALESCE(NULLIF(display_name, ''), 'Kante Elite Coach'),
    role_title = COALESCE(NULLIF(role_title, ''), 'Coach')
WHERE display_name IS NULL OR display_name = '' OR role_title IS NULL OR role_title = '';

ALTER TABLE coach_profiles
    ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE coach_profiles
    ADD CONSTRAINT fk_coach_profiles_headshot_media
    FOREIGN KEY (headshot_media_post_id) REFERENCES media_posts(id)
    ON DELETE SET NULL;
