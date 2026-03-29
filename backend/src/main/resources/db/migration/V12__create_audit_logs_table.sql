-- V12: Audit logs
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_email  VARCHAR(150),
    action      VARCHAR(100) NOT NULL,
    entity      VARCHAR(100) NOT NULL,
    entity_id   BIGINT,
    details     TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity     ON audit_logs (entity, entity_id);
CREATE INDEX idx_audit_logs_user_email ON audit_logs (user_email);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
