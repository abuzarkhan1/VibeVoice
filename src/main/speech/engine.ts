import { splitChunks } from './chunker'
import { getSpeakerHost, type SpeakerEvent } from './speaker-host'
import { loadSettings } from '../settings/store'
import {
  showSpeakWindow,
  hideSpeakWindow,
  broadcastSpeakState
} from '../windows/speak-overlay'

export type SpeakStatus = 'idle' | 'speaking' | 'paused'

let chunks: string[] = []
let chunkIndex = 0
let status: SpeakStatus = 'idle'
let skipping = false
let listenersAttached = false

function broadcast(): void {
  broadcastSpeakState({
    state: status,
    text: chunks[chunkIndex],
    chunkIndex,
    chunkTotal: chunks.length
  })
}

function attachListeners(): void {
  if (listenersAttached) return
  listenersAttached = true
  const host = getSpeakerHost()
  host.on('event', (event: SpeakerEvent) => {
    if (event.type === 'word' && typeof event.start === 'number' && typeof event.length === 'number') {
      broadcastSpeakState({
        state: status,
        text: chunks[chunkIndex],
        word: { start: event.start, length: event.length },
        chunkIndex,
        chunkTotal: chunks.length
      })
    } else if (event.type === 'paused') {
      status = 'paused'
      broadcast()
    } else if (event.type === 'resumed') {
      status = 'speaking'
      broadcast()
    } else if (event.type === 'done') {
      if (skipping) {
        skipping = false
        return
      }
      if (chunkIndex + 1 < chunks.length) {
        chunkIndex += 1
        void speakCurrent()
      } else {
        reset()
      }
    }
  })
  host.on('exit', () => reset())
}

async function speakCurrent(): Promise<void> {
  const text = chunks[chunkIndex]
  if (!text) return
  const settings = await loadSettings()
  const host = getSpeakerHost()
  attachListeners()
  host.ensure(settings.speech.voice, settings.speech.rate)
  status = 'speaking'
  broadcast()
  showSpeakWindow()
  host.send({
    cmd: 'speak',
    text,
    voice: settings.speech.voice,
    rate: settings.speech.rate
  })
}

function reset(): void {
  chunks = []
  chunkIndex = 0
  status = 'idle'
  hideSpeakWindow()
  broadcastSpeakState({ state: 'idle' })
}

export async function speak(text: string): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return
  chunks = splitChunks(trimmed)
  chunkIndex = 0
  skipping = false
  if (chunks.length === 0) return
  await speakCurrent()
}

export function stop(): void {
  skipping = false
  getSpeakerHost().send({ cmd: 'stop' })
  reset()
}

export function togglePause(): void {
  const host = getSpeakerHost()
  if (status === 'speaking') host.send({ cmd: 'pause' })
  else if (status === 'paused') host.send({ cmd: 'resume' })
}

export function nextChunk(): void {
  if (chunkIndex + 1 >= chunks.length) return
  skipping = true
  chunkIndex += 1
  getSpeakerHost().send({ cmd: 'stop' })
  void speakCurrent()
}

export function prevChunk(): void {
  if (chunkIndex <= 0) return
  skipping = true
  chunkIndex -= 1
  getSpeakerHost().send({ cmd: 'stop' })
  void speakCurrent()
}

export function isSpeaking(): boolean {
  return status !== 'idle'
}
