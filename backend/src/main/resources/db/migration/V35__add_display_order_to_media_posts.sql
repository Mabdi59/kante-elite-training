-- Restore missing media post ordering migration.
-- Adds a general display order used across the public media feed.
ALTER TABLE media_posts
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

