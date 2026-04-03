CREATE TABLE waiver_templates (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    content        TEXT         NOT NULL,
    required_roles VARCHAR(500),
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE signed_waivers (
    id          BIGSERIAL PRIMARY KEY,
    template_id BIGINT       NOT NULL REFERENCES waiver_templates(id),
    user_email  VARCHAR(150) NOT NULL,
    user_name   VARCHAR(100),
    signed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    ip_address  VARCHAR(50),
    signature   VARCHAR(500)
);
CREATE UNIQUE INDEX uq_signed_waiver ON signed_waivers(template_id, user_email);

CREATE TABLE player_documents (
    id           BIGSERIAL PRIMARY KEY,
    player_email VARCHAR(150) NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_url     VARCHAR(500) NOT NULL,
    doc_type     VARCHAR(50)  NOT NULL DEFAULT 'OTHER',
    description  TEXT,
    uploaded_by  VARCHAR(150),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_player_docs_email ON player_documents(player_email);
