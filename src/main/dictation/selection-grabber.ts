import { spawn } from 'child_process'
import { app } from 'electron'
import { join } from 'path'

function binaryPath(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'native/selection-grabber')
  return join(app.getAppPath(), 'build/native/selection-grabber')
}

export function captureSelectedText(targetBundleId?: string): Promise<string> {
  return new Promise((resolve) => {
    const args = targetBundleId ? [targetBundleId] : []
    const proc = spawn(binaryPath(), args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    proc.stdout.setEncoding('utf-8')
    proc.stdout.on('data', (chunk: string) => (stdout += chunk))
    proc.on('exit', () => resolve(stdout))
    proc.on('error', (err) => {
      console.warn('[selection-grabber] spawn error:', err)
      resolve('')
    })
  })
}
