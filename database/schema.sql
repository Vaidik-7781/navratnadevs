-- NavratnaDevs Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── SESSIONS ─────────────────────────────────────────────────────────────────
CREATE TABLE sessions (
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

-- ─── AGENT OUTPUTS ────────────────────────────────────────────────────────────
CREATE TABLE agent_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_emoji TEXT,
    message TEXT NOT NULL,
    output_type TEXT CHECK (output_type IN ('prd','architecture','design','code','bug','security','devops','analytics','debate','vote','conflict','resolution')),
    mood TEXT DEFAULT '💼',
    sequence_order INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GENERATED FILES ──────────────────────────────────────────────────────────
CREATE TABLE generated_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT,
    agent_name TEXT,
    file_type TEXT CHECK (file_type IN ('frontend','backend','database','config','docs','test','devops')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VOTES ────────────────────────────────────────────────────────────────────
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    vote TEXT CHECK (vote IN ('yes','no','abstain')),
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONFLICTS ────────────────────────────────────────────────────────────────
CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_a TEXT NOT NULL,
    agent_b TEXT NOT NULL,
    topic TEXT NOT NULL,
    agent_a_argument TEXT,
    agent_b_argument TEXT,
    resolution TEXT,
    winner TEXT,
    votes_for_a INTEGER DEFAULT 0,
    votes_for_b INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SPRINT CARDS ─────────────────────────────────────────────────────────────
CREATE TABLE sprint_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done')),
    agent_owner TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MOODS ────────────────────────────────────────────────────────────────────
CREATE TABLE moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    mood_emoji TEXT NOT NULL,
    mood_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SHARES ───────────────────────────────────────────────────────────────────
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    linkedin_post TEXT,
    twitter_thread TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_agent_outputs_session_id ON agent_outputs(session_id);
CREATE INDEX idx_agent_outputs_sequence ON agent_outputs(session_id, sequence_order);
CREATE INDEX idx_generated_files_session_id ON generated_files(session_id);
CREATE INDEX idx_sprint_cards_session_id ON sprint_cards(session_id);
CREATE INDEX idx_shares_token ON shares(share_token);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Sessions: users see own sessions
CREATE POLICY "Users see own sessions" ON sessions
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Agent outputs: linked to accessible session
CREATE POLICY "Users see own agent outputs" ON agent_outputs
    FOR ALL USING (
        session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL)
    );

-- Generated files: linked to accessible session
CREATE POLICY "Users see own files" ON generated_files
    FOR ALL USING (
        session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL)
    );

-- Shares: public shares visible to all
CREATE POLICY "Public shares visible to all" ON shares
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users manage own shares" ON shares
    FOR ALL USING (
        session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
    );

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE agent_outputs;
ALTER PUBLICATION supabase_realtime ADD TABLE sprint_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE moods;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
