import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Check, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { AIProviderId } from '../../../main/settings/types'
import type { KeyMeta as AIKeyMeta } from '../../../main/ai/key-store'

export const PROVIDER_LABEL: Record<AIProviderId, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google Gemini'
}

export const PROVIDER_HINT: Record<AIProviderId, string> = {
  anthropic: 'Claude 4 family. Opus 4.7, Sonnet 4.6, Haiku 4.5. Tap default.',
  openai: 'GPT-5.5 flagship plus the 5.4 family and the 5.3 Codex coding model.',
  gemini: 'Gemini 3.5 Flash flagship plus the 3.1 preview and 2.5 GA family.'
}

interface Props {
  provider: AIProviderId
  meta: AIKeyMeta | undefined
  models: readonly string[]
  selectedModel: string | undefined
  defaultModel: string
  onModelChange: (model: string) => void
  onKeyChange: () => void
}

export const ProviderRow: React.FC<Props> = ({
  provider,
  meta,
  models,
  selectedModel,
  defaultModel,
  onModelChange,
  onKeyChange
}) => {
  const [editing, setEditing] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState<'save' | 'validate' | 'clear' | null>(null)

  const handleSave = useCallback(
    async (nextKey: string) => {
      setBusy('save')
      try {
        await window.electron.setAIKey(provider, nextKey)
        toast.success(`${PROVIDER_LABEL[provider]} key saved`)
        setEditing(false)
        setDraft('')
        onKeyChange()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save key')
      } finally {
        setBusy(null)
      }
    },
    [provider, onKeyChange]
  )

  const handleValidate = useCallback(async () => {
    const target = editing ? draft : ''
    if (!target) return
    setBusy('validate')
    try {
      await window.electron.validateAIKey(provider, target)
      toast.success(`${PROVIDER_LABEL[provider]} key is valid`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `${PROVIDER_LABEL[provider]} rejected the key`
      )
    } finally {
      setBusy(null)
    }
  }, [provider, draft, editing])

  const handleClear = useCallback(async () => {
    setBusy('clear')
    try {
      await window.electron.clearAIKey(provider)
      toast.success(`${PROVIDER_LABEL[provider]} key removed`)
      onKeyChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove key')
    } finally {
      setBusy(null)
    }
  }, [provider, onKeyChange])

  const hasKey = meta?.hasKey ?? false
  const masked = meta?.masked ?? null

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground">{PROVIDER_LABEL[provider]}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{PROVIDER_HINT[provider]}</p>
          </div>
          {hasKey && !editing && (
            // WHY: no success token in the design system; emerald-500 is the deliberate connected-state color
            <span className="text-xs text-emerald-500 flex items-center gap-1 flex-shrink-0">
              <Check className="w-3 h-3" aria-hidden="true" />
              Connected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder={`Paste your ${PROVIDER_LABEL[provider]} API key`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSave(draft)
                  if (e.key === 'Escape') {
                    setEditing(false)
                    setDraft('')
                  }
                }}
                autoFocus
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowKey((s) => !s)}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                type="button"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void handleValidate()}
                disabled={busy !== null || draft.length === 0}
              >
                {busy === 'validate' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Validate'}
              </Button>
              <Button
                size="sm"
                onClick={() => void handleSave(draft)}
                disabled={busy !== null || draft.length === 0}
              >
                {busy === 'save' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1 text-sm font-mono text-muted-foreground">
                {hasKey ? masked : 'No key set'}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                {hasKey ? 'Change' : 'Add key'}
              </Button>
              {hasKey && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => void handleClear()}
                  disabled={busy !== null}
                  aria-label={`Remove ${PROVIDER_LABEL[provider]} key`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {busy === 'clear' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        {hasKey && models.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground w-12">Model</span>
            <Select
              value={selectedModel ?? defaultModel}
              onValueChange={(v) => onModelChange(v)}
            >
              <SelectTrigger className="h-7 text-xs w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model} className="text-xs">
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
