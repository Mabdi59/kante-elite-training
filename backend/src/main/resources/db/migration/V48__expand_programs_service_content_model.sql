ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS category VARCHAR(80),
    ADD COLUMN IF NOT EXISTS media_post_id BIGINT,
    ADD COLUMN IF NOT EXISTS cta_label VARCHAR(80),
    ADD COLUMN IF NOT EXISTS cta_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE programs
SET category = COALESCE(NULLIF(category, ''), 'Training'),
    cta_label = COALESCE(NULLIF(cta_label, ''), 'Book This Program'),
    cta_url = COALESCE(NULLIF(cta_url, ''), '/book')
WHERE category IS NULL OR category = '' OR cta_label IS NULL OR cta_label = '' OR cta_url IS NULL OR cta_url = '';

WITH first_program AS (
    SELECT id
    FROM programs
    WHERE active = TRUE
    ORDER BY display_order ASC, created_at ASC
    LIMIT 1
)
UPDATE programs
SET featured = TRUE
WHERE id IN (SELECT id FROM first_program)
  AND NOT EXISTS (SELECT 1 FROM programs WHERE featured = TRUE);

ALTER TABLE programs
    ADD CONSTRAINT fk_programs_media_post
    FOREIGN KEY (media_post_id) REFERENCES media_posts(id)
    ON DELETE SET NULL;
