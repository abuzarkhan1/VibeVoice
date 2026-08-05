import { getKey } from './key-store'
import type { AIProviderId } from '../settings/types'

export type { AIProviderId } from '../settings/types'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GenerateOptions {
  provider: AIProviderId
  model?: string
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export const DEFAULT_MODELS: Record<AIProviderId, string> = {
  anthropic: 'claude-opus-4-7',
  openai: 'gpt-5.5',
  gemini: 'gemini-3.5-flash'
}

export const SUPPORTED_MODELS: Record<AIProviderId, readonly string[]> = {
  anthropic: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  openai: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5.3-codex'],
  gemini: [
    'gemini-3.5-flash',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ]
}

function isOpenAIReasoningModel(model: string): boolean {
  return /^o[1-9]/.test(model)
}

export class AIProviderError extends Error {
  constructor(
    public provider: AIProviderId,
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

async function readSSE(
  response: Response,
  onEvent: (data: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!response.body) return
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    if (signal?.aborted) {
      await reader.cancel()
      return
    }
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || !line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') return
      onEvent(data)
    }
  }
}

async function* pump(
  provider: AIProviderId,
  response: Response,
  extract: (data: string) => string | null,
  signal?: AbortSignal
): AsyncIterable<string> {
  const chunks: string[] = []
  let queueResolve: ((value: IteratorResult<string, undefined>) => void) | null = null
  let done = false
  let err: Error | null = null

  void readSSE(
    response,
    (data) => {
      let text: string | null
      try {
        text = extract(data)
      } catch (e) {
        console.warn(
          `[ai:${provider}] malformed SSE event:`,
          (e as Error).message,
          data.slice(0, 200)
        )
        return
      }
      if (!text) return
      if (queueResolve) {
        const resolve = queueResolve
        queueResolve = null
        resolve({ value: text, done: false })
      } else {
        chunks.push(text)
      }
    },
    signal
  )
    .catch((e) => {
      err = e as Error
    })
    .finally(() => {
      done = true
      if (queueResolve) {
        const resolve = queueResolve
        queueResolve = null
        resolve({ value: undefined, done: true })
      }
    })

  while (true) {
    if (chunks.length > 0) {
      yield chunks.shift()!
      continue
    }
    if (done) {
      if (err) throw err
      return
    }
    yield await new Promise<string>((resolve, reject) => {
      queueResolve = (r) => {
        if (r.done) {
          if (err) reject(err)
          else resolve('')
        } else {
          resolve(r.value)
        }
      }
    })
  }
}

// WHY: provider request bodies have disjoint optional fields (system / systemInstruction / generationConfig);
// per-provider interfaces would be noisier than the loose record for three call sites.
type RequestBody = Record<string, unknown>

// WHY: only one field per SSE shape is load-bearing; zod parsing in the hot per-chunk loop
// would add cost without catching anything the extractor doesn't already guard.
type AnthropicEvent = { type?: string; delta?: { type?: string; text?: string } }
type OpenAIEvent = { choices?: { delta?: { content?: string } }[] }
type GeminiEvent = { candidates?: { content?: { parts?: { text?: string }[] } }[] }

async function* streamAnthropic(opts: GenerateOptions): AsyncIterable<string> {
  const key = await getKey('anthropic')
  if (!key) throw new AIProviderError('anthropic', 0, 'Anthropic API key not configured')
  const model = opts.model ?? DEFAULT_MODELS.anthropic
  const system = opts.messages.find((m) => m.role === 'system')?.content
  const rest = opts.messages.filter((m) => m.role !== 'system')
  const body: RequestBody = {
    model,
    max_tokens: opts.maxTokens ?? 1024,
    messages: rest.map((m) => ({ role: m.role, content: m.content })),
    stream: true
  }
  if (system) body.system = system
  if (opts.temperature !== undefined) body.temperature = opts.temperature

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body),
    signal: opts.signal
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new AIProviderError('anthropic', response.status, text || response.statusText)
  }

  yield* pump(
    'anthropic',
    response,
    (data) => {
      const event = JSON.parse(data) as AnthropicEvent
      if (event.type === 'content_block_delta' && event.delta?.text) return event.delta.text
      return null
    },
    opts.signal
  )
}

async function* streamOpenAI(opts: GenerateOptions): AsyncIterable<string> {
  const key = await getKey('openai')
  if (!key) throw new AIProviderError('openai', 0, 'OpenAI API key not configured')
  const model = opts.model ?? DEFAULT_MODELS.openai
  const body: RequestBody = {
    model,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true
  }
  if (opts.maxTokens !== undefined) body.max_tokens = opts.maxTokens
  if (opts.temperature !== undefined && !isOpenAIReasoningModel(model)) {
    body.temperature = opts.temperature
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body),
    signal: opts.signal
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new AIProviderError('openai', response.status, text || response.statusText)
  }

  yield* pump(
    'openai',
    response,
    (data) => {
      const event = JSON.parse(data) as OpenAIEvent
      return event.choices?.[0]?.delta?.content ?? null
    },
    opts.signal
  )
}

async function* streamGemini(opts: GenerateOptions): AsyncIterable<string> {
  const key = await getKey('gemini')
  if (!key) throw new AIProviderError('gemini', 0, 'Gemini API key not configured')
  const model = opts.model ?? DEFAULT_MODELS.gemini

  const contents = opts.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  const system = opts.messages.find((m) => m.role === 'system')?.content
  const body: RequestBody = { contents }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  if (opts.temperature !== undefined) body.generationConfig = { temperature: opts.temperature }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new AIProviderError('gemini', response.status, text || response.statusText)
  }

  yield* pump(
    'gemini',
    response,
    (data) => {
      const event = JSON.parse(data) as GeminiEvent
      return event.candidates?.[0]?.content?.parts?.[0]?.text ?? null
    },
    opts.signal
  )
}

export function generate(opts: GenerateOptions): AsyncIterable<string> {
  switch (opts.provider) {
    case 'anthropic':
      return streamAnthropic(opts)
    case 'openai':
      return streamOpenAI(opts)
    case 'gemini':
      return streamGemini(opts)
    default:
      throw new Error(`unknown provider: ${(opts as { provider: string }).provider}`)
  }
}

export async function validateKey(provider: AIProviderId, key: string): Promise<boolean> {
  if (!key) return false
  try {
    if (provider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: DEFAULT_MODELS.anthropic,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }]
        })
      })
      return r.ok
    }
    if (provider === 'openai') {
      const r = await fetch('https://api.openai.com/v1/models', {
        headers: { authorization: `Bearer ${key}` }
      })
      return r.ok
    }
    if (provider === 'gemini') {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
      )
      return r.ok
    }
  } catch {
    return false
  }
  return false
}
