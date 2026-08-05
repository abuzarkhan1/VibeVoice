import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { AppSettings, DeepPartial, AIProviderId } from '../main/settings/types'
import type { KeyMeta } from '../main/ai/key-store'

interface WhisperStateMsg {
  state: 'idle' | 'recording' | 'finalizing'
}

interface WhisperEvent {
  type: 'ready' | 'partial' | 'final' | 'audio-rms' | 'error' | 'exit'
  text?: string
  value?: number
  message?: string
}

function subscribe<P>(channel: string, callback: (payload: P) => void): () => void {
  const listener = (_event: IpcRendererEvent, payload: P): void => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.off(channel, listener)
}

export interface TapBridge {
  getSettings: () => Promise<AppSettings>
  saveSettings: (patch: DeepPartial<AppSettings>) => Promise<AppSettings>
  onWhisperState: (cb: (msg: WhisperStateMsg) => void) => () => void
  onWhisperEvent: (cb: (event: WhisperEvent) => void) => () => void
  listAIKeys: () => Promise<KeyMeta[]>
  setAIKey: (provider: AIProviderId, key: string) => Promise<void>
  clearAIKey: (provider: AIProviderId) => Promise<void>
  validateAIKey: (provider: AIProviderId, key: string) => Promise<boolean>
  listAIModels: () => Promise<Record<AIProviderId, readonly string[]>>
  promptSubmit: (text: string) => Promise<void>
  promptAbort: () => Promise<void>
  promptClose: () => Promise<void>
  onPromptStart: (cb: (payload: { prompt: string }) => void) => () => void
  onPromptChunk: (cb: (payload: { response: string }) => void) => () => void
  onPromptDone: (cb: (payload: { response: string }) => void) => () => void
  onPromptError: (cb: (payload: { message: string }) => void) => () => void
  writeClipboard: (text: string) => Promise<void>
  pasteToFrontmost: (text: string) => Promise<void>
  onSpeakState: (
    cb: (payload: {
      state: 'idle' | 'speaking' | 'paused'
      text?: string
      word?: { start: number; length: number }
      chunkIndex?: number
      chunkTotal?: number
    }) => void
  ) => () => void
  ttsListVoices: () => Promise<Array<{ name: string; locale: string }>>
  ttsPreview: (text: string) => Promise<void>
  ttsTogglePause: () => Promise<void>
  ttsStop: () => Promise<void>
  ttsNext: () => Promise<void>
  ttsPrev: () => Promise<void>
}

const bridge: TapBridge = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (patch) => ipcRenderer.invoke('settings:save', patch),
  onWhisperState: (cb) => subscribe('whisper:state', cb),
  onWhisperEvent: (cb) => subscribe('whisper:event', cb),
  listAIKeys: () => ipcRenderer.invoke('ai:list-keys'),
  setAIKey: (provider, key) => ipcRenderer.invoke('ai:set-key', provider, key),
  clearAIKey: (provider) => ipcRenderer.invoke('ai:clear-key', provider),
  validateAIKey: (provider, key) => ipcRenderer.invoke('ai:validate-key', provider, key),
  listAIModels: () => ipcRenderer.invoke('ai:list-models'),
  promptSubmit: (text) => ipcRenderer.invoke('prompt:submit', text),
  promptAbort: () => ipcRenderer.invoke('prompt:abort'),
  promptClose: () => ipcRenderer.invoke('prompt:close'),
  onPromptStart: (cb) => subscribe('prompt:start', cb),
  onPromptChunk: (cb) => subscribe('prompt:chunk', cb),
  onPromptDone: (cb) => subscribe('prompt:done', cb),
  onPromptError: (cb) => subscribe('prompt:error', cb),
  writeClipboard: (text) => ipcRenderer.invoke('clipboard:write', text),
  pasteToFrontmost: (text) => ipcRenderer.invoke('system:paste', text),
  onSpeakState: (cb) => subscribe('speak:state', cb),
  ttsListVoices: () => ipcRenderer.invoke('tts:list-voices'),
  ttsPreview: (text) => ipcRenderer.invoke('tts:preview', text),
  ttsTogglePause: () => ipcRenderer.invoke('tts:toggle-pause'),
  ttsStop: () => ipcRenderer.invoke('tts:stop'),
  ttsNext: () => ipcRenderer.invoke('tts:next'),
  ttsPrev: () => ipcRenderer.invoke('tts:prev')
}

contextBridge.exposeInMainWorld('electron', bridge)
