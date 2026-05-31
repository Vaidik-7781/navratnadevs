-- Migration 002: Agent outputs + Generated files

CREATE TABLE IF NOT EXISTS agent_outputs (
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

CREATE TABLE IF NOT EXISTS generated_files (
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

CREATE INDEX IF NOT EXISTS idx_agent_outputs_session ON agent_outputs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_sequence ON agent_outputs(session_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_generated_files_session ON generated_files(session_id);

ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own agent outputs" ON agent_outputs FOR ALL
    USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users see own files" ON generated_files FOR ALL
    USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL));

ALTER PUBLICATION supabase_realtime ADD TABLE agent_outputs;
