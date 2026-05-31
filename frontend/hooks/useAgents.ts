'use client'
import { useState, useCallback } from 'react'
import type { AgentName, AgentStatus, AgentMessage } from '@/types'

export interface AgentState {
  name: AgentName
  emoji: string
  status: AgentStatus
  mood: string
  messages: AgentMessage[]
  streamingText: string
  durationMs?: number
}

const INITIAL_AGENTS: AgentState[] = [
  { name: 'PM',        emoji: '🧠', status: 'idle', mood: '💼', messages: [], streamingText: '' },
  { name: 'Architect', emoji: '🏗️', status: 'idle', mood: '🏗️', messages: [], streamingText: '' },
  { name: 'Designer',  emoji: '🎨', status: 'idle', mood: '🎨', messages: [], streamingText: '' },
  { name: 'Backend',   emoji: '⚙️', status: 'idle', mood: '⚙️', messages: [], streamingText: '' },
  { name: 'Frontend',  emoji: '🖥️', status: 'idle', mood: '🖥️', messages: [], streamingText: '' },
  { name: 'QA',        emoji: '🔍', status: 'idle', mood: '🔍', messages: [], streamingText: '' },
  { name: 'Security',  emoji: '🔐', status: 'idle', mood: '🔐', messages: [], streamingText: '' },
  { name: 'DevOps',    emoji: '📈', status: 'idle', mood: '📈', messages: [], streamingText: '' },
  { name: 'Analytics', emoji: '📊', status: 'idle', mood: '📊', messages: [], streamingText: '' },
]

export function useAgents() {
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS)

  const setAgentStatus = useCallback((name: AgentName, status: AgentStatus) => {
    setAgents(prev => prev.map(a => a.name === name ? { ...a, status } : a))
  }, [])

  const setAgentMood = useCallback((name: AgentName, mood: string) => {
    setAgents(prev => prev.map(a => a.name === name ? { ...a, mood } : a))
  }, [])

  const appendToken = useCallback((name: AgentName, token: string) => {
    setAgents(prev => prev.map(a =>
      a.name === name ? { ...a, streamingText: a.streamingText + token } : a
    ))
  }, [])

  const addMessage = useCallback((message: AgentMessage) => {
    setAgents(prev => prev.map(a =>
      a.name === message.agent_name
        ? { ...a, messages: [...a.messages, message], streamingText: '', status: 'done', durationMs: message.duration_ms }
        : a
    ))
  }, [])

  const resetAgents = useCallback(() => {
    setAgents(INITIAL_AGENTS.map(a => ({ ...a })))
  }, [])

  const getAgent = useCallback((name: AgentName) => {
    return agents.find(a => a.name === name) || null
  }, [agents])

  const completedCount = agents.filter(a => a.status === 'done').length
  const activeAgent = agents.find(a => a.status === 'thinking' || a.status === 'streaming') || null

  return {
    agents,
    setAgentStatus,
    setAgentMood,
    appendToken,
    addMessage,
    resetAgents,
    getAgent,
    completedCount,
    activeAgent,
  }
}
