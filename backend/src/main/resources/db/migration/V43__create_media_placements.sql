CREATE TABLE media_placements (
    id BIGSERIAL PRIMARY KEY,
    media_post_id BIGINT NOT NULL REFERENCES media_posts(id) ON DELETE CASCADE,
    placement_key VARCHAR(40) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uk_media_placements_post_key UNIQUE (media_post_id, placement_key)
);

CREATE INDEX idx_media_placements_key_order
    ON media_placements (placement_key, display_order, id);

INSERT INTO media_placements (media_post_id, placement_key, display_order)
SELECT id, 'MEDIA_LIBRARY', COALESCE(display_order, 0)
FROM media_posts
ON CONFLICT DO NOTHING;

INSERT INTO media_placements (media_post_id, placement_key, display_order)
SELECT id, 'HOME_GALLERY', COALESCE(home_display_order, display_order, 0)
FROM media_posts
WHERE show_on_home = TRUE
ON CONFLICT DO NOTHING;

INSERT INTO media_placements (media_post_id, placement_key, display_order)
SELECT id, 'ABOUT_GALLERY', COALESCE(about_display_order, display_order, 0)
FROM media_posts
WHERE show_on_about = TRUE
ON CONFLICT DO NOTHING;

INSERT INTO media_placements (media_post_id, placement_key, display_order)
SELECT id, 'HOME_HERO', 1
FROM media_posts
WHERE is_featured = TRUE
ON CONFLICT DO NOTHING;

INSERT INTO media_placements (media_post_id, placement_key, display_order)
SELECT id, 'ABOUT_HERO', 1
FROM media_posts
WHERE is_featured = TRUE
ON CONFLICT DO NOTHING;
