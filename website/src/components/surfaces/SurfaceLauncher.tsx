import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Code2,
  Mail,
  FileText,
  Wand2,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  Cpu,
  CornerDownLeft,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  icon: React.ElementType;
  model: string;
  latency: string;
  rawInput: string;
  formattedOutput: string;
  type: 'code' | 'text' | 'markdown';
}

const MODELS = [
  { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latency: '84ms', badge: 'Cloud' },
  { id: 'gpt4o', name: 'GPT-4o', provider: 'OpenAI', latency: '112ms', badge: 'Cloud' },
  { id: 'ollama', name: 'Ollama (Llama 3.3)', provider: 'Local Machine', latency: '14ms', badge: 'Offline' },
];

const PRESETS: Preset[] = [
  {
    id: 'refactor',
    name: 'Refactor Code',
    icon: Code2,
    model: 'Claude 3.5 Sonnet',
    latency: '84ms',
    rawInput: 'Refactor this async data fetcher to handle errors, add TypeScript types, and use abort controller for cleanup',
    type: 'code',
    formattedOutput: `interface FetchOptions<T> {
  url: string;
  signal?: AbortSignal;
}

export async function fetchWithTimeout<T>({ url, signal }: FetchOptions<T>): Promise<T> {
  try {
    const res = await fetch(url, { signal, headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[VibeVoice] Request cancelled by signal');
    }
    throw err;
  }
}`,
  },
  {
    id: 'email',
    name: 'Polish Email',
    icon: Mail,
    model: 'GPT-4o',
    latency: '112ms',
    rawInput: 're: product launch update - delayed by 2 days due to final security scan. need to inform stakeholders professionally.',
    type: 'text',
    formattedOutput: `Subject: Update: Adjusted VibeVoice Launch Timeline (2-Day Security Audit Buffer)

Dear Stakeholders,

I am writing to provide an operational update regarding our upcoming release. To ensure our hardware keychain vault and local encryption standards satisfy final zero-trust verification, we are shifting the public launch by 48 hours.

• Revised Release Time: Thursday at 09:00 AM EST
• Impact: Zero downtime for existing beta keyholders
• Action Required: None.

Thank you for your flexibility as we finalize these quality and security benchmarks.`,
  },
  {
    id: 'summarize',
    name: 'Summarize Notes',
    icon: FileText,
    model: 'Claude 3.5 Sonnet',
    latency: '64ms',
    rawInput: 'Meeting notes from audio sync: latency reduced to 72ms on macOS metal. Windows DPAPI vault tested 100%. Linux secret service backend ready. Next focus is electron IPC streaming optimizations.',
    type: 'markdown',
    formattedOutput: `# ⚡ Engineering Sync Highlights

1. Performance Benchmark:
   • macOS: Latency reduced to 72ms via Metal compute kernel.
   • Windows: DPAPI hardware vault achieved 100% test coverage.
   • Linux: Secret Service API backend is verified & production-ready.

2. Next Milestone:
   • Electron IPC zero-copy buffer streaming for sub-50ms render target.`,
  },
  {
    id: 'grammar',
    name: 'Fix Grammar',
    icon: Wand2,
    model: 'Ollama (Llama 3.3)',
    latency: '14ms',
    rawInput: 'The dictation app have real time sound meters that shows audio levels when user talk into mic.',
    type: 'text',
    formattedOutput: `The dictation application features real-time sound meters that display dynamic audio levels as the user speaks into the microphone.

Grammar & Style Fixes:
✓ "have" ➔ "features" (Subject-verb agreement)
✓ "shows" ➔ "display" (Plural noun agreement: "meters")
✓ "talk into mic" ➔ "speaks into the microphone" (Clarity & tone)`,
  },
];

export const SurfaceLauncher: React.FC = () => {
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [selectedModel, setSelectedModel] = useState<string>(PRESETS[0].model);
  const [promptText, setPromptText] = useState<string>(PRESETS[0].rawInput);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentModelObj = MODELS.find((m) => m.name === selectedModel) || MODELS[0];

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setSelectedModel(preset.model);
    setPromptText(preset.rawInput);
    triggerProcessing();
  };

  const triggerProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 450);
  };

  const handleRunPrompt = () => {
    if (!promptText.trim()) return;
    triggerProcessing();
  };

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activePreset.formattedOutput);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-8 hover:border-white/[0.16] transition-all duration-300 shadow-2xl">
      {/* Mono label */}
      <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 flex items-center justify-between select-none">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SURFACE 03 // GLOBAL LAUNCHER</span>
        </span>
        <span className="bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-zinc-400" />
          ⌘+Shift+P Shortcut
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
        Global AI Prompt Launcher Card
      </h3>

      {/* Description */}
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
        Summon a floating AI prompt bar over any active desktop window with <code className="text-zinc-200 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-xs">⌘+Shift+P</code>. Select model providers, execute quick transformation presets, or stream clean outputs directly into your target app.
      </p>

      {/* Interactive Visual Mockup Box */}
      <div className="bg-[#0a0a0d] border border-white/[0.06] rounded-xl p-5 font-mono text-xs space-y-4 shadow-2xl relative overflow-hidden">
        
        {/* Top bar: Floating Prompt Bar header + Model selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          {/* Header info */}
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <span className="text-white font-medium font-sans block text-xs">VibeVoice Command Bar</span>
              <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ⌘+Shift+P Shortcut Active
              </span>
            </div>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 px-3 py-1.5 rounded-lg text-xs transition-colors font-sans"
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium text-white">{selectedModel}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                {currentModelObj.latency}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#16161a] border border-white/[0.12] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-500 border-b border-white/[0.06]">
                  SELECT INFERENCE ENGINE
                </div>
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model.name);
                      setIsModelDropdownOpen(false);
                      triggerProcessing();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between font-sans transition-colors ${
                      selectedModel === model.name
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <span className="block text-white text-xs">{model.name}</span>
                      <span className="text-[10px] text-zinc-500">{model.provider}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-mono block">{model.latency}</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{model.badge}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preset Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Quick Action Presets</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const IconComp = preset.icon;
              const isActive = activePreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-lg shadow-white/5 border border-white'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>PROMPT INPUT BAR</span>
            <span>PRESS ENTER ↵ TO RUN</span>
          </div>
          <div className="bg-[#111115] border border-white/[0.08] focus-within:border-white/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-inner">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRunPrompt();
                }
              }}
              placeholder="Ask AI to refactor, write, or clean text..."
              className="bg-transparent text-white text-xs font-sans placeholder-zinc-600 focus:outline-none w-full"
            />
            <button
              type="button"
              onClick={handleRunPrompt}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 shrink-0 transition-colors border border-white/10"
            >
              <span>Run</span>
              <CornerDownLeft className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Cleaned Output Preview */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white font-sans font-medium">Cleaned Output Preview</span>
              <span className="text-[10px] text-zinc-500 font-mono">({selectedModel})</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="relative bg-[#050508] border border-white/[0.08] rounded-xl p-4 min-h-[140px] font-mono text-xs overflow-x-auto shadow-inner">
            {isProcessing ? (
              <div className="absolute inset-0 bg-[#050508]/90 backdrop-blur-sm flex items-center justify-center gap-2 text-zinc-400 text-xs font-sans z-10 rounded-xl">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                <span>Running prompt with {selectedModel}...</span>
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                key={activePreset.id + selectedModel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed font-mono">
                  {activePreset.formattedOutput}
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
