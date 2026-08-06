import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PROVIDER_LABEL, ProviderRow } from './ProviderRow'
import HotkeyRecorder from './HotkeyRecorder'
import type { AppSettings, AIProviderId } from '../../../main/settings/types'
import type { KeyMeta } from '../../../main/ai/key-store'

const PROVIDERS: AIProviderId[] = ['anthropic', 'openai', 'gemini']

const DEFAULT_MODELS: Record<AIProviderId, string> = {
  anthropic: 'claude-opus-4-7',
  openai: 'gpt-5.5',
  gemini: 'gemini-3.5-flash'
}

export function AITab(): React.JSX.Element {
  const [keys, setKeys] = useState<KeyMeta[] | null>(null)
  const [models, setModels] = useState<Record<AIProviderId, readonly string[]> | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const refreshKeys = useCallback(async () => {
    const next = await window.electron.listAIKeys()
    setKeys(next)
  }, [])

  useEffect(() => {
    void Promise.all([
      window.electron.listAIKeys(),
      window.electron.listAIModels(),
      window.electron.getSettings()
    ]).then(([k, m, s]) => {
      setKeys(k)
      setModels(m)
      setSettings(s)
    })
  }, [])

  const handleModelChange = async (
    provider: AIProviderId,
    model: string
  ): Promise<void> => {
    if (!settings) return
    const next = await window.electron.saveSettings({ ai: { models: { [provider]: model } } })
    setSettings(next)
    toast.success(`${PROVIDER_LABEL[provider]} model set to ${model}`)
  }

  const handleDefaultProviderChange = async (provider: AIProviderId): Promise<void> => {
    const next = await window.electron.saveSettings({ ai: { defaultProvider: provider } })
    setSettings(next)
  }

  const handlePromptHotkeyChange = async (hotkey: string): Promise<void> => {
    if (!hotkey) return
    const next = await window.electron.saveSettings({ ai: { promptHotkey: hotkey } })
    setSettings(next)
    toast.success('Prompt shortcut updated')
  }

  if (!keys || !models || !settings) {
    return (
      <div className="p-8 max-w-2xl space-y-3">
        <div className="h-7 w-32 bg-muted/30 rounded animate-pulse" />
        <div className="h-28 w-full bg-muted/10 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">AI</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect providers for the prompt window and dictation cleanup.
        </p>
      </header>

      <div className="space-y-3">
        {PROVIDERS.map((p) => (
          <ProviderRow
            key={p}
            provider={p}
            meta={keys.find((k) => k.provider === p)}
            models={models[p] ?? []}
            selectedModel={settings.ai.models[p]}
            defaultModel={DEFAULT_MODELS[p]}
            onModelChange={(model) => void handleModelChange(p, model)}
            onKeyChange={() => void refreshKeys()}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Default provider</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Used by Ask AI and dictation cleanup.
              </p>
            </div>
            <Select
              value={settings.ai.defaultProvider}
              onValueChange={(v) => void handleDefaultProviderChange(v as AIProviderId)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PROVIDER_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-border">
            <div>
              <h3 className="text-sm font-medium text-foreground">Prompt shortcut</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Opens the AI prompt window from anywhere.
              </p>
            </div>
            <HotkeyRecorder
              value={settings.ai.promptHotkey}
              onChange={(v) => void handlePromptHotkeyChange(v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
