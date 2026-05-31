import type {
  Session,
  AgentMessage,
  AgentStatusMap,
  GeneratedFile,
  SprintBoard,
  ShareResponse,
  CreateSessionResponse,
  FullSessionOutput,
  CodexFlowStage,
  BuilderDNA,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── CORE FETCH ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `API error ${res.status}`)
  }
  return res.json()
}

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

export const sessionsApi = {
  create: (idea: string, soloFounderMode = false): Promise<CreateSessionResponse> =>
    apiFetch('/sessions/create', {
      method: 'POST',
      body: JSON.stringify({ idea, solo_founder_mode: soloFounderMode }),
    }),

  start: (sessionId: string): Promise<{ status: string }> =>
    apiFetch(`/sessions/${sessionId}/start`, { method: 'POST' }),

  get: (sessionId: string): Promise<Session> =>
    apiFetch(`/sessions/${sessionId}`),
}

// ─── OUTPUTS ──────────────────────────────────────────────────────────────────

export const outputsApi = {
  getMessages: (sessionId: string): Promise<{ messages: AgentMessage[]; count: number }> =>
    apiFetch(`/outputs/${sessionId}/messages`),

  getFiles: (sessionId: string): Promise<{ files: GeneratedFile[]; count: number; tree: Record<string, unknown> }> =>
    apiFetch(`/outputs/${sessionId}/files`),

  getSprint: (sessionId: string): Promise<SprintBoard> =>
    apiFetch(`/outputs/${sessionId}/sprint`),

  getFull: (sessionId: string): Promise<FullSessionOutput> =>
    apiFetch(`/outputs/${sessionId}/full`),
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────

export const agentsApi = {
  getRoster: (): Promise<{ agents: AgentStatusMap }> =>
    apiFetch('/agents/roster'),

  getStatuses: (sessionId: string): Promise<{ session_id: string; statuses: AgentStatusMap }> =>
    apiFetch(`/agents/${sessionId}/status`),

  getOutput: (sessionId: string, agentName: string): Promise<{ agent: unknown; messages: AgentMessage[] }> =>
    apiFetch(`/agents/${sessionId}/${agentName}`),
}

// ─── SHARE ────────────────────────────────────────────────────────────────────

export const shareApi = {
  create: (sessionId: string): Promise<ShareResponse> =>
    apiFetch(`/share/${sessionId}`, { method: 'POST' }),

  get: (token: string): Promise<unknown> =>
    apiFetch(`/share/${token}`),
}

// ─── CODEX FLOW ───────────────────────────────────────────────────────────────

export const codexApi = {
  getFlow: (sessionId: string): Promise<CodexFlowStage[]> =>
    apiFetch(`/outputs/${sessionId}/codex-flow`),
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: (): Promise<{ status: string; agents: number }> =>
    fetch(`${BASE_URL}/health`).then(r => r.json()),
}
