'use client'
import { motion } from 'framer-motion'

interface TimeSavedCardProps {
  weeks: number
  totalTime: number
}

export default function TimeSavedCard({ weeks, totalTime }: TimeSavedCardProps) {
  const mins = Math.floor(totalTime / 60)
  const secs = totalTime % 60
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass-strong rounded-xl p-6 border border-[#4f90f3]/20 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#4f90f3]/6 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <span className="material-symbols-outlined text-[40px] text-[#4f90f3] mb-3 block">timer</span>
        <div className="text-[48px] font-bold leading-none text-gradient mb-1">{weeks}w</div>
        <p className="text-[14px] text-[#c2c6d4]/60 mb-4">of manual dev work saved</p>
        <div className="flex items-center justify-center gap-2 text-[12px] text-[#c2c6d4]/40">
          <span>NavratnaDevs completed this in</span>
          <span className="text-[#aac7ff] font-semibold">{timeStr}</span>
        </div>
      </div>
    </motion.div>
  )
}
