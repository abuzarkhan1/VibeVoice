import { z } from 'zod'
import { safeHandle } from './safe-handle'
import { loadSettings, saveSettings } from '../settings/store'
import { registerPromptShortcut, registerSpeakShortcut } from '../shortcuts/global'
import { showPrompt } from '../prompt/controller'
import { buildSpeakHandler } from '../dictation/speak-handler'
import { getHoldWatcher } from '../dictation/hold-watcher-host'

const DictationComboSchema = z.enum(['fn', 'right-cmd+right-opt', 'ctrl+opt'])
const AIProviderSchema = z.enum(['anthropic', 'openai', 'gemini'])
const ThemeSchema = z.enum(['dark', 'light'])

const SettingsPatchSchema = z
  .object({
    dictation: z
      .object({
        combo: DictationComboSchema.optional(),
        language: z.string().min(1).max(20).optional(),
        soundEnabled: z.boolean().optional(),
        aiCleanup: z
          .object({
            enabled: z.boolean().optional(),
            prompt: z.string().max(4000).optional()
          })
          .strict()
          .optional()
      })
      .strict()
      .optional(),
    speech: z
      .object({
        hotkey: z.string().min(1).max(200).optional(),
        voice: z.string().min(1).max(200).optional(),
        rate: z.number().int().min(80).max(720).optional()
      })
      .strict()
      .optional(),
    ai: z
      .object({
        promptHotkey: z.string().min(1).max(200).optional(),
        defaultProvider: AIProviderSchema.optional(),
        models: z.record(AIProviderSchema, z.string().min(1).max(200)).optional()
      })
      .strict()
      .optional(),
    theme: ThemeSchema.optional()
  })
  .strict()

export function registerSettingsIpc(): void {
  safeHandle('settings:get', [] as const, () => loadSettings())
  safeHandle('settings:save', [SettingsPatchSchema] as const, async (_event, patch) => {
    const next = await saveSettings(patch)
    if (patch.ai?.promptHotkey) {
      registerPromptShortcut(next.ai.promptHotkey, () => showPrompt())
    }
    if (patch.speech?.hotkey) {
      registerSpeakShortcut(next.speech.hotkey, buildSpeakHandler())
    }
    if (patch.dictation?.combo) {
      getHoldWatcher().setCombo(next.dictation.combo)
    }
    return next
  })
}
