CREATE TABLE media_posts (
    id BIGSERIAL PRIMARY KEY,
    media_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_posts_created_at ON media_posts (created_at DESC);
