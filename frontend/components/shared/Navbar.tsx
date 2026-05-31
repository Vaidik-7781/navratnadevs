'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/#how-it-works', label: 'How it Works' },
    { href: '/#agents', label: 'Agents' },
    { href: '/#simulator', label: 'Simulator' },
  ]

  return (
    <nav className="liquid-glass-strong fixed top-0 w-full z-50 border-b border-white/10">
      <div className="flex justify-between items-center px-4 md:px-[48px] py-4 max-w-[1280px] mx-auto">
        <Link href="/" className="font-bold text-[32px] leading-[40px] tracking-tighter text-[#aac7ff] flex items-center gap-2 active:scale-95 transition-transform duration-200">
          <span className="material-symbols-outlined filled text-[#4f90f3] text-[28px]">token</span>
          NavratnaDevs
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-[16px] leading-[24px] transition-all duration-300 px-3 py-1.5 rounded ${
                pathname === link.href
                  ? 'text-[#aac7ff] font-bold border-b-2 border-[#aac7ff] rounded-t bg-white/5'
                  : 'text-[#c2c6d4] hover:text-[#e5e2e1] hover:bg-white/5'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/history" className="hidden md:block btn-secondary text-[12px] tracking-[0.08em] font-semibold px-4 py-2 rounded-lg active:scale-95 duration-200">
            My Builds
          </Link>
          <Link href="/#simulator" className="btn-neon text-[12px] tracking-[0.08em] font-semibold px-5 py-2.5 rounded-lg active:scale-95 duration-200">
            Launch App
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#e5e2e1] p-2">
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-3xl"
          >
            <div className="flex flex-col px-4 py-4 gap-2">
              {links.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="text-[16px] text-[#c2c6d4] hover:text-[#e5e2e1] px-3 py-2 rounded hover:bg-white/5 transition-all">
                  {link.label}
                </Link>
              ))}
              <Link href="/history" onClick={() => setMenuOpen(false)}
                className="text-[16px] text-[#c2c6d4] hover:text-[#e5e2e1] px-3 py-2 rounded hover:bg-white/5 transition-all">
                My Builds
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
