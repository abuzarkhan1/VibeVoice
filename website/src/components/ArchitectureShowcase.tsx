'use client';

import React from 'react';

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
    <section id="inside" className="bg-[#0a0a0d] py-28 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Section label */}
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
          Architecture
        </p>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          Native Abstraction Layer.
        </h2>
        <p className="text-zinc-400 text-lg mb-16 max-w-xl">
          How VibeVoice bridges OS kernel APIs with cloud and on-device AI.
        </p>

        {/* Steps List */}
        <div className="space-y-12">
          {steps.map((step) => (
            <div key={step.num} className="border-b border-white/[0.06] pb-10 last:border-0">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-mono text-sm text-zinc-600 select-none">
                  {step.num}
                </span>
                <h3 className="text-xl font-bold text-white">
                  {step.title}
                </h3>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6 ml-9">
                {step.desc}
              </p>

              {/* OS Implementation Spec Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-9">
                <div className="p-3 bg-[#111113] border border-white/[0.06] rounded-xl text-xs font-mono">
                  <div className="text-zinc-500 mb-1">macOS</div>
                  <div className="text-zinc-200">{step.mac}</div>
                </div>
                <div className="p-3 bg-[#111113] border border-white/[0.06] rounded-xl text-xs font-mono">
                  <div className="text-zinc-500 mb-1">Windows</div>
                  <div className="text-zinc-200">{step.win}</div>
                </div>
                <div className="p-3 bg-[#111113] border border-white/[0.06] rounded-xl text-xs font-mono">
                  <div className="text-zinc-500 mb-1">Linux</div>
                  <div className="text-zinc-200">{step.linux}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
