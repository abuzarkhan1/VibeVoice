import { z } from 'zod'
import { safeHandle } from './safe-handle'
import { nextChunk, prevChunk, stop, togglePause, speak } from '../speech/engine'
import { listVoices } from '../speech/voices'

export function registerSpeechIpc(): void {
  safeHandle('tts:list-voices', [] as const, () => listVoices())
  safeHandle(
    'tts:preview',
    [z.string().min(1).max(1000)] as const,
    async (_e, text) => {
      await speak(text)
    }
  )
  safeHandle('tts:toggle-pause', [] as const, () => togglePause())
  safeHandle('tts:stop', [] as const, () => stop())
  safeHandle('tts:next', [] as const, () => nextChunk())
  safeHandle('tts:prev', [] as const, () => prevChunk())
}
