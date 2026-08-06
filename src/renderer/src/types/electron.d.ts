import type { TapBridge } from '../../../preload/index'

declare global {
  interface Window {
    electron: TapBridge
  }
}

export {}
