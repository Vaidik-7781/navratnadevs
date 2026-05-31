'use client'
import { motion } from 'framer-motion'
import type { Conflict } from '@/types'

interface ConflictResolverProps {
  conflict: Conflict | null
}

export default function ConflictResolver({ conflict }: ConflictResolverProps) {
  if (!conflict) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass-strong rounded-xl p-4 border border-[#ff7043]/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#ff7043]">swords</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#ff7043] uppercase">
          Conflict — {conflict.agent_a} vs {conflict.agent_b}
        </span>
        {conflict.winner && (
          <span className="ml-auto text-[11px] text-[#27c93f] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: "'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 24" }}>
              check_circle
            </span>
            {conflict.winner} wins ({conflict.votes_for_a}–{conflict.votes_for_b})
          </span>
        )}
      </div>

      <p className="text-[12px] text-[#c2c6d4]/70 mb-3 leading-[18px] font-medium">
        {conflict.topic}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`p-2.5 rounded-lg border text-[11px] leading-[16px] ${
          conflict.winner === conflict.agent_a
            ? 'border-[#27c93f]/40 bg-[#27c93f]/8'
            : 'border-white/8 bg-white/3'
        }`}>
          <div className="font-semibold text-[#e5e2e1] mb-1">{conflict.agent_a}</div>
          <div className="text-[#c2c6d4]/60 line-clamp-3">
            {(conflict.agent_a_argument || '—').slice(0, 140)}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border text-[11px] leading-[16px] ${
          conflict.winner === conflict.agent_b
            ? 'border-[#27c93f]/40 bg-[#27c93f]/8'
            : 'border-white/8 bg-white/3'
        }`}>
          <div className="font-semibold text-[#e5e2e1] mb-1">{conflict.agent_b}</div>
          <div className="text-[#c2c6d4]/60 line-clamp-3">
            {(conflict.agent_b_argument || '—').slice(0, 140)}
          </div>
        </div>
      </div>

      {conflict.resolution && (
        <div className="p-2.5 bg-[#27c93f]/8 border border-[#27c93f]/20 rounded-lg text-[11px] text-[#27c93f]/80 leading-[16px]">
          <span className="font-semibold">Resolution: </span>{conflict.resolution}
        </div>
      )}
    </motion.div>
  )
}
