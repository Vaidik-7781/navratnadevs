'use client'
import { useState, useCallback, useMemo } from 'react'
import type { GeneratedFile, FileTreeNode } from '@/types'
import { detectLanguage } from '@/lib/utils'

export function useCodeOutput() {
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)

  const addFile = useCallback((file: GeneratedFile) => {
    setFiles(prev => {
      const exists = prev.find(f => f.filepath === file.filepath)
      if (exists) return prev.map(f => f.filepath === file.filepath ? file : f)
      return [...prev, file]
    })
  }, [])

  const addFiles = useCallback((newFiles: GeneratedFile[]) => {
    setFiles(prev => {
      const merged = [...prev]
      for (const file of newFiles) {
        const idx = merged.findIndex(f => f.filepath === file.filepath)
        if (idx >= 0) merged[idx] = file
        else merged.push(file)
      }
      return merged
    })
  }, [])

  const selectFile = useCallback((filepath: string) => {
    const file = files.find(f => f.filepath === filepath)
    setSelectedFile(file || null)
  }, [files])

  const clearFiles = useCallback(() => {
    setFiles([])
    setSelectedFile(null)
  }, [])

  // Build nested file tree from flat file list
  const fileTree = useMemo((): Record<string, FileTreeNode> => {
    const tree: Record<string, FileTreeNode> = {}

    for (const file of files) {
      const parts = file.filepath.split('/')
      let node = tree

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!node[part]) {
          node[part] = { name: part, path: parts.slice(0, i + 1).join('/'), type: 'folder', children: {} }
        }
        node = node[part].children!
      }

      const filename = parts[parts.length - 1]
      node[filename] = {
        name: filename,
        path: file.filepath,
        type: 'file',
        language: file.language || detectLanguage(filename),
        id: file.id,
        agent: file.agent_name,
      }
    }

    return tree
  }, [files])

  // Group files by type
  const filesByType = useMemo(() => {
    return files.reduce((acc, file) => {
      const type = file.file_type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(file)
      return acc
    }, {} as Record<string, GeneratedFile[]>)
  }, [files])

  const totalLines = useMemo(() => {
    return files.reduce((sum, f) => sum + (f.content.split('\n').length), 0)
  }, [files])

  return {
    files,
    selectedFile,
    fileTree,
    filesByType,
    totalLines,
    addFile,
    addFiles,
    selectFile,
    clearFiles,
    fileCount: files.length,
  }
}
