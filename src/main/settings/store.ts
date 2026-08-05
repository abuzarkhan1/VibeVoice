import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { DEFAULT_SETTINGS, type AppSettings, type DeepPartial } from './types'

const VERSION = 1

interface FileEnvelope {
  version: number
  data: AppSettings
}

let cache: AppSettings | null = null

function path(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function clone(s: AppSettings): AppSettings {
  return JSON.parse(JSON.stringify(s)) as AppSettings
}

function merge(base: AppSettings, patch: DeepPartial<AppSettings>): AppSettings {
  const next = clone(base)
  if (patch.dictation) {
    next.dictation = {
      ...next.dictation,
      ...patch.dictation,
      aiCleanup: patch.dictation.aiCleanup
        ? { ...next.dictation.aiCleanup, ...patch.dictation.aiCleanup }
        : next.dictation.aiCleanup
    }
  }
  if (patch.speech) next.speech = { ...next.speech, ...patch.speech }
  if (patch.ai) {
    next.ai = {
      ...next.ai,
      ...patch.ai,
      models: patch.ai.models ? { ...next.ai.models, ...patch.ai.models } : next.ai.models
    }
  }
  if (patch.theme) next.theme = patch.theme
  return next
}

async function writeAtomic(contents: string): Promise<void> {
  const target = path()
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(tmp, contents, 'utf-8')
  try {
    await fs.rename(tmp, target)
  } catch (err) {
    await fs.unlink(tmp).catch(() => {})
    throw err
  }
}

export async function loadSettings(): Promise<AppSettings> {
  if (cache) return clone(cache)
  try {
    const raw = await fs.readFile(path(), 'utf-8')
    const parsed = JSON.parse(raw) as FileEnvelope
    cache = parsed.data ?? clone(DEFAULT_SETTINGS)
  } catch {
    cache = clone(DEFAULT_SETTINGS)
    await writeAtomic(JSON.stringify({ version: VERSION, data: cache }, null, 2))
  }
  return clone(cache)
}

export async function saveSettings(patch: DeepPartial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings()
  const next = merge(current, patch)
  await writeAtomic(JSON.stringify({ version: VERSION, data: next }, null, 2))
  cache = next
  return clone(next)
}
