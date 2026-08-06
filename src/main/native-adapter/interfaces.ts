export interface HoldEvent {
  type: 'ready' | 'down' | 'up' | 'perm-error' | 'exit'
  combo?: string
  message?: string
}

export interface SpeechEvent {
  type: 'ready' | 'partial' | 'final' | 'audio-rms' | 'error' | 'exit'
  text?: string
  value?: number
  message?: string
  code?: string
}

export interface SpeakerEvent {
  type: 'ready' | 'start' | 'word' | 'done' | 'paused' | 'resumed'
  text?: string
  start?: number
  length?: number
}

export interface HoldWatcherAdapter {
  start(combo: string): void
  stop(): void
  on(event: 'event', listener: (evt: HoldEvent) => void): this
  setCombo?(combo: string): void
  readonly isRunning?: boolean
}

export interface SpeechRecognizerAdapter {
  start(language?: string): void
  stop(): void
  on(event: 'event', listener: (evt: SpeechEvent) => void): this
  readonly isRunning?: boolean
}

export interface SelectionGrabberAdapter {
  grabText(targetBundleId?: string): Promise<string>
}

export interface TTSSpeakerAdapter {
  speak(text: string, voice?: string, rate?: number): void
  stop(): void
  pause(): void
  resume(): void
  on(event: 'event', listener: (evt: SpeakerEvent) => void): this
  on(event: 'exit' | 'error', listener: (err?: unknown) => void): this
  readonly isRunning?: boolean
}

export interface TextInjectorAdapter {
  injectText(text: string): Promise<void>
}
