import React from 'react'
import ReactDOM from 'react-dom/client'
import { SettingsApp } from './settings/SettingsApp'
import { WhisperOverlay } from './whisper/WhisperOverlay'
import { PromptApp } from './prompt/PromptApp'
import { SpeakOverlay } from './speak/SpeakOverlay'
import './globals.css'

function pickSurface(): string {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash) return hash
  const params = new URLSearchParams(window.location.search)
  return params.get('window') ?? 'settings'
}

const surface = pickSurface()

function Root(): React.JSX.Element {
  if (surface === 'whisper') return <WhisperOverlay />
  if (surface === 'speak') return <SpeakOverlay />
  if (surface === 'prompt') return <PromptApp />
  if (surface === 'settings') return <SettingsApp />
  return (
    <div className="h-full w-full grid place-items-center text-muted-foreground text-sm font-mono">
      {surface}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<Root />)
