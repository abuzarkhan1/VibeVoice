import { BrowserWindow } from 'electron'
import { createDetachedPanel } from './detached-panel'

const WIDTH = 200
const HEIGHT = 88
const BOTTOM_INSET = 14

const panel = createDetachedPanel({
  width: WIDTH,
  height: HEIGHT,
  hash: '/whisper',
  focusable: false,
  ignoreMouseEvents: true,
  position: ({ width, height }, display) => ({
    x: display.workArea.x + (display.workArea.width - width) / 2,
    y: display.workArea.y + display.workArea.height - height - BOTTOM_INSET
  })
})

export function getWhisperWindow(): BrowserWindow | null {
  return panel.get()
}

export function showWhisperWindow(): void {
  panel.show()
}

export function hideWhisperWindow(): void {
  panel.hide()
}
