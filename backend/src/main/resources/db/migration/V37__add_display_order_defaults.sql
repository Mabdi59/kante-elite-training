-- Ensure display order columns have a default of 0 so inserts without explicit values succeed
-- These columns were added by V35 and V36; this migration sets safe defaults.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_posts' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE media_posts ALTER COLUMN display_order SET DEFAULT 0;
    ALTER TABLE media_posts ALTER COLUMN home_display_order SET DEFAULT 0;
    ALTER TABLE media_posts ALTER COLUMN about_display_order SET DEFAULT 0;
  END IF;
END $$;
