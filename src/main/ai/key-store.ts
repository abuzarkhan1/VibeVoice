import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { encryptSecret, decryptSecret } from './safe-storage'
import type { AIProviderId } from '../settings/types'

const PROVIDERS: AIProviderId[] = ['anthropic', 'openai', 'gemini']
const MIN_UNMASKED_LEN = 8
const MASK_TAIL_LEN = 4

interface VaultFile {
  version: 1
  keys: Partial<Record<AIProviderId, string>>
}

let cache: VaultFile | null = null

function vaultPath(): string {
  return join(app.getPath('userData'), 'ai-keys.enc')
}

async function loadVault(): Promise<VaultFile> {
  if (cache) return cache
  try {
    const raw = await fs.readFile(vaultPath(), 'utf-8')
    const parsed = JSON.parse(raw) as VaultFile
    if (parsed.version === 1 && typeof parsed.keys === 'object') {
      cache = parsed
      return cache
    }
  } catch {
    // WHY: file may not exist on first run
  }
  cache = { version: 1, keys: {} }
  return cache
}

async function saveVault(vault: VaultFile): Promise<void> {
  const target = vaultPath()
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(tmp, JSON.stringify(vault, null, 2), 'utf-8')
  await fs.rename(tmp, target)
  cache = vault
}

export async function getKey(provider: AIProviderId): Promise<string> {
  const vault = await loadVault()
  const stored = vault.keys[provider]
  if (!stored) return ''
  return decryptSecret(stored)
}

export async function setKey(provider: AIProviderId, plaintext: string): Promise<void> {
  const vault = await loadVault()
  const next: VaultFile = { version: 1, keys: { ...vault.keys } }
  if (plaintext) next.keys[provider] = encryptSecret(plaintext)
  else delete next.keys[provider]
  await saveVault(next)
}

export async function clearKey(provider: AIProviderId): Promise<void> {
  await setKey(provider, '')
}

export interface KeyMeta {
  provider: AIProviderId
  hasKey: boolean
  masked: string | null
}

function mask(key: string): string {
  if (!key) return ''
  if (key.length <= MIN_UNMASKED_LEN) return '••••'
  return `${key.slice(0, MASK_TAIL_LEN)}…${key.slice(-MASK_TAIL_LEN)}`
}

export async function listKeyMeta(): Promise<KeyMeta[]> {
  const vault = await loadVault()
  return PROVIDERS.map((provider) => {
    const stored = vault.keys[provider]
    if (!stored) return { provider, hasKey: false, masked: null }
    const decoded = decryptSecret(stored)
    return { provider, hasKey: decoded.length > 0, masked: mask(decoded) }
  })
}

export function listProviders(): readonly AIProviderId[] {
  return PROVIDERS
}
