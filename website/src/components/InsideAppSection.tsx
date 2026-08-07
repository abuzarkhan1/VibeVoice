'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Command,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  Lock,
  CheckCircle2,
  Code2,
  Mail,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  icon: React.ReactNode;
  provider: string;
  rawInput: string;
  polishedOutput: string;
}

const PRESETS: Preset[] = [
  {
    id: 'refactor',
    name: 'Refactor Code',
    icon: <Code2 className="w-3.5 h-3.5" />,
    provider: 'Claude 3.5 Sonnet',
    rawInput: 'um yeah so basically we have this async fetch user function and like if the user is null it crashes',
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
    icon: <Mail className="w-3.5 h-3.5" />,
    provider: 'GPT-4o',
    rawInput: 'hey team just wanted to let you know that the release is pushed to thursday because we are still finishing up the accessibility audit',
    polishedOutput: `Hi Team,

I'd like to update you on our deployment timeline. To ensure complete accessibility compliance and thorough performance verification, we are rescheduling the release to Thursday morning.

Thank you for your flexibility.

Best regards,
Abuzar`,
  },
  {
    id: 'summarize',
    name: 'Summarize Notes',
    icon: <FileText className="w-3.5 h-3.5" />,
    provider: 'Claude 3.5 Sonnet',
    rawInput: 'in todays standup Sarah mentioned backend API endpoints are ready for testing. Alex will start integrating the audio highlighters today.',
    polishedOutput: `📌 Standup Key Action Items:

1. Backend API: Endpoints ready for testing (Sarah).
2. Audio Integration: Highlighters integration starts today (Alex).
3. Admin: Renew Apple Developer Certificate before next Friday.`,
  },
];

const DICTATION_MODES = [
  { id: 'local', label: 'Native C++', latency: 18 },
  { id: 'whisper', label: 'Whisper', latency: 45 },
  { id: 'deepgram', label: 'Deepgram', latency: 82 },
] as const;

const VAULT_OS = [
  { id: 'macos', label: 'macOS', backend: 'macOS Keychain Services' },
  { id: 'windows', label: 'Windows', backend: 'Windows DPAPI Vault' },
  { id: 'linux', label: 'Linux', backend: 'Linux Secret Service (DBus)' },
] as const;

type Token = { text: string; color: string };

