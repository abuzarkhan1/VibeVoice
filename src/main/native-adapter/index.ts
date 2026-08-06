import type {
  HoldWatcherAdapter,
  SpeechRecognizerAdapter,
  SelectionGrabberAdapter,
  TTSSpeakerAdapter,
  TextInjectorAdapter
} from './interfaces'
import {
  DarwinHoldWatcherAdapter,
  DarwinSpeechRecognizerAdapter,
  DarwinSelectionGrabberAdapter,
  DarwinTTSSpeakerAdapter,
  DarwinTextInjectorAdapter
} from './darwin'
import {
  Win32HoldWatcherAdapter,
  Win32SpeechRecognizerAdapter,
  Win32SelectionGrabberAdapter,
  Win32TTSSpeakerAdapter,
  Win32TextInjectorAdapter
} from './win32'
import {
  LinuxHoldWatcherAdapter,
  LinuxSpeechRecognizerAdapter,
  LinuxSelectionGrabberAdapter,
  LinuxTTSSpeakerAdapter,
  LinuxTextInjectorAdapter
} from './linux'

export * from './interfaces'
export * from './darwin'
export * from './win32'
export * from './linux'

let holdWatcherSingleton: HoldWatcherAdapter | null = null
let selectionGrabberSingleton: SelectionGrabberAdapter | null = null
let ttsSpeakerSingleton: TTSSpeakerAdapter | null = null
let textInjectorSingleton: TextInjectorAdapter | null = null

export function createHoldWatcherAdapter(): HoldWatcherAdapter {
  switch (process.platform) {
    case 'darwin':
      return new DarwinHoldWatcherAdapter()
    case 'win32':
      return new Win32HoldWatcherAdapter()
    case 'linux':
      return new LinuxHoldWatcherAdapter()
    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

export function getHoldWatcherAdapter(): HoldWatcherAdapter {
  if (!holdWatcherSingleton) {
    holdWatcherSingleton = createHoldWatcherAdapter()
  }
  return holdWatcherSingleton
}

export function createSpeechRecognizerAdapter(): SpeechRecognizerAdapter {
  switch (process.platform) {
    case 'darwin':
      return new DarwinSpeechRecognizerAdapter()
    case 'win32':
      return new Win32SpeechRecognizerAdapter()
    case 'linux':
      return new LinuxSpeechRecognizerAdapter()
    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

export function createSelectionGrabberAdapter(): SelectionGrabberAdapter {
  switch (process.platform) {
    case 'darwin':
      return new DarwinSelectionGrabberAdapter()
    case 'win32':
      return new Win32SelectionGrabberAdapter()
    case 'linux':
      return new LinuxSelectionGrabberAdapter()
    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

export function getSelectionGrabberAdapter(): SelectionGrabberAdapter {
  if (!selectionGrabberSingleton) {
    selectionGrabberSingleton = createSelectionGrabberAdapter()
  }
  return selectionGrabberSingleton
}

export function createTTSSpeakerAdapter(): TTSSpeakerAdapter {
  switch (process.platform) {
    case 'darwin':
      return new DarwinTTSSpeakerAdapter()
    case 'win32':
      return new Win32TTSSpeakerAdapter()
    case 'linux':
      return new LinuxTTSSpeakerAdapter()
    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

export function getTTSSpeakerAdapter(): TTSSpeakerAdapter {
  if (!ttsSpeakerSingleton) {
    ttsSpeakerSingleton = createTTSSpeakerAdapter()
  }
  return ttsSpeakerSingleton
}

export function createTextInjectorAdapter(): TextInjectorAdapter {
  switch (process.platform) {
    case 'darwin':
      return new DarwinTextInjectorAdapter()
    case 'win32':
      return new Win32TextInjectorAdapter()
    case 'linux':
      return new LinuxTextInjectorAdapter()
    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

export function getTextInjectorAdapter(): TextInjectorAdapter {
  if (!textInjectorSingleton) {
    textInjectorSingleton = createTextInjectorAdapter()
  }
  return textInjectorSingleton
}
