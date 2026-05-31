'use client'
import { useState } from 'react'
import type { FileTreeNode } from '@/types'

const LANG_COLORS: Record<string, string> = {
  typescript: '#4f90f3', tsx: '#4f90f3', javascript: '#ffcc02', jsx: '#ffcc02',
  python: '#81c784', sql: '#ce93d8', json: '#ffb74d', yaml: '#80cbc4',
  markdown: '#c2c6d4', bash: '#ff7043', dockerfile: '#80cbc4', css: '#f48fb1',
}

function FileIcon({ language }: { language?: string }) {
  const color = LANG_COLORS[language || ''] || '#c2c6d4'
  return <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
}

function TreeNode({ name, node, depth = 0, onSelect, selectedPath }: {
  name: string
  node: FileTreeNode
  depth?: number
  onSelect: (path: string) => void
  selectedPath: string | null
}) {
  const [open, setOpen] = useState(depth < 2)
  const isFolder = node.type === 'folder'
  const isSelected = node.path === selectedPath

  return (
    <div>
      <div
        onClick={() => isFolder ? setOpen(!open) : onSelect(node.path)}
        className={`flex items-center gap-1.5 py-1 rounded cursor-pointer text-[13px] transition-all duration-150 ${
          isSelected ? 'bg-[#4f90f3]/15 text-[#4f90f3]' : 'text-[#c2c6d4] hover:bg-white/5 hover:text-[#e5e2e1]'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: '8px' }}
      >
        {isFolder ? (
          <span className="material-symbols-outlined text-[15px] text-[#c2c6d4]/50">
            {open ? 'folder_open' : 'folder'}
          </span>
        ) : (
          <FileIcon language={node.language} />
        )}
        <span className="truncate font-mono flex-1">{name}</span>
        {!isFolder && node.agent && (
          <span className="text-[10px] text-[#c2c6d4]/25 flex-shrink-0">{node.agent}</span>
        )}
      </div>
      {isFolder && open && node.children && (
        <div>
          {Object.entries(node.children).map(([childName, childNode]) => (
            <TreeNode key={childName} name={childName} node={childNode as FileTreeNode}
              depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  )
}

interface FileTreeProps {
  tree: Record<string, FileTreeNode>
  onSelect: (path: string) => void
  selectedPath: string | null
  fileCount: number
}

export default function FileTree({ tree, onSelect, selectedPath, fileCount }: FileTreeProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] tracking-[0.08em] text-[#c2c6d4]/50 uppercase font-semibold">Files</span>
        <span className="text-[11px] text-[#4f90f3] font-semibold">{fileCount}</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {Object.keys(tree).length === 0 ? (
          <p className="text-[12px] text-[#c2c6d4]/30 text-center py-6 px-3">Generating files...</p>
        ) : (
          Object.entries(tree).map(([name, node]) => (
            <TreeNode key={name} name={name} node={node as FileTreeNode}
              onSelect={onSelect} selectedPath={selectedPath} />
          ))
        )}
      </div>
    </div>
  )
}
