'use client'
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }

export default function HeroSection() {
  return (
    <motion.section
      initial="hidden" animate="visible" variants={stagger}
      className="flex flex-col items-center text-center max-w-4xl mx-auto pt-12 md:pt-20"
    >
      <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass mb-8">
        <span className="w-2 h-2 rounded-full bg-[#4f90f3] animate-pulse shadow-[0_0_8px_#4f90f3]" />
        <span className="text-[12px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">System Online V2.4</span>
      </motion.div>

      <motion.h1 variants={fadeInUp} className="text-[48px] leading-[56px] md:text-[64px] md:leading-[72px] font-bold tracking-tight mb-6">
        Your idea.{' '}
        <span className="text-gradient">9 agents.</span>{' '}
        <span className="text-neon">One product.</span>
      </motion.h1>

      <motion.p variants={fadeInUp} className="text-[20px] leading-[28px] text-[#c2c6d4] max-w-2xl mx-auto opacity-90">
        Describe your vision. Our elite squad of 9 autonomous AI agents will architect, design, code, test, and deploy your software company from scratch.
      </motion.p>
    </motion.section>
  )
}
