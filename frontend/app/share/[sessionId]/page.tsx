'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { shareApi } from '@/lib/api'
import { copyToClipboard, openLinkedIn, openTwitter } from '@/lib/sharekit'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

export default function SharePage() {
  const { sessionId } = useParams() as { sessionId: string }
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false)
  const [copiedTwitter, setCopiedTwitter] = useState(false)

  useEffect(() => {
    shareApi.get(sessionId).then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => {
      setError('Build not found or not public')
      setLoading(false)
    })
  }, [sessionId])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="material-symbols-outlined text-[48px] text-[#4f90f3] animate-spin">refresh</span>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="material-symbols-outlined text-[64px] text-[#c2c6d4]/20">link_off</span>
      <h1 className="text-[24px] font-bold text-[#e5e2e1]">Build not found</h1>
      <p className="text-[16px] text-[#c2c6d4]/50">{error}</p>
      <Link href="/" className="btn-neon px-6 py-3 rounded-lg text-[16px] font-semibold mt-4">
        Build something →
      </Link>
    </div>
  )

  const session = data.sessions || {}
  const idea = session.idea || 'An amazing product'
  const linkedin = data.linkedin_post || ''
  const twitter = data.twitter_thread || ''

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 z-[-1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(79,144,243,0.06) 0%, transparent 60%)' }} />

      {/* Minimal nav */}
      <nav className="liquid-glass border-b border-white/8 px-4 md:px-[48px] py-4 flex items-center gap-3">
        <span className="material-symbols-outlined filled text-[#4f90f3] text-[24px]">token</span>
        <span className="font-bold text-[20px] text-[#aac7ff]">NavratnaDevs</span>
        <Link href="/" className="ml-auto btn-neon px-4 py-2 rounded-lg text-[13px] font-semibold">
          Build yours →
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="flex flex-col gap-8">

          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass mb-6">
              <span className="w-2 h-2 rounded-full bg-[#27c93f] animate-pulse" />
              <span className="text-[12px] tracking-[0.08em] text-[#c2c6d4]/70 uppercase font-semibold">Build Shipped</span>
            </div>
            <h1 className="text-[32px] md:text-[48px] font-bold text-[#e5e2e1] leading-tight mb-4">
              {idea}
            </h1>
            <p className="text-[16px] text-[#c2c6d4]/60">
              Built with NavratnaDevs — 9 AI agents that debate, vote, and ship
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
            {[
              { value: '9', label: 'Agents', icon: 'groups' },
              { value: session.estimated_manual_weeks ? `${session.estimated_manual_weeks}w` : '3w', label: 'Time Saved', icon: 'timer' },
              { value: session.builder_level?.split(' ')[0] || 'Senior', label: 'Builder Level', icon: 'military_tech' },
            ].map(stat => (
              <div key={stat.label} className="liquid-glass rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-[24px] text-[#4f90f3] mb-2 block">{stat.icon}</span>
                <div className="text-[24px] font-bold text-[#e5e2e1] leading-none">{stat.value}</div>
                <div className="text-[11px] text-[#c2c6d4]/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Share actions */}
          <motion.div variants={fadeInUp} className="liquid-glass rounded-xl p-6">
            <h2 className="text-[20px] font-semibold text-[#e5e2e1] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#4f90f3]">share</span>
              Share This Build
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { openLinkedIn(linkedin); setCopiedLinkedIn(true); setTimeout(() => setCopiedLinkedIn(false), 2000) }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#0a66c2]/15 border border-[#0a66c2]/30 hover:bg-[#0a66c2]/25 transition-all">
                <span className="text-2xl">💼</span>
                <div className="text-left">
                  <div className="text-[14px] font-semibold text-[#e5e2e1]">{copiedLinkedIn ? 'Opening...' : 'Share on LinkedIn'}</div>
                  <div className="text-[11px] text-[#c2c6d4]/50">Post to your network</div>
                </div>
              </button>
              <button
                onClick={() => { openTwitter(twitter); setCopiedTwitter(true); setTimeout(() => setCopiedTwitter(false), 2000) }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#1d9bf0]/15 border border-[#1d9bf0]/30 hover:bg-[#1d9bf0]/25 transition-all">
                <span className="text-2xl font-bold">𝕏</span>
                <div className="text-left">
                  <div className="text-[14px] font-semibold text-[#e5e2e1]">{copiedTwitter ? 'Opening...' : 'Post Thread'}</div>
                  <div className="text-[11px] text-[#c2c6d4]/50">Share on X / Twitter</div>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-[#1c1b1b] rounded-lg flex items-center gap-2">
              <span className="text-[11px] text-[#c2c6d4]/40 font-mono flex-1 truncate">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </span>
              <button onClick={() => copyToClipboard(typeof window !== 'undefined' ? window.location.href : '')}
                className="text-[#c2c6d4]/40 hover:text-[#c2c6d4] transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="text-center">
            <p className="text-[16px] text-[#c2c6d4]/60 mb-4">Ready to build yours?</p>
            <Link href="/"
              className="btn-neon px-8 py-4 rounded-xl text-[18px] font-semibold inline-flex items-center gap-2">
              <span className="material-symbols-outlined">bolt</span>
              Assemble Your Team
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
