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

export class Win32HoldWatcherAdapter extends EventEmitter implements HoldWatcherAdapter {
  private _isRunning = false

  start(combo: string): void {
    console.warn(`[win32-adapter] HoldWatcher start combo="${combo}" (Win32 native engine pending Phase 2)`)
    this._isRunning = true
  }

  stop(): void {
    console.warn('[win32-adapter] HoldWatcher stop')
    this._isRunning = false
  }

  override on(event: 'event', listener: (evt: HoldEvent) => void): this {
    super.on(event, listener)
    return this
  }

  setCombo(combo: string): void {
    console.warn(`[win32-adapter] HoldWatcher setCombo combo="${combo}"`)
  }

  get isRunning(): boolean {
    return this._isRunning
  }
}

export class Win32SpeechRecognizerAdapter extends EventEmitter implements SpeechRecognizerAdapter {
  private _isRunning = false

  start(language = 'en-US'): void {
    console.warn(`[win32-adapter] SpeechRecognizer start language="${language}" (WinRT pending Phase 2)`)
    this._isRunning = true
  }

  stop(): void {
    console.warn('[win32-adapter] SpeechRecognizer stop')
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

export class Win32SelectionGrabberAdapter implements SelectionGrabberAdapter {
  async grabText(_targetBundleId?: string): Promise<string> {
    console.warn('[win32-adapter] SelectionGrabber grabText (UI Automation pending Phase 2)')
    return ''
  }
}

export class Win32TTSSpeakerAdapter extends EventEmitter implements TTSSpeakerAdapter {
  private _isRunning = false

  speak(text: string, voice?: string, rate?: number): void {
    console.warn(`[win32-adapter] TTSSpeaker speak text="${text.slice(0, 20)}..." voice="${voice}" rate="${rate}" (SAPI 5 pending Phase 2)`)
    this._isRunning = true
  }

  stop(): void {
    console.warn('[win32-adapter] TTSSpeaker stop')
    this._isRunning = false
  }

  pause(): void {
    console.warn('[win32-adapter] TTSSpeaker pause')
  }

  resume(): void {
    console.warn('[win32-adapter] TTSSpeaker resume')
  }

  override on(event: 'event' | 'exit' | 'error', listener: (...args: any[]) => void): this {
    super.on(event, listener)
    return this
  }

  get isRunning(): boolean {
    return this._isRunning
  }
}

export class Win32TextInjectorAdapter implements TextInjectorAdapter {
  async injectText(_text: string): Promise<void> {
    console.warn('[win32-adapter] TextInjector injectText (SendInput pending Phase 2)')
  }
}
