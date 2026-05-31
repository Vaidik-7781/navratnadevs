'use client'
import { motion } from 'framer-motion'
import type { VoteUpdateEvent } from '@/types'

interface VotingModalProps {
  vote: VoteUpdateEvent | null
  visible: boolean
}

export default function VotingModal({ vote, visible }: VotingModalProps) {
  if (!visible || !vote) return null
  const total = vote.votes_a + vote.votes_b
  const pctA = total > 0 ? Math.round((vote.votes_a / total) * 100) : 50
  const pctB = 100 - pctA
  const leading = vote.votes_a >= vote.votes_b ? vote.option_a : vote.option_b

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass-strong rounded-xl p-4 border border-[#ffbd2e]/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#ffbd2e]">how_to_vote</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#ffbd2e] uppercase">Live Vote</span>
        <span className="ml-auto text-[11px] text-[#c2c6d4]/40">{vote.voter} just voted</span>
      </div>

      <div className="flex gap-3 items-center mb-3">
        <div className="flex-1 text-center p-2 rounded-lg bg-[#4f90f3]/10 border border-[#4f90f3]/20">
          <div className="text-[11px] text-[#c2c6d4]/60 truncate mb-1">{vote.option_a}</div>
          <div className="text-[24px] font-bold text-[#4f90f3] leading-none">{vote.votes_a}</div>
          <div className="text-[10px] text-[#c2c6d4]/40 mt-0.5">{pctA}%</div>
        </div>
        <div className="text-[12px] text-[#c2c6d4]/30 font-bold">vs</div>
        <div className="flex-1 text-center p-2 rounded-lg bg-[#ff7043]/10 border border-[#ff7043]/20">
          <div className="text-[11px] text-[#c2c6d4]/60 truncate mb-1">{vote.option_b}</div>
          <div className="text-[24px] font-bold text-[#ff7043] leading-none">{vote.votes_b}</div>
          <div className="text-[10px] text-[#c2c6d4]/40 mt-0.5">{pctB}%</div>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
        <motion.div className="h-full bg-[#4f90f3] rounded-l-full"
          animate={{ width: `${pctA}%` }} transition={{ duration: 0.5 }} />
        <motion.div className="h-full bg-[#ff7043] rounded-r-full"
          animate={{ width: `${pctB}%` }} transition={{ duration: 0.5 }} />
      </div>

      <div className="mt-2 text-[11px] text-center text-[#c2c6d4]/40">
        Leading: <span className="text-[#ffbd2e]">{leading}</span>
      </div>
    </motion.div>
  )
}
