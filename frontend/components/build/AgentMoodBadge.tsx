'use client'

interface AgentMoodBadgeProps {
  mood: string
  pulse?: boolean
}

export default function AgentMoodBadge({ mood, pulse = false }: AgentMoodBadgeProps) {
  return (
    <span className={`text-base leading-none ${pulse ? 'animate-pulse' : ''}`} title={`Mood: ${mood}`}>
      {mood}
    </span>
  )
}
