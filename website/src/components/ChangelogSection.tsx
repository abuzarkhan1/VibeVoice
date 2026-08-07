import React, { useEffect } from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

const RELEASES = [
  {
    version: 'v1.4.0',
    date: 'Aug 2026',
    title: 'Linux support & hotkey customization',
    changes: [
      'Added Linux .deb package support',
      'AI Launcher hotkey customization',
      'Performance improvements across all platforms',
    ],
  },
  {
    version: 'v1.3.0',
    date: 'Jun 2026',
    title: 'Synchronized TTS & ElevenLabs',
    changes: [
      'Synchronized TTS with word-level highlighting',
      'ElevenLabs voice provider integration',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'Apr 2026',
    title: 'Windows vault & Deepgram streaming',
    changes: [
      'Windows DPAPI vault for secure credential storage',
      'Deepgram streaming dictation support',
      'Global hotkey fix across all OS targets',
    ],
  },
];

interface ChangelogSectionProps {
  standalone?: boolean;
}

export const ChangelogSection: React.FC<ChangelogSectionProps> = ({ standalone = false }) => {
  useEffect(() => {
    if (standalone) {
      document.title = 'Changelog — VibeVoice';
    }
  }, [standalone]);

  const content = (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-28">
      {standalone && (
        <a
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-16 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2] group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span>Back to home</span>
        </a>
      )}

      <div className="mb-16">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-5">
          Changelog
        </span>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08]"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          What&apos;s new.{' '}
          <span className="text-zinc-400 font-normal">v1.4.0</span>
        </h1>
      </div>

      <div className="relative flex flex-col gap-0">
        <div className="absolute left-[3.5rem] top-3 bottom-3 w-px bg-white/[0.06] hidden sm:block" />

        {RELEASES.map((release) => (
          <div key={release.version} className="relative flex gap-6 pb-12 last:pb-0">
            <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-28">
              <span className="font-mono text-xs bg-zinc-900 border border-white/[0.10] text-white px-2.5 py-1 rounded-full z-10 whitespace-nowrap">
                {release.version}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mt-2">
                {release.date}
              </span>
            </div>

            <div className="flex-1 bg-zinc-900/60 border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.14] transition-colors duration-200">
              <div className="flex items-start justify-between gap-4 mb-1 sm:hidden">
                <span className="font-mono text-xs bg-zinc-900 border border-white/[0.10] text-white px-2.5 py-1 rounded-full">
                  {release.version}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                  {release.date}
                </span>
              </div>
              <h3
                className="text-white font-extrabold text-base mb-4"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {release.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {release.changes.map((change) => (
                  <li key={change} className="flex items-start gap-2.5">
                    <span className="mt-[7px] flex-shrink-0 w-1 h-1 rounded-full bg-zinc-600" />
                    <span
                      className="text-zinc-400 text-sm leading-relaxed"
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      {change}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-start">
        <a
          href="https://github.com/abuzarkhan1/VibeVoice/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors duration-200 group"
        >
          <span>View all releases on GitHub</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </a>
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#08080a] border-b border-white/[0.08]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center">
            <a
              href="/"
              className="text-2xl font-black text-white tracking-tight select-none flex items-center gap-1 hover:opacity-90 transition-opacity"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              <span className="font-black tracking-tight text-white">Vibe</span>
              <em className="italic font-bold text-zinc-100 text-2xl" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Voice
              </em>
            </a>
          </div>
        </header>
        <main className="pt-16">
          {content}
        </main>
      </div>
    );
  }

  return null;
};
