-- V43: Add session-centric scheduling architecture
-- New columns on availability_rules, programs, events
-- New tables: sessions, registrations, blocked_times, program_schedule_rules, event_schedule_rules

-- ─── 1. availability_rules: add coach FK and timezone ───────────────────────

ALTER TABLE availability_rules
    ADD COLUMN IF NOT EXISTS coach_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS timezone  VARCHAR(100) NOT NULL DEFAULT 'America/New_York';

CREATE INDEX IF NOT EXISTS idx_availability_rules_coach_id ON availability_rules(coach_id);

-- ─── 2. programs: add coach FK, recurring flag, date range, program type ─────

ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS coach_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS recurring    BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS start_date   DATE,
    ADD COLUMN IF NOT EXISTS end_date     DATE,
    ADD COLUMN IF NOT EXISTS program_type VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_programs_coach_id ON programs(coach_id);

-- ─── 3. events: add coach FK, recurring flag, event type ─────────────────────

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS coach_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS recurring  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS event_type VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_events_coach_id ON events(coach_id);

-- ─── 4. sessions ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
    id               BIGSERIAL    PRIMARY KEY,
    source_type      VARCHAR(20)  NOT NULL,
    source_id        BIGINT       NOT NULL,
    coach_id         BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    start_datetime   TIMESTAMP    NOT NULL,
    end_datetime     TIMESTAMP    NOT NULL,
    capacity         INTEGER      NOT NULL DEFAULT 20,
    registered_count INTEGER      NOT NULL DEFAULT 0,
    status           VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sessions_source_type
        CHECK (source_type IN ('PROGRAM','EVENT')),
    CONSTRAINT chk_sessions_status
        CHECK (status IN ('SCHEDULED','CANCELLED','COMPLETED')),
    CONSTRAINT chk_sessions_capacity    CHECK (capacity >= 1),
    CONSTRAINT chk_sessions_reg_count   CHECK (registered_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_sessions_source ON sessions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_datetime ON sessions(start_datetime);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- ─── 5. registrations ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS registrations (
    id                BIGSERIAL    PRIMARY KEY,
    session_id        BIGINT       NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    player_profile_id BIGINT       REFERENCES player_profiles(id) ON DELETE SET NULL,
    user_id           BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMED',
    notes             TEXT,
    registered_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_registrations_status
        CHECK (status IN ('CONFIRMED','WAITLISTED','CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_session_id ON registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_player_profile_id ON registrations(player_profile_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- ─── 6. blocked_times ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blocked_times (
    id             BIGSERIAL    PRIMARY KEY,
    coach_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP    NOT NULL,
    end_datetime   TIMESTAMP    NOT NULL,
    reason         VARCHAR(255),
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blocked_times_coach_id ON blocked_times(coach_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_range ON blocked_times(start_datetime, end_datetime);

-- ─── 7. program_schedule_rules ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS program_schedule_rules (
    id          BIGSERIAL   PRIMARY KEY,
    program_id  BIGINT      NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    day_of_week INTEGER     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_program_schedule_rules_program_id ON program_schedule_rules(program_id);

-- ─── 8. event_schedule_rules ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_schedule_rules (
    id          BIGSERIAL   PRIMARY KEY,
    event_id    BIGINT      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    day_of_week INTEGER     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_schedule_rules_event_id ON event_schedule_rules(event_id);
