'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  Command,
  Lock,
  CheckCircle2,
  Activity,
  Key,
  Sliders,
  Code2,
  Mail,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

/* ─── Preset Types for Launcher ───────────────────────────────── */
interface Preset {
  id: string;
  name: string;
  provider: string;
  rawInput: string;
  polishedOutput: string;
}

const PRESETS: Preset[] = [
  {
    id: 'refactor',
    name: 'Refactor Code',
    provider: 'Claude 3.5 Sonnet',
    rawInput: 'um yeah so basically we have this async fetch user function and like if the user is null it crashes because of unhandled promise rejection so we should add a try catch block and return null or log the error cleanly',
    polishedOutput: `async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await api.get(\`/users/\${userId}\`);
    return response.data;
  } catch (error) {
    console.error('[VibeVoice] Failed to fetch user profile:', error);
    return null;
  }
}`,
  },
  {
    id: 'email',
    name: 'Polish Email',
    provider: 'GPT-4o',
    rawInput: 'hey team just wanted to let you know that the release is pushed to thursday morning instead of tuesday because we are still finishing up the accessibility audit and performance tests thanks for understanding',
    polishedOutput: `Hi Team,

I'd like to update you on our deployment timeline. To ensure complete accessibility compliance and thorough performance verification, we are rescheduling the release from Tuesday to Thursday morning.

Thank you for your flexibility as we finalize these quality benchmarks.

Best regards,
Abuzar`,
  },
  {
    id: 'summarize',
    name: 'Summarize Notes',
    provider: 'Claude 3.5 Sonnet',
    rawInput: 'in todays standup Sarah mentioned backend API endpoints are ready for testing. Alex will start integrating the audio highlighters today. Also we need to renew our Apple Developer certificate before next Friday',
    polishedOutput: `📌 Standup Key Action Items:

1. Backend API: Endpoints ready for testing (Sarah).
2. Audio Integration: Highlighters integration starts today (Alex).
3. Admin: Renew Apple Developer Certificate before next Friday.`,
  },
];

