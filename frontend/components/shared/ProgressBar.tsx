'use client'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0-100
  label?: string
  color?: string
  showValue?: boolean
  size?: 'sm' | 'md'
}

export default function ProgressBar({ value, label, color = '#4f90f3', showValue = true, size = 'md' }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1' : 'h-1.5'
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-[12px] text-[#c2c6d4] font-medium">{label}</span>}
          {showValue && <span className="text-[12px] text-[#aac7ff] font-semibold tabular-nums">{clamped}/10</span>}
        </div>
      )}
      <div className={`w-full ${h} bg-white/5 rounded-full overflow-hidden`}>
        <motion.div
          className={`${h} rounded-full`}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped * 10}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
