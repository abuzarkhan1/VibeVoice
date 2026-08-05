import { clipboard } from 'electron'
import {
  showPromptWindow,
  hidePromptWindow,
  sendPromptEvent
} from '../windows/prompt'
import { loadSettings } from '../settings/store'
import { generate, AIProviderError } from '../ai/provider'
import { listKeyMeta } from '../ai/key-store'

let active: AbortController | null = null

export function showPrompt(): void {
  showPromptWindow()
}

export function closePrompt(): void {
  abortPrompt()
  hidePromptWindow()
}

export function abortPrompt(): void {
  if (active) {
    active.abort()
    active = null
  }
}

export async function submitPrompt(text: string): Promise<void> {
  abortPrompt()
  const trimmed = text.trim()
  if (!trimmed) return

  const settings = await loadSettings()
  const provider = settings.ai.defaultProvider
  const keys = await listKeyMeta()
  const hasKey = keys.find((k) => k.provider === provider)?.hasKey ?? false
  if (!hasKey) {
    sendPromptEvent('prompt:error', {
      message: `No ${provider} API key set. Open Settings → AI to add one.`
    })
    return
  }

  const controller = new AbortController()
  active = controller

  sendPromptEvent('prompt:start', { prompt: trimmed })
  let response = ''

  try {
    const stream = generate({
      provider,
      model: settings.ai.models[provider],
      messages: [{ role: 'user', content: trimmed }],
      signal: controller.signal,
      maxTokens: 2048
    })
    for await (const chunk of stream) {
      response += chunk
      sendPromptEvent('prompt:chunk', { response })
    }
    sendPromptEvent('prompt:done', { response })
  } catch (err) {
    if (controller.signal.aborted) return
    const message =
      err instanceof AIProviderError
        ? `${err.provider}: ${err.message}`
        : (err as Error).message
    sendPromptEvent('prompt:error', { message })
  } finally {
    if (active === controller) active = null
  }
}

export async function copyResponse(text: string): Promise<void> {
  if (!text.trim()) return
  clipboard.writeText(text)
}