export const InsideAppSection: React.FC = () => {
  /* ── 1. Dictation State ── */
  const [dictationActive, setDictationActive] = useState(false);
  const [dictationMode, setDictationMode] = useState<'local' | 'whisper' | 'deepgram'>('local');
  const [dictationLatency, setDictationLatency] = useState(18);
  const [typedOutput, setTypedOutput] = useState('Hold Fn anywhere to stream voice input directly to your cursor...');
  const [equalizerBars, setEqualizerBars] = useState<number[]>([30, 45, 60, 25, 80, 50, 40, 70, 90, 35, 65, 45, 80, 55]);

  /* ── 2. TTS Karaoke State ── */
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const ttsWords = [
    'VibeVoice', 'delivers', 'sub-100ms', 'synchronized', 'speech', 'synthesis', 'directly', 'to', 'your', 'active', 'cursor.'
  ];

  /* ── 3. Hardware Vault State ── */
  const [vaultOS, setVaultOS] = useState<'macos' | 'windows' | 'linux'>('macos');
  const [vaultUnlocked, setVaultUnlocked] = useState(true);

  /* ── 4. Launcher State ── */
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [launcherInput, setLauncherInput] = useState(PRESETS[0].rawInput);
  const [launcherOutput, setLauncherOutput] = useState(PRESETS[0].polishedOutput);
  const [copied, setCopied] = useState(false);

  /* Audio Equalizer Animation loop */
  useEffect(() => {
    let interval: any;
    if (dictationActive) {
      interval = setInterval(() => {
        setEqualizerBars(Array.from({ length: 14 }, () => Math.floor(Math.random() * 75) + 15));
      }, 90);
    } else {
      setEqualizerBars([20, 30, 25, 35, 20, 40, 25, 30, 20, 25, 30, 20, 25, 20]);
    }
    return () => clearInterval(interval);
  }, [dictationActive]);

  /* Synchronized TTS playback loop */
  useEffect(() => {
    let interval: any;
    if (ttsPlaying) {
      interval = setInterval(() => {
        setCurrentWordIdx((prev) => {
          if (prev >= ttsWords.length - 1) {
            setTtsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 360 / ttsSpeed);
    }
    return () => clearInterval(interval);
  }, [ttsPlaying, ttsSpeed, ttsWords.length]);

  const handleToggleDictation = () => {
    if (!dictationActive) {
      setDictationActive(true);
      setTypedOutput('Streaming voice capture into VS Code index.tsx...');
    } else {
      setDictationActive(false);
      setTypedOutput('Dictation paused. Press Test Mic to stream again.');
    }
  };

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setLauncherInput(preset.rawInput);
    setLauncherOutput(preset.polishedOutput);
  };

  const handleCopyLauncherOutput = () => {
    navigator.clipboard.writeText(launcherOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="inside" className="py-28 sm:py-36 bg-[#08080a] relative overflow-hidden border-t border-white/[0.06]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>INSIDE THE APP</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            Built for speed.{' '}
            <em className="italic font-serif font-normal text-zinc-400">
              Every detail refined.
            </em>
          </h2>
          <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed">
            Four core surfaces engineered for sub-100ms response times and zero context switching across macOS, Windows, and Linux.
          </p>
        </div>

        {/* Bento Grid Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ── CARD 1: Sub-100ms Voice Dictation (Large 7 Columns) ── */}
          <div className="lg:col-span-7 bento-card flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">01 · Voice Dictation</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">Sub-100ms Streaming Audio</h3>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {dictationLatency}ms Latency
                </span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Direct streaming PCM audio connected to Whisper, Deepgram, or native C++ inference engines with lock-free memory ringbuffers.
              </p>

              {/* Interactive Dictation Visualizer Box */}
              <div className="bento-card-inner space-y-4">
                {/* Engine Mode & Latency Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-400">Inference Engine:</span>
                  <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 gap-1">
                    <button
                      onClick={() => { setDictationMode('local'); setDictationLatency(18); }}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        dictationMode === 'local' ? 'bg-white text-black font-bold shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Native C++ (18ms)
                    </button>
                    <button
                      onClick={() => { setDictationMode('whisper'); setDictationLatency(45); }}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        dictationMode === 'whisper' ? 'bg-white text-black font-bold shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Whisper (45ms)
                    </button>
                    <button
                      onClick={() => { setDictationMode('deepgram'); setDictationLatency(82); }}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        dictationMode === 'deepgram' ? 'bg-white text-black font-bold shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Deepgram (82ms)
                    </button>
                  </div>
                </div>

                {/* Mic Test & Live Audio Equalizer */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleDictation}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all text-xs flex items-center gap-2 ${
                      dictationActive
                        ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 animate-pulse'
                        : 'bg-white text-black font-semibold hover:bg-zinc-200'
                    }`}
                  >
                    <Mic className={`w-3.5 h-3.5 ${dictationActive ? 'animate-bounce' : ''}`} />
                    <span>{dictationActive ? 'Stop Stream' : 'Test Mic Stream'}</span>
                  </button>

                  <div className="flex-1 h-10 bg-zinc-900 rounded-xl border border-zinc-800 p-2 flex items-center justify-center gap-1 overflow-hidden">
                    {equalizerBars.map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-100 ${
                          dictationActive ? 'bg-white animate-pulse' : 'bg-zinc-700'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Typewriter Output Box */}
                <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-200 min-h-[44px] flex items-center">
                  {dictationActive ? (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>"{typedOutput}"</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">{typedOutput}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Hotkey: Hold Fn</span>
              <span>RingBuffer: Lock-Free PCM</span>
            </div>
          </div>

          {/* ── CARD 2: Synchronized Neural TTS (5 Columns) ── */}
          <div className="lg:col-span-5 bento-card flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">02 · Neural Speech</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">Synchronized TTS</h3>
                  </div>
                </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Highlight text anywhere on screen to listen with millisecond-accurate word karaoke highlighting.
              </p>

              {/* Interactive TTS Player Box */}
              <div className="bento-card-inner space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTtsPlaying(!ttsPlaying)}
                      className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-zinc-200"
                    >
                      {ttsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                      <span>{ttsPlaying ? 'Pause' : 'Play Audio'}</span>
                    </button>
                    <button
                      onClick={() => { setTtsPlaying(false); setCurrentWordIdx(0); }}
                      className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-xs hover:text-white"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 gap-1">
                    {[1.0, 1.25, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setTtsSpeed(s)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          ttsSpeed === s ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Word Highlight Reader Box */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs leading-relaxed min-h-[72px] flex flex-wrap items-center gap-1">
                  {ttsWords.map((word, idx) => {
                    const isCurrent = ttsPlaying && idx === currentWordIdx;
                    const isPassed = ttsPlaying && idx < currentWordIdx;
                    return (
                      <span
                        key={idx}
                        className={`px-1 py-0.5 rounded transition-all duration-150 ${
                          isCurrent
                            ? 'bg-white text-black font-bold scale-105 shadow'
                            : isPassed
                            ? 'text-zinc-200 font-medium'
                            : 'text-zinc-500'
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Voices: OpenAI / ElevenLabs</span>
              <span>IPC: Word Boundaries</span>
            </div>
          </div>

          {/* ── CARD 3: Hardware Keychain Vault (5 Columns) ── */}
          <div className="lg:col-span-5 bento-card flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">03 · Key Security</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">Hardware Secure Enclave</h3>
                  </div>
                </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                API keys are sealed in your OS hardware keychain. Zero keys ever leave your machine.
              </p>

              {/* Vault Interactive Box */}
              <div className="bento-card-inner space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">OS Enclave:</span>
                  <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 gap-1">
                    <button
                      onClick={() => setVaultOS('macos')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        vaultOS === 'macos' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      macOS SecItem
                    </button>
                    <button
                      onClick={() => setVaultOS('windows')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        vaultOS === 'windows' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Windows DPAPI
                    </button>
                    <button
                      onClick={() => setVaultOS('linux')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        vaultOS === 'linux' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Secret Service
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">
                        {vaultOS === 'macos' && 'SecItem API (Touch ID Enclave)'}
                        {vaultOS === 'windows' && 'DPAPI (Windows Hello Vault)'}
                        {vaultOS === 'linux' && 'libsecret D-Bus Keyring'}
                      </div>
                      <div className="text-zinc-500 font-mono text-[11px]">
                        {vaultUnlocked ? '••••••••••••••••••••••••' : 'Locked Vault State'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setVaultUnlocked(!vaultUnlocked)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
                  >
                    {vaultUnlocked ? 'Lock Enclave' : 'Unlock Enclave'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Encryption: AES-256 GCM</span>
              <span>Cloud Storage: 0%</span>
            </div>
          </div>

          {/* ── CARD 4: Global AI Prompt Launcher (Large 7 Columns) ── */}
          <div className="lg:col-span-7 bento-card flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                    <Command className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">04 · AI Command Bar</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">Floating AI Launcher</h3>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-mono font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
                  ⌘+Shift+P
                </span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Instant floating prompt bar overlay accessible anywhere across system windows via global hardware keybindings.
              </p>

              {/* Launcher Interactive Box */}
              <div className="bento-card-inner space-y-3">
                {/* Action Preset Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        activePreset.id === preset.id
                          ? 'bg-white text-black font-bold shadow'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Input Prompt Box */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  <input
                    type="text"
                    value={launcherInput}
                    onChange={(e) => setLauncherInput(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                </div>

                {/* Formatted Output Box */}
                <div className="relative p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-white">
                  <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-800 pb-2 mb-2">
                    <span>{activePreset.provider}</span>
                    <button
                      onClick={handleCopyLauncherOutput}
                      className="flex items-center gap-1 text-zinc-400 hover:text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-zinc-200">
                    {launcherOutput}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Insertion: AXUI Cursor Focus</span>
              <span>Presets: Unlimited</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
