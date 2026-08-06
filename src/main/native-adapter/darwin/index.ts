import { getHoldWatcher, HoldWatcher, type HoldEvent } from '../../dictation/hold-watcher-host'
import { SpeechSession, type SpeechEvent } from '../../dictation/speech-host'
import { captureSelectedText } from '../../dictation/selection-grabber'
import { getSpeakerHost, SpeakerHost } from '../../speech/speaker-host'
import { injectText } from '../../dictation/text-injector'
import type {
  HoldWatcherAdapter,
  SpeechRecognizerAdapter,
  SelectionGrabberAdapter,
  TTSSpeakerAdapter,
  TextInjectorAdapter
} from '../interfaces'

export class DarwinHoldWatcherAdapter implements HoldWatcherAdapter {
  private watcher: HoldWatcher

  constructor(watcher?: HoldWatcher) {
    this.watcher = watcher ?? getHoldWatcher()
  }

  start(combo: string): void {
    this.watcher.start(combo)
  }

  stop(): void {
    this.watcher.stop()
  }

  on(event: 'event', listener: (evt: HoldEvent) => void): this {
    this.watcher.on(event, listener)
    return this
  }

  setCombo(combo: string): void {
    this.watcher.setCombo(combo)
  }

  get isRunning(): boolean {
    return this.watcher.isRunning
  }
}

export class DarwinSpeechRecognizerAdapter implements SpeechRecognizerAdapter {
  private session: SpeechSession

  constructor(session?: SpeechSession) {
    this.session = session ?? new SpeechSession()
  }

  start(language = 'en-US'): void {
    this.session.start(language)
  }

  stop(): void {
    this.session.stop()
  }

  on(event: 'event', listener: (evt: SpeechEvent) => void): this {
    this.session.on(event, listener)
    return this
  }

  get isRunning(): boolean {
    return this.session.isRunning
  }
}

export class DarwinSelectionGrabberAdapter implements SelectionGrabberAdapter {
  async grabText(targetBundleId?: string): Promise<string> {
    return captureSelectedText(targetBundleId)
  }
}

export class DarwinTTSSpeakerAdapter implements TTSSpeakerAdapter {
  private host: SpeakerHost

  constructor(host?: SpeakerHost) {
    this.host = host ?? getSpeakerHost()
  }

  speak(text: string, voice = 'Alex', rate = 175): void {
    this.host.ensure(voice, rate)
    this.host.send({
      cmd: 'speak',
      text,
      voice,
      rate
    })
  }

  stop(): void {
    this.host.send({ cmd: 'stop' })
  }

  pause(): void {
    this.host.send({ cmd: 'pause' })
  }

  resume(): void {
    this.host.send({ cmd: 'resume' })
  }

  on(event: 'event' | 'exit' | 'error', listener: (...args: any[]) => void): this {
    this.host.on(event, listener)
    return this
  }

  get isRunning(): boolean {
    return this.host.isRunning
  }
}

export class DarwinTextInjectorAdapter implements TextInjectorAdapter {
  async injectText(text: string): Promise<void> {
    return injectText(text)
  }
}
