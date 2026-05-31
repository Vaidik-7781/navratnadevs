-- Migration 003: Votes + Sprint cards + Conflicts

CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    vote TEXT CHECK (vote IN ('yes','no','abstain')),
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sprint_cards (
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

CREATE TABLE IF NOT EXISTS conflicts (
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

CREATE INDEX IF NOT EXISTS idx_sprint_cards_session ON sprint_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_sprint_cards_status ON sprint_cards(status);

ALTER TABLE sprint_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sprint cards" ON sprint_cards FOR ALL
    USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users see own conflicts" ON conflicts FOR ALL
    USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL));

ALTER PUBLICATION supabase_realtime ADD TABLE sprint_cards;
