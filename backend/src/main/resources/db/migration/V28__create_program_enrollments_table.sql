CREATE TABLE program_enrollments (
    id             BIGSERIAL PRIMARY KEY,
    program_id     BIGINT       NOT NULL REFERENCES programs(id),
    player_email   VARCHAR(150) NOT NULL,
    player_name    VARCHAR(100),
    parent_email   VARCHAR(150),
    start_date     DATE,
    end_date       DATE,
    status         VARCHAR(30)  NOT NULL DEFAULT 'ACTIVE',
    schedule_type  VARCHAR(30)  NOT NULL DEFAULT 'ONE_TIME',
    payment_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    notes          TEXT,
    enrolled_by    VARCHAR(150),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_enrollment_program ON program_enrollments(program_id);
CREATE INDEX idx_enrollment_player  ON program_enrollments(player_email);
CREATE UNIQUE INDEX uq_enrollment_program_player ON program_enrollments(program_id, player_email);
