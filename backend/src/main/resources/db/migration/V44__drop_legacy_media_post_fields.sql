ALTER TABLE media_posts
    DROP COLUMN IF EXISTS is_featured,
    DROP COLUMN IF EXISTS show_on_home,
    DROP COLUMN IF EXISTS show_on_about,
    DROP COLUMN IF EXISTS display_order,
    DROP COLUMN IF EXISTS home_display_order,
    DROP COLUMN IF EXISTS about_display_order;
