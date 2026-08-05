import { BrowserWindow } from 'electron'
import { createDetachedPanel } from './detached-panel'

const WIDTH = 540
const HEIGHT = 124
const TOP_INSET = 18
const RIGHT_INSET = 18

export interface SpeakState {
  state: 'idle' | 'speaking' | 'paused'
  text?: string
  word?: { start: number; length: number }
  chunkIndex?: number
  chunkTotal?: number
}

const panel = createDetachedPanel({
  width: WIDTH,
  height: HEIGHT,
  hash: '/speak',
  focusable: false,
  alwaysOnTopLevel: 'floating',
  position: ({ width }, display) => ({
    x: display.workArea.x + display.workArea.width - width - RIGHT_INSET,
    y: display.workArea.y + TOP_INSET
  })
})

export function getSpeakWindow(): BrowserWindow | null {
  return panel.get()
}

export function showSpeakWindow(): void {
  panel.show()
}

export function hideSpeakWindow(): void {
  panel.hide()
}

export function broadcastSpeakState(state: SpeakState): void {
  panel.send('speak:state', state)
}
