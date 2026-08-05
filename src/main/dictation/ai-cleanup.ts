import { generate, AIProviderError } from '../ai/provider'
import { listKeyMeta } from '../ai/key-store'
import { loadSettings } from '../settings/store'

export async function maybeCleanupTranscript(raw: string): Promise<string> {
  const settings = await loadSettings()
  if (!settings.dictation.aiCleanup.enabled) return raw
  const provider = settings.ai.defaultProvider
  const keys = await listKeyMeta()
  const hasKey = keys.find((k) => k.provider === provider)?.hasKey ?? false
  if (!hasKey) return raw
  try {
    let out = ''
    const stream = generate({
      provider,
      model: settings.ai.models[provider],
      messages: [
        { role: 'system', content: settings.dictation.aiCleanup.prompt },
        { role: 'user', content: raw }
      ],
      temperature: 0.2,
      maxTokens: 1024
    })
    for await (const chunk of stream) out += chunk
    const cleaned = out.trim()
    return cleaned || raw
  } catch (err) {
    const detail =
      err instanceof AIProviderError
        ? `${err.provider}: ${err.message}`
        : (err as Error).message
    console.warn('[dictation] cleanup failed, pasting raw:', detail)
    return raw
  }
}
