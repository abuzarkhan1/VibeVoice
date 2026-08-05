import { spawn, type ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { join } from 'path'
import { app } from 'electron'

export interface SpeechEvent {
  type: 'ready' | 'partial' | 'final' | 'audio-rms' | 'error' | 'exit'
  text?: string
  value?: number
  message?: string
  code?: string
}

function appBundleBinary(): string {
  if (app.isPackaged) {
    return join(
      process.resourcesPath,
      'native/SpeechRecognizer.app/Contents/MacOS/SpeechRecognizer'
    )
  }
  return join(
    app.getAppPath(),
    'build/native/SpeechRecognizer.app/Contents/MacOS/SpeechRecognizer'
  )
}

function tapSpawnPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'native/tap-spawn')
  }
  return join(app.getAppPath(), 'build/native/tap-spawn')
}

export class SpeechSession extends EventEmitter {
  private proc: ChildProcess | null = null
  private buffer = ''
  private stopping = false

  start(language = 'en-US'): void {
    const target = appBundleBinary()
    const wrapper = tapSpawnPath()
    this.proc = spawn(wrapper, [target, language], { stdio: ['pipe', 'pipe', 'pipe'] })
    this.proc.stdout?.setEncoding('utf-8')
    this.proc.stdout?.on('data', (chunk: string) => this.consume(chunk))
    this.proc.stderr?.on('data', (chunk) => {
      process.stderr.write(`[speech-recognizer] ${chunk}`)
    })
    this.proc.on('exit', (code) => {
      this.proc = null
      this.emit('event', {
        type: 'exit',
        code: code === null ? undefined : String(code)
      } satisfies SpeechEvent)
    })
    this.proc.on('error', (err) => {
      console.error('[speech-host] proc error:', err)
      this.emit('event', {
        type: 'error',
        message: err.message
      } satisfies SpeechEvent)
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
        const event = JSON.parse(trimmed) as SpeechEvent
        this.emit('event', event)
      } catch (err) {
        console.warn('[speech-host] failed to parse event line:', err)
      }
    }
  }

  stop(): void {
    if (this.stopping || !this.proc) return
    this.stopping = true
    try {
      this.proc.kill('SIGTERM')
    } catch (err) {
      console.warn('[speech-host] SIGTERM failed:', err)
    }
    setTimeout(() => {
      if (this.proc) {
        try {
          this.proc.kill('SIGKILL')
        } catch (err) {
          console.warn('[speech-host] SIGKILL failed:', err)
        }
      }
    }, 2500)
  }

  get isRunning(): boolean {
    return this.proc !== null
  }
}
