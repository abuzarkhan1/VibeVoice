import { z } from 'zod'
import { safeHandle } from './safe-handle'
import { clearKey, listKeyMeta, setKey } from '../ai/key-store'
import { validateKey, SUPPORTED_MODELS } from '../ai/provider'

const ProviderSchema = z.enum(['anthropic', 'openai', 'gemini'])
const KeySchema = z.string().min(1).max(2000)

export function registerAIKeyIpc(): void {
  safeHandle('ai:list-keys', [] as const, () => listKeyMeta())
  safeHandle('ai:set-key', [ProviderSchema, KeySchema] as const, async (_e, provider, key) => {
    await setKey(provider, key)
  })
  safeHandle('ai:clear-key', [ProviderSchema] as const, async (_e, provider) => {
    await clearKey(provider)
  })
  safeHandle(
    'ai:validate-key',
    [ProviderSchema, KeySchema] as const,
    async (_e, provider, key) => {
      const ok = await validateKey(provider, key)
      if (!ok) throw new Error(`${provider} rejected the key`)
      return true
    }
  )
  safeHandle('ai:list-models', [] as const, () => SUPPORTED_MODELS)
}
