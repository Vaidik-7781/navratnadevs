'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgents } from '@/hooks/useAgents'
import { useStreaming } from '@/hooks/useStreaming'
import { useCodeOutput } from '@/hooks/useCodeOutput'
import { useRealtime } from '@/hooks/useRealtime'
import AgentSidebar from '@/components/build/AgentSidebar'
import ChatFeed from '@/components/build/ChatFeed'
import CodeViewer from '@/components/build/CodeViewer'
import SprintBoard from '@/components/build/SprintBoard'
import {
  MetricsDashboard, APICallInspector, CodexFlowPanel,
  TeamHealthMeter, VotingModal, ConflictResolver, DiagramPanel
} from '@/components/build/BuildComponents'
import { BuilderDNAPanel, TimeSavedCard, ShareKit, OutputExporter } from '@/components/output/OutputComponents'
import { outputsApi, agentsApi, shareApi } from '@/lib/api'
import type {
  AgentMessage, SprintCard, Conflict, APICallLogEvent,
  VoteUpdateEvent, PipelineCompleteEvent, TeamHealth, BuilderDNA, CodexFlowStage
} from '@/types'

const DEFAULT_HEALTH: TeamHealth = { morale: 8, conflicts: 0, blockers: 0, velocity: 'Starting', risk_level: 'Low' }

