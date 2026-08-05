import { safeStorage } from 'electron'

const PLAINTEXT_PREFIX = 'plain:'

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return ''
  if (!safeStorage.isEncryptionAvailable()) {
    return `${PLAINTEXT_PREFIX}${plaintext}`
  }
  return safeStorage.encryptString(plaintext).toString('base64')
}

export function decryptSecret(stored: string): string {
  if (!stored) return ''
  if (stored.startsWith(PLAINTEXT_PREFIX)) return stored.slice(PLAINTEXT_PREFIX.length)
  if (!safeStorage.isEncryptionAvailable()) return ''
  try {
    return safeStorage.decryptString(Buffer.from(stored, 'base64'))
  } catch {
    return ''
  }
}
