import React from 'react';
import { Check, ArrowRight, Github } from 'lucide-react';

const FEATURES = [
  'Sub-100ms Voice Dictation',
  'Synchronized TTS',
  'Global AI Prompt Launcher (BYOK)',
  'OS Hardware Keychain Security',
  'macOS + Windows + Linux',
  'Full source code on GitHub',
];

interface PricingSectionProps {
  onOpenModal?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenModal }) => {
  return (
    <section className="w-full bg-[#08080a] py-28 px-6" id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-5">
            Pricing
          </span>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08]"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Free forever.{' '}
            <span className="text-zinc-400 font-normal">Open source.</span>
          </h2>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-zinc-900/90 border border-white/[0.08] rounded-3xl p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-2">
                <span
                  className="text-5xl font-extrabold text-white leading-none"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  $0
                </span>
                <span className="text-zinc-500 text-base mb-1 font-normal">/mo</span>
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-1">
                MIT License
              </span>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <ul className="flex flex-col gap-4">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.08]">
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  </span>
                  <span
                    className="text-zinc-300 text-sm font-normal"
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex flex-col gap-3">
              <button
                onClick={onOpenModal}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-xl shadow-white/10 active:scale-[0.98] cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                <span>Download VibeVoice</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </button>

              <a
                href="https://github.com/abuzarkhan1/VibeVoice"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-transparent border border-white/[0.12] text-white font-semibold text-sm hover:bg-white/[0.06] hover:border-white/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                <Github className="w-4 h-4 text-white stroke-[1.5]" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
