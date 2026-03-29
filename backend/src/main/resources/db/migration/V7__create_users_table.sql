-- V7: Create users table
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(150)  NOT NULL UNIQUE,
    password   TEXT          NOT NULL,
    role       VARCHAR(20)   NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
