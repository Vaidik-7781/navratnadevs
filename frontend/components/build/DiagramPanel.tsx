'use client'

interface DiagramPanelProps {
  architectureText?: string
}

export default function DiagramPanel({ architectureText }: DiagramPanelProps) {
  if (!architectureText) return (
    <div className="liquid-glass rounded-xl p-4 flex items-center justify-center min-h-[100px]">
      <p className="text-[12px] text-[#c2c6d4]/30 text-center">
        Architecture diagram appears after Architect speaks
      </p>
    </div>
  )

  // Extract text diagram from markdown code blocks or raw text
  const diagramMatch = architectureText.match(/```[\s\S]*?```/)
  const diagram = diagramMatch
    ? diagramMatch[0].replace(/```[a-z]*/g, '').trim()
    : architectureText.split('\n').filter(l => l.includes('→') || l.includes('──') || l.includes('↓')).join('\n')

  return (
    <div className="liquid-glass rounded-xl p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[16px] text-[#4f90f3]">account_tree</span>
        <span className="text-[11px] tracking-[0.08em] font-semibold text-[#c2c6d4] uppercase">Architecture</span>
      </div>
      <pre className="text-[11px] font-mono text-[#c2c6d4]/70 leading-[18px] whitespace-pre-wrap overflow-x-auto">
        {(diagram || architectureText).slice(0, 600)}
      </pre>
    </div>
  )
}
