'use client'
import type { BuilderDNA, Session } from '@/types'

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}

export function buildShareUrl(token: string): string {
  if (typeof window === 'undefined') return `/share/${token}`
  return `${window.location.origin}/share/${token}`
}

export function openLinkedIn(post: string): void {
  if (typeof window === 'undefined') return
  const encoded = encodeURIComponent(post)
  window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`, '_blank')
}

export function openTwitter(text: string): void {
  if (typeof window === 'undefined') return
  const firstTweet = text.split('---')[0].trim().slice(0, 270)
  const encoded = encodeURIComponent(firstTweet)
  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank')
}

export function formatTimeSaved(weeks: number): string {
  if (weeks < 1) return `${Math.round(weeks * 5)} days`
  if (weeks === 1) return '1 week'
  return `${weeks} weeks`
}

export function getBuilderLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'Senior Engineer': '#4f90f3',
    'Mid-Level Engineer': '#ffbd2e',
    'Junior Engineer': '#81c784',
  }
  return colors[level] || '#4f90f3'
}

export function buildSkillsSummary(dna: BuilderDNA): string {
  return `Built with: ${dna.technologies_used.slice(0, 4).join(', ')} — ${dna.total_files_generated} files, ${formatTimeSaved(dna.time_saved_weeks)} saved`
}
