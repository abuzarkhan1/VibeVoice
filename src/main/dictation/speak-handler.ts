import { clipboard } from 'electron'
import { captureSelectedText } from './selection-grabber'
import { speak } from '../speech/engine'

export function buildSpeakHandler(): () => Promise<void> {
  return async () => {
    const selection = await captureSelectedText()
    const text = selection.trim() ? selection : clipboard.readText()
    if (text.trim()) await speak(text)
  }
}
