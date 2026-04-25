-- Restore missing media post surface-specific ordering migration.
-- Initializes the surface order columns from the existing display order when present.
ALTER TABLE media_posts
    ADD COLUMN IF NOT EXISTS home_display_order INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS about_display_order INTEGER NOT NULL DEFAULT 0;

UPDATE media_posts
SET home_display_order = COALESCE(display_order, 0)
WHERE show_on_home = TRUE
  AND home_display_order = 0;

UPDATE media_posts
SET about_display_order = COALESCE(display_order, 0)
WHERE show_on_about = TRUE
  AND about_display_order = 0;

