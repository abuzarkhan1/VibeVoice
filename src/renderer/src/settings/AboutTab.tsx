import React from 'react'
import { GitBranch, Mail, Globe, Cpu, ShieldCheck, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import logoImg from '../assets/logo.png'

export function AboutTab(): React.JSX.Element {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="VibeVoice Logo" className="w-10 h-10 rounded-xl object-contain border border-border bg-black" />
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">VibeVoice</h2>
            <p className="text-xs text-muted-foreground">Version 0.1.0 · macOS AI Voice Launcher</p>
          </div>
        </div>
      </header>

      {/* Developer Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold px-2 py-0.5 rounded bg-muted border border-border">
                Creator & Core Lead
              </span>
              <h3 className="text-lg font-bold text-foreground mt-2">Abuzar Khan</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">
                Full-Stack & Desktop Software Engineer. Architect of high-performance developer tools and macOS application suites.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-bold text-lg">
              AK
            </div>
          </div>

          <div className="pt-2 border-t border-border flex flex-wrap gap-3 text-xs">
            <a
              href="https://github.com/abuzarkhan1/VibeVoice"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium border border-border"
            >
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              <span>VibeVoice Repo</span>
            </a>
            <a
              href="https://github.com/abuzarkhan1"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium border border-border"
            >
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span>GitHub Profile</span>
            </a>
            <a
              href="mailto:abuzarkhan1242@gmail.com"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium border border-border"
            >
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Contact Abuzar</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem Badge */}
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-secondary text-foreground border border-border">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Vibe Productivity Suite</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Part of the Vibe ecosystem by Abuzar Khan (VibeGrid terminal manager & VibeVoice AI launcher).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical Highlights */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <Cpu className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-foreground">Native macOS Helpers</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Swift & C binaries for low-latency EventTaps and AXUIElement text injection.
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-foreground">Keychain AES Security</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Encrypted multi-provider AI key storage via macOS safeStorage APIs.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center pt-4 text-[11px] text-muted-foreground font-mono">
        © 2026 Abuzar Khan. All rights reserved.
      </footer>
    </div>
  )
}
