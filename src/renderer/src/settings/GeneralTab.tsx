import React, { useEffect, useState } from 'react'
import { Sparkles, Mic, Volume2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { applyTheme } from '../hooks/useTheme'
import type { AppSettings, Theme } from '../../../main/settings/types'

export function GeneralTab(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    void window.electron.getSettings().then((s) => {
      setSettings(s)
      applyTheme(s.theme)
    })
  }, [])

  const handleThemeChange = async (theme: Theme): Promise<void> => {
    applyTheme(theme)
    const next = await window.electron.saveSettings({ theme })
    setSettings(next)
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
        <h2 className="text-xl font-semibold tracking-tight">General</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Appearance and global preferences.
        </p>
      </header>

      <Card>
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Theme</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Dark is the default.</p>
          </div>
          <Select
            value={settings.theme}
            onValueChange={(v) => void handleThemeChange(v as Theme)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-3 grid-cols-3 text-xs text-muted-foreground">
        <FeatureBadge icon={<Mic className="w-3.5 h-3.5" />} label="Voice dictation" />
        <FeatureBadge icon={<Volume2 className="w-3.5 h-3.5" />} label="Speak selected" />
        <FeatureBadge icon={<Sparkles className="w-3.5 h-3.5" />} label="Ask AI" />
      </div>

      <footer className="mt-16 text-center text-[11px] text-muted-foreground font-mono space-y-1">
        <div className="text-foreground/80">VibeVoice v0.1.0</div>
        <p>Voice dictation, text-to-speech, and AI prompt for macOS.</p>
      </footer>
    </div>
  )
}

function FeatureBadge({
  icon,
  label
}: {
  icon: React.ReactNode
  label: string
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-card/50 border border-border">
      <span className="text-brand">{icon}</span>
      <span>{label}</span>
    </div>
  )
}
