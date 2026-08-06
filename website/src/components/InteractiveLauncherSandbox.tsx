import React, { useState, useEffect, useRef } from 'react';
import { Mic, Code2, Mail, FileText, Copy, Check, Play, RefreshCw, Command, Sparkles } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  icon: React.ReactNode;
  rawInput: string;
  polishedOutput: string;
  provider: string;
}

const PRESETS: Preset[] = [
  {
    id: 'refactor',
    name: 'Refactor Code',
    icon: <Code2 className="w-4 h-4" />,
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
    icon: <Mail className="w-4 h-4" />,
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
    icon: <FileText className="w-4 h-4" />,
    provider: 'Claude 3.5 Sonnet',
    rawInput: 'in todays standup Sarah mentioned backend API endpoints are ready for testing. Alex will start integrating the audio highlighters today. Also we need to renew our Apple Developer certificate before next Friday',
    polishedOutput: `📌 Standup Key Action Items:

1. Backend API: Endpoints ready for testing (Sarah).
2. Audio Integration: Highlighters integration starts today (Alex).
3. Admin: Renew Apple Developer Certificate before next Friday.`,
  },
];

export const InteractiveLauncherSandbox: React.FC = () => {
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [isDictating, setIsDictating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedInput, setDisplayedInput] = useState(PRESETS[0].rawInput);
  const [showOutput, setShowOutput] = useState(true);
  const [copied, setCopied] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([30, 45, 60, 25, 80, 50, 40, 70, 90, 35, 65, 45]);

  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (isDictating) {
      interval = setInterval(() => {
        setWaveHeights(Array.from({ length: 14 }, () => Math.floor(Math.random() * 70) + 20));
      }, 100);
    } else {
      setWaveHeights([20, 30, 25, 35, 20, 40, 25, 30, 20, 25, 30, 20, 25, 20]);
    }
    return () => clearInterval(interval);
  }, [isDictating]);

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setIsDictating(true);
    setIsProcessing(false);
    setShowOutput(false);
    setDisplayedInput('');

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    let charIndex = 0;
    const text = preset.rawInput;
    typingTimerRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedInput((prev) => text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingTimerRef.current);
        setIsDictating(false);
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setShowOutput(true);
        }, 600);
      }
    }, 15);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(activePreset.polishedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="sandbox" className="py-32 bg-[#0a0a0d] text-white relative">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
            Interactive Demo
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Experience the launcher live.
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Simulate real-time voice streaming, instant AI cleanup, and native cursor insertion right here.
          </p>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {PRESETS.map((preset) => {
            const isActive = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow'
                    : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {preset.icon}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* VibeVoice Floating Launcher Mockup Window */}
        <div className="bg-[#111113] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Mock Window Header */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>VibeVoice Launcher</span>
            </div>
            <span>Hotkey: ⌘+Shift+P</span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            
            {/* Dictation Input Area */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-zinc-400">
                <span>Spoken Input Stream</span>
                <span className="font-mono text-zinc-500">Fn Key Hold</span>
              </div>
              <div className="p-4 bg-[#0a0a0d] border border-white/[0.06] rounded-xl text-sm font-mono text-zinc-300 min-h-[72px] flex items-center justify-between gap-4">
                <span>{displayedInput || <span className="text-zinc-600">Click a preset above to simulate voice dictation...</span>}</span>
                <div className="flex items-center gap-1 shrink-0 h-6">
                  {waveHeights.map((h, i) => (
                    <div
                      key={i}
                      className={`w-0.5 rounded-full transition-all duration-100 ${
                        isDictating ? 'bg-white' : 'bg-zinc-700'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Model Output */}
            {isProcessing && (
              <div className="p-4 bg-[#0a0a0d] border border-white/[0.06] rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Processing through {activePreset.provider}...</span>
              </div>
            )}

            {showOutput && (
              <div>
                <div className="flex items-center justify-between mb-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Sparkles className="w-3.5 h-3.5" /> Cleaned Output ({activePreset.provider})
                  </span>
                  <button
                    onClick={handleCopyOutput}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0a0a0d] border border-white/[0.06] rounded-xl text-sm font-mono text-white whitespace-pre-wrap leading-relaxed">
                  {activePreset.polishedOutput}
                </pre>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
