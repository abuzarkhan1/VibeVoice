import { globalShortcut } from 'electron'

type ShortcutSlot = {
  register: (accelerator: string, handler: () => void) => boolean
  reset: () => void
}

function makeShortcutSlot(): ShortcutSlot {
  let current: string | null = null
  return {
    register(accelerator, handler) {
      if (current) {
        globalShortcut.unregister(current)
        current = null
      }
      if (!accelerator) return true
      const ok = globalShortcut.register(accelerator, handler)
      if (ok) current = accelerator
      return ok
    },
    reset() {
      current = null
    }
  }
}

const promptSlot = makeShortcutSlot()
const speakSlot = makeShortcutSlot()

export function registerPromptShortcut(accelerator: string, handler: () => void): boolean {
  return promptSlot.register(accelerator, handler)
}

export function registerSpeakShortcut(accelerator: string, handler: () => void): boolean {
  return speakSlot.register(accelerator, handler)
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
  promptSlot.reset()
  speakSlot.reset()
}
