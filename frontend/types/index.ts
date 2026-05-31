// ─── SESSION ──────────────────────────────────────────────────────────────────

export type SessionStatus = 'idle' | 'running' | 'complete' | 'failed'

export interface Session {
  id: string
  idea: string
  status: SessionStatus
  solo_founder_mode: boolean
  total_time_seconds?: number
  estimated_manual_weeks?: number
  builder_level?: string
  created_at: string
  updated_at?: string
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────

export type AgentName =
  | 'PM'
  | 'Architect'
  | 'Designer'
  | 'Backend'
  | 'Frontend'
  | 'QA'
  | 'Security'
  | 'DevOps'
  | 'Analytics'

export type AgentStatus = 'idle' | 'queued' | 'thinking' | 'streaming' | 'done' | 'error'

export type OutputType =
  | 'prd'
  | 'architecture'
  | 'design'
  | 'code'
  | 'bug'
  | 'security'
  | 'devops'
  | 'analytics'
  | 'debate'
  | 'vote'
  | 'conflict'
  | 'resolution'

export interface AgentMeta {
  emoji: string
  name: string
  role: string
}

export interface AgentMessage {
  id?: string
  session_id: string
  agent_name: AgentName
  agent_emoji: string
  message: string
  output_type: OutputType
  mood: string
  sequence_order: number
  metadata: Record<string, unknown>
  created_at: string
  duration_ms?: number
}

export interface AgentStatusMap {
  [agent: string]: AgentMeta & {
    status: AgentStatus
    output_count: number
    mood?: string
  }
}

// ─── FILES ────────────────────────────────────────────────────────────────────

export type FileType = 'frontend' | 'backend' | 'database' | 'config' | 'docs' | 'test' | 'devops'

export interface GeneratedFile {
  id: string
  session_id: string
  filename: string
  filepath: string
  content: string
  language: string
  agent_name: string
  file_type: FileType
  created_at?: string
}

export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  language?: string
  children?: Record<string, FileTreeNode>
  id?: string
  agent?: string
}

// ─── SPRINT ───────────────────────────────────────────────────────────────────

export type CardStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type CardPriority = 'low' | 'medium' | 'high' | 'critical'

export interface SprintCard {
  id: string
  session_id: string
  title: string
  description?: string
  status: CardStatus
  agent_owner: string
  priority: CardPriority
  created_at?: string
}

export interface SprintBoard {
  todo: SprintCard[]
  in_progress: SprintCard[]
  review: SprintCard[]
  done: SprintCard[]
}

// ─── CONFLICTS & VOTES ────────────────────────────────────────────────────────

export interface VoteRecord {
  voter: string
  vote: 'A' | 'B' | 'yes' | 'no'
  option?: string
  reason?: string
}

export interface Conflict {
  id?: string
  session_id: string
  agent_a: AgentName
  agent_b: AgentName
  topic: string
  agent_a_argument?: string
  agent_b_argument?: string
  resolution?: string
  winner?: string
  votes_for_a: number
  votes_for_b: number
}

// ─── WEBSOCKET EVENTS ─────────────────────────────────────────────────────────

export type WSEventType =
  | 'pipeline_started'
  | 'agent_queued'
  | 'agent_thinking'
  | 'agent_token'
  | 'agent_message'
  | 'mood_update'
  | 'sprint_update'
  | 'conflict_start'
  | 'conflict_resolved'
  | 'vote_update'
  | 'file_generated'
  | 'api_call_log'
  | 'pipeline_complete'
  | 'pipeline_error'

export interface WSEvent<T = unknown> {
  type: WSEventType
  data: T
  session_id: string
  timestamp: string
}

export interface AgentTokenEvent {
  agent_name: AgentName
  token: string
}

export interface MoodUpdateEvent {
  agent_name: AgentName
  mood: string
  reason: string
}

export interface APICallLogEvent {
  agent_name: AgentName
  model: string
  status: 'queued' | 'calling' | 'done' | 'error'
  duration_ms?: number
  tokens_used?: number
}

export interface PipelineCompleteEvent {
  total_time_seconds: number
  agents_completed: number
  team_health: TeamHealth
  builder_dna: BuilderDNA
}

export interface ConflictStartEvent {
  agent_a: AgentName
  agent_b: AgentName
  topic: string
}

export interface VoteUpdateEvent {
  voter: string
  vote: 'A' | 'B'
  votes_a: number
  votes_b: number
  option_a: string
  option_b: string
}

// ─── METRICS ──────────────────────────────────────────────────────────────────

export interface TeamHealth {
  morale: number       // 1-10
  conflicts: number
  blockers: number
  velocity: 'Starting' | 'Medium' | 'High'
  risk_level: 'Low' | 'Medium' | 'High'
}

export interface CodeQualityMetrics {
  security_score: number     // 0-10
  test_coverage: number      // 0-10
  performance: number        // 0-10
  code_quality: number       // 0-10
  complexity: number         // 0-10
}

// ─── BUILDER DNA ──────────────────────────────────────────────────────────────

export interface BuilderDNA {
  skills_demonstrated: string[]
  technologies_used: string[]
  time_saved_weeks: number
  builder_level: string
  total_files_generated: number
  total_agents_used: number
  conflicts_resolved: number
  bugs_found: number
  security_issues_fixed: number
  linkedin_post: string
  twitter_thread: string
  share_token?: string
}

// ─── CODEX FLOW ───────────────────────────────────────────────────────────────

export type CodexFlowStatus = 'pending' | 'running' | 'done'

export interface CodexFlowStage {
  id: string
  label: string
  codex_equivalent: string
  agent: AgentName | null
  description: string
  status: CodexFlowStatus
}

// ─── SHARE ────────────────────────────────────────────────────────────────────

export interface ShareResponse {
  share_token: string
  share_url: string
  linkedin_post: string
  twitter_thread: string
}

// ─── API RESPONSES ────────────────────────────────────────────────────────────

export interface CreateSessionResponse {
  session_id: string
  status: 'idle'
}

export interface FullSessionOutput {
  session: Session
  messages: AgentMessage[]
  files: GeneratedFile[]
  sprint_cards: SprintCard[]
  metrics: {
    total_messages: number
    total_files: number
    total_cards: number
    done_cards: number
  }
}
