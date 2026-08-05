import { app } from 'electron'
import { registerAllIpc } from './ipc'
import { createTray, destroyTray, setOpenSettingsHandler } from './tray'
import { showSettingsWindow } from './windows/settings'
import { loadSettings } from './settings/store'
import { getHoldWatcher, type HoldEvent } from './dictation/hold-watcher-host'
import { onHoldDown, onHoldUp } from './dictation/orchestrator'
import {
  registerPromptShortcut,
  registerSpeakShortcut,
  unregisterAllShortcuts
} from './shortcuts/global'
import { showPrompt } from './prompt/controller'
import { buildSpeakHandler } from './dictation/speak-handler'

app.whenReady().then(async () => {
  if (process.platform === 'darwin') app.dock?.hide()
  const settings = await loadSettings()
  registerAllIpc()
  setOpenSettingsHandler(showSettingsWindow)
  createTray()

  const watcher = getHoldWatcher()
  watcher.on('event', (event: HoldEvent) => {
    if (event.type === 'down') void onHoldDown()
    else if (event.type === 'up') void onHoldUp()
  })
  watcher.start(settings.dictation.combo)

  registerPromptShortcut(settings.ai.promptHotkey, () => showPrompt())
  registerSpeakShortcut(settings.speech.hotkey, buildSpeakHandler())
})

app.on('window-all-closed', () => {
  // WHY: menu-bar resident; closing all windows is not a quit signal
})

app.on('will-quit', () => {
  getHoldWatcher().stop()
  unregisterAllShortcuts()
  destroyTray()
})
