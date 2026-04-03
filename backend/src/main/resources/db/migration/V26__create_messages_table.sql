CREATE TABLE messages (
    id              BIGSERIAL PRIMARY KEY,
    sender_email    VARCHAR(150) NOT NULL,
    sender_name     VARCHAR(100),
    recipient_email VARCHAR(150) NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    body            TEXT         NOT NULL,
    read_status     BOOLEAN      NOT NULL DEFAULT FALSE,
    parent_id       BIGINT       REFERENCES messages(id) ON DELETE SET NULL,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_sender    ON messages(sender_email);
CREATE INDEX idx_messages_recipient ON messages(recipient_email);
CREATE INDEX idx_messages_parent    ON messages(parent_id);
CREATE INDEX idx_messages_created   ON messages(created_at DESC);