function highlightTS(code: string): Token[] {
  type Range = { start: number; end: number; color: string };
  const ranges: Range[] = [];

  const add = (re: RegExp, color: string) => {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(code)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, color });
    }
  };

  add(/`[^`]*`/g, '#CE9178');
  add(/'[^'\n]*'/g, '#CE9178');
  add(/"[^"\n]*"/g, '#CE9178');
  add(/\/\/[^\n]*/g, '#6A9955');
  add(/\b(async|await|function|return|try|catch|const|let|var|if|else|null|undefined|true|false|new|typeof|void|throw)\b/g, '#569CD6');
  add(/\b(string|number|boolean|Promise|UserProfile|Error|Array|Object|any|never|unknown)\b/g, '#4EC9B0');
  add(/\b([a-zA-Z_][\w]*)(?=\s*\()/g, '#DCDCAA');
  add(/\b([a-z][a-zA-Z0-9]*)(?=\s*:\s*(string|number|boolean|Promise|null))/g, '#9CDCFE');

  ranges.sort((a, b) => a.start - b.start);

  const tokens: Token[] = [];
  let cursor = 0;

  for (const r of ranges) {
    if (r.start < cursor) continue;
    if (r.start > cursor) tokens.push({ text: code.slice(cursor, r.start), color: '#D4D4D4' });
    tokens.push({ text: code.slice(r.start, r.end), color: r.color });
    cursor = r.end;
  }
  if (cursor < code.length) tokens.push({ text: code.slice(cursor), color: '#D4D4D4' });

  return tokens;
}

export const InsideAppSection: React.FC = () => {
  const [dictationActive, setDictationActive] = useState(false);
  const [dictationMode, setDictationMode] = useState<'local' | 'whisper' | 'deepgram'>('local');
  const [dictationLatency, setDictationLatency] = useState(18);
  const [typedOutput, setTypedOutput] = useState('Hold Fn anywhere to stream voice input directly to your cursor...');
  const [equalizerBars, setEqualizerBars] = useState<number[]>([30, 45, 60, 25, 80, 50, 40, 70, 90, 35, 65, 45, 80, 55]);

  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const ttsWords = ['VibeVoice', 'delivers', 'sub-100ms', 'synchronized', 'speech', 'synthesis', 'directly', 'to', 'your', 'active', 'cursor.'];

  const [vaultOS, setVaultOS] = useState<'macos' | 'windows' | 'linux'>('macos');
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [launcherOutput, setLauncherOutput] = useState(PRESETS[0].polishedOutput);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (dictationActive) {
      interval = setInterval(() => {
        setEqualizerBars(Array.from({ length: 14 }, () => Math.floor(Math.random() * 65) + 25));
      }, 120);
    } else {
      setEqualizerBars([15, 20, 25, 15, 30, 20, 15, 25, 35, 20, 30, 20, 25, 15]);
    }
    return () => clearInterval(interval);
  }, [dictationActive]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;
    if (dictationActive) {
      const fullText = 'Transcribing spoken speech directly to cursor position with sub-100ms lock-free memory ringbuffers...';
      let currLength = 0;
      setTypedOutput('');
      const typeNextChar = () => {
        if (isCancelled) return;
        if (currLength < fullText.length) {
          currLength++;
          setTypedOutput(fullText.slice(0, currLength));
          timeoutId = setTimeout(typeNextChar, 25);
        }
      };
      typeNextChar();
    }
    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dictationActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ttsPlaying) {
      interval = setInterval(() => {
        setCurrentWordIdx((prev) => {
          if (prev >= ttsWords.length - 1) {
            setTtsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 320 / ttsSpeed);
    }
    return () => clearInterval(interval);
  }, [ttsPlaying, ttsSpeed, ttsWords.length]);

  const handleToggleDictation = () => {
    if (!dictationActive) {
      setDictationActive(true);
    } else {
      setDictationActive(false);
      setTypedOutput('Dictation paused. Press Test Mic to stream again.');
    }
  };

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setLauncherOutput(preset.polishedOutput);
  };

  const handleCopyOutput = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(launcherOutput);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = launcherOutput;
        el.style.position = 'fixed';
        el.style.left = '-999999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      } catch (fallbackErr) {
        console.error('Copy failed', fallbackErr);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentVaultOS = VAULT_OS.find((v) => v.id === vaultOS)!;

  return (
    <section
      id="inside"
      className="relative overflow-hidden bg-[#08080a] py-28 sm:py-36 border-t border-white/[0.06]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-white/[0.025] blur-[120px]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">

        <div className="max-w-3xl mb-20 sm:mb-28">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-6">
            Inside the App
          </p>
          <h2
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Built for speed.{' '}
            <br />
            <span className="text-zinc-400 font-normal">Every detail refined.</span>
          </h2>
          <p className="mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-400 font-normal">
            Four interactive surfaces. All running natively on your machine — no cloud dependencies, no context switching.
          </p>
        </div>

        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <article
              role="region"
              aria-label="Voice Dictation Surface"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleDictation(); } }}
              className="group rounded-2xl bg-zinc-900/50 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 p-6 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div>

                    <h3
                      className="text-base font-extrabold text-white tracking-tight"
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      Voice Dictation
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white bg-white/[0.06] border border-white/[0.12] rounded-full px-2.5 py-1">
                  <Zap className="w-3 h-3" />
                  {dictationLatency}ms
                </span>
              </div>

              <div className="flex gap-1 p-1 bg-white/[0.04] rounded-full border border-white/[0.06]">
                {DICTATION_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setDictationMode(mode.id); setDictationLatency(mode.latency); }}
                    className={`flex-1 py-1.5 px-2 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                      dictationMode === mode.id
                        ? 'bg-white text-black'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {mode.label} · {mode.latency}ms
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer active:scale-[0.97] ${
                    dictationActive
                      ? 'bg-white/[0.06] border border-white/20 text-white'
                      : 'bg-white text-black hover:bg-zinc-100'
                  }`}
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  <Mic className={`w-3.5 h-3.5 ${dictationActive ? 'animate-pulse' : ''}`} />
                  {dictationActive ? 'Streaming...' : 'Test Mic'}
                </button>
                <div className="flex items-end gap-[2px] h-7 flex-1" aria-hidden="true">
                  {equalizerBars.map((height, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-100 ${dictationActive ? 'bg-white' : 'bg-zinc-800'}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              <div
                aria-live="polite"
                aria-atomic="true"
                className="p-3.5 bg-black/30 rounded-xl border border-white/[0.06] font-mono text-xs text-zinc-400 min-h-[52px] flex items-center"
              >
                {dictationActive ? (
                  <span className="flex items-center gap-2 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" aria-hidden="true" />
                    {typedOutput}
                  </span>
                ) : (
                  <span>{typedOutput}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Hold Fn</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Lock-Free PCM Ringbuffer</span>
              </div>
            </article>

            <article
              role="region"
              aria-label="Synchronized TTS Surface"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTtsPlaying((v) => !v); } }}
              className="group rounded-2xl bg-zinc-900/50 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 p-6 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-white" />
                  </div>
                  <div>

                    <h3
                      className="text-base font-extrabold text-white tracking-tight"
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      Synchronized TTS
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed font-normal -mt-2">
                Highlight text anywhere. Hear it synthesized with real-time word-by-word visual karaoke highlighting.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTtsPlaying(!ttsPlaying)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-extrabold text-xs hover:bg-zinc-100 transition-all cursor-pointer active:scale-[0.97]"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  {ttsPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                  {ttsPlaying ? 'Pause' : 'Play Speech'}
                </button>
                <div className="flex gap-1 p-1 bg-white/[0.04] rounded-full border border-white/[0.06]">
                  {[1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setTtsSpeed(speed)}
                      className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        ttsSpeed === speed ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div
                aria-live="off"
                className="flex-1 p-4 bg-black/30 rounded-xl border border-white/[0.06] flex flex-wrap gap-1.5 content-start min-h-[88px]"
              >
                {ttsWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-sm font-extrabold transition-all duration-150 ${
                      currentWordIdx === idx && ttsPlaying
                        ? 'bg-white text-black shadow-lg'
                        : 'text-zinc-400'
                    }`}
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {word}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">OpenAI Neural · ElevenLabs</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Boundary Sync</span>
              </div>
            </article>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <article
              role="region"
              aria-label="AI Launcher Surface"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const nextIdx = (PRESETS.indexOf(activePreset) + 1) % PRESETS.length;
                  handleSelectPreset(PRESETS[nextIdx]);
                }
              }}
              className="group rounded-2xl bg-zinc-900/50 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 p-6 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Command className="w-4 h-4 text-white" />
                  </div>
                  <div>

                    <h3
                      className="text-base font-extrabold text-white tracking-tight"
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      AI Prompt Launcher
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-1">
                  ⌘+Shift+P
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      activePreset.id === preset.id
                        ? 'bg-white text-black'
                        : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:text-white hover:border-white/20'
                    }`}
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {preset.icon}
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-black/30 rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {activePreset.provider}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre
                  className="p-4 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-44 overflow-y-auto"
                  style={{ background: 'transparent' }}
                >
                  {activePreset.id === 'refactor'
                    ? highlightTS(launcherOutput).map((token, i) => (
                        <span key={i} style={{ color: token.color }}>{token.text}</span>
                      ))
                    : <span style={{ color: '#D4D4D4' }}>{launcherOutput}</span>
                  }
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">BYOK · OpenAI · Anthropic · Ollama</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Zero Cloud</span>
              </div>
            </article>

            <article
              role="region"
              aria-label="Security Vault Surface"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const cycle: Array<'macos' | 'windows' | 'linux'> = ['macos', 'windows', 'linux'];
                  setVaultOS((prev) => cycle[(cycle.indexOf(prev) + 1) % cycle.length]);
                }
              }}
              className="group rounded-2xl bg-zinc-900/50 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 p-6 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>

                    <h3
                      className="text-base font-extrabold text-white tracking-tight"
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      OS Keychain Vault
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white bg-white/[0.06] border border-white/[0.12] rounded-full px-2.5 py-1">
                  <Lock className="w-3 h-3" />
                  Sealed
                </span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed font-normal -mt-2">
                All API keys sealed inside native hardware vaults. Zero cloud storage — ever.
              </p>

              <div className="flex gap-1 p-1 bg-white/[0.04] rounded-full border border-white/[0.06]">
                {VAULT_OS.map((os) => (
                  <button
                    key={os.id}
                    type="button"
                    onClick={() => setVaultOS(os.id)}
                    className={`flex-1 py-1.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                      vaultOS === os.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                    }`}
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {os.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-black/30 rounded-xl border border-white/[0.06] p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Vault Backend</span>
                  <span className="text-white font-bold">{currentVaultOS.backend}</span>
                </div>
                <div className="w-full h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Encryption</span>
                  <span className="text-zinc-300">AES-256 GCM Hardware</span>
                </div>
                <div className="w-full h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Cloud Storage</span>
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Zero Data Stored
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Hardware Security Enclave</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">100% On-Device</span>
              </div>
            </article>

          </div>
        </div>

        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
            Four surfaces. One native runtime.
          </p>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
            macOS · Windows · Linux
          </span>
        </div>

      </div>
    </section>
  );
};