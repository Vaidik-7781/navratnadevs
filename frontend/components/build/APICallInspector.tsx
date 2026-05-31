'use client'
import { motion } from 'framer-motion'
import type { APICallLogEvent } from '@/types'

const STATUS_STYLES = {
  queued:  { color: '#c2c6d4', icon: 'schedule',      spin: false },
  calling: { color: '#4f90f3', icon: 'sync',           spin: true },
  done:    { color: '#27c93f', icon: 'check_circle',   spin: false },
  error:   { color: '#ff5f56', icon: 'error',          spin: false },
}

interface APICallInspectorProps {
  logs: APICallLogEvent[]
}

export default function APICallInspector({ logs }: APICallInspectorProps) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">api</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">API Calls</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-[#27c93f]/70">
          <span className="w-1 h-1 rounded-full bg-[#27c93f] animate-pulse" />
          Live · Real calls
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
        {logs.length === 0 && (
          <p className="text-[11px] text-[#c2c6d4]/30 text-center py-3">
            Waiting for first agent call...
          </p>
        )}
        {logs.map((log, i) => {
          const style = STATUS_STYLES[log.status] || STATUS_STYLES.queued
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className={`material-symbols-outlined text-[13px] ${style.spin ? 'animate-spin' : ''}`}
                style={{
                  color: style.color,
                  fontVariationSettings: log.status !== 'calling'
                    ? "'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 24"
                    : undefined
                }}
              >
                {style.icon}
              </span>
              <span className="text-[#c2c6d4]/70 flex-1 truncate">{log.agent_name}</span>
              <span className="text-[#c2c6d4]/25 font-mono text-[10px]">groq/llama-3.3</span>
              {log.duration_ms && (
                <span className="text-[#c2c6d4]/35 font-mono tabular-nums">
                  {(log.duration_ms / 1000).toFixed(1)}s
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
