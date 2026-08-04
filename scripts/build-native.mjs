#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import {
  readdirSync,
  mkdirSync,
  statSync,
  existsSync,
  rmSync,
  copyFileSync,
  writeFileSync
} from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(process.argv[2] ?? process.cwd())
const SRC = join(ROOT, 'src/native')
const OUT = join(ROOT, 'build/native')

if (!existsSync(SRC)) {
  console.log('[native] no src/native directory — skipping')
  process.exit(0)
}

if (process.platform !== 'darwin') {
  console.log('[native] not macOS — skipping native binary build')
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })

function appName(snakeName) {
  return snakeName
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

const entries = readdirSync(SRC)
let rebuilt = 0
let skipped = 0

for (const entry of entries) {
  if (entry.endsWith('.c')) {
    const source = join(SRC, entry)
    const outName = entry.replace(/\.c$/, '')
    const outPath = join(OUT, outName)
    const srcMtime = statSync(source).mtimeMs
    if (existsSync(outPath) && statSync(outPath).mtimeMs >= srcMtime) {
      skipped += 1
      continue
    }
    console.log(`[native] clang -O2 ${entry} -> ${outName}`)
    execFileSync('/usr/bin/clang', ['-O2', '-o', outPath, source], { stdio: 'inherit' })
    rebuilt += 1
    continue
  }
  if (!entry.endsWith('.swift')) continue

  const source = join(SRC, entry)
  const outName = entry.replace(/\.swift$/, '')
  const plistPath = join(SRC, `${outName}.plist`)
  const hasPlist = existsSync(plistPath)
  const srcMtime = statSync(source).mtimeMs
  const plistMtime = hasPlist ? statSync(plistPath).mtimeMs : 0
  const newest = Math.max(srcMtime, plistMtime)

  if (hasPlist) {
    const bundleName = appName(outName)
    const appDir = join(OUT, `${bundleName}.app`)
    const macosDir = join(appDir, 'Contents/MacOS')
    const binPath = join(macosDir, bundleName)
    const bundleInfoPath = join(appDir, 'Contents/Info.plist')

    if (existsSync(binPath) && statSync(binPath).mtimeMs >= newest) {
      skipped += 1
      continue
    }

    rmSync(appDir, { recursive: true, force: true })
    mkdirSync(macosDir, { recursive: true })

    console.log(`[native] swiftc -O ${entry} -> ${bundleName}.app/Contents/MacOS/${bundleName}`)
    execFileSync(
      '/usr/bin/swiftc',
      [
        '-O',
        '-o',
        binPath,
        source,
        '-Xlinker',
        '-sectcreate',
        '-Xlinker',
        '__TEXT',
        '-Xlinker',
        '__info_plist',
        '-Xlinker',
        plistPath
      ],
      { stdio: 'inherit' }
    )
    copyFileSync(plistPath, bundleInfoPath)
    execFileSync('/usr/bin/codesign', ['--force', '--sign', '-', '--deep', appDir], {
      stdio: 'ignore'
    })
    rebuilt += 1
  } else {
    const outPath = join(OUT, outName)
    if (existsSync(outPath) && statSync(outPath).mtimeMs >= srcMtime) {
      skipped += 1
      continue
    }
    console.log(`[native] swiftc -O ${entry} -> ${outName}`)
    execFileSync('/usr/bin/swiftc', ['-O', '-o', outPath, source], { stdio: 'inherit' })
    rebuilt += 1
  }
}

console.log(`[native] ${rebuilt} rebuilt, ${skipped} up-to-date`)

const electronPlist = join(
  ROOT,
  'node_modules/electron/dist/Electron.app/Contents/Info.plist'
)
if (existsSync(electronPlist)) {
  const usage = {
    NSMicrophoneUsageDescription: 'VibeVoice uses the microphone for voice dictation.',
    NSSpeechRecognitionUsageDescription:
      'VibeVoice uses Speech Recognition to turn your voice into text.'
  }
  for (const [key, value] of Object.entries(usage)) {
    try {
      execFileSync(
        '/usr/libexec/PlistBuddy',
        ['-c', `Set :${key} "${value}"`, electronPlist],
        { stdio: 'ignore' }
      )
    } catch {
      try {
        execFileSync(
          '/usr/libexec/PlistBuddy',
          ['-c', `Add :${key} string "${value}"`, electronPlist],
          { stdio: 'ignore' }
        )
      } catch (err) {
        console.warn(`[native] could not patch ${key}:`, err.message)
      }
    }
  }
  console.log('[native] patched Electron Info.plist (defensive — tap-spawn is primary path)')
}
