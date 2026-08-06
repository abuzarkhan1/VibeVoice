import { EventEmitter } from 'events'
import type {
  HoldWatcherAdapter,
  SpeechRecognizerAdapter,
  SelectionGrabberAdapter,
  TTSSpeakerAdapter,
  TextInjectorAdapter,
  HoldEvent,
  SpeechEvent
} from '../interfaces'

export class LinuxHoldWatcherAdapter extends EventEmitter implements HoldWatcherAdapter {
  private _isRunning = false

  start(combo: string): void {
    console.warn(`[linux-adapter] HoldWatcher start combo="${combo}" (evdev/X11 pending Phase 3)`)
    this._isRunning = true
  }

  stop(): void {
    console.warn('[linux-adapter] HoldWatcher stop')
    this._isRunning = false
  }

  override on(event: 'event', listener: (evt: HoldEvent) => void): this {
    super.on(event, listener)
    return this
  }

  setCombo(combo: string): void {
    console.warn(`[linux-adapter] HoldWatcher setCombo combo="${combo}"`)
  }

  get isRunning(): boolean {
    return this._isRunning
  }
}

export class LinuxSpeechRecognizerAdapter extends EventEmitter implements SpeechRecognizerAdapter {
  private _isRunning = false

  start(language = 'en-US'): void {
    console.warn(`[linux-adapter] SpeechRecognizer start language="${language}" (whisper.cpp pending Phase 3)`)
    this._isRunning = true
  }

  stop(): void {
    console.warn('[linux-adapter] SpeechRecognizer stop')
    this._isRunning = false
  }

  override on(event: 'event', listener: (evt: SpeechEvent) => void): this {
    super.on(event, listener)
    return this
  }

  get isRunning(): boolean {
    return this._isRunning
  }
}

export class LinuxSelectionGrabberAdapter implements SelectionGrabberAdapter {
  async grabText(_targetBundleId?: string): Promise<string> {
    console.warn('[linux-adapter] SelectionGrabber grabText (xclip/wl-paste pending Phase 3)')
    return ''
  }
}

export class LinuxTTSSpeakerAdapter extends EventEmitter implements TTSSpeakerAdapter {
  private _isRunning = false

  speak(text: string, voice?: string, rate?: number): void {
    console.warn(`[linux-adapter] TTSSpeaker speak text="${text.slice(0, 20)}..." voice="${voice}" rate="${rate}" (piper/espeak pending Phase 3)`)
    this._isRunning = true
  }

  stop(): void {
    console.warn('[linux-adapter] TTSSpeaker stop')
    this._isRunning = false
  }

  pause(): void {
    console.warn('[linux-adapter] TTSSpeaker pause')
  }

  resume(): void {
    console.warn('[linux-adapter] TTSSpeaker resume')
  }

  override on(event: 'event' | 'exit' | 'error', listener: (...args: any[]) => void): this {
    super.on(event, listener)
    return this
  }

  get isRunning(): boolean {
    return this._isRunning
  }
}

export class LinuxTextInjectorAdapter implements TextInjectorAdapter {
  async injectText(_text: string): Promise<void> {
    console.warn('[linux-adapter] TextInjector injectText (xdotool/wtype pending Phase 3)')
  }
}
