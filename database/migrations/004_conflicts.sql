-- Migration 004: Conflicts indexes (table created in 003)
CREATE INDEX IF NOT EXISTS idx_conflicts_session ON conflicts(session_id);
