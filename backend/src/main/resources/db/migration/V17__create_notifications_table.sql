-- V17: Notifications table
CREATE TABLE notifications (
    id           BIGSERIAL PRIMARY KEY,
    user_email   VARCHAR(150),
    type         VARCHAR(50)   NOT NULL,
    title        VARCHAR(255)  NOT NULL,
    body         TEXT,
    read_status  BOOLEAN       NOT NULL DEFAULT FALSE,
    entity       VARCHAR(100),
    entity_id    BIGINT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_email ON notifications (user_email);
CREATE INDEX idx_notifications_read       ON notifications (user_email, read_status);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
