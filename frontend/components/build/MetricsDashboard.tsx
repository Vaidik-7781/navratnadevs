'use client'
import { motion } from 'framer-motion'
import ProgressBar from '@/components/shared/ProgressBar'
import type { TeamHealth } from '@/types'

interface MetricsDashboardProps {
  health: TeamHealth
  totalFiles: number
  totalMessages: number
  timeElapsed: number
}

export default function MetricsDashboard({ health, totalFiles, totalMessages, timeElapsed }: MetricsDashboardProps) {
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
          { label: 'Files',     value: totalFiles,    icon: 'description' },
          { label: 'Messages',  value: totalMessages, icon: 'forum' },
          { label: 'Conflicts', value: health.conflicts, icon: 'warning' },
          { label: 'Time', value: `${mins}:${secs.toString().padStart(2, '0')}`, icon: 'timer' },
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
        <ProgressBar value={health.morale} label="Team Morale" color="#4f90f3" size="sm" />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-[#c2c6d4]/50">
            Velocity: <span className="text-[#e5e2e1]">{health.velocity}</span>
          </span>
          <span className="text-[11px] font-semibold" style={{ color: riskColor }}>
            Risk: {health.risk_level}
          </span>
        </div>
      </div>
    </div>
  )
}
