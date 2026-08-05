import { registerSettingsIpc } from './settings-ipc'
import { registerAIKeyIpc } from './ai-key-ipc'
import { registerPromptIpc } from './prompt-ipc'
import { registerSpeechIpc } from './speech-ipc'

export function registerAllIpc(): void {
  registerSettingsIpc()
  registerAIKeyIpc()
  registerPromptIpc()
  registerSpeechIpc()
}
