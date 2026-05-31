'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('NavratnaDevs error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a]">
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-[#ff5f56]/10 border border-[#ff5f56]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-[#ff5f56]"
              style={{ fontVariationSettings: "'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 24" }}>
              error
            </span>
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-[#e5e2e1] mb-2">Something went wrong</h1>
            <p className="text-[15px] text-[#c2c6d4]/60 max-w-sm mb-1">
              The agents hit an unexpected error.
            </p>
            {error.message && (
              <p className="text-[12px] font-mono text-[#ff7043]/70 max-w-sm">{error.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={reset}
              className="bg-[#4f90f3] text-white font-semibold px-6 py-3 rounded-lg text-[15px] flex items-center gap-2 hover:shadow-[0_0_20px_rgba(79,144,243,0.3)] transition-all">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Try Again
            </button>
            <a href="/"
              className="bg-white/5 border border-white/10 text-[#e5e2e1] font-semibold px-6 py-3 rounded-lg text-[15px] flex items-center gap-2 hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">home</span>
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
