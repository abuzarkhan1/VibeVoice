import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export interface EngineOption {
  id: 'native' | 'whisper' | 'deepgram';
  name: string;
  latency: string;
  accuracy: string;
  badge: string;
  type: string;
}

const ENGINES: EngineOption[] = [
  {
    id: 'native',
    name: 'Native C++ 18ms',
    latency: '12ms local latency',
    accuracy: '99.8%',
    badge: 'Zero-IPC Metal',
    type: 'C++ / Whisper Core',
  },
  {
    id: 'whisper',
    name: 'Whisper 45ms',
    latency: '45ms local latency',
    accuracy: '99.4%',
    badge: 'CoreML Quantized',
    type: 'Whisper Small',
  },
  {
    id: 'deepgram',
    name: 'Deepgram 82ms',
    latency: '82ms cloud latency',
    accuracy: '99.6%',
    badge: 'Nova-2 Streaming',
    type: 'Cloud API',
  },
];

const PHRASES = [
  'Transcribing voice input directly into active cursor in real-time...',
  'Refactor this React hook to use memoized state and sub-10ms handlers.',
  'System-wide voice dictation streaming cleanly across native macOS applications.',
];

export const SurfaceDictation: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState<EngineOption>(ENGINES[0]);
  const [isDictating, setIsDictating] = useState<boolean>(true);
  const [typedText, setTypedText] = useState<string>('');
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(16).fill(20));

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isDictating) {
      return;
    }

    const currentPhrase = PHRASES[phraseIndex];
    let charIndex = 0;
    setTypedText('');

    const interval = setInterval(() => {
      if (charIndex <= currentPhrase.length) {
        setTypedText(currentPhrase.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        const timeout = setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        }, 2200);
        return () => clearTimeout(timeout);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isDictating, phraseIndex]);

  useEffect(() => {
    if (!isDictating) {
      setBarHeights(Array(16).fill(16));
      return;
    }

    let lastUpdate = 0;
    const updateWaveform = (timestamp: number) => {
      if (timestamp - lastUpdate > 60) {
        lastUpdate = timestamp;
        const newHeights = Array.from({ length: 16 }, (_, i) => {
          const centerDist = Math.abs(i - 7.5) / 7.5;
          const weight = 1 - centerDist * 0.45;
          const noise = Math.random() * 0.8 + 0.2;
          const val = Math.floor(weight * noise * 85 + 15);
          return Math.max(12, Math.min(100, val));
        });
        setBarHeights(newHeights);
      }
      animRef.current = requestAnimationFrame(updateWaveform);
    };

    animRef.current = requestAnimationFrame(updateWaveform);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isDictating]);

  const toggleDictation = () => {
    setIsDictating((prev) => !prev);
  };

  return (
    <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-8 hover:border-white/[0.16] transition-all shadow-xl">
      <div className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-between">
        <span>SURFACE // 01</span>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-200 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isDictating ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
          SYSTEM-WIDE DICTATION
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-space font-extrabold tracking-tight text-white mb-2">
        Floating Dictation <span className="italic font-serif font-normal text-zinc-400">HUD</span>
      </h3>

      <p className="text-sm font-bold text-zinc-300 leading-relaxed mb-6">
        Sub-10ms latency voice capture with live RMS audio meter. Instant streaming insertion into VS Code, Slack, Chrome, or any native application.
      </p>

      <div className="bg-[#0a0a0d] border border-white/[0.06] rounded-xl p-5 font-mono text-xs flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isDictating && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isDictating ? 'bg-emerald-400' : 'bg-zinc-600'
                }`}
              />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              {isDictating ? 'Listening & Transcribing' : 'Dictation Idle'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{selectedEngine.latency}</span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-200 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
              Fn Hold
            </span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
            <span>AUDIO INPUT STREAM (RMS METER)</span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-300">
              {isDictating ? `${selectedEngine.accuracy} CONFIDENCE` : 'MIC MUTED'}
            </span>
          </div>

          <div className="h-12 bg-black/50 border border-white/[0.04] rounded-md p-2 flex items-center justify-between gap-1 overflow-hidden">
            {barHeights.map((height, i) => (
              <div key={i} className="flex-1 h-full flex items-center justify-center">
                <div
                  className={`w-full rounded-full transition-all duration-75 ${
                    isDictating
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
                      : 'bg-zinc-800'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/60 border border-white/[0.08] rounded-lg p-3.5 min-h-[64px] flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-300">LIVE STREAMING OUTPUT</span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Target: Active Cursor</span>
          </div>

          <div className="font-mono text-xs font-bold text-white leading-relaxed flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono font-bold select-none">&gt;</span>
            <span className="text-zinc-100 font-bold">
              {typedText || "Click 'Test Mic Dictation' to start stream..."}
            </span>
            {isDictating && (
              <span className="w-1.5 h-4 bg-emerald-400 inline-block animate-pulse ml-0.5 shrink-0" />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={toggleDictation}
            className="bg-white hover:bg-zinc-200 text-black active:scale-[0.98] font-space font-extrabold tracking-tight text-xs px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md shadow-white/5"
          >
            {isDictating ? (
              <MicOff className="w-3.5 h-3.5 text-zinc-900" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-zinc-900" />
            )}
            <span>{isDictating ? 'Stop Dictation' : 'Test Mic Dictation'}</span>
          </button>

          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] p-1 rounded-lg gap-1 overflow-x-auto">
            {ENGINES.map((engine) => (
              <button
                key={engine.id}
                type="button"
                onClick={() => setSelectedEngine(engine)}
                className={`px-2.5 py-1.5 rounded-md font-space font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  selectedEngine.id === engine.id
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {engine.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurfaceDictation;
