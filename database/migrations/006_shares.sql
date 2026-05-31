-- Migration 006: Shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    linkedin_post TEXT,
    twitter_thread TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(share_token);
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public shares visible" ON shares FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users manage own shares" ON shares FOR ALL
    USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));
