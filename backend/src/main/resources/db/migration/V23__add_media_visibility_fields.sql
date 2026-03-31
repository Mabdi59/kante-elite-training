ALTER TABLE media_posts
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE media_posts
    ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE media_posts
    ADD COLUMN IF NOT EXISTS show_on_about BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE media_posts
SET show_on_home = TRUE
WHERE show_on_home = FALSE;

UPDATE media_posts
SET show_on_about = TRUE
WHERE show_on_about = FALSE;

WITH latest_post AS (
    SELECT id
    FROM media_posts
    ORDER BY created_at DESC, id DESC
    LIMIT 1
)
UPDATE media_posts
SET is_featured = TRUE
WHERE id IN (SELECT id FROM latest_post);
