'use client';

import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: 'What is VibeVoice?',
    answer: 'VibeVoice is the cross-platform desktop voice launcher created by Abuzar Khan. Hold a key, speak, and your words appear anywhere instantly.',
  },
  {
    question: 'Which platforms does it support?',
    answer: 'macOS (Apple Silicon M-Series & Intel), Windows 10/11 (x64), and Linux (AppImage & .deb packages).',
  },
  {
    question: 'Is it private?',
    answer: 'Yes. All voice processing runs on-device. API keys are encrypted in your OS hardware keychain (macOS SecItem, Windows DPAPI, Linux Secret Service). Zero data leaves your machine.',
  },
  {
    question: 'Which AI models work with it?',
    answer: 'Bring your own accounts and keys: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and local models via Ollama or Whisper.cpp.',
  },
  {
    question: 'What are the default hotkeys?',
    answer: 'Hold Fn to dictate anywhere, press ⌘+Shift+P (or Alt+Space) to summon the floating AI prompt bar, or highlight text for instant speech.',
  },
  {
    question: 'Is it free and open source?',
    answer: 'Yes, VibeVoice is 100% free and open source under the MIT license.',
  },
  {
    question: 'Where do I get help or report issues?',
    answer: 'Our GitHub repository and issue tracker at https://github.com/abuzarkhan1/VibeVoice.',
  },
];

export const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="py-28 bg-[#0a0a0d] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Section label */}
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
          FAQ
        </p>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-16">
          Common <em className="italic font-serif font-normal text-zinc-400">questions.</em>
        </h2>

        {/* Accordion FAQ List */}
        <div className="divide-y divide-white/[0.08]">
          {faqItems.map((item, idx) => (
            <details key={idx} className="group py-6 border-b border-white/[0.08] first:pt-0 last:pb-0">
              <summary className="flex justify-between text-lg font-medium text-white cursor-pointer list-none select-none items-center">
                <span>{item.question}</span>
                <span className="text-zinc-500 group-open:rotate-45 transition-transform duration-200 text-xl font-mono ml-4 shrink-0">
                  +
                </span>
              </summary>
              <p className="mt-4 text-zinc-400 text-base leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
