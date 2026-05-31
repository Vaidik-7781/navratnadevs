'use client'
import { useEffect, useRef, useCallback } from 'react'
import { getSocket, closeSocket } from '@/lib/websocket'
import type {
  AgentName, AgentMessage, SprintCard,
  Conflict, MoodUpdateEvent, APICallLogEvent,
  PipelineCompleteEvent, ConflictStartEvent, VoteUpdateEvent,
} from '@/types'

interface UseRealtimeOptions {
  sessionId: string | null
  onAgentThinking?: (agentName: AgentName) => void
  onAgentToken?: (agentName: AgentName, token: string) => void
  onAgentMessage?: (message: AgentMessage) => void
  onMoodUpdate?: (agentName: AgentName, mood: string) => void
  onSprintUpdate?: (card: SprintCard) => void
  onConflictStart?: (conflict: ConflictStartEvent) => void
  onConflictResolved?: (conflict: Conflict) => void
  onVoteUpdate?: (vote: VoteUpdateEvent) => void
  onFileGenerated?: (file: { filename: string; filepath: string; language: string }) => void
  onAPICallLog?: (log: APICallLogEvent) => void
  onPipelineComplete?: (data: PipelineCompleteEvent) => void
  onPipelineError?: (error: string) => void
}

export function useRealtime({
  sessionId,
  onAgentThinking,
  onAgentToken,
  onAgentMessage,
  onMoodUpdate,
  onSprintUpdate,
  onConflictStart,
  onConflictResolved,
  onVoteUpdate,
  onFileGenerated,
  onAPICallLog,
  onPipelineComplete,
  onPipelineError,
}: UseRealtimeOptions) {
  const connectedRef = useRef(false)

  useEffect(() => {
    if (!sessionId || connectedRef.current) return

    const socket = getSocket(sessionId)

    socket
      .on('agent_thinking', (data: { agent_name: AgentName }) => {
        onAgentThinking?.(data.agent_name)
      })
      .on('agent_token', (data: { agent_name: AgentName; token: string }) => {
        onAgentToken?.(data.agent_name, data.token)
      })
      .on('agent_message', (data: AgentMessage) => {
        onAgentMessage?.(data)
      })
      .on('mood_update', (data: MoodUpdateEvent) => {
        onMoodUpdate?.(data.agent_name, data.mood)
      })
      .on('sprint_update', (data: SprintCard) => {
        onSprintUpdate?.(data)
      })
      .on('conflict_start', (data: ConflictStartEvent) => {
        onConflictStart?.(data)
      })
      .on('conflict_resolved', (data: Conflict) => {
        onConflictResolved?.(data)
      })
      .on('vote_update', (data: VoteUpdateEvent) => {
        onVoteUpdate?.(data)
      })
      .on('file_generated', (data) => {
        onFileGenerated?.(data as { filename: string; filepath: string; language: string })
      })
      .on('api_call_log', (data: APICallLogEvent) => {
        onAPICallLog?.(data)
      })
      .on('pipeline_complete', (data: PipelineCompleteEvent) => {
        onPipelineComplete?.(data)
      })
      .on('pipeline_error', (data: { error: string }) => {
        onPipelineError?.(data.error)
      })

    socket.connect().then(() => {
      connectedRef.current = true
    }).catch(console.error)

    return () => {
      closeSocket(sessionId)
      connectedRef.current = false
    }
  }, [sessionId])
}
