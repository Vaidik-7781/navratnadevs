'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GeneratedFile, FileTreeNode } from '@/types'

// ─── FILE TREE ────────────────────────────────────────────────────────────────

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
        className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-[13px] transition-all duration-150 ${
          isSelected ? 'bg-[#4f90f3]/15 text-[#4f90f3]' : 'text-[#c2c6d4] hover:bg-white/5 hover:text-[#e5e2e1]'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {isFolder ? (
          <span className="material-symbols-outlined text-[15px] text-[#c2c6d4]/50">
            {open ? 'folder_open' : 'folder'}
          </span>
        ) : (
          <FileIcon language={node.language} />
        )}
        <span className="truncate font-mono">{name}</span>
        {!isFolder && node.agent && (
          <span className="ml-auto text-[10px] text-[#c2c6d4]/30 flex-shrink-0">{node.agent}</span>
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

export function FileTree({ tree, onSelect, selectedPath, fileCount }: FileTreeProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] tracking-[0.08em] text-[#c2c6d4]/50 uppercase">Files</span>
        <span className="text-[11px] text-[#4f90f3] font-semibold">{fileCount}</span>
      </div>
      <div className="py-1">
        {Object.keys(tree).length === 0 ? (
          <p className="text-[12px] text-[#c2c6d4]/40 text-center py-6">No files yet</p>
        ) : (
          Object.entries(tree).map(([name, node]) => (
            <TreeNode key={name} name={name} node={node as FileTreeNode} onSelect={onSelect} selectedPath={selectedPath} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── CODE VIEWER ──────────────────────────────────────────────────────────────

interface CodeViewerProps {
  files: GeneratedFile[]
  fileTree: Record<string, FileTreeNode>
  selectedFile: GeneratedFile | null
  onSelect: (path: string) => void
}

export default function CodeViewer({ files, fileTree, selectedFile, onSelect }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyFile = async () => {
    if (!selectedFile) return
    await navigator.clipboard.writeText(selectedFile.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAll = async () => {
    const all = files.map(f => `// ─── ${f.filepath} ───\n${f.content}`).join('\n\n')
    await navigator.clipboard.writeText(all)
  }

  return (
    <div className="liquid-glass rounded-xl flex h-full overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-48 flex-shrink-0 border-r border-white/8 flex flex-col">
        <FileTree tree={fileTree} onSelect={onSelect} selectedPath={selectedFile?.filepath || null} fileCount={files.length} />
      </div>

      {/* Code Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8 bg-[#1c1b1b]/50 flex-shrink-0">
          {selectedFile ? (
            <>
              <span className="text-[12px] font-mono text-[#aac7ff] truncate">{selectedFile.filename}</span>
              <span className="text-[10px] text-[#c2c6d4]/40 px-1.5 py-0.5 rounded bg-white/5">
                {selectedFile.language}
              </span>
              <div className="ml-auto flex gap-1.5">
                <button onClick={copyFile} className="p-1 rounded hover:bg-white/10 text-[#c2c6d4] transition-colors" title="Copy file">
                  <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                </button>
                <button onClick={copyAll} className="p-1 rounded hover:bg-white/10 text-[#c2c6d4] transition-colors" title="Copy all files">
                  <span className="material-symbols-outlined text-[16px]">copy_all</span>
                </button>
              </div>
            </>
          ) : (
            <span className="text-[12px] text-[#c2c6d4]/40">Select a file</span>
          )}
        </div>

        {/* Code content */}
        <div className="flex-1 overflow-auto relative scanlines">
          {selectedFile ? (
            <pre className="p-4 text-[13px] leading-[20px] font-mono text-[#c2c6d4] min-h-full">
              <code>{selectedFile.content}</code>
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
              <span className="material-symbols-outlined text-[48px] text-[#c2c6d4]/15">code</span>
              <p className="text-[13px] text-[#c2c6d4]/40">
                {files.length === 0 ? 'Code will appear here as agents generate it' : 'Select a file from the tree'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
