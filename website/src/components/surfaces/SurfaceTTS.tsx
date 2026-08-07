import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

const WORDS = [
  "VibeVoice",
  "delivers",
  "sub-100ms",
  "synchronized",
  "speech",
  "synthesis",
  "directly",
  "to",
  "your",
  "active",
  "cursor."
];

const SPEED_OPTIONS = ["1.0x", "1.25x", "1.5x", "2.0x"];

export const SurfaceTTS: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [speed, setSpeed] = useState("1.25x");

  const speedMultipliers: Record<string, number> = {
    "1.0x": 1.0,
    "1.25x": 1.25,
    "1.5x": 1.5,
    "2.0x": 2.0,
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isPlaying) {
      const multiplier = speedMultipliers[speed] || 1.25;
      const duration = 320 / multiplier;

      timer = setInterval(() => {
        setActiveIndex((prev) => {
          if (prev >= WORDS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, duration);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    if (activeIndex >= WORDS.length - 1 && !isPlaying) {
      setActiveIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveIndex(0);
  };

  return (
    <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-8 hover:border-white/[0.16] transition-all">
      <div className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-between">
        <span>SURFACE 02 // SYNCHRONIZED NEURAL TTS</span>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE DEMO
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-space font-extrabold tracking-tight text-white mb-2">
        Synchronized Neural <span className="italic font-serif font-normal text-zinc-400">TTS Card</span>
      </h3>

      <p className="text-sm font-bold text-zinc-300 leading-relaxed mb-6">
        Stream high-fidelity voice synthesis with real-time word-level synchronization directly to your active cursor.
      </p>

      <div className="bg-[#0a0a0d] border border-white/[0.06] rounded-xl p-5 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 active:scale-95 font-space font-extrabold tracking-tight text-xs rounded-lg transition-all cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-black" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.08] rounded-lg font-space font-extrabold tracking-tight text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-lg">
            {SPEED_OPTIONS.map((spdOption) => {
              const isSelected = speed === spdOption;
              return (
                <button
                  key={spdOption}
                  onClick={() => setSpeed(spdOption)}
                  className={`px-2.5 py-1 rounded font-space font-extrabold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {spdOption}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl mb-4 min-h-[90px] flex flex-col justify-between">
          <div className="flex flex-wrap gap-x-2 gap-y-2 text-base sm:text-lg leading-relaxed items-center">
            {WORDS.map((word, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;

              return (
                <span
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`transition-all duration-150 rounded px-1.5 py-0.5 cursor-pointer font-space font-extrabold ${
                    isActive
                      ? 'bg-white text-black scale-105 inline-block shadow-md'
                      : isPast
                      ? 'text-zinc-100 hover:text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.04] font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span>Word {activeIndex + 1} of {WORDS.length}</span>
            </div>

            <div className="flex items-end gap-1 h-3.5">
              {[0.4, 0.9, 0.6, 0.3, 0.8, 0.5, 1.0, 0.4].map((h, i) => (
                <motion.span
                  key={i}
                  className={`w-0.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-zinc-700'}`}
                  animate={
                    isPlaying
                      ? { height: [`${h * 100}%`, `${(1 - h + 0.2) * 100}%`, `${h * 100}%`] }
                      : { height: '20%' }
                  }
                  transition={{
                    duration: 0.4 + (i % 3) * 0.15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-bold uppercase tracking-widest pt-1">
          <span className="text-zinc-400">Voice Provider:</span>
          <span className="bg-white/[0.06] border border-white/[0.1] text-zinc-200 px-2.5 py-1 rounded-md font-mono text-xs font-bold uppercase tracking-widest">
            OpenAI Neural / ElevenLabs / Local C++
          </span>
        </div>
      </div>
    </div>
  );
};

export default SurfaceTTS;
