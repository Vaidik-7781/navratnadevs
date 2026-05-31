'use client'
import { motion } from 'framer-motion'
import StreamingText from '@/components/shared/StreamingText'
import type { AgentMessage, OutputType } from '@/types'

const OUTPUT_TAGS: Record<OutputType, { label: string; color: string }> = {
  prd:          { label: 'PRD',          color: '#4f90f3' },
  architecture: { label: 'Architecture', color: '#81c784' },
  design:       { label: 'UI/UX',        color: '#f48fb1' },
  code:         { label: 'Code',         color: '#ffcc02' },
  bug:          { label: 'Bugs',         color: '#ff7043' },
  security:     { label: 'Security',     color: '#ce93d8' },
  devops:       { label: 'DevOps',       color: '#80cbc4' },
  analytics:    { label: 'Analytics',    color: '#ffb74d' },
  debate:       { label: 'Debate',       color: '#ffd700' },
  vote:         { label: 'Vote',         color: '#87ceeb' },
  conflict:     { label: 'Conflict',     color: '#ff5722' },
  resolution:   { label: 'Resolved',     color: '#00e676' },
}

interface ChatMessageProps {
  message: AgentMessage
  streamingText?: string
  isStreaming?: boolean
}

export default function ChatMessage({ message, streamingText, isStreaming }: ChatMessageProps) {
  const tag = OUTPUT_TAGS[message.output_type] || { label: message.output_type, color: '#c2c6d4' }
  const displayText = isStreaming ? (streamingText || '') : message.message

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 group"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1c1b1b] border border-white/10 flex items-center justify-center text-lg shadow-inner">
        {message.agent_emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[14px] font-semibold text-[#e5e2e1]">{message.agent_name}</span>
          <span className="text-[11px] tracking-[0.06em] font-semibold px-1.5 py-0.5 rounded"
            style={{ color: tag.color, backgroundColor: `${tag.color}18` }}>
            {tag.label}
          </span>
          <span className="text-[11px] text-[#c2c6d4]/30 ml-auto">{message.mood}</span>
          {message.duration_ms && (
            <span className="text-[10px] text-[#c2c6d4]/25">{(message.duration_ms / 1000).toFixed(1)}s</span>
          )}
        </div>

        <div className="liquid-glass rounded-lg rounded-tl-none p-4 text-[14px] leading-[22px] text-[#c2c6d4]">
          <StreamingText text={displayText} isStreaming={isStreaming} />
        </div>
      </div>
    </motion.div>
  )
}
