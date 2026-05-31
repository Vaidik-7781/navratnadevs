'use client'
import { useState } from 'react'

interface OutputExporterProps {
  files: { filename: string; filepath: string; content: string }[]
}

export default function OutputExporter({ files }: OutputExporterProps) {
  const [exporting, setExporting] = useState(false)

  const exportAll = async () => {
    if (files.length === 0) return
    setExporting(true)
    const content = files
      .map(f => `// ${'═'.repeat(60)}\n// ${f.filepath}\n// ${'═'.repeat(60)}\n\n${f.content}`)
      .join('\n\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'navratnadevs-codebase.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setTimeout(() => setExporting(false), 1500)
  }

  return (
    <button
      onClick={exportAll}
      disabled={exporting || files.length === 0}
      className="btn-neon w-full px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-[15px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined text-[20px]">
        {exporting ? 'downloading' : 'download'}
      </span>
      {exporting ? 'Exporting...' : `Export All Files (${files.length})`}
    </button>
  )
}
