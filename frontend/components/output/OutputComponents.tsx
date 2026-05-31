'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { BuilderDNA } from '@/types'
import { copyToClipboard, openLinkedIn, openTwitter } from '@/lib/sharekit'

// ─── BUILDER DNA ──────────────────────────────────────────────────────────────

export function BuilderDNAPanel({ dna }: { dna: BuilderDNA }) {
  const levelColors: Record<string, string> = {
    'Senior Engineer': '#4f90f3',
    'Mid-Level Engineer': '#ffbd2e',
    'Junior Engineer': '#81c784',
  }
  const color = levelColors[dna.builder_level] || '#4f90f3'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-[24px]" style={{ color }}>dna</span>
        <h3 className="text-[20px] leading-[28px] font-semibold text-[#e5e2e1]">Your Builder DNA</h3>
        <span className="ml-auto px-3 py-1 rounded-full text-[12px] font-bold" style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}>
          {dna.builder_level}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Files Generated', value: dna.total_files_generated, icon: 'description' },
          { label: 'Agents Used', value: dna.total_agents_used, icon: 'groups' },
          { label: 'Bugs Fixed', value: dna.bugs_found, icon: 'bug_report' },
          { label: 'Security Issues', value: dna.security_issues_fixed, icon: 'security' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1c1b1b] rounded-xl p-4 text-center border border-white/6">
            <span className="material-symbols-outlined text-[20px] text-[#4f90f3] block mb-2">{stat.icon}</span>
            <div className="text-[28px] font-bold text-[#e5e2e1] leading-none">{stat.value}</div>
            <div className="text-[11px] text-[#c2c6d4]/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-[12px] tracking-[0.06em] text-[#c2c6d4]/50 uppercase mb-2">Skills Demonstrated</p>
          <div className="flex flex-wrap gap-2">
            {dna.skills_demonstrated.map(skill => (
              <span key={skill} className="px-2 py-1 text-[11px] rounded-lg bg-[#4f90f3]/12 text-[#aac7ff] border border-[#4f90f3]/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] tracking-[0.06em] text-[#c2c6d4]/50 uppercase mb-2">Technologies</p>
          <div className="flex flex-wrap gap-2">
            {dna.technologies_used.slice(0, 8).map(tech => (
              <span key={tech} className="px-2 py-1 text-[11px] rounded-lg bg-white/5 text-[#c2c6d4] border border-white/10">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── TIME SAVED CARD ─────────────────────────────────────────────────────────

export function TimeSavedCard({ weeks, totalTime }: { weeks: number; totalTime: number }) {
  const mins = Math.floor(totalTime / 60)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="liquid-glass-strong rounded-xl p-6 border border-[#4f90f3]/20 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#4f90f3]/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <span className="material-symbols-outlined text-[48px] text-[#4f90f3] mb-3 block">timer</span>
        <div className="text-[48px] font-bold leading-none text-gradient mb-1">{weeks}w</div>
        <p className="text-[14px] text-[#c2c6d4]/70 mb-4">of manual dev work saved</p>
        <div className="text-[12px] text-[#c2c6d4]/40">
          NavratnaDevs completed this in <span className="text-[#aac7ff] font-semibold">{mins} minutes</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── SHARE KIT ────────────────────────────────────────────────────────────────

export function ShareKit({ dna, shareUrl }: { dna: BuilderDNA; shareUrl?: string }) {
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false)
  const [copiedTwitter, setCopiedTwitter] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleCopyLinkedIn = async () => {
    await copyToClipboard(dna.linkedin_post)
    setCopiedLinkedIn(true)
    setTimeout(() => setCopiedLinkedIn(false), 2000)
  }

  const handleCopyTwitter = async () => {
    await copyToClipboard(dna.twitter_thread)
    setCopiedTwitter(true)
    setTimeout(() => setCopiedTwitter(false), 2000)
  }

  const handleCopyUrl = async () => {
    if (shareUrl) {
      await copyToClipboard(shareUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  return (
    <div className="liquid-glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="material-symbols-outlined text-[20px] text-[#4f90f3]">share</span>
        <h3 className="text-[20px] font-semibold text-[#e5e2e1]">Share Your Build</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <button onClick={() => openLinkedIn(dna.linkedin_post)}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#0a66c2]/15 border border-[#0a66c2]/30 hover:bg-[#0a66c2]/25 transition-all group">
          <span className="text-2xl">💼</span>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#e5e2e1]">LinkedIn</div>
            <div className="text-[11px] text-[#c2c6d4]/50">Open & post</div>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/30 ml-auto group-hover:text-[#c2c6d4]/60">open_in_new</span>
        </button>

        <button onClick={() => openTwitter(dna.twitter_thread)}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#1d9bf0]/15 border border-[#1d9bf0]/30 hover:bg-[#1d9bf0]/25 transition-all group">
          <span className="text-2xl">𝕏</span>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#e5e2e1]">Twitter / X</div>
            <div className="text-[11px] text-[#c2c6d4]/50">Post thread</div>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/30 ml-auto group-hover:text-[#c2c6d4]/60">open_in_new</span>
        </button>

        <button onClick={handleCopyUrl}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#4f90f3]/10 border border-[#4f90f3]/20 hover:bg-[#4f90f3]/20 transition-all">
          <span className="material-symbols-outlined text-[24px] text-[#4f90f3]">link</span>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#e5e2e1]">{copiedUrl ? 'Copied!' : 'Copy Link'}</div>
            <div className="text-[11px] text-[#c2c6d4]/50">Share build URL</div>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-[#1c1b1b] rounded-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-[#c2c6d4]/30">tag</span>
        <span className="text-[11px] text-[#c2c6d4]/40 font-mono">
          #AIBuildersHackathon #Outskill #OpenAI #NavratnaDevs #BuildInPublic
        </span>
        <button onClick={() => copyToClipboard('#AIBuildersHackathon #Outskill #OpenAI #NavratnaDevs #BuildInPublic')}
          className="ml-auto text-[#c2c6d4]/30 hover:text-[#c2c6d4] transition-colors">
          <span className="material-symbols-outlined text-[14px]">content_copy</span>
        </button>
      </div>
    </div>
  )
}

// ─── OUTPUT EXPORTER ─────────────────────────────────────────────────────────

export function OutputExporter({ files }: { files: { filename: string; filepath: string; content: string }[] }) {
  const [exporting, setExporting] = useState(false)

  const exportAll = async () => {
    setExporting(true)
    const content = files.map(f => `// ═══ ${f.filepath} ═══\n\n${f.content}`).join('\n\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'navratnadevs-output.txt'
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setExporting(false), 1000)
  }

  return (
    <button onClick={exportAll} disabled={exporting || files.length === 0}
      className="btn-neon px-5 py-2.5 rounded-lg flex items-center gap-2 text-[14px] font-semibold">
      <span className="material-symbols-outlined text-[18px]">{exporting ? 'downloading' : 'download'}</span>
      {exporting ? 'Exporting...' : `Export All (${files.length} files)`}
    </button>
  )
}
