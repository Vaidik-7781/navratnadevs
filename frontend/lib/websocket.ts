import type { WSEvent, WSEventType } from '@/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

type EventHandler<T = unknown> = (data: T, event: WSEvent<T>) => void
type HandlerMap = Partial<Record<WSEventType | 'error' | 'open' | 'close', EventHandler[]>>

// ─── WEBSOCKET CLIENT ─────────────────────────────────────────────────────────

export class NavratnaSocket {
  private ws: WebSocket | null = null
  private sessionId: string
  private handlers: HandlerMap = {}
  private reconnectAttempts = 0
  private maxReconnects = 5
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private isManualClose = false

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_URL}/ws/${this.sessionId}`)

        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          this.startPing()
          this.emit('open', null)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const parsed: WSEvent = JSON.parse(event.data)
            if (parsed.data === 'pong') return
            this.emit(parsed.type, parsed.data, parsed)
          } catch {
            // ignore malformed messages
          }
        }

        this.ws.onerror = (error) => {
          this.emit('error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          this.stopPing()
          this.emit('close', null)
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnects) {
            this.reconnectAttempts++
            setTimeout(() => this.connect(), 1000 * this.reconnectAttempts)
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  on<T = unknown>(event: WSEventType | 'error' | 'open' | 'close', handler: EventHandler<T>): this {
    if (!this.handlers[event]) this.handlers[event] = []
    this.handlers[event]!.push(handler as EventHandler)
    return this
  }

  off(event: WSEventType | 'error' | 'open' | 'close', handler: EventHandler): this {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event]!.filter(h => h !== handler)
    }
    return this
  }

  private emit<T>(event: string, data: T, fullEvent?: WSEvent<T>): void {
    const handlers = this.handlers[event as WSEventType]
    if (handlers) {
      handlers.forEach(h => h(data, fullEvent as WSEvent))
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping')
      }
    }, 25000)
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  disconnect(): void {
    this.isManualClose = true
    this.stopPing()
    this.ws?.close()
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// ─── SINGLETON FACTORY ────────────────────────────────────────────────────────

const sockets: Map<string, NavratnaSocket> = new Map()

export function getSocket(sessionId: string): NavratnaSocket {
  if (!sockets.has(sessionId)) {
    sockets.set(sessionId, new NavratnaSocket(sessionId))
  }
  return sockets.get(sessionId)!
}

export function closeSocket(sessionId: string): void {
  const socket = sockets.get(sessionId)
  if (socket) {
    socket.disconnect()
    sockets.delete(sessionId)
  }
}
