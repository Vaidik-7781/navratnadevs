'use client'
import { motion } from 'framer-motion'
import type { CodexFlowStage } from '@/types'

interface CodexFlowPanelProps {
  stages: CodexFlowStage[]
}

export default function CodexFlowPanel({ stages }: CodexFlowPanelProps) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">schema</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Codex Flow</span>
        <span className="ml-auto text-[10px] text-[#c2c6d4]/30">idea → plan → code → ship</span>
      </div>

      <div className="flex items-center">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <motion.div
                animate={stage.status === 'running' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-500 ${
                  stage.status === 'done'
                    ? 'bg-[#4f90f3] border-[#4f90f3] text-white shadow-[0_0_8px_rgba(79,144,243,0.4)]'
                    : stage.status === 'running'
                    ? 'bg-[#4f90f3]/20 border-[#4f90f3] text-[#4f90f3]'
                    : 'bg-white/5 border-white/10 text-[#c2c6d4]/25'
                }`}
              >
                {stage.status === 'done' ? '✓' : i + 1}
              </motion.div>
              <span className="text-[9px] text-[#c2c6d4]/40 text-center leading-tight truncate w-full px-0.5">
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <motion.div
                className="h-px flex-1 mx-1 transition-all duration-700"
                style={{ backgroundColor: stage.status === 'done' ? 'rgba(79,144,243,0.4)' : 'rgba(255,255,255,0.06)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
