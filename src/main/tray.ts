import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'

let tray: Tray | null = null
let openSettingsHandler: () => void = () => {}

function trayIcon(): Electron.NativeImage {
  const candidate = app.isPackaged
    ? join(process.resourcesPath, 'tray-icon.png')
    : join(app.getAppPath(), 'resources/tray-icon.png')
  const image = nativeImage.createFromPath(candidate)
  if (image.isEmpty()) {
    return nativeImage.createEmpty()
  }
  image.setTemplateImage(true)
  return image
}

export function setOpenSettingsHandler(fn: () => void): void {
  openSettingsHandler = fn
}

export function createTray(): void {
  if (tray) return
  tray = new Tray(trayIcon())
  tray.setToolTip('VibeVoice')
  const menu = Menu.buildFromTemplate([
    {
      label: 'Open Settings',
      accelerator: 'CommandOrControl+,',
      click: () => openSettingsHandler()
    },
    { type: 'separator' },
    { label: 'Quit VibeVoice', accelerator: 'CommandOrControl+Q', role: 'quit' }
  ])
  tray.setContextMenu(menu)
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
