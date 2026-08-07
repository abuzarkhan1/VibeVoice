import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  Fingerprint,
  Cpu,
  Eye,
  EyeOff,
  ServerOff,
  CheckCircle2,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OSEnclaveOption {
  id: 'macos' | 'windows' | 'linux';
  name: string;
  shortName: string;
  badge: string;
  driver: string;
  hardware: string;
  crypto: string;
  handle: string;
}

const OS_ENCLAVES: OSEnclaveOption[] = [
  {
    id: 'macos',
    name: 'macOS SecItem',
    shortName: 'macOS SecItem',
    badge: 'Apple Secure Enclave',
    driver: 'Keychain.framework / kSecClassGenericPassword',
    hardware: 'Apple SEP (M1–M4 / T2)',
    crypto: 'AES-256-GCM Hardware Encrypted',
    handle: '0x7F8B90A2E3_SEP',
  },
  {
    id: 'windows',
    name: 'Windows DPAPI',
    shortName: 'Windows DPAPI',
    badge: 'Windows CryptProtectData',
    driver: 'Cryptographic Service Provider (NCrypt)',
    hardware: 'TPM 2.0 Silicon Vault',
    crypto: 'AES-256-GCM Sealed Key',
    handle: '0x3C4D5E6F70_TPM',
  },
  {
    id: 'linux',
    name: 'Linux Secret Service',
    shortName: 'Linux Secret Service',
    badge: 'freedesktop SecretService',
    driver: 'libsecret / KWallet / LUKS Keyring',
    hardware: 'Kernel Keyring (CONFIG_KEYS)',
    crypto: 'AES-256 Hardware Bound',
    handle: '0x1A2B3C4D5E_LUKS',
  },
];

export interface SecretItem {
  id: string;
  label: string;
  value: string;
  masked: string;
  handle: string;
}

const DEFAULT_SECRETS: SecretItem[] = [
  {
    id: 'openai',
    label: 'OPENAI_API_KEY',
    value: 'sk-proj-99824f8a2c1b7e40d9f2d8471c5a',
    masked: '••••••••••••••••••••••••',
    handle: '0xKEY_HANDLE_01',
  },
  {
    id: 'anthropic',
    label: 'ANTHROPIC_API_KEY',
    value: 'sk-ant-api03-91c84f27e0a15b3901b899a1',
    masked: '••••••••••••••••••••••••',
    handle: '0xKEY_HANDLE_02',
  },
  {
    id: 'elevenlabs',
    label: 'ELEVENLABS_API_KEY',
    value: 'xi-api-key-491a87c320d91e84f50a29b3',
    masked: '••••••••••••••••••••••••',
    handle: '0xKEY_HANDLE_03',
  },
];

export const SurfaceSecurity: React.FC = () => {
  const [selectedOS, setSelectedOS] = useState<OSEnclaveOption>(OS_ENCLAVES[0]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleToggleLock = () => {
    if (!isUnlocked) {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        setIsUnlocked(true);
      }, 450);
    } else {
      setIsUnlocked(false);
      setRevealedKeys({});
    }
  };

  const handleToggleReveal = (id: string) => {
    if (!isUnlocked) {
      handleToggleLock();
      return;
    }
    setRevealedKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = async (id: string, text: string) => {
    if (!isUnlocked) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
      }
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-8 hover:border-white/[0.16] transition-all shadow-xl relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />

      <div className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-between">
        <span>SURFACE // 04</span>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
          {isUnlocked ? 'ENCLAVE UNLOCKED' : 'ENCLAVE SEALED'}
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-space font-extrabold tracking-tight text-white mb-2">
        Hardware Keychain <span className="italic font-serif font-normal text-zinc-400">Enclave Vault Card</span>
      </h3>

      <p className="text-sm font-bold text-zinc-300 leading-relaxed mb-6">
        Your API keys and credentials are encrypted directly into Apple Secure Enclave, Windows DPAPI, or Linux Secret Service. Zero data stored in the cloud.
      </p>

      <div className="bg-[#0a0a0d] border border-white/[0.06] rounded-xl p-5 font-mono text-xs flex flex-col gap-4 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-space font-extrabold tracking-tight text-white text-xs sm:text-sm">
              OS Secure Enclave Switcher
            </span>
          </div>

          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] p-1 rounded-lg gap-1 overflow-x-auto">
            {OS_ENCLAVES.map((os) => {
              const isSelected = selectedOS.id === os.id;
              return (
                <button
                  key={os.id}
                  type="button"
                  onClick={() => setSelectedOS(os)}
                  className={`px-2.5 py-1.5 rounded-md font-space font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 relative ${
                    isSelected
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{os.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-300 font-mono text-xs font-bold uppercase tracking-widest">{selectedOS.hardware}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono text-xs font-bold uppercase tracking-widest hidden md:inline">{selectedOS.driver}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              {selectedOS.badge}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/40 border border-white/[0.06] p-3 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md transition-colors ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-space font-extrabold tracking-tight text-white text-xs">
                  {selectedOS.name} Vault State
                </span>
                <span className={`font-mono text-xs font-bold uppercase tracking-widest px-1.5 py-0.2 rounded ${isUnlocked ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 bg-white/5'}`}>
                  {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <span className="text-zinc-400 font-mono text-xs font-bold uppercase tracking-widest block">
                Enclave Handle: {selectedOS.handle}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleLock}
            disabled={isAuthenticating}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-space font-extrabold tracking-tight text-xs transition-all cursor-pointer shadow-sm active:scale-95 ${
              isUnlocked
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                : 'bg-white hover:bg-zinc-200 text-black'
            }`}
          >
            {isAuthenticating ? (
              <Fingerprint className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            ) : isUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-black" />
            )}
            <span>
              {isAuthenticating
                ? 'Authenticating...'
                : isUnlocked
                ? 'Lock Enclave'
                : 'Unlock Enclave'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {DEFAULT_SECRETS.map((secret) => {
            const isRevealed = isUnlocked && revealedKeys[secret.id];
            const isCopied = copiedId === secret.id;

            return (
              <div
                key={secret.id}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    : 'bg-white/[0.015] border-white/[0.04]'
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-300 font-mono text-xs font-bold uppercase tracking-widest">
                      {secret.label}
                    </span>
                    <span className="text-zinc-400 font-mono text-xs font-bold uppercase tracking-widest bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/[0.06]">
                      {secret.handle}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold tracking-wider text-zinc-100 truncate flex items-center gap-2">
                    <span className={isUnlocked && isRevealed ? 'text-emerald-300 font-bold' : 'text-zinc-300 font-bold'}>
                      {isRevealed ? secret.value : secret.masked}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(secret.id)}
                    className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={isRevealed ? 'Hide secret' : 'Reveal secret (Requires Enclave Unlock)'}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(secret.id, secret.value)}
                    disabled={!isUnlocked}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      !isUnlocked
                        ? 'opacity-30 cursor-not-allowed text-zinc-600 bg-white/[0.02]'
                        : isCopied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                    title={isUnlocked ? 'Copy unencrypted secret' : 'Unlock Enclave to Copy'}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>AES-256 GCM Hardware Sealed</span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-widest">
              <ServerOff className="w-3.5 h-3.5 shrink-0" />
              <span>Zero Cloud Storage</span>
            </div>
          </div>

          <div className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1 self-end sm:self-auto">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Hardware Isolation Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurfaceSecurity;
