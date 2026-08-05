import { BrowserWindow } from 'electron'
import { createDetachedPanel } from './detached-panel'

const WIDTH = 640
const HEIGHT = 420
const TOP_INSET = 120

const panel = createDetachedPanel({
  width: WIDTH,
  height: HEIGHT,
  hash: '/prompt',
  focusable: true,
  hideOnBlur: true,
  alwaysOnTopLevel: 'floating',
  position: ({ width }, display) => ({
    x: display.workArea.x + (display.workArea.width - width) / 2,
    y: display.workArea.y + TOP_INSET
  })
})

export function getPromptWindow(): BrowserWindow | null {
  return panel.get()
}

export function ensurePromptWindow(): BrowserWindow {
  return panel.ensure()
}

export function showPromptWindow(): void {
  panel.show()
}

export function hidePromptWindow(): void {
  panel.hide()
}

export function sendPromptEvent(channel: string, payload: unknown): void {
  panel.send(channel, payload)
}
