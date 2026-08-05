import { spawn, type ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { join } from 'path'
import { app } from 'electron'

export interface HoldEvent {
  type: 'ready' | 'down' | 'up' | 'perm-error' | 'exit'
  combo?: string
  message?: string
}

function holdWatcherBinary(): string {
  const sub = 'native/hold-watcher'
  if (app.isPackaged) return join(process.resourcesPath, sub)
  return join(app.getAppPath(), 'build', sub)
}

export class HoldWatcher extends EventEmitter {
  private proc: ChildProcess | null = null
  private buffer = ''
  private currentCombo: string | null = null

  start(combo: string): void {
    if (this.proc) {
      if (this.currentCombo === combo) return
      this.stop()
    }
    this.currentCombo = combo
    this.proc = spawn(holdWatcherBinary(), [combo], { stdio: ['pipe', 'pipe', 'pipe'] })
    this.proc.stdout?.setEncoding('utf-8')
    this.proc.stdout?.on('data', (chunk: string) => this.consume(chunk))
    this.proc.stderr?.on('data', (chunk) => process.stderr.write(`[hold-watcher] ${chunk}`))
    this.proc.on('exit', () => {
      this.proc = null
      this.currentCombo = null
      this.emit('event', { type: 'exit' } satisfies HoldEvent)
    })
    this.proc.on('error', (err) => {
      this.emit('event', { type: 'perm-error', message: err.message } satisfies HoldEvent)
    })
  }

  private consume(chunk: string): void {
    this.buffer += chunk
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const event = JSON.parse(trimmed) as HoldEvent
        this.emit('event', event)
      } catch (err) {
        console.warn('[hold-watcher] failed to parse event line:', err)
      }
    }
  }

  stop(): void {
    if (!this.proc) return
    try {
      this.proc.kill('SIGTERM')
    } catch (err) {
      console.warn('[hold-watcher] SIGTERM failed:', err)
    }
  }

  setCombo(combo: string): void {
    if (this.currentCombo === combo) return
    this.stop()
    setTimeout(() => this.start(combo), 80)
  }

  get isRunning(): boolean {
    return this.proc !== null
  }
}

let singleton: HoldWatcher | null = null

export function getHoldWatcher(): HoldWatcher {
  if (!singleton) singleton = new HoldWatcher()
  return singleton
}
