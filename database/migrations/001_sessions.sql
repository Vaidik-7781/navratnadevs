-- Migration 001: Sessions table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    idea TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','running','complete','failed')),
    solo_founder_mode BOOLEAN DEFAULT FALSE,
    total_time_seconds INTEGER,
    estimated_manual_weeks FLOAT,
    builder_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sessions" ON sessions
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
