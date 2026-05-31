'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from './ChatMessage'
import type { AgentMessage } from '@/types'

interface ChatFeedProps {
  messages: AgentMessage[]
  streamingTexts: Record<string, string>
  activeAgentName?: string
  activeAgentEmoji?: string
}

export default function ChatFeed({ messages, streamingTexts, activeAgentName, activeAgentEmoji }: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, Object.values(streamingTexts).join('').length])

  return (
    <div className="liquid-glass rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 flex-shrink-0">
        <span className="material-symbols-outlined text-[18px] text-[#4f90f3]">forum</span>
        <span className="text-[12px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Team Feed</span>
        {activeAgentName && (
          <div className="ml-auto flex items-center gap-1.5 text-[12px] text-[#4f90f3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f90f3] animate-pulse" />
            {activeAgentEmoji} {activeAgentName} is writing...
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isActiveMsg = msg.agent_name === activeAgentName && i === messages.length - 1
            return (
              <ChatMessage
                key={`${msg.agent_name}-${msg.sequence_order}-${i}`}
                message={msg}
                streamingText={isActiveMsg ? streamingTexts[msg.agent_name] : undefined}
                isStreaming={isActiveMsg && !!streamingTexts[msg.agent_name]}
              />
            )
          })}
        </AnimatePresence>

        {/* Active streaming agent (before message saved) */}
        {activeAgentName && !messages.find(m => m.agent_name === activeAgentName) && streamingTexts[activeAgentName] && (
          <ChatMessage
            message={{
              id: 'streaming',
              session_id: '',
              agent_name: activeAgentName as any,
              agent_emoji: activeAgentEmoji || '🤖',
              message: '',
              output_type: 'prd',
              mood: '💭',
              sequence_order: 99,
              metadata: {},
              created_at: new Date().toISOString(),
            }}
            streamingText={streamingTexts[activeAgentName]}
            isStreaming
          />
        )}

        {messages.length === 0 && !activeAgentName && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-3xl">🚀</div>
            <p className="text-[14px] text-[#c2c6d4]/60">Waiting for the team to start...</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
