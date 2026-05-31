'use client'
import { useState, useCallback } from 'react'
import { sessionsApi } from '@/lib/api'
import type { Session } from '@/types'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAndStart = useCallback(async (idea: string, soloFounderMode = false): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const { session_id } = await sessionsApi.create(idea, soloFounderMode)
      await sessionsApi.start(session_id)
      const sessionData = await sessionsApi.get(session_id)
      setSession(sessionData)
      return session_id
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start session')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async (sessionId: string) => {
    try {
      const data = await sessionsApi.get(sessionId)
      setSession(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to refresh')
    }
  }, [])

  return { session, setSession, loading, error, createAndStart, refreshSession }
}
