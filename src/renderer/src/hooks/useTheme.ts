import type { Theme } from '../../../main/settings/types'

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme)
}
