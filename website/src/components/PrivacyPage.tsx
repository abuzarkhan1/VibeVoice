import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `VibeVoice is a native desktop application. We do not operate servers that collect your personal data. The app runs entirely on your device. No audio, transcriptions, keystrokes, or usage metrics are transmitted to us.`,
  },
  {
    title: 'API Keys & Credentials',
    body: `Any API keys you enter (OpenAI, Anthropic, Deepgram, ElevenLabs) are stored exclusively in your operating system's hardware-backed credential vault — macOS Keychain (SecItem API), Windows Credential Manager (DPAPI), or Linux Secret Service (D-Bus). These credentials never leave your device and are never accessible to us.`,
  },
  {
    title: 'Voice & Audio Data',
    body: `Voice processing runs on-device using local Whisper (whisper.cpp) by default. If you choose a cloud provider such as Deepgram or OpenAI Whisper, audio is transmitted directly from your device to that provider under their privacy policy. VibeVoice does not intercept, store, or log audio data.`,
  },
  {
    title: 'Crash Reports & Diagnostics',
    body: `VibeVoice does not automatically collect crash reports or telemetry. If you choose to file a GitHub issue, any information you include in that issue is subject to GitHub's privacy policy.`,
  },
  {
    title: 'Third-Party Services',
    body: `When you use AI features with third-party providers (OpenAI, Anthropic, Ollama, etc.), your prompts and responses are governed by their respective privacy policies. VibeVoice acts only as a local interface — it does not log or store these interactions.`,
  },
  {
    title: 'Open Source',
    body: `VibeVoice is fully open source under the MIT license. You can audit every line of code that runs on your machine at https://github.com/abuzarkhan1/VibeVoice.`,
  },
  {
    title: 'Contact',
    body: `For privacy-related questions, open an issue on GitHub at https://github.com/abuzarkhan1/VibeVoice/issues or contact Abuzar Khan directly via GitHub.`,
  },
];

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy — VibeVoice';
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#08080a] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
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
          <a
            href="/terms"
            className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            Terms →
          </a>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-24">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-16 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2] group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Back to home</span>
          </a>

          <div className="mb-14">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-5">
              Legal
            </span>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-4"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Privacy{' '}
              <span className="text-zinc-400 font-normal">Policy</span>
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">
              Last updated: August 2026
            </p>
          </div>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title} className="border-t border-white/[0.06] pt-8">
                <h2
                  className="text-lg font-extrabold text-white mb-3 tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  {section.title}
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
              VibeVoice · MIT License
            </span>
            <a
              href="/terms"
              className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Terms of Service →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