export default function BuildPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const router = useRouter()

  // Core state
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [sprintCards, setSprintCards] = useState<SprintCard[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [apiLogs, setApiLogs] = useState<APICallLogEvent[]>([])
  const [activeVote, setActiveVote] = useState<VoteUpdateEvent | null>(null)
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null)
  const [health, setHealth] = useState<TeamHealth>(DEFAULT_HEALTH)
  const [builderDNA, setBuilderDNA] = useState<BuilderDNA | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [codexFlow, setCodexFlow] = useState<CodexFlowStage[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'sprint' | 'metrics' | 'dna'>('code')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [activeAgentName, setActiveAgentName] = useState<string | undefined>()
  const [idea, setIdea] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const { agents, setAgentStatus, setAgentMood, addMessage, completedCount } = useAgents()
  const { streamingTexts, appendToken, clearStream } = useStreaming()
  const { files, fileTree, selectedFile, addFile, addFiles, selectFile, fileCount } = useCodeOutput()

  // Start timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Stop timer on complete
  useEffect(() => {
    if (isComplete) clearInterval(timerRef.current)
  }, [isComplete])

  // Load initial session data
  useEffect(() => {
    if (!sessionId) return
    outputsApi.getFull(sessionId).then(data => {
      setIdea(data.session.idea || '')
      if (data.messages?.length) setMessages(data.messages)
      if (data.files?.length) addFiles(data.files)
      if (data.sprint_cards?.length) setSprintCards(data.sprint_cards)
      if (data.session.status === 'complete') setIsComplete(true)
    }).catch(console.error)

    agentsApi.getRoster().then(data => {
      // roster loaded for reference
    }).catch(() => { })
  }, [sessionId])

  // Realtime WebSocket
  useRealtime({
    sessionId,
    onAgentThinking: (name) => {
      setActiveAgentName(name)
      setAgentStatus(name, 'thinking')
    },
    onAgentToken: (name, token) => {
      setAgentStatus(name, 'streaming')
      appendToken(name, token)
    },
    onAgentMessage: (msg) => {
      setMessages(prev => {
        const exists = prev.find(m => m.agent_name === msg.agent_name && m.sequence_order === msg.sequence_order)
        if (exists) return prev
        return [...prev, msg]
      })
      clearStream(msg.agent_name)
      addMessage(msg)
      setActiveAgentName(undefined)
    },
    onMoodUpdate: (name, mood) => setAgentMood(name, mood),
    onSprintUpdate: (card) => setSprintCards(prev => {
      const exists = prev.findIndex(c => c.id === card.id)
      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = { ...updated[exists], ...card }
        return updated
      }
      return [...prev, card]
    }),
    onConflictStart: (c) => setActiveConflict({ agent_a: c.agent_a, agent_b: c.agent_b, topic: c.topic, votes_for_a: 0, votes_for_b: 0, session_id: sessionId }),
    onConflictResolved: (c) => {
      setConflicts(prev => [...prev, c])
      setActiveConflict(null)
    },
    onVoteUpdate: (v) => setActiveVote(v),
    onFileGenerated: async (_f) => {
      try {
        const result = await outputsApi.getFiles(sessionId)
        if (result.files?.length) addFiles(result.files)
      } catch { }
    },
    onAPICallLog: (log) => setApiLogs(prev => {
      const idx = prev.findIndex(l => l.agent_name === log.agent_name)
      if (idx >= 0) { const n = [...prev]; n[idx] = log; return n }
      return [...prev, log]
    }),
    onPipelineComplete: async (data) => {
      setIsComplete(true)
      setHealth(data.team_health)
      if (data.builder_dna) setBuilderDNA(data.builder_dna)
      clearInterval(timerRef.current)
      setActiveTab('dna')
      // Load all files on complete
      try {
        const full = await outputsApi.getFull(sessionId)
        addFiles(full.files)
        // Create share link
        const share = await shareApi.create(sessionId)
        setShareUrl(share.share_url)
      } catch { }
    },
    onPipelineError: (err) => console.error('Pipeline error:', err),
  })

  const activeAgent = agents.find(a => a.name === activeAgentName)
  const architectOutput = messages.find(m => m.agent_name === 'Architect')?.message

  const TABS = [
    { key: 'code', label: 'Code', icon: 'code', badge: fileCount || undefined },
    { key: 'sprint', label: 'Sprint', icon: 'view_kanban', badge: sprintCards.filter(c => c.status === 'done').length || undefined },
    { key: 'metrics', label: 'Metrics', icon: 'monitoring', badge: undefined },
    { key: 'dna', label: 'DNA', icon: 'dna', badge: isComplete ? '✓' : undefined },
  ]

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="liquid-glass border-b border-white/8 px-4 py-3 flex items-center gap-3 flex-shrink-0 z-40">
        <button onClick={() => router.push('/')} className="p-1.5 rounded-lg hover:bg-white/8 text-[#c2c6d4] transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined filled text-[#4f90f3] text-[20px]">token</span>
          <span className="font-bold text-[16px] text-[#aac7ff] hidden sm:block">NavratnaDevs</span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <p className="text-[13px] text-[#c2c6d4]/60 truncate max-w-xs hidden sm:block">{idea}</p>

        <div className="ml-auto flex items-center gap-3">
          <TeamHealthMeter health={health} />
          {isComplete && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27c93f]/15 border border-[#27c93f]/30 text-[12px] font-semibold text-[#27c93f]">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Shipped
            </span>
          )}
          {!isComplete && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4f90f3]/10 border border-[#4f90f3]/20 text-[12px] font-semibold text-[#4f90f3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f90f3] animate-pulse" />
              Building...
            </span>
          )}
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Agent Sidebar */}
        <div className="w-52 flex-shrink-0 p-3 border-r border-white/5 overflow-y-auto">
          <AgentSidebar
            agents={agents}
            completedCount={completedCount}
            activeAgentName={activeAgentName}
            onAgentClick={(name) => {
              const msg = messages.filter(m => m.agent_name === name).pop()
              if (msg) {
                const el = document.getElementById(`msg-${msg.sequence_order}`)
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }}
          />
        </div>

        {/* Center: Chat Feed */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
          {/* Codex flow strip */}
          {codexFlow.length > 0 && (
            <div className="flex-shrink-0">
              <CodexFlowPanel stages={codexFlow} />
            </div>
          )}

          {/* Conflict / Vote overlays */}
          <AnimatePresence>
            {activeConflict && (
              <div className="flex-shrink-0">
                <ConflictResolver conflict={activeConflict} />
              </div>
            )}
            {activeVote && (
              <div className="flex-shrink-0">
                <VotingModal vote={activeVote} visible={!!activeVote} />
              </div>
            )}
          </AnimatePresence>

          {/* Main chat */}
          <div className="flex-1 overflow-hidden">
            <ChatFeed
              messages={messages}
              streamingTexts={streamingTexts}
              activeAgentName={activeAgentName}
              activeAgentEmoji={activeAgent?.emoji}
            />
          </div>
        </div>

        {/* Right: Tabbed panel */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-l border-white/5 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/8 flex-shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-medium transition-all relative ${activeTab === tab.key
                  ? 'text-[#4f90f3] bg-[#4f90f3]/8'
                  : 'text-[#c2c6d4]/50 hover:text-[#c2c6d4] hover:bg-white/3'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span className="hidden lg:block">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#4f90f3] text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.key && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4f90f3]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {activeTab === 'code' && (
              <div className="flex flex-col gap-3 h-full">
                <div className="flex-1 min-h-0" style={{ height: '60%' }}>
                  <CodeViewer
                    files={files}
                    fileTree={fileTree}
                    selectedFile={selectedFile}
                    onSelect={selectFile}
                  />
                </div>
                <DiagramPanel architectureText={architectOutput} />
                <APICallInspector logs={apiLogs} />
              </div>
            )}

            {activeTab === 'sprint' && (
              <SprintBoard cards={sprintCards} />
            )}

            {activeTab === 'metrics' && (
              <div className="flex flex-col gap-3">
                <MetricsDashboard
                  health={health}
                  totalFiles={fileCount}
                  totalMessages={messages.length}
                  timeElapsed={timeElapsed}
                />
                <APICallInspector logs={apiLogs} />
                {codexFlow.length > 0 && <CodexFlowPanel stages={codexFlow} />}
              </div>
            )}

            {activeTab === 'dna' && (
              <div className="flex flex-col gap-4">
                {builderDNA ? (
                  <>
                    <BuilderDNAPanel dna={builderDNA} />
                    <TimeSavedCard weeks={builderDNA.time_saved_weeks} totalTime={timeElapsed} />
                    <ShareKit dna={builderDNA} shareUrl={shareUrl} />
                    <OutputExporter files={files} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                    <span className="material-symbols-outlined text-[48px] text-[#c2c6d4]/15">dna</span>
                    <p className="text-[13px] text-[#c2c6d4]/40">Builder DNA will appear when all agents complete</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
