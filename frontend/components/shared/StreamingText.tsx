'use client'
import { useEffect, useRef } from 'react'

interface StreamingTextProps {
  text: string
  isStreaming?: boolean
  className?: string
}

export default function StreamingText({ text, isStreaming = false, className = '' }: StreamingTextProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [text, isStreaming])

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {text}
      {isStreaming && (
        <span className="inline-block w-[2px] h-[1em] bg-[#4f90f3] ml-0.5 align-text-bottom animate-pulse" />
      )}
      <div ref={endRef} />
    </div>
  )
}
