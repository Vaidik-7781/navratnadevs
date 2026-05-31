'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { SprintCard, CardStatus } from '@/types'

const PRIORITY_COLORS = { critical: '#ff1744', high: '#ff9800', medium: '#ffeb3b', low: '#66bb6a' }
const COLUMNS: { key: CardStatus; label: string; icon: string }[] = [
  { key: 'todo',        label: 'To Do',       icon: 'radio_button_unchecked' },
  { key: 'in_progress', label: 'In Progress',  icon: 'pending' },
  { key: 'review',      label: 'Review',       icon: 'rate_review' },
  { key: 'done',        label: 'Done',         icon: 'check_circle' },
]

interface SprintBoardProps {
  cards: SprintCard[]
}

export default function SprintBoard({ cards }: SprintBoardProps) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = cards.filter(c => c.status === col.key)
    return acc
  }, {} as Record<CardStatus, SprintCard[]>)

  return (
    <div className="liquid-glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
        <span className="material-symbols-outlined text-[18px] text-[#4f90f3]">view_kanban</span>
        <span className="text-[12px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Sprint Board</span>
        <span className="ml-auto text-[12px] text-[#c2c6d4]/40">{cards.filter(c => c.status === 'done').length}/{cards.length} done</span>
      </div>

      <div className="grid grid-cols-4 gap-0 overflow-x-auto">
        {COLUMNS.map((col, ci) => (
          <div key={col.key} className={`p-3 min-h-[140px] ${ci < 3 ? 'border-r border-white/5' : ''}`}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="material-symbols-outlined text-[14px] text-[#c2c6d4]/50">{col.icon}</span>
              <span className="text-[11px] tracking-[0.06em] text-[#c2c6d4]/50 uppercase font-semibold">{col.label}</span>
              <span className="ml-auto text-[10px] text-[#c2c6d4]/30 bg-white/5 px-1.5 rounded-full">
                {grouped[col.key].length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>
                {grouped[col.key].map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#1c1b1b] border border-white/6 rounded-lg p-2.5 group hover:border-white/15 transition-all"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="text-[12px] text-[#e5e2e1] leading-[16px] font-medium">{card.title}</p>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: PRIORITY_COLORS[card.priority] || '#c2c6d4' }} />
                    </div>
                    <span className="text-[10px] text-[#c2c6d4]/35">{card.agent_owner}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
