'use client'
import { motion } from 'framer-motion'
import ProgressBar from '@/components/shared/ProgressBar'
import type { TeamHealth, APICallLogEvent, CodexFlowStage, Conflict, VoteUpdateEvent } from '@/types'

// ─── METRICS DASHBOARD ────────────────────────────────────────────────────────

interface MetricsDashboardProps {
  health: TeamHealth
  totalFiles: number
  totalMessages: number
  timeElapsed: number
}

export function MetricsDashboard({ health, totalFiles, totalMessages, timeElapsed }: MetricsDashboardProps) {
  const riskColor = { Low: '#27c93f', Medium: '#ffbd2e', High: '#ff5f56' }[health.risk_level] || '#c2c6d4'
  const mins = Math.floor(timeElapsed / 60)
  const secs = timeElapsed % 60

  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">monitoring</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Live Metrics</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Files', value: totalFiles, icon: 'description' },
          { label: 'Messages', value: totalMessages, icon: 'forum' },
          { label: 'Conflicts', value: health.conflicts, icon: 'warning' },
          { label: 'Time', value: `${mins}:${secs.toString().padStart(2,'0')}`, icon: 'timer' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1c1b1b] rounded-lg p-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/40">{stat.icon}</span>
            <div>
              <div className="text-[16px] font-bold text-[#e5e2e1] leading-none">{stat.value}</div>
              <div className="text-[10px] text-[#c2c6d4]/40 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#c2c6d4]/50">Team Morale</span>
          <span className="text-[#4f90f3] font-semibold">{health.morale}/10</span>
        </div>
        <ProgressBar value={health.morale} showValue={false} color="#4f90f3" size="sm" />

        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-[#c2c6d4]/50">Velocity: <span className="text-[#e5e2e1]">{health.velocity}</span></span>
          <span className="text-[11px] font-semibold" style={{ color: riskColor }}>
            Risk: {health.risk_level}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── API CALL INSPECTOR ───────────────────────────────────────────────────────

interface APICallInspectorProps {
  logs: APICallLogEvent[]
}

const STATUS_STYLES = {
  queued:  { color: '#c2c6d4', icon: 'schedule' },
  calling: { color: '#4f90f3', icon: 'sync' },
  done:    { color: '#27c93f', icon: 'check_circle' },
  error:   { color: '#ff5f56', icon: 'error' },
}

export function APICallInspector({ logs }: APICallInspectorProps) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">api</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">API Calls</span>
        <span className="ml-auto text-[10px] text-[#c2c6d4]/40">Live · Real calls</span>
      </div>
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
        {logs.length === 0 && (
          <p className="text-[11px] text-[#c2c6d4]/30 text-center py-3">Waiting for agents...</p>
        )}
        {logs.map((log, i) => {
          const style = STATUS_STYLES[log.status]
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[11px]">
              <span className="material-symbols-outlined text-[13px]" style={{ color: style.color,
                fontVariationSettings: log.status === 'calling' ? undefined : "'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 24" }}>
                {style.icon}
              </span>
              <span className="text-[#c2c6d4]/70 flex-1 truncate">{log.agent_name}</span>
              <span className="text-[#c2c6d4]/30 font-mono text-[10px]">groq/llama-3.3</span>
              {log.duration_ms && (
                <span className="text-[#c2c6d4]/40 font-mono">{(log.duration_ms/1000).toFixed(1)}s</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── CODEX FLOW PANEL ─────────────────────────────────────────────────────────

interface CodexFlowPanelProps {
  stages: CodexFlowStage[]
}

export function CodexFlowPanel({ stages }: CodexFlowPanelProps) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">schema</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Codex Flow</span>
      </div>
      <div className="flex items-center gap-0">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-500 ${
                stage.status === 'done'    ? 'bg-[#4f90f3] border-[#4f90f3] text-white' :
                stage.status === 'running' ? 'bg-[#4f90f3]/20 border-[#4f90f3] text-[#4f90f3] animate-pulse' :
                                             'bg-white/5 border-white/10 text-[#c2c6d4]/30'
              }`}>
                {stage.status === 'done' ? '✓' : i + 1}
              </div>
              <span className="text-[9px] text-[#c2c6d4]/50 text-center leading-tight truncate w-full px-1">
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={`h-px flex-1 mx-1 transition-all duration-500 ${stage.status === 'done' ? 'bg-[#4f90f3]/50' : 'bg-white/8'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TEAM HEALTH METER ────────────────────────────────────────────────────────

interface TeamHealthMeterProps {
  health: TeamHealth
}

export function TeamHealthMeter({ health }: TeamHealthMeterProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 liquid-glass rounded-lg">
      <span className="text-[12px] text-[#c2c6d4]/50">Team Health</span>
      <div className="flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-1.5 h-4 rounded-sm transition-all duration-500"
            style={{ backgroundColor: i < health.morale ? '#4f90f3' : 'rgba(255,255,255,0.05)' }} />
        ))}
      </div>
      <span className="text-[12px] font-semibold text-[#aac7ff]">{health.morale}/10</span>
    </div>
  )
}

// ─── DIAGRAM PANEL ────────────────────────────────────────────────────────────

export function DiagramPanel({ architectureText }: { architectureText?: string }) {
  if (!architectureText) return (
    <div className="liquid-glass rounded-xl p-4 flex items-center justify-center h-full min-h-[120px]">
      <p className="text-[12px] text-[#c2c6d4]/30">Architecture diagram will appear after Architect speaks</p>
    </div>
  )

  return (
    <div className="liquid-glass rounded-xl p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">account_tree</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Architecture</span>
      </div>
      <pre className="text-[11px] font-mono text-[#c2c6d4]/70 leading-[18px] whitespace-pre-wrap">
        {architectureText.slice(0, 800)}
      </pre>
    </div>
  )
}

// ─── VOTING MODAL ─────────────────────────────────────────────────────────────

interface VotingModalProps {
  vote: VoteUpdateEvent | null
  visible: boolean
}

export function VotingModal({ vote, visible }: VotingModalProps) {
  if (!visible || !vote) return null
  const total = vote.votes_a + vote.votes_b
  const pctA = total > 0 ? Math.round((vote.votes_a / total) * 100) : 50
  const pctB = 100 - pctA

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="liquid-glass-strong rounded-xl p-4 border border-[#ffbd2e]/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#ffbd2e]">how_to_vote</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#ffbd2e] uppercase">Live Vote</span>
      </div>
      <div className="flex gap-3 text-[12px]">
        <div className="flex-1 text-center">
          <div className="font-semibold text-[#e5e2e1] mb-1 truncate">{vote.option_a}</div>
          <div className="text-[#4f90f3] font-bold text-[20px]">{vote.votes_a}</div>
          <div className="text-[#c2c6d4]/40 text-[10px]">{pctA}%</div>
        </div>
        <div className="text-[#c2c6d4]/30 self-center">vs</div>
        <div className="flex-1 text-center">
          <div className="font-semibold text-[#e5e2e1] mb-1 truncate">{vote.option_b}</div>
          <div className="text-[#ff7043] font-bold text-[20px]">{vote.votes_b}</div>
          <div className="text-[#c2c6d4]/40 text-[10px]">{pctB}%</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
        <motion.div className="h-full bg-[#4f90f3] rounded-full"
          animate={{ width: `${pctA}%` }} transition={{ duration: 0.5 }} />
      </div>
    </motion.div>
  )
}

// ─── CONFLICT RESOLVER ────────────────────────────────────────────────────────

interface ConflictResolverProps {
  conflict: Conflict | null
}

export function ConflictResolver({ conflict }: ConflictResolverProps) {
  if (!conflict) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="liquid-glass-strong rounded-xl p-4 border border-[#ff7043]/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#ff7043]">swords</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#ff7043] uppercase">Conflict</span>
        {conflict.winner && (
          <span className="ml-auto text-[11px] text-[#27c93f] font-semibold">
            ✓ {conflict.winner} wins
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#c2c6d4]/70 mb-3 leading-[18px]">{conflict.topic}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg border text-[11px] leading-[16px] ${conflict.winner === conflict.agent_a ? 'border-[#27c93f]/40 bg-[#27c93f]/5' : 'border-white/8 bg-white/3'}`}>
          <span className="font-semibold text-[#e5e2e1]">{conflict.agent_a}:</span>{' '}
          <span className="text-[#c2c6d4]/60">{(conflict.agent_a_argument || '').slice(0, 120)}...</span>
        </div>
        <div className={`p-2 rounded-lg border text-[11px] leading-[16px] ${conflict.winner === conflict.agent_b ? 'border-[#27c93f]/40 bg-[#27c93f]/5' : 'border-white/8 bg-white/3'}`}>
          <span className="font-semibold text-[#e5e2e1]">{conflict.agent_b}:</span>{' '}
          <span className="text-[#c2c6d4]/60">{(conflict.agent_b_argument || '').slice(0, 120)}...</span>
        </div>
      </div>
      {conflict.resolution && (
        <div className="mt-3 p-2 bg-[#27c93f]/8 border border-[#27c93f]/20 rounded-lg text-[11px] text-[#27c93f]/80">
          {conflict.resolution}
        </div>
      )}
    </motion.div>
  )
}
