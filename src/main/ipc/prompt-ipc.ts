import { z } from 'zod'
import { safeHandle } from './safe-handle'
import {
  abortPrompt,
  closePrompt,
  copyResponse,
  submitPrompt
} from '../prompt/controller'
import { clipboard } from 'electron'

export function registerPromptIpc(): void {
  safeHandle(
    'prompt:submit',
    [z.string().min(1).max(20000)] as const,
    async (_e, text) => {
      void submitPrompt(text)
    }
  )
  safeHandle('prompt:abort', [] as const, () => abortPrompt())
  safeHandle('prompt:close', [] as const, () => closePrompt())
  safeHandle(
    'clipboard:write',
    [z.string().min(1).max(1_000_000)] as const,
    (_e, text) => {
      clipboard.writeText(text)
    }
  )
  safeHandle(
    'system:paste',
    [z.string().min(1).max(1_000_000)] as const,
    async (_e, text) => {
      await copyResponse(text)
    }
  )
}
