import { spawn } from 'child_process'
import { SpeechSession, type SpeechEvent } from './speech-host'
import { injectText } from './text-injector'
import { maybeCleanupTranscript } from './ai-cleanup'
import {
  showWhisperWindow,
  hideWhisperWindow,
  getWhisperWindow
} from '../windows/whisper-overlay'
import { loadSettings } from '../settings/store'

const QUICK_PRESS_GRACE_MS = 250
const FINALIZE_TIMEOUT_MS = 1800

type WhisperState = 'idle' | 'recording' | 'finalizing'

let state: WhisperState = 'idle'
let session: SpeechSession | null = null
let latestText = ''
let pressStartedAt = 0

function playCommitSound(): void {
  try {
    const proc = spawn(
      '/usr/bin/afplay',
      ['-v', '0.5', '/System/Library/Sounds/Purr.aiff'],
      { stdio: 'ignore', detached: true }
    )
    proc.unref()
  } catch {}
}

function broadcast(event: SpeechEvent): void {
  const win = getWhisperWindow()
  if (!win || win.isDestroyed()) return
  win.webContents.send('whisper:event', event)
}

function broadcastState(next: WhisperState): void {
  state = next
  const win = getWhisperWindow()
  if (!win || win.isDestroyed()) return
  win.webContents.send('whisper:state', { state: next })
}

export async function onHoldDown(): Promise<void> {
  if (state !== 'idle') return
  pressStartedAt = Date.now()
  latestText = ''
  broadcastState('recording')
  showWhisperWindow()

  const settings = await loadSettings()
  const next = new SpeechSession()
  session = next
  next.on('event', (event: SpeechEvent) => {
    if (event.type === 'partial' || event.type === 'final') {
      latestText = event.text ?? latestText
    }
    broadcast(event)
  })
  next.start(settings.dictation.language)
}

export async function onHoldUp(): Promise<void> {
  if (state === 'idle') return
  const held = Date.now() - pressStartedAt
  if (held < QUICK_PRESS_GRACE_MS) {
    cancelDictation()
    return
  }
  broadcastState('finalizing')

  const finalizing = session
  session = null
  await waitForFinal(finalizing)
  await commitAndReset()
}

function waitForFinal(s: SpeechSession | null): Promise<void> {
  return new Promise((resolve) => {
    if (!s) return resolve()
    let settled = false
    const finish = (): void => {
      if (settled) return
      settled = true
      resolve()
    }
    s.on('event', (event: SpeechEvent) => {
      if (event.type === 'final') {
        latestText = event.text ?? latestText
        finish()
      } else if (event.type === 'exit' || event.type === 'error') {
        finish()
      }
    })
    s.stop()
    setTimeout(finish, FINALIZE_TIMEOUT_MS)
  })
}

async function commitAndReset(): Promise<void> {
  const raw = latestText.trim()
  if (!raw) {
    hideWhisperWindow()
    broadcastState('idle')
    return
  }
  const finalText = await maybeCleanupTranscript(raw)
  hideWhisperWindow()
  broadcastState('idle')
  try {
    await injectText(finalText)
    const settings = await loadSettings()
    if (settings.dictation.soundEnabled) playCommitSound()
  } catch (err) {
    console.warn('[dictation] inject failed:', err)
  }
}

export function cancelDictation(): void {
  if (session) {
    session.stop()
    session = null
  }
  latestText = ''
  hideWhisperWindow()
  broadcastState('idle')
}

export function isDictationActive(): boolean {
  return state !== 'idle'
}
