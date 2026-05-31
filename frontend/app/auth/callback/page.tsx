'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      } else {
        router.push('/?auth=error')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-[#4f90f3] animate-spin">refresh</span>
      </div>
      <p className="text-[16px] text-[#c2c6d4]/60">Signing you in...</p>
    </div>
  )
}
