import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export interface TTSVoice {
  name: string
  locale: string
}

let cache: TTSVoice[] | null = null

export async function listVoices(): Promise<TTSVoice[]> {
  if (cache) return cache
  try {
    const { stdout } = await execFileAsync('/usr/bin/say', ['-v', '?'], { timeout: 1500 })
    const out: TTSVoice[] = []
    for (const line of stdout.split('\n')) {
      const hashIdx = line.indexOf('# ')
      const front = hashIdx > -1 ? line.slice(0, hashIdx).trimEnd() : line.trimEnd()
      const match = front.match(/^(.+?)\s{2,}([a-z]{2,3}[_-][A-Z]{2})$/)
      if (!match) continue
      out.push({ name: match[1].trim(), locale: match[2] })
    }
    cache = out
    return out
  } catch (err) {
    console.warn('[voices] failed to enumerate /usr/bin/say voices:', err)
    return []
  }
}
