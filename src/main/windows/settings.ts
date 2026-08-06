import { BrowserWindow, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let win: BrowserWindow | null = null

export function showSettingsWindow(): void {
  if (win && !win.isDestroyed()) {
    win.show()
    win.focus()
    return
  }
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(app.getAppPath(), 'resources/icon.png')

  win = new BrowserWindow({
    width: 880,
    height: 640,
    minWidth: 720,
    minHeight: 520,
    title: 'VibeVoice Settings',
    icon: iconPath,
    backgroundColor: '#0a0d11',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.once('ready-to-show', () => {
    if (process.platform === 'darwin' && app.dock) {
      try {
        app.dock.setIcon(iconPath)
      } catch {}
      app.dock.show()
    }
    win?.show()
  })

  win.on('closed', () => {
    win = null
    if (process.platform === 'darwin' && BrowserWindow.getAllWindows().length === 0) {
      app.dock?.hide()
    }
  })

  const url = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && url) {
    void win.loadURL(`${url}?window=settings`)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'), { query: { window: 'settings' } })
  }
}
