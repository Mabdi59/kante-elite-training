-- Add media category to existing media_posts table.
-- Column is nullable to support rows that existed before this migration.
ALTER TABLE media_posts ADD COLUMN media_category VARCHAR(30);
