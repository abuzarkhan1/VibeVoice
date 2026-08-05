import { spawn } from 'child_process'
import { app } from 'electron'
import { join } from 'path'

function textInjectorPath(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'native/text-injector')
  return join(app.getAppPath(), 'build/native/text-injector')
}

export function injectText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(textInjectorPath(), [], { stdio: ['pipe', 'pipe', 'pipe'] })
    proc.stderr?.on('data', (chunk) => process.stderr.write(`[text-injector] ${chunk}`))
    proc.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`text-injector exited with code ${code}`))
    })
    proc.on('error', reject)
    proc.stdin?.write(text)
    proc.stdin?.end()
  })
}
