-- Migration 005: Moods table
CREATE TABLE IF NOT EXISTS moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    mood_emoji TEXT NOT NULL,
    mood_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER PUBLICATION supabase_realtime ADD TABLE moods;
