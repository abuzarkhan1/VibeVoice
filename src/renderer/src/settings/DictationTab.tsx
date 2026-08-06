import React, { useEffect, useState } from 'react'
import { Mic, Sparkles, Volume2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { AppSettings, DictationCombo } from '../../../main/settings/types'

const COMBOS: Array<{ value: DictationCombo; label: string; hint: string }> = [
  { value: 'fn', label: 'Hold Fn', hint: 'Apple keyboards (default)' },
  {
    value: 'right-cmd+right-opt',
    label: 'Hold Right ⌘ + Right ⌥',
    hint: 'External keyboards'
  },
  { value: 'ctrl+opt', label: 'Hold ⌃ + ⌥', hint: 'Universal fallback' }
]

export function DictationTab(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    void window.electron.getSettings().then(setSettings)
  }, [])

  const handleComboChange = async (combo: DictationCombo): Promise<void> => {
    const next = await window.electron.saveSettings({ dictation: { combo } })
    setSettings(next)
  }

  const handleSoundToggle = async (soundEnabled: boolean): Promise<void> => {
    const next = await window.electron.saveSettings({ dictation: { soundEnabled } })
    setSettings(next)
  }

  const handleCleanupToggle = async (enabled: boolean): Promise<void> => {
    const next = await window.electron.saveSettings({
      dictation: { aiCleanup: { enabled } }
    })
    setSettings(next)
  }

  const handleCleanupPromptChange = (prompt: string): void => {
    setSettings((prev) =>
      prev
        ? { ...prev, dictation: { ...prev.dictation, aiCleanup: { ...prev.dictation.aiCleanup, prompt } } }
        : prev
    )
  }

  const handleCleanupPromptCommit = async (): Promise<void> => {
    if (!settings) return
    await window.electron.saveSettings({
      dictation: { aiCleanup: { prompt: settings.dictation.aiCleanup.prompt } }
    })
  }

  if (!settings) {
    return (
      <div className="p-8 max-w-2xl space-y-3">
        <div className="h-7 w-32 bg-muted/30 rounded animate-pulse" />
        <div className="h-32 w-full bg-muted/10 rounded-xl mt-6 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Dictation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hold to talk. Release to paste into the focused field.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <Row icon={<Mic className="w-4 h-4 text-muted-foreground" />} title="Hotkey">
            <Select
              value={settings.dictation.combo}
              onValueChange={(v) => void handleComboChange(v as DictationCombo)}
            >
              <SelectTrigger className="w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMBOS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-muted-foreground text-xs">{c.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <div className="border-t border-border" />
          <Row
            icon={<Volume2 className="w-4 h-4 text-muted-foreground" />}
            title="Confirmation sound"
            description="Plays a soft chime after dictation pastes."
          >
            <Switch
              checked={settings.dictation.soundEnabled}
              onCheckedChange={(v) => void handleSoundToggle(v)}
            />
          </Row>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-foreground">AI cleanup</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Run the transcript through your default provider before pasting.
                </p>
              </div>
            </div>
            <Switch
              checked={settings.dictation.aiCleanup.enabled}
              onCheckedChange={(v) => void handleCleanupToggle(v)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dictation-cleanup-prompt" className="text-xs text-muted-foreground">
              Cleanup prompt
            </Label>
            <Textarea
              id="dictation-cleanup-prompt"
              value={settings.dictation.aiCleanup.prompt}
              onChange={(e) => handleCleanupPromptChange(e.target.value)}
              onBlur={() => void handleCleanupPromptCommit()}
              rows={5}
              className="text-xs font-mono"
              disabled={!settings.dictation.aiCleanup.enabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 ml-6">{description}</p>
      )}
      <div className="mt-4 ml-6">{children}</div>
    </div>
  )
}
