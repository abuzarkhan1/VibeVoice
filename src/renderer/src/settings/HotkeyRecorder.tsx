import React, { useState, useRef, useEffect } from 'react'

interface HotkeyRecorderProps {
  value: string
  onChange: (hotkey: string) => void
  compact?: boolean
}

function keyEventToAccelerator(e: React.KeyboardEvent): string | null {
  const parts: string[] = []

  if (e.metaKey) parts.push('Command')
  if (e.ctrlKey) parts.push('Control')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  const key = e.key
  if (['Meta', 'Control', 'Alt', 'Shift'].includes(key)) return null

  const keyMap: Record<string, string> = {
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    ' ': 'Space',
    Enter: 'Return',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Tab: 'Tab',
    Escape: 'Escape'
  }

  const mappedKey = keyMap[key] || (key.length === 1 ? key.toUpperCase() : key)

  if (parts.length === 0) return null

  parts.push(mappedKey)
  return parts.join('+')
}

function formatShortcut(shortcut: string): string {
  return shortcut
    .replace(/CommandOrControl/g, '⌘')
    .replace(/Command/g, '⌘')
    .replace(/Control/g, '⌃')
    .replace(/Alt/g, '⌥')
    .replace(/Shift/g, '⇧')
    .replace(/\+/g, ' ')
}

const HotkeyRecorder: React.FC<HotkeyRecorderProps> = ({ value, onChange, compact }) => {
  const [isRecording, setIsRecording] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isRecording && ref.current) {
      ref.current.focus()
    }
  }, [isRecording])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.key === 'Escape') {
      setIsRecording(false)
      return
    }

    if (
      e.key === 'Backspace' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey
    ) {
      onChange('')
      setIsRecording(false)
      return
    }

    const accelerator = keyEventToAccelerator(e)
    if (accelerator) {
      onChange(accelerator)
      setIsRecording(false)
    }
  }

  if (compact) {
    return (
      <div
        ref={ref}
        tabIndex={0}
        role="button"
        aria-label={isRecording ? 'Recording shortcut' : value ? `Shortcut ${formatShortcut(value)}` : 'Record shortcut'}
        onClick={() => setIsRecording(true)}
        onKeyDown={isRecording ? handleKeyDown : undefined}
        onBlur={() => setIsRecording(false)}
        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs cursor-pointer transition-all select-none outline-none min-w-[110px] ${
          isRecording
            ? 'bg-brand/15 border border-brand/40 text-foreground ring-2 ring-brand/30'
            : value
              ? 'bg-[color:var(--card)] border border-[color:var(--border)] text-foreground/80 hover:border-[color:var(--ring)]'
              : 'bg-transparent border border-dashed border-[color:var(--border)] text-muted-foreground hover:border-[color:var(--ring)] hover:text-foreground/80'
        }`}
      >
        {isRecording ? 'Type shortcut…' : value ? formatShortcut(value) : 'Record shortcut'}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={() => setIsRecording(true)}
      onKeyDown={isRecording ? handleKeyDown : undefined}
      onBlur={() => setIsRecording(false)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all select-none outline-none ${
        isRecording
          ? 'bg-brand/20 border border-brand/40 text-brand'
          : 'bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--fg-secondary)] hover:border-[color:var(--ring)]'
      }`}
    >
      {isRecording ? (
        <span>Press a key combination…</span>
      ) : (
        <span className="font-mono">{value ? formatShortcut(value) : 'Click to record'}</span>
      )}
    </div>
  )
}

export default HotkeyRecorder
