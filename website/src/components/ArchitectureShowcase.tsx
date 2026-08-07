'use client';

import React from 'react';
import { Apple, MonitorCog, Terminal } from 'lucide-react';

export const ArchitectureShowcase: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Native Hotkey & Event Intercept',
      desc: 'Hardware-level keypress hook listens for global shortcuts without stealing focus or introducing UI lag.',
      mac: 'CoreGraphics Event Tap (CGEventTapCreate)',
      win: 'SetWindowsHookEx (WH_KEYBOARD_LL)',
      linux: 'X11 XRecord / Wayland Portal',
    },
    {
      num: '02',
      title: 'Native Abstraction Layer (NAL) Bridge',
      desc: 'Unified C++/Node.js Addon standardizes OS events into a lock-free RingBuffer queue.',
      mac: 'Swift C-Bridge (libvibevoice_mac.dylib)',
      win: 'C# P/Invoke DLL (vibevoice_win.dll)',
      linux: 'C Shared Object (libvibevoice_linux.so)',
    },
    {
      num: '03',
      title: 'Streaming Audio Pipeline',
      desc: 'PCM audio streams directly to local Whisper C++ or Deepgram with Voice Activity Detection.',
      mac: 'CoreAudio AudioQueue Input',
      win: 'WASAPI Low-Latency Loopback',
      linux: 'PipeWire / ALSA PCM Substream',
    },
    {
      num: '04',
      title: 'Hardware Keychain Vault',
      desc: 'Retrieves AES-256 API secrets directly from operating system secure hardware enclaves.',
      mac: 'SecItem API + Touch ID Enclave',
      win: 'DPAPI Windows Credential Manager',
      linux: 'Secret Service D-Bus / GNOME Keyring',
    },
    {
      num: '05',
      title: 'Active Window Cursor Insertion',
      desc: 'Injects transcribed text directly into focused text inputs across all applications.',
      mac: 'AXUIElement & CGEventKeyboard',
      win: 'SendInput & UI Automation API',
      linux: 'xdotool / wl-paste / wtype',
    },
  ];

  return (
    <section
      id="architecture"
      className="relative bg-[#08080a] py-32 border-t border-white/[0.06] overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">

        <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
          Architecture
        </p>

        <h2
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6 max-w-2xl"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          Native{' '}
          <span className="text-zinc-400 font-normal">abstraction layer.</span>
        </h2>
        <p className="text-zinc-400 font-normal text-xl leading-relaxed mb-24 max-w-lg">
          How VibeVoice bridges OS kernel APIs with cloud and on-device AI — five stages, three platforms.
        </p>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-white/25 via-white/10 to-transparent"
          />

          <div className="space-y-20">
            {steps.map((step) => (
              <div key={step.num} className="relative pl-16">

                <div className="absolute left-0 top-0.5 w-10 h-10 rounded-full bg-[#0d0d10] border border-white/20 flex items-center justify-center">
                  <span
                    className="text-xs font-extrabold text-white"
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {step.num}
                  </span>
                </div>

                <h3
                  className="text-2xl font-extrabold text-white tracking-tight leading-tight mb-3"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  {step.title}
                </h3>

                <p className="text-zinc-400 font-normal text-base leading-relaxed mb-6 max-w-xl">
                  {step.desc}
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full bg-zinc-900/90 border border-white/[0.1] hover:border-white/25 hover:bg-zinc-800/80 transition-all duration-200">
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                      <Apple className="w-3.5 h-3.5 text-zinc-300" strokeWidth={2.5} />
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">{step.mac}</span>
                  </div>

                  <div className="inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full bg-zinc-900/90 border border-white/[0.1] hover:border-white/25 hover:bg-zinc-800/80 transition-all duration-200">
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                      <MonitorCog className="w-3.5 h-3.5 text-zinc-300" strokeWidth={2.5} />
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">{step.win}</span>
                  </div>

                  <div className="inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full bg-zinc-900/90 border border-white/[0.1] hover:border-white/25 hover:bg-zinc-800/80 transition-all duration-200">
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                      <Terminal className="w-3.5 h-3.5 text-zinc-300" strokeWidth={2.5} />
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">{step.linux}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};