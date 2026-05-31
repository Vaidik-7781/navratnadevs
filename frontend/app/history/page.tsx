'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/shared/Navbar'
import { outputsApi } from '@/lib/api'
import type { Session } from '@/types'

const STATUS_STYLES: Record<string, { color: string; icon: string; label: string }> = {
  complete: { color: '#27c93f', icon: 'check_circle', label: 'Shipped' },
  running:  { color: '#4f90f3', icon: 'pending',      label: 'Building' },
  idle:     { color: '#c2c6d4', icon: 'schedule',     label: 'Idle' },
  failed:   { color: '#ff5f56', icon: 'error',        label: 'Failed' },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load recent sessions from localStorage fallback
    const stored = localStorage.getItem('navratna_sessions')
    if (stored) {
      try { setSessions(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 z-[-1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(79,144,243,0.04) 0%, transparent 60%)' }} />
      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-[48px] max-w-[1280px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-[32px] leading-[40px] font-bold text-[#e5e2e1] mb-2">My Builds</h1>
          <p className="text-[16px] text-[#c2c6d4]/60">Your previous NavratnaDevs sessions</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="material-symbols-outlined text-[32px] text-[#4f90f3] animate-spin">refresh</span>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-6 text-center"
          >
            <div className="w-24 h-24 rounded-full liquid-glass flex items-center justify-center text-4xl">🚀</div>
            <div>
              <h2 className="text-[24px] font-bold text-[#e5e2e1] mb-2">No builds yet</h2>
              <p className="text-[16px] text-[#c2c6d4]/60 mb-6">Start your first build and let 9 agents bring your idea to life.</p>
              <Link href="/" className="btn-neon px-6 py-3 rounded-lg inline-flex items-center gap-2 text-[16px] font-semibold">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Start Building
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {sessions.map((session) => {
              const style = STATUS_STYLES[session.status] || STATUS_STYLES.idle
              const date = new Date(session.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              return (
                <motion.div key={session.id} variants={fadeInUp}>
                  <Link href={`/build/${session.id}`}
                    className="block liquid-glass rounded-xl p-5 agent-card group">
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: style.color, backgroundColor: `${style.color}18` }}>
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 24" }}>
                            {style.icon}
                          </span>
                          {style.label}
                        </span>
                        <span className="text-[11px] text-[#c2c6d4]/30">{date}</span>
                      </div>

                      <h3 className="text-[16px] font-semibold text-[#e5e2e1] mb-3 line-clamp-2 leading-[22px]">
                        {session.idea}
                      </h3>

                      <div className="flex items-center justify-between text-[12px] text-[#c2c6d4]/40">
                        <span>{session.solo_founder_mode ? '👤 Solo Mode' : '👥 Full Team'}</span>
                        {session.estimated_manual_weeks && (
                          <span className="text-[#4f90f3]">{session.estimated_manual_weeks}w saved</span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-[#c2c6d4]/30 font-mono truncate">{session.id.slice(0, 16)}...</span>
                        <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/30 group-hover:text-[#4f90f3] transition-colors">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>
    </div>
  )
}
