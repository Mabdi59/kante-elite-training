ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS story_title VARCHAR(150),
    ADD COLUMN IF NOT EXISTS media_post_id BIGINT,
    ADD COLUMN IF NOT EXISTS player_metadata VARCHAR(255),
    ADD COLUMN IF NOT EXISTS team_metadata VARCHAR(255),
    ADD COLUMN IF NOT EXISTS program_id BIGINT,
    ADD COLUMN IF NOT EXISTS coach_profile_id BIGINT,
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE testimonials
    ADD CONSTRAINT fk_testimonials_media_post
        FOREIGN KEY (media_post_id) REFERENCES media_posts(id) ON DELETE SET NULL;

ALTER TABLE testimonials
    ADD CONSTRAINT fk_testimonials_program
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL;

ALTER TABLE testimonials
    ADD CONSTRAINT fk_testimonials_coach_profile
        FOREIGN KEY (coach_profile_id) REFERENCES coach_profiles(id) ON DELETE SET NULL;

UPDATE testimonials
SET
    active = TRUE,
    story_title = COALESCE(story_title, 'Player development story'),
    player_metadata = COALESCE(player_metadata, role_or_context),
    updated_at = COALESCE(updated_at, NOW());

CREATE INDEX IF NOT EXISTS idx_testimonials_active_display
    ON testimonials (active, display_order, created_at);

CREATE INDEX IF NOT EXISTS idx_testimonials_active_featured_display
    ON testimonials (active, featured, display_order, created_at);

CREATE INDEX IF NOT EXISTS idx_testimonials_program
    ON testimonials (program_id);

CREATE INDEX IF NOT EXISTS idx_testimonials_coach_profile
    ON testimonials (coach_profile_id);
