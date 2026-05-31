'use client'
import { motion } from 'framer-motion'
import type { AgentState } from '@/hooks/useAgents'
import AgentMoodBadge from './AgentMoodBadge'

const STATUS_COLORS: Record<string, string> = {
  idle: '#353534',
  queued: '#ffbd2e',
  thinking: '#4f90f3',
  streaming: '#4f90f3',
  done: '#27c93f',
  error: '#ff5f56',
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  queued: 'Queued',
  thinking: 'Thinking...',
  streaming: 'Writing...',
  done: 'Done',
  error: 'Error',
}

interface AgentCardProps {
  agent: AgentState
  isActive?: boolean
  onClick?: () => void
}

export default function AgentCard({ agent, isActive, onClick }: AgentCardProps) {
  const isWorking = agent.status === 'thinking' || agent.status === 'streaming'
  const color = STATUS_COLORS[agent.status] || '#353534'

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 3 }}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-[#4f90f3]/10 border border-[#4f90f3]/30' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Status dot */}
      <div className="relative flex-shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: isWorking ? `0 0 8px ${color}` : 'none' }}
        />
        {isWorking && (
          <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: color, opacity: 0.4 }} />
        )}
      </div>

      {/* Emoji */}
      <span className="text-xl flex-shrink-0">{agent.emoji}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[14px] font-medium text-[#e5e2e1] truncate">{agent.name}</span>
          <AgentMoodBadge mood={agent.mood} pulse={isWorking} />
        </div>
        <span className="text-[12px] text-[#c2c6d4]/60" style={{ color: isWorking ? '#4f90f3' : undefined }}>
          {STATUS_LABELS[agent.status]}
        </span>
      </div>
    </motion.div>
  )
}
