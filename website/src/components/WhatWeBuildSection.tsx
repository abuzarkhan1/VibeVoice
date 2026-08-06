import React from 'react';

const BUILD_ITEMS = [
  {
    num: '01',
    title: 'Sub-100ms Voice Dictation',
    desc: 'Hold Fn. Speak. Text appears in any active application instantly via hardware-level OS hooks.',
  },
  {
    num: '02',
    title: 'Synchronized Text-To-Speech',
    desc: 'Highlight text anywhere. Hear it read back with real-time word-by-word visual karaoke highlighting.',
  },
  {
    num: '03',
    title: 'Global AI Prompt Launcher',
    desc: '⌘+Shift+P anywhere. Summon Claude, GPT-4o, and Llama directly in your active application.',
  },
];

export const WhatWeBuildSection: React.FC = () => {
  return (
    <section id="what-we-build" className="py-28 sm:py-36 bg-[#0a0a0d] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Section label */}
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4">
          WHAT WE BUILD
        </p>

        {/* Section Heading */}
        <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-16">
          One key. Anywhere.{' '}
          <em className="not-italic text-zinc-400 font-normal">
            Instant voice control.
          </em>
        </h2>

        {/* 01, 02, 03 Lines */}
        <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
          {BUILD_ITEMS.map((item) => (
            <div
              key={item.num}
              className="py-8 sm:py-10 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 group"
            >
              <span className="w-8 shrink-0 font-mono text-xs sm:text-sm text-zinc-500 tracking-widest pt-1 select-none">
                {item.num}
              </span>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
