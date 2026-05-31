import type { AgentName, OutputType } from '@/types'

// ─── AGENT COLORS ─────────────────────────────────────────────────────────────

export const AGENT_COLORS: Record<AgentName, string> = {
  PM:        '#00ff88',
  Architect: '#4fc3f7',
  Designer:  '#f48fb1',
  Backend:   '#ffcc02',
  Frontend:  '#81c784',
  QA:        '#ff7043',
  Security:  '#ce93d8',
  DevOps:    '#80cbc4',
  Analytics: '#ffb74d',
}

export const AGENT_EMOJIS: Record<AgentName, string> = {
  PM:        '🧠',
  Architect: '🏗️',
  Designer:  '🎨',
  Backend:   '⚙️',
  Frontend:  '🖥️',
  QA:        '🔍',
  Security:  '🔐',
  DevOps:    '📈',
  Analytics: '📊',
}

export const AGENT_FULL_NAMES: Record<AgentName, string> = {
  PM:        'Priya (PM)',
  Architect: 'Arjun (Architect)',
  Designer:  'Disha (Designer)',
  Backend:   'Bharat (Backend)',
  Frontend:  'Farhan (Frontend)',
  QA:        'Qadir (QA)',
  Security:  'Shreya (Security)',
  DevOps:    'Dev (DevOps)',
  Analytics: 'Ananya (Analytics)',
}

// ─── OUTPUT TYPE LABELS ───────────────────────────────────────────────────────

export const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  prd:          'PRD',
  architecture: 'Architecture',
  design:       'UI/UX Design',
  code:         'Code',
  bug:          'Bug Report',
  security:     'Security Audit',
  devops:       'DevOps',
  analytics:    'Analytics',
  debate:       'Debate',
  vote:         'Vote',
  conflict:     'Conflict',
  resolution:   'Resolution',
}

export const OUTPUT_TYPE_COLORS: Record<OutputType, string> = {
  prd:          '#00ff88',
  architecture: '#4fc3f7',
  design:       '#f48fb1',
  code:         '#81c784',
  bug:          '#ff7043',
  security:     '#ce93d8',
  devops:       '#80cbc4',
  analytics:    '#ffb74d',
  debate:       '#ffd700',
  vote:         '#87ceeb',
  conflict:     '#ff5722',
  resolution:   '#00e676',
}

// ─── LANGUAGE DETECTION ───────────────────────────────────────────────────────

export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    py: 'python', sql: 'sql', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sh: 'bash', dockerfile: 'dockerfile', env: 'bash',
    css: 'css', html: 'html', toml: 'toml',
  }
  return map[ext || ''] || 'text'
}

// ─── TIME FORMATTING ─────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

// ─── PRIORITY COLORS ─────────────────────────────────────────────────────────

export const PRIORITY_COLORS = {
  critical: '#ff1744',
  high:     '#ff9800',
  medium:   '#ffeb3b',
  low:      '#66bb6a',
}

// ─── TRUNCATE ─────────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

// ─── CLASS NAMES ─────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
