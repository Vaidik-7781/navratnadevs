'use client'
import { motion } from 'framer-motion'
import AgentCard from './AgentCard'
import type { AgentState } from '@/hooks/useAgents'

interface AgentSidebarProps {
  agents: AgentState[]
  completedCount: number
  activeAgentName?: string
  onAgentClick?: (name: string) => void
}

export default function AgentSidebar({ agents, completedCount, activeAgentName, onAgentClick }: AgentSidebarProps) {
  const total = agents.length
  const pct = Math.round((completedCount / total) * 100)

  return (
    <aside className="liquid-glass rounded-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">The Nine</span>
          <span className="text-[12px] font-semibold text-[#4f90f3]">{completedCount}/{total}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#4f90f3]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="text-[11px] text-[#c2c6d4]/50 mt-1 block">{pct}% complete</span>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {agents.map(agent => (
          <AgentCard
            key={agent.name}
            agent={agent}
            isActive={agent.name === activeAgentName}
            onClick={() => onAgentClick?.(agent.name)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-[11px] text-[#c2c6d4]/40">
          <span className="material-symbols-outlined text-[14px]">electric_bolt</span>
          Powered by Groq LLaMA 3.3
        </div>
      </div>
    </aside>
  )
}
