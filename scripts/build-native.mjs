#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import {
  readdirSync,
  mkdirSync,
  statSync,
  existsSync,
  rmSync,
  copyFileSync
} from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(process.argv[2] ?? process.cwd())
const platform = process.env.TARGET_PLATFORM || process.platform
const SRC = join(ROOT, 'src/native', platform)
const OUT = join(ROOT, 'build/native')

if (!existsSync(SRC)) {
  console.log(`[native] no src/native/${platform} directory — skipping native build`)
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })

function appName(snakeName) {
  return snakeName
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

if (platform === 'darwin') {
  buildDarwin()
} else if (platform === 'win32') {
  buildWin32()
} else if (platform === 'linux') {
  buildLinux()
} else {
  console.log(`[native] unsupported platform ${platform} — skipping native build`)
  process.exit(0)
}

function buildDarwin() {
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

  console.log(`[native] [darwin] ${rebuilt} rebuilt, ${skipped} up-to-date`)

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
}

function buildWin32() {
  const entries = readdirSync(SRC)
  if (entries.length === 0) {
    console.log('[native] [win32] source directory empty — stub build complete')
    return
  }

  let rebuilt = 0
  let skipped = 0

  for (const entry of entries) {
    if (!entry.endsWith('.cs')) continue
    const source = join(SRC, entry)
    const outName = entry.replace(/\.cs$/, '.exe')
    const outPath = join(OUT, outName)
    const srcMtime = statSync(source).mtimeMs

    if (existsSync(outPath) && statSync(outPath).mtimeMs >= srcMtime) {
      skipped += 1
      continue
    }

    console.log(`[native] [win32] csc /optimize+ ${entry} -> ${outName}`)
    try {
      const csc = process.env.CSC || 'csc'
      execFileSync(csc, ['/nologo', '/optimize+', `/out:${outPath}`, source], { stdio: 'inherit' })
      rebuilt += 1
    } catch (err) {
      console.warn(`[native] [win32] Compilation skipped or failed for ${entry}:`, err.message)
    }
  }

  console.log(`[native] [win32] ${rebuilt} rebuilt, ${skipped} up-to-date`)
}

function buildLinux() {
  const entries = readdirSync(SRC)
  if (entries.length === 0) {
    console.log('[native] [linux] source directory empty — stub build complete')
    return
  }

  let rebuilt = 0
  let skipped = 0

  for (const entry of entries) {
    const source = join(SRC, entry)

    if (entry.endsWith('.c')) {
      const outName = entry.replace(/\.c$/, '')
      const outPath = join(OUT, outName)
      const srcMtime = statSync(source).mtimeMs

      if (existsSync(outPath) && statSync(outPath).mtimeMs >= srcMtime) {
        skipped += 1
        continue
      }

      console.log(`[native] [linux] gcc -O2 ${entry} -> ${outName}`)
      try {
        const cc = process.env.CC || 'gcc'
        execFileSync(cc, ['-O2', '-o', outPath, source], { stdio: 'inherit' })
        execFileSync('chmod', ['+x', outPath], { stdio: 'ignore' })
        rebuilt += 1
      } catch (err) {
        console.warn(`[native] [linux] Compilation failed for ${entry}:`, err.message)
      }
      continue
    }

    if (entry.endsWith('.cpp')) {
      const outName = entry.replace(/\.cpp$/, '')
      const outPath = join(OUT, outName)
      const srcMtime = statSync(source).mtimeMs

      if (existsSync(outPath) && statSync(outPath).mtimeMs >= srcMtime) {
        skipped += 1
        continue
      }

      console.log(`[native] [linux] g++ -O3 ${entry} -> ${outName}`)
      try {
        const cxx = process.env.CXX || 'g++'
        execFileSync(cxx, ['-O3', '-std=c++17', '-o', outPath, source, '-lpthread'], { stdio: 'inherit' })
        execFileSync('chmod', ['+x', outPath], { stdio: 'ignore' })
        rebuilt += 1
      } catch (err) {
        console.warn(`[native] [linux] Compilation failed for ${entry}:`, err.message)
      }
      continue
    }

    if (entry.endsWith('.sh') || entry.endsWith('.py')) {
      const outPath = join(OUT, entry)
      copyFileSync(source, outPath)
      execFileSync('chmod', ['+x', outPath], { stdio: 'ignore' })
      rebuilt += 1
      continue
    }
  }

  console.log(`[native] [linux] ${rebuilt} rebuilt/copied, ${skipped} up-to-date`)
}
