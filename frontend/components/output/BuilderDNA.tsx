'use client'
import { motion } from 'framer-motion'
import type { BuilderDNA } from '@/types'

const LEVEL_COLORS: Record<string, string> = {
  'Senior Engineer':     '#4f90f3',
  'Mid-Level Engineer':  '#ffbd2e',
  'Junior Engineer':     '#81c784',
}

export default function BuilderDNAComponent({ dna }: { dna: BuilderDNA }) {
  const color = LEVEL_COLORS[dna.builder_level] || '#4f90f3'

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
        <span className="ml-auto px-3 py-1 rounded-full text-[12px] font-bold"
          style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}>
          {dna.builder_level}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Files Generated',   value: dna.total_files_generated,  icon: 'description' },
          { label: 'Agents Used',       value: dna.total_agents_used,       icon: 'groups' },
          { label: 'Bugs Fixed',        value: dna.bugs_found,              icon: 'bug_report' },
          { label: 'Security Issues',   value: dna.security_issues_fixed,   icon: 'security' },
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
          <p className="text-[12px] tracking-[0.06em] text-[#c2c6d4]/50 uppercase mb-2 font-semibold">Skills Demonstrated</p>
          <div className="flex flex-wrap gap-2">
            {dna.skills_demonstrated.map(skill => (
              <span key={skill}
                className="px-2 py-1 text-[11px] rounded-lg bg-[#4f90f3]/12 text-[#aac7ff] border border-[#4f90f3]/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] tracking-[0.06em] text-[#c2c6d4]/50 uppercase mb-2 font-semibold">Technologies Used</p>
          <div className="flex flex-wrap gap-2">
            {dna.technologies_used.slice(0, 8).map(tech => (
              <span key={tech}
                className="px-2 py-1 text-[11px] rounded-lg bg-white/5 text-[#c2c6d4] border border-white/10">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {dna.conflicts_resolved > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-[12px] text-[#c2c6d4]/50">
          <span>⚔️ {dna.conflicts_resolved} conflict{dna.conflicts_resolved > 1 ? 's' : ''} resolved</span>
          <span>🔐 {dna.security_issues_fixed} security patches</span>
          <span>🐛 {dna.bugs_found} bugs caught</span>
        </div>
      )}
    </motion.div>
  )
}
