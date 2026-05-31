'use client'
import { useState } from 'react'

interface SoloFounderToggleProps {
  value: boolean
  onChange: (v: boolean) => void
}

export default function SoloFounderToggle({ value, onChange }: SoloFounderToggleProps) {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!value)}>
      <div className={`toggle-track ${value ? 'active' : ''}`}>
        <div className="toggle-thumb" />
      </div>
      <span className="text-[14px] text-[#c2c6d4] select-none flex items-center gap-1.5">
        Solo Founder Mode
        <span className="material-symbols-outlined text-[16px] text-[#c2c6d4]/40" title="Agents recommend free tools only">info</span>
      </span>
    </div>
  )
}
