import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: `By downloading, installing, or using VibeVoice, you agree to be bound by these Terms of Service. If you do not agree, do not use the software.`,
  },
  {
    title: 'License',
    body: `VibeVoice is released under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, provided the original copyright notice and this permission notice appear in all copies.`,
  },
  {
    title: 'Permitted Use',
    body: `VibeVoice is intended for personal and professional productivity use. You may use the software for any lawful purpose. You may not use VibeVoice to violate any applicable laws, infringe intellectual property rights, or engage in unauthorized data collection.`,
  },
  {
    title: 'Third-Party API Keys',
    body: `You are solely responsible for obtaining and complying with the terms of any third-party API services you connect to VibeVoice (OpenAI, Anthropic, Deepgram, ElevenLabs, Ollama, etc.). Abuzar Khan is not responsible for costs, rate limits, or policy violations incurred through your use of those services.`,
  },
  {
    title: 'No Warranty',
    body: `VibeVoice is provided "as is", without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Use at your own risk.`,
  },
  {
    title: 'Limitation of Liability',
    body: `In no event shall Abuzar Khan or contributors be liable for any claim, damages, or other liability — whether in contract, tort, or otherwise — arising from, out of, or in connection with the software or its use.`,
  },
  {
    title: 'Open Source',
    body: `The full source code is available at https://github.com/abuzarkhan1/VibeVoice under the MIT License. Community contributions are welcome and governed by the project's contribution guidelines.`,
  },
  {
    title: 'Changes to Terms',
    body: `These terms may be updated from time to time. Continued use of VibeVoice after changes are posted constitutes acceptance of the revised terms. Changes will be reflected in the repository.`,
  },
  {
    title: 'Contact',
    body: `For questions about these terms, open an issue at https://github.com/abuzarkhan1/VibeVoice/issues or contact Abuzar Khan via GitHub.`,
  },
];

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service — VibeVoice';
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
            href="/privacy"
            className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            Privacy →
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
              Terms of{' '}
              <span className="text-zinc-400 font-normal">Service</span>
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
              href="/privacy"
              className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Privacy Policy →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
