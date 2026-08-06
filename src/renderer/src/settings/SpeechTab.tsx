import React, { useEffect, useMemo, useState } from 'react'
import { Keyboard, AudioLines, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import HotkeyRecorder from './HotkeyRecorder'
import type { AppSettings } from '../../../main/settings/types'

interface TTSVoice {
  name: string
  locale: string
}

const PREVIEW_SAMPLE =
  'The quick brown fox jumps over the lazy dog. This is a preview of the selected voice and speed.'

export function SpeechTab(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [voices, setVoices] = useState<TTSVoice[]>([])
  const [showAllVoices, setShowAllVoices] = useState(false)

  useEffect(() => {
    void window.electron.getSettings().then(setSettings)
    void window.electron.ttsListVoices().then(setVoices)
  }, [])

  const visibleVoices = useMemo(() => {
    if (showAllVoices) return voices
    const englishOnly = voices.filter((v) => v.locale.startsWith('en'))
    return englishOnly.length > 0 ? englishOnly : voices
  }, [voices, showAllVoices])

  const handleHotkeyChange = async (hotkey: string): Promise<void> => {
    if (!hotkey) return
    const next = await window.electron.saveSettings({ speech: { hotkey } })
    setSettings(next)
  }

  const handleVoiceChange = async (voice: string): Promise<void> => {
    const next = await window.electron.saveSettings({ speech: { voice } })
    setSettings(next)
  }

  const handleRateChange = (rate: number): void => {
    setSettings((prev) => (prev ? { ...prev, speech: { ...prev.speech, rate } } : prev))
  }

  const handleRateCommit = async (rate: number): Promise<void> => {
    await window.electron.saveSettings({ speech: { rate } })
  }

  const handlePreview = async (): Promise<void> => {
    await window.electron.ttsPreview(PREVIEW_SAMPLE)
  }

  if (!settings) {
    return (
      <div className="p-8 max-w-2xl space-y-3">
        <div className="h-7 w-32 bg-muted/30 rounded animate-pulse" />
        <div className="h-32 w-full bg-muted/10 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Speech</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Read selected text aloud with live word highlight.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <Row icon={<Keyboard className="w-4 h-4 text-muted-foreground" />} title="Speak hotkey">
            <HotkeyRecorder
              value={settings.speech.hotkey}
              onChange={(v) => void handleHotkeyChange(v)}
            />
          </Row>
          <div className="border-t border-border" />
          <Row icon={<AudioLines className="w-4 h-4 text-muted-foreground" />} title="Voice">
            <div className="flex items-center gap-2">
              <Select
                value={settings.speech.voice}
                onValueChange={(v) => void handleVoiceChange(v)}
                disabled={voices.length === 0}
              >
                <SelectTrigger className="w-60">
                  <SelectValue placeholder={voices.length ? 'Select voice' : 'Loading…'} />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {visibleVoices.map((v) => (
                    <SelectItem key={`${v.name}-${v.locale}`} value={v.name}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{v.name}</span>
                        <span className="text-muted-foreground text-xs">{v.locale}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setShowAllVoices((s) => !s)}
              >
                {showAllVoices ? 'English only' : `All ${voices.length}`}
              </Button>
            </div>
          </Row>
          <div className="border-t border-border" />
          <Row
            icon={<Play className="w-4 h-4 text-muted-foreground" />}
            title="Speaking rate"
            description="Words per minute. Default 175."
          >
            <div className="flex items-center gap-4 w-full max-w-md">
              <Slider
                value={[settings.speech.rate]}
                min={80}
                max={360}
                step={10}
                onValueChange={(vals) => handleRateChange(vals[0] ?? 175)}
                onValueCommit={(vals) => void handleRateCommit(vals[0] ?? 175)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                {settings.speech.rate} wpm
              </span>
              <Button variant="outline" size="sm" onClick={() => void handlePreview()}>
                <Play className="w-3.5 h-3.5 mr-1" />
                Preview
              </Button>
            </div>
          </Row>
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
