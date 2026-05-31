import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(79,144,243,0.04) 0%, transparent 70%)' }}
      />

      <div className="text-[120px] font-bold leading-none select-none"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #353534 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>

      <div>
        <h1 className="text-[24px] font-bold text-[#e5e2e1] mb-2">Page not found</h1>
        <p className="text-[16px] text-[#c2c6d4]/60 max-w-sm">
          The agents looked everywhere. This page doesn't exist.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/"
          className="btn-neon px-6 py-3 rounded-lg text-[15px] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">home</span>
          Go Home
        </Link>
        <Link href="/history"
          className="btn-secondary px-6 py-3 rounded-lg text-[15px] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">history</span>
          My Builds
        </Link>
      </div>
    </div>
  )
}
