'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import SoloFounderToggle from './SoloFounderToggle'
import { sessionsApi } from '@/lib/api'

export default function InputScreen() {
  const [idea, setIdea] = useState('')
  const [soloMode, setSoloMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (idea.trim().length < 10) { setError('Tell us more about your idea (min 10 characters)'); return }
    setLoading(true)
    setError('')
    try {
      const { session_id } = await sessionsApi.create(idea.trim(), soloMode)
      await sessionsApi.start(session_id)
      router.push(`/build/${session_id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start. Try again.')
      setLoading(false)
    }
  }

  return (
    <section id="simulator" className="w-full max-w-3xl mx-auto">
      <div className="liquid-glass rounded-xl p-[1px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <form onSubmit={handleSubmit} className="bg-[#1c1b1b] rounded-xl p-6 md:p-8 flex flex-col gap-6">
          <div className="relative">
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              className="w-full bg-transparent border-0 liquid-glass-input rounded-t-lg p-4 text-[16px] leading-[24px] text-[#e5e2e1] placeholder:text-[#c2c6d4]/40 resize-none focus:ring-0 font-sans"
              placeholder="Describe your app idea. E.g. 'A CRM for freelance photographers with AI scheduling and client galleries...'"
              rows={4}
              required
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button type="button" className="p-1.5 rounded-md hover:bg-white/10 text-[#c2c6d4] transition-colors">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <button type="button" className="p-1.5 rounded-md hover:bg-white/10 text-[#c2c6d4] transition-colors">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-[#ffb4ab] text-[14px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <SoloFounderToggle value={soloMode} onChange={setSoloMode} />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto btn-neon text-[20px] leading-[28px] font-medium px-8 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                  Assembling team...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  Assemble the Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
