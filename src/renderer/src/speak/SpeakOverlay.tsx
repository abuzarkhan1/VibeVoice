import React, { useEffect, useRef, useState } from 'react'
import { X, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'

type State = 'idle' | 'speaking' | 'paused'

interface WordRange {
  start: number
  length: number
}

const CAPTION: Record<State, string> = {
  idle: 'READY',
  speaking: 'PLAYING',
  paused: 'PAUSED'
}

export function SpeakOverlay(): React.JSX.Element {
  const [state, setState] = useState<State>('speaking')
  const [text, setText] = useState('')
  const [word, setWord] = useState<WordRange | null>(null)
  const [chunkIndex, setChunkIndex] = useState(0)
  const [chunkTotal, setChunkTotal] = useState(1)
  const highlightRef = useRef<HTMLSpanElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const off = window.electron.onSpeakState((payload) => {
      setState(payload.state)
      if (payload.text !== undefined) setText(payload.text)
      if (payload.word) setWord(payload.word)
      else setWord(null)
      if (typeof payload.chunkIndex === 'number') setChunkIndex(payload.chunkIndex)
      if (typeof payload.chunkTotal === 'number') setChunkTotal(payload.chunkTotal)
    })
    return off
  }, [])

  useEffect(() => {
    const el = highlightRef.current
    const container = containerRef.current
    if (!el || !container) return
    const elTop = el.offsetTop
    const elBottom = elTop + el.offsetHeight
    const viewTop = container.scrollTop
    const viewBottom = viewTop + container.clientHeight
    if (elTop < viewTop || elBottom > viewBottom) {
      container.scrollTo({ top: Math.max(0, elTop - 4), behavior: 'smooth' })
    }
  }, [word])

  const isSpeaking = state === 'speaking'
  const isPaused = state === 'paused'
  const isActive = state !== 'idle'
  const hasPrev = isActive && chunkIndex > 0
  const hasNext = isActive && chunkIndex + 1 < chunkTotal

  const renderText = (): React.ReactNode => {
    if (!text) return <span className="opacity-60 italic">Waiting for text…</span>
    if (!word) return <span>{text}</span>
    const before = text.slice(0, word.start)
    const current = text.slice(word.start, word.start + word.length)
    const after = text.slice(word.start + word.length)
    return (
      <>
        <span>{before}</span>
        <span
          ref={highlightRef}
          className="rounded-md"
          style={{
            background: 'rgba(182, 213, 255, 0.18)',
            color: '#ffffff',
            padding: '0.02em 0.1em',
            margin: '0 -0.02em',
            boxShadow: '0 0 0 1px rgba(182, 213, 255, 0.22) inset'
          }}
        >
          {current}
        </span>
        <span>{after}</span>
      </>
    )
  }

  return (
    <div className="w-full h-full p-[10px]">
      <div
        className="tap-glass-panel relative w-full h-full overflow-hidden"
        style={{ padding: '10px 12px 10px 10px' }}
      >
        <div className="relative flex items-center gap-2 mb-1">
          <div className="flex items-center gap-[7px] flex-shrink-0 min-w-[74px]">
            <div
              className={`tap-beacon flex-shrink-0 ${isSpeaking ? 'tap-beacon--pulsing' : ''}`}
            />
            <span
              className="font-medium tracking-[0.08em] uppercase whitespace-nowrap"
              style={{ fontSize: 10, color: 'rgba(224, 237, 255, 0.86)' }}
            >
              {CAPTION[state]}
            </span>
            {chunkTotal > 1 && isActive && (
              <span
                className="font-medium tabular-nums whitespace-nowrap"
                style={{ fontSize: 10, color: 'rgba(189, 207, 232, 0.6)' }}
              >
                · {chunkIndex + 1}/{chunkTotal}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-[6px]">
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              onClick={() => void window.electron.ttsPrev()}
              aria-label="Previous chunk"
              disabled={!hasPrev}
            >
              <SkipBack className="w-3 h-3" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              onClick={() => void window.electron.ttsTogglePause()}
              aria-label={isPaused ? 'Resume' : 'Pause'}
              disabled={!isActive}
            >
              {isPaused ? (
                <Play className="w-3 h-3" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              ) : (
                <Pause className="w-3 h-3" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              onClick={() => void window.electron.ttsNext()}
              aria-label="Next chunk"
              disabled={!hasNext}
            >
              <SkipForward
                className="w-3 h-3"
                fill="currentColor"
                strokeWidth={0}
                aria-hidden="true"
              />
            </Button>
            <button
              type="button"
              onClick={() => void window.electron.ttsStop()}
              aria-label="Stop"
              className="flex-shrink-0 flex items-center justify-center transition-[background,border-color,transform] duration-[120ms] hover:-translate-y-[1px]"
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                border: '1px solid rgba(236, 244, 255, 0.46)',
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(174, 210, 255, 0.12))',
                color: 'rgba(248, 252, 255, 0.98)'
              }}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative w-full overflow-y-auto custom-scrollbar"
          style={{
            maxHeight: 56,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.38,
            color: '#f8fbff',
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.7)'
          }}
        >
          {renderText()}
        </div>
      </div>
    </div>
  )
}
