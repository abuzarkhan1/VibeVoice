'use client';

import React, { useEffect, useRef } from 'react';

const features = [
  {
    num: '01',
    title: 'Sub-100ms Voice Dictation',
    desc: 'Hold Fn. Speak. Text appears in any app instantly.',
  },
  {
    num: '02',
    title: 'Synchronized Text-To-Speech',
    desc: 'Highlight text anywhere. Hear it read with word-by-word sync.',
  },
  {
    num: '03',
    title: 'Global AI Prompt Launcher',
    desc: '⌘+Shift+P anywhere. Claude, GPT-4o, Llama — your choice.',
  },
  {
    num: '04',
    title: 'Hardware Keychain Security',
    desc: 'Keys encrypted in your OS vault. Zero cloud storage.',
  },
  {
    num: '05',
    title: 'Cross-Platform Native Engine',
    desc: 'Mac, Windows, Linux. Native C++ / Swift / C# per platform.',
  },
];

export const FeaturesSection: React.FC = () => {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLLIElement>('[data-feature]');
    if (!items) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="what" className="bg-[#0a0a0d] py-28 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Section label */}
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
          What it does
        </p>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-16">
          One key. Anywhere. Instant.
        </h2>

        {/* Numbered list */}
        <ol ref={listRef} className="space-y-0">
          {features.map((f, i) => (
            <li
              key={f.num}
              data-feature
              className="flex gap-8 py-8 border-t border-white/[0.06] last:border-b last:border-white/[0.06]"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Number */}
              <span className="w-8 shrink-0 font-mono text-sm text-zinc-600 pt-0.5 select-none">
                {f.num}
              </span>

              {/* Content */}
              <div>
                <p className="font-semibold text-white text-base leading-snug mb-1">
                  {f.title}
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
