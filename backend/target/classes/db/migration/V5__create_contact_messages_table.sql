-- V5: Create contact_messages table
CREATE TABLE contact_messages (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    phone       VARCHAR(30),
    subject     VARCHAR(150),
    message     TEXT         NOT NULL,
    read_status BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_read ON contact_messages (read_status);
