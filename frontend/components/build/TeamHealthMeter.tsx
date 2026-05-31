'use client'
import type { TeamHealth } from '@/types'

interface TeamHealthMeterProps {
  health: TeamHealth
}

export default function TeamHealthMeter({ health }: TeamHealthMeterProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 liquid-glass rounded-lg">
      <span className="text-[12px] text-[#c2c6d4]/50 hidden sm:block">Team</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-4 rounded-sm transition-all duration-500"
            style={{ backgroundColor: i < health.morale ? '#4f90f3' : 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold text-[#aac7ff]">{health.morale}/10</span>
    </div>
  )
}
