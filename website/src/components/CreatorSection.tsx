'use client';

import React from 'react';
import { GithubIcon as Github } from './icons';

export const CreatorSection: React.FC = () => {
  return (
    <section id="creator" className="bg-[#0a0a0d] py-32 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        
        {/* Section label */}
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
          Built in the Open
        </p>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-8">
          Created by Abuzar Khan.
        </h2>

        <p className="text-zinc-400 text-lg leading-relaxed mb-12">
          VibeVoice is an independent open-source software project built with precision native engineering for macOS, Windows, and Linux. Part of the Vibe Productivity Suite.
        </p>

        {/* Suite Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-2xl">
            <div className="text-xs font-mono text-zinc-500 uppercase mb-2">01 · Voice AI</div>
            <h3 className="text-lg font-bold text-white mb-2">VibeVoice</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-100ms voice dictation, synchronized text-to-speech, and floating AI prompt bar across all desktop OS.
            </p>
          </div>

          <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-2xl">
            <div className="text-xs font-mono text-zinc-500 uppercase mb-2">02 · Productivity</div>
            <h3 className="text-lg font-bold text-white mb-2">VibeGrid</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              High-performance window management and spatial workspace organization for macOS power users.
            </p>
          </div>
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/abuzarkhan1/VibeVoice"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-zinc-300 transition-colors"
        >
          <Github className="w-4 h-4 text-white" />
          <span>Follow project updates on GitHub</span>
          <span className="font-mono text-zinc-500 text-xs">→</span>
        </a>

      </div>
    </section>
  );
};
