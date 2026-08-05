import { spawn, type ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { app } from 'electron'
import { join } from 'path'

export interface SpeakerEvent {
  type: 'ready' | 'start' | 'word' | 'done' | 'paused' | 'resumed'
  text?: string
  start?: number
  length?: number
}

export interface SpeakCommand {
  cmd: 'speak'
  text: string
  voice: string
  rate: number
}

function binaryPath(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'native/tts-speaker')
  return join(app.getAppPath(), 'build/native/tts-speaker')
}

export class SpeakerHost extends EventEmitter {
  private proc: ChildProcess | null = null
  private buffer = ''

  ensure(voice: string, rate: number): ChildProcess {
    if (this.proc) return this.proc
    const proc = spawn(binaryPath(), [voice, String(rate)], {
      stdio: ['pipe', 'pipe', 'ignore'],
      detached: false
    })
    this.proc = proc
    proc.stdout?.setEncoding('utf-8')
    proc.stdout?.on('data', (chunk: string) => this.consume(chunk))
    proc.on('exit', () => {
      if (this.proc === proc) this.proc = null
      this.emit('exit')
    })
    proc.on('error', (err) => {
      if (this.proc === proc) this.proc = null
      this.emit('error', err)
    })
    return proc
  }

  private consume(chunk: string): void {
    this.buffer += chunk
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const event = JSON.parse(trimmed) as SpeakerEvent
        this.emit('event', event)
      } catch (err) {
        console.warn('[speaker-host] failed to parse event line:', err)
      }
    }
  }

  send(cmd: Record<string, unknown>): boolean {
    if (!this.proc || !this.proc.stdin) return false
    try {
      this.proc.stdin.write(JSON.stringify(cmd) + '\n')
      return true
    } catch {
      return false
    }
  }

  stop(): void {
    if (!this.proc) return
    try {
      this.proc.kill('SIGTERM')
    } catch (err) {
      console.warn('[speaker-host] SIGTERM failed:', err)
    }
  }

  get isRunning(): boolean {
    return this.proc !== null
  }
}

let singleton: SpeakerHost | null = null

export function getSpeakerHost(): SpeakerHost {
  if (!singleton) singleton = new SpeakerHost()
  return singleton
}
