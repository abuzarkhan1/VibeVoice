export type DictationCombo = 'fn' | 'right-cmd+right-opt' | 'ctrl+opt'
export type AIProviderId = 'anthropic' | 'openai' | 'gemini'
export type Theme = 'dark' | 'light'

export interface DictationSettings {
  combo: DictationCombo
  language: string
  soundEnabled: boolean
  aiCleanup: {
    enabled: boolean
    prompt: string
  }
}

export interface SpeechSettings {
  hotkey: string
  voice: string
  rate: number
}

export interface AISettings {
  promptHotkey: string
  defaultProvider: AIProviderId
  models: Partial<Record<AIProviderId, string>>
}

export interface AppSettings {
  dictation: DictationSettings
  speech: SpeechSettings
  ai: AISettings
  theme: Theme
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export const DEFAULT_SETTINGS: AppSettings = {
  dictation: {
    combo: 'fn',
    language: 'en-US',
    soundEnabled: true,
    aiCleanup: {
      enabled: false,
      prompt:
        'Clean up this speech-to-text transcript. Fix capitalization and punctuation, remove filler words like "um", "uh", "like". Preserve the exact meaning. Reply with only the cleaned text — no preamble, no quote marks.'
    }
  },
  speech: {
    hotkey: 'CommandOrControl+Shift+S',
    voice: 'Samantha',
    rate: 175
  },
  ai: {
    promptHotkey: 'CommandOrControl+Shift+P',
    defaultProvider: 'anthropic',
    models: {}
  },
  theme: 'dark'
}
