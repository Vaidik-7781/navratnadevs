'use client'
import { useState, useRef, useCallback } from 'react'

interface StreamingState {
  [agentName: string]: string
}

export function useStreaming() {
  const [streamingTexts, setStreamingTexts] = useState<StreamingState>({})
  const bufferRef = useRef<StreamingState>({})

  const appendToken = useCallback((agentName: string, token: string) => {
    bufferRef.current[agentName] = (bufferRef.current[agentName] || '') + token
    setStreamingTexts(prev => ({
      ...prev,
      [agentName]: bufferRef.current[agentName],
    }))
  }, [])

  const clearStream = useCallback((agentName: string) => {
    bufferRef.current[agentName] = ''
    setStreamingTexts(prev => ({ ...prev, [agentName]: '' }))
  }, [])

  const clearAll = useCallback(() => {
    bufferRef.current = {}
    setStreamingTexts({})
  }, [])

  const getStream = useCallback((agentName: string): string => {
    return streamingTexts[agentName] || ''
  }, [streamingTexts])

  const isStreaming = useCallback((agentName: string): boolean => {
    return (streamingTexts[agentName] || '').length > 0
  }, [streamingTexts])

  return {
    streamingTexts,
    appendToken,
    clearStream,
    clearAll,
    getStream,
    isStreaming,
  }
}
