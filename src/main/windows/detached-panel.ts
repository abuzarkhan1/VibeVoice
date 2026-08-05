import { BrowserWindow, screen, type Display } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export type PanelPosition = (
  size: { width: number; height: number },
  display: Display
) => { x: number; y: number }

export interface DetachedPanelOptions {
  width: number
  height: number
  hash: string
  position: PanelPosition
  focusable?: boolean
  hideOnBlur?: boolean
  ignoreMouseEvents?: boolean
  alwaysOnTopLevel?: 'floating' | 'screen-saver'
}

export interface DetachedPanel {
  ensure: () => BrowserWindow
  show: () => void
  hide: () => void
  get: () => BrowserWindow | null
  send: (channel: string, payload: unknown) => void
}

export function createDetachedPanel(options: DetachedPanelOptions): DetachedPanel {
  const {
    width,
    height,
    hash,
    position,
    focusable = false,
    hideOnBlur = false,
    ignoreMouseEvents = false,
    alwaysOnTopLevel = 'screen-saver'
  } = options
  let window: BrowserWindow | null = null

  const place = (win: BrowserWindow): void => {
    const cursor = screen.getCursorScreenPoint()
    const display = screen.getDisplayNearestPoint(cursor)
    const { x, y } = position({ width, height }, display)
    win.setPosition(Math.round(x), Math.round(y))
  }

  const ensure = (): BrowserWindow => {
    if (window && !window.isDestroyed()) return window

    window = new BrowserWindow({
      width,
      height,
      show: false,
      frame: false,
      transparent: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      focusable,
      skipTaskbar: true,
      hasShadow: false,
      type: 'panel',
      backgroundColor: '#00000000',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    window.setAlwaysOnTop(true, alwaysOnTopLevel)
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    if (ignoreMouseEvents) window.setIgnoreMouseEvents(true, { forward: true })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      void window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#${hash}`)
    } else {
      void window.loadFile(join(__dirname, '../renderer/index.html'), { hash })
    }

    if (hideOnBlur) {
      window.on('blur', () => {
        if (window && !window.isDestroyed()) window.hide()
      })
    }

    window.on('closed', () => {
      window = null
    })

    return window
  }

  return {
    ensure,
    show: () => {
      const win = ensure()
      place(win)
      win.showInactive()
    },
    hide: () => {
      if (window && !window.isDestroyed() && window.isVisible()) window.hide()
    },
    get: () => (window && !window.isDestroyed() ? window : null),
    send: (channel, payload) => {
      if (window && !window.isDestroyed()) {
        window.webContents.send(channel, payload)
      }
    }
  }
}
