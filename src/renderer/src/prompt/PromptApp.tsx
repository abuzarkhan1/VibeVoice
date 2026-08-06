import React, { useEffect, useRef, useState } from 'react'
import { Send, Copy, ClipboardPaste, Square, X, Sparkles, Code2, Mail, ListCheck, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Phase = 'idle' | 'streaming' | 'done' | 'error'

const PROMPT_PRESETS = [
  {
    icon: <Code2 className="w-3 h-3 text-white/70" />,
    label: 'Refactor Code',
    text: 'Refactor and format this code with clean TypeScript typing and concise comments:'
  },
  {
    icon: <Mail className="w-3 h-3 text-white/70" />,
    label: 'Polish Email',
    text: 'Rewrite this draft into a clear, polite, executive email:'
  },
  {
    icon: <ListCheck className="w-3 h-3 text-white/70" />,
    label: 'Summarize',
    text: 'Summarize the following text into 3 clear key bullet points:'
  },
  {
    icon: <HelpCircle className="w-3 h-3 text-white/70" />,
    label: 'Explain',
    text: 'Explain this concept clearly and simply in two paragraphs:'
  }
]

export function PromptApp(): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const responseRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const offStart = window.electron.onPromptStart(() => {
      setResponse('')
      setError(null)
      setPhase('streaming')
    })
    const offChunk = window.electron.onPromptChunk((payload) => {
      setResponse(payload.response)
    })
    const offDone = window.electron.onPromptDone((payload) => {
      setResponse(payload.response)
      setPhase('done')
    })
    const offError = window.electron.onPromptError((payload) => {
      setError(payload.message)
      setPhase('error')
    })
    return () => {
      offStart()
      offChunk()
      offDone()
      offError()
    }
  }, [])

  useEffect(() => {
    if (!responseRef.current) return
    responseRef.current.scrollTop = responseRef.current.scrollHeight
  }, [response])

  const submit = (): void => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    void window.electron.promptSubmit(trimmed)
  }

  const close = (): void => {
    void window.electron.promptClose()
  }

  const abort = (): void => {
    void window.electron.promptAbort()
    setPhase('idle')
  }

  const copy = (): void => {
    if (!response.trim()) return
    void window.electron.writeClipboard(response)
  }

  const paste = (): void => {
    if (!response.trim()) return
    void window.electron.pasteToFrontmost(response)
    close()
  }

  const applyPreset = (presetText: string): void => {
    setPrompt(presetText + ' ')
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      if (phase === 'streaming') abort()
      else close()
    }
  }

  const isStreaming = phase === 'streaming'
  const hasResponse = response.trim().length > 0

  return (
    <div className="w-full h-full p-[10px]">
      <div className="tap-glass-panel tap-glass-panel--prompt relative w-full h-full overflow-hidden flex flex-col border border-white/10 bg-black/80">
        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white/80 animate-pulse" />
            <span className="font-semibold tracking-wider text-[11px] uppercase text-white/90">
              VibeVoice AI Launcher
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Input Area */}
        <div className="relative px-4 pt-3 space-y-2">
          <Textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask AI or select a preset below…"
            rows={3}
            className="resize-none bg-white/[0.04] border border-white/10 focus-visible:border-white/30 text-white placeholder:text-white/40 text-[13px] leading-relaxed rounded-lg p-3"
          />

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {PROMPT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.text)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/15 border border-white/10 text-[11px] text-white/80 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-white/40 font-mono">
              ⌘↵ to send · Esc to close
            </span>
            {isStreaming ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={abort}
                className="h-7 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/20"
              >
                <Square className="w-3 h-3 mr-1" fill="currentColor" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={submit}
                disabled={!prompt.trim()}
                className="h-7 text-xs bg-white text-black hover:bg-white/90 font-medium"
              >
                <Send className="w-3 h-3 mr-1" />
                Ask AI
              </Button>
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div
          ref={responseRef}
          className="relative flex-1 overflow-y-auto custom-scrollbar px-4 py-3 mt-2 border-t border-white/10 bg-black/40"
        >
          {error && (
            <div className="text-[13px] text-rose-300 leading-relaxed font-mono p-2 rounded bg-rose-500/10 border border-rose-500/20">
              {error}
            </div>
          )}
          {!error && hasResponse && (
            <div className="text-[13px] leading-relaxed whitespace-pre-wrap text-white font-sans">
              {response}
            </div>
          )}
          {!error && !hasResponse && phase === 'idle' && (
            <div className="text-[12px] text-white/35 italic">
              Type your prompt or click a preset above, then press ⌘↵.
            </div>
          )}
          {!error && !hasResponse && isStreaming && (
            <div className="flex items-center gap-2 text-[12px] text-white/70 italic animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generating response…</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {hasResponse && phase !== 'streaming' && (
          <div className="relative flex items-center gap-2 px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
            <Button
              size="sm"
              variant="secondary"
              onClick={copy}
              className="h-7 text-xs flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              <Copy className="w-3 h-3 mr-1.5" />
              Copy
            </Button>
            <Button
              size="sm"
              onClick={paste}
              className="h-7 text-xs flex-1 bg-white text-black hover:bg-white/90 font-medium"
            >
              <ClipboardPaste className="w-3 h-3 mr-1.5" />
              Paste to Frontmost App
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
