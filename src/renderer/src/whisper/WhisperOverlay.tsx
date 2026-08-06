import React, { useEffect, useRef, useState } from 'react'

const BARS = 13
const BAR_HEIGHT_PROFILE = [
  0.45, 0.62, 0.52, 0.58, 0.74, 0.7, 1.0, 0.7, 0.58, 0.52, 0.74, 0.62, 0.45
]
const SMOOTHING = 0.62

type Status = 'idle' | 'recording' | 'finalizing' | 'error'

interface WhisperStateMsg {
  state: 'idle' | 'recording' | 'finalizing'
}

interface WhisperEvent {
  type: 'ready' | 'partial' | 'final' | 'audio-rms' | 'error' | 'exit'
  text?: string
  value?: number
  message?: string
}

export function WhisperOverlay(): React.JSX.Element {
  const [status, setStatus] = useState<Status>('idle')
  const rmsRef = useRef(0)
  const rmsDecayAt = useRef(0)
  const barValuesRef = useRef(new Float32Array(BARS))
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const statusRef = useRef<Status>('idle')

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    const offState = window.electron.onWhisperState((msg: WhisperStateMsg) => {
      setStatus(msg.state)
    })
    const offEvent = window.electron.onWhisperEvent((event: WhisperEvent) => {
      if (event.type === 'audio-rms' && typeof event.value === 'number') {
        rmsRef.current = event.value
        rmsDecayAt.current = performance.now()
      } else if (event.type === 'error') {
        setStatus('error')
      }
    })
    return () => {
      offState()
      offEvent()
    }
  }, [])

  useEffect(() => {
    let rafId = 0
    const tick = (now: number): void => {
      const values = barValuesRef.current
      const current = statusRef.current
      const isActive = current === 'recording' || current === 'finalizing'

      const sinceRms = now - rmsDecayAt.current
      if (sinceRms > 200) rmsRef.current *= 0.92

      for (let i = 0; i < BARS; i++) {
        const profile = BAR_HEIGHT_PROFILE[i]
        let target: number
        if (current === 'recording') target = Math.min(1, rmsRef.current * 8.5)
        else if (current === 'finalizing') target = 0.4
        else target = 0
        values[i] = values[i] * SMOOTHING + target * (1 - SMOOTHING)
        const value = values[i]

        const dotMode = !isActive
        const minHeight = dotMode ? 3 : 4 + Math.round(profile * 4)
        const amplitude = dotMode ? 0 : 3 + Math.round(profile * 7)
        const px = Math.min(dotMode ? 3 : 17, minHeight + Math.round(value * amplitude))

        const bar = barRefs.current[i]
        if (bar) bar.style.height = `${px}px`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const isExpanded = status !== 'idle'
  const isListening = status === 'recording'
  const isProcessing = status === 'finalizing'
  const isError = status === 'error'

  const borderColor = isError
    ? 'rgba(255, 143, 143, 0.55)'
    : isListening
      ? 'rgba(203, 208, 214, 0.6)'
      : isProcessing
        ? 'rgba(214, 219, 224, 0.4)'
        : 'rgba(216, 220, 224, 0.42)'

  return (
    <div className="w-full h-full flex items-end justify-center pb-1">
      <div
        className="relative flex items-center justify-center transition-[width,min-width,height,padding] duration-[160ms] ease-out"
        style={{
          width: isExpanded ? 88 : 44,
          minWidth: isExpanded ? 88 : 44,
          height: isExpanded ? 38 : 10,
          padding: isExpanded ? '8px 7px' : '1px 3px',
          gap: 2,
          borderRadius: 999,
          border: `1px solid ${borderColor}`,
          background: `
            radial-gradient(130% 130% at 100% 0%, rgba(35, 76, 126, 0.16), transparent 54%),
            radial-gradient(120% 120% at 0% 100%, rgba(52, 107, 77, 0.12), transparent 58%),
            linear-gradient(180deg, rgba(6, 8, 12, 0.96), rgba(4, 6, 9, 0.95))
          `,
          backdropFilter: 'blur(18px) saturate(120%)',
          WebkitBackdropFilter: 'blur(18px) saturate(120%)'
        }}
      >
        {isProcessing && (
          <div
            aria-hidden="true"
            className="rounded-full animate-spin"
            style={{
              width: 6,
              height: 6,
              border: '1.5px solid rgba(240, 244, 248, 0.24)',
              borderTopColor: 'rgba(240, 244, 248, 0.96)',
              animationDuration: '0.85s'
            }}
          />
        )}
        {!isProcessing &&
          Array.from({ length: BARS }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                barRefs.current[i] = el
              }}
              className="block"
              style={{
                width: 1.5,
                height: 3,
                borderRadius: 999,
                background: 'rgba(216, 220, 224, 0.92)',
                opacity: isExpanded ? 0.92 : 0,
                transform: isExpanded ? 'scale(1)' : 'scale(0.72)',
                transition:
                  'height 100ms linear, opacity 120ms ease, transform 120ms ease'
              }}
            />
          ))}
      </div>
    </div>
  )
}
