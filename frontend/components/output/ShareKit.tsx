'use client'
import { useState } from 'react'
import type { BuilderDNA } from '@/types'
import { copyToClipboard, openLinkedIn, openTwitter } from '@/lib/sharekit'

interface ShareKitProps {
  dna: BuilderDNA
  shareUrl?: string
}

export default function ShareKit({ dna, shareUrl }: ShareKitProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedTags, setCopiedTags] = useState(false)

  const TAGS = '#AIBuildersHackathon #Outskill #OpenAI #NavratnaDevs #BuildInPublic'

  return (
    <div className="liquid-glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="material-symbols-outlined text-[20px] text-[#4f90f3]">share</span>
        <h3 className="text-[20px] font-semibold text-[#e5e2e1]">Share Your Build</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {/* LinkedIn */}
        <button
          onClick={() => openLinkedIn(dna.linkedin_post)}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#0a66c2]/15 border border-[#0a66c2]/30 hover:bg-[#0a66c2]/25 transition-all group"
        >
          <span className="text-2xl">💼</span>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#e5e2e1]">LinkedIn</div>
            <div className="text-[11px] text-[#c2c6d4]/50">Open &amp; post</div>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/25 ml-auto group-hover:text-[#c2c6d4]/60 transition-colors">
            open_in_new
          </span>
        </button>

        {/* Twitter */}
        <button
          onClick={() => openTwitter(dna.twitter_thread)}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#1d9bf0]/15 border border-[#1d9bf0]/30 hover:bg-[#1d9bf0]/25 transition-all group"
        >
          <span className="text-2xl font-bold text-[#e5e2e1]">𝕏</span>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#e5e2e1]">Twitter / X</div>
            <div className="text-[11px] text-[#c2c6d4]/50">Post thread</div>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/25 ml-auto group-hover:text-[#c2c6d4]/60 transition-colors">
            open_in_new
          </span>
        </button>

        {/* Copy link */}
        <button
          onClick={async () => {
            if (shareUrl) {
              await copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}${shareUrl}` : shareUrl)
              setCopiedUrl(true)
              setTimeout(() => setCopiedUrl(false), 2000)
            }
          }}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#4f90f3]/10 border border-[#4f90f3]/20 hover:bg-[#4f90f3]/20 transition-all"
        >
          <span className="material-symbols-outlined text-[24px] text-[#4f90f3]">link</span>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#e5e2e1]">{copiedUrl ? 'Copied!' : 'Copy Link'}</div>
            <div className="text-[11px] text-[#c2c6d4]/50">Share build URL</div>
          </div>
        </button>
      </div>

      {/* Hashtags */}
      <div className="p-3 bg-[#1c1b1b] rounded-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-[#c2c6d4]/25">tag</span>
        <span className="text-[11px] text-[#c2c6d4]/40 font-mono flex-1 truncate">{TAGS}</span>
        <button
          onClick={async () => {
            await copyToClipboard(TAGS)
            setCopiedTags(true)
            setTimeout(() => setCopiedTags(false), 2000)
          }}
          className="text-[#c2c6d4]/30 hover:text-[#c2c6d4] transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copiedTags ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
    </div>
  )
}
