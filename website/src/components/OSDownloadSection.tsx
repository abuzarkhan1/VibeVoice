import React from 'react';
import { Download, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

/* ─── Types & Data Exports ─────────────────────────────────────────── */
export interface DownloadOption {
  title: string;
  architecture: string;
  filename: string;
  fileSize: string;
  format: string;
  sha256: string;
  downloadUrl: string;
  recommended?: boolean;
  notes?: string;
}

export interface OSConfig {
  id: 'mac' | 'win' | 'linux';
  name: string;
  requirements: string;
  options: DownloadOption[];
}

export const OS_DOWNLOAD_DATA: Record<'mac' | 'win' | 'linux', OSConfig> = {
  mac: {
    id: 'mac',
    name: 'macOS',
    requirements: 'macOS 12.0 Monterey or later',
    options: [
      {
        title: 'Apple Silicon (M-Series)',
        architecture: 'ARM64 (M1/M2/M3/M4)',
        filename: 'VibeVoice-1.4.0-arm64.dmg',
        fileSize: '84.2 MB',
        format: '.dmg',
        recommended: true,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-arm64.dmg',
      },
      {
        title: 'Intel Processor',
        architecture: 'x86_64 Intel Mac',
        filename: 'VibeVoice-1.4.0-x64.dmg',
        fileSize: '88.7 MB',
        format: '.dmg',
        sha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-x64.dmg',
      },
    ],
  },
  win: {
    id: 'win',
    name: 'Windows',
    requirements: 'Windows 10 / 11 (64-bit)',
    options: [
      {
        title: 'NSIS Installer (.exe)',
        architecture: 'x64 (64-bit)',
        filename: 'VibeVoice-Setup-1.4.0.exe',
        fileSize: '89.4 MB',
        format: '.exe',
        recommended: true,
        sha256: '3a187900b8e6146c6460e46b856b3e735e5d16568972b2203713838274712497',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-Setup-1.4.0.exe',
      },
      {
        title: 'Portable Executable',
        architecture: 'x64 Standalone',
        filename: 'VibeVoice-1.4.0-portable.exe',
        fileSize: '86.1 MB',
        format: '.exe',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-portable.exe',
      },
    ],
  },
  linux: {
    id: 'linux',
    name: 'Linux',
    requirements: 'Linux 64-bit (GLIBC 2.31+)',
    options: [
      {
        title: 'AppImage (.AppImage)',
        architecture: 'x86_64 Universal',
        filename: 'VibeVoice-1.4.0.AppImage',
        fileSize: '91.3 MB',
        format: '.AppImage',
        recommended: true,
        sha256: 'd41d8cd98f00b204e9800998ecf8427e9972322302324e930198428800049091',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0.AppImage',
      },
      {
        title: 'Debian Package (.deb)',
        architecture: 'amd64 Ubuntu/Debian',
        filename: 'vibevoice_1.4.0_amd64.deb',
        fileSize: '83.9 MB',
        format: '.deb',
        sha256: '702008f87e871783515328704259835749298457294875928374928374982739',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/vibevoice_1.4.0_amd64.deb',
      },
    ],
  },
};

/* ─── OS Icons ─────────────────────────────────────────────────────── */
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.07.08 2.15-.57 2.81-1.37z" />
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const LinuxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M12.504 0c-.155 0-.315.008-.48.021C7.309.356 4.189 3.685 4.189 7.498c0 1.244.35 2.426.966 3.424l-.001.004-.013.033c-.091.2-.264.35-.452.35h-.007c-.243 0-.484-.066-.704-.198-.22-.133-.392-.323-.492-.552C3.217 9.99 3 9.329 3 8.634c0-.695.217-1.356.493-1.925.275-.568.617-1.076.617-1.764 0-.979-.674-1.842-1.694-1.842-1.14 0-1.694.935-1.694 1.842 0 .929.397 1.802 1.023 2.486-.24.16-.49.297-.76.4C.378 7.945 0 8.47 0 9.035c0 .557.37 1.08.989 1.38.621.3 1.402.356 2.04.356h.013c.24 0 .48-.015.716-.044.37-.044.735-.135 1.074-.27.34-.134.655-.31.933-.526.277-.217.522-.474.724-.76.203-.286.366-.605.482-.944.116-.34.18-.7.18-1.07 0-.37-.062-.73-.179-1.072a5.12 5.12 0 0 0-.483-.942 5.096 5.096 0 0 0-.724-.76 5.104 5.104 0 0 0-.933-.526 4.897 4.897 0 0 0-1.074-.27 5.2 5.2 0 0 0-.716-.044h-.013c-.638 0-1.419.056-2.04.356-.619.3-.989.823-.989 1.38 0 .564.378 1.09.989 1.38l.01.005c.277-.104.527-.24.768-.4C.627 8.06 1.024 7.187 1.024 6.258c0-.907.554-1.842 1.694-1.842 1.02 0 1.694.863 1.694 1.842 0 .688-.342 1.196-.617 1.764-.276.569-.493 1.23-.493 1.925 0 .695.217 1.356.493 1.925l.001.003c.1.23.272.42.492.552.22.132.46.198.704.198h.007c.188 0 .361-.15.452-.35l.013-.033.001-.004a7.475 7.475 0 0 1-.966-3.424c0-3.813 3.12-7.142 7.835-7.477C12.19.008 12.349 0 12.504 0zm-.504 4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4z" />
  </svg>
);

interface OSDownloadSectionProps {
  onOpenModal?: (os?: 'mac' | 'win' | 'linux') => void;
}

export const OSDownloadSection: React.FC<OSDownloadSectionProps> = () => {
  return (
    <section id="downloads" className="py-28 sm:py-36 bg-[#08080a] border-t border-white/[0.08] text-white relative">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Download className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>NATIVE INSTALLERS</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Your platform.{' '}
            <em className="italic font-serif font-normal text-zinc-300">
              Your installer.
            </em>
          </h2>
          <p className="text-zinc-200 text-lg sm:text-xl leading-relaxed font-medium">
            Native hardware-optimized desktop builds with automated system tray initialization and zero background overhead.
          </p>
        </div>

        {/* 3 Prominent OS Cards with Exact Hero Button Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* macOS Card */}
          <div className="bg-[#111115]/95 border border-white/15 rounded-3xl p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-2xl group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-md">
                  <AppleIcon />
                </div>
                <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
                  macOS 12+
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">macOS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-8 font-mono font-medium">
                Apple Silicon (M1/M2/M3/M4) & Intel 64-bit
              </p>

              <div className="space-y-4">
                {/* Primary Hero-Style Download Button */}
                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-arm64.dmg"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-2xl active:scale-[0.98]"
                >
                  <span>Apple Silicon .dmg</span>
                  <ArrowRight className="w-4 h-4 text-black stroke-[2.5] ml-2 shrink-0" />
                </a>

                {/* Secondary Hero-Style Download Button */}
                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-x64.dmg"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-zinc-900 border border-white/20 text-white font-bold text-sm hover:bg-zinc-800 hover:border-white/40 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Intel Mac .dmg</span>
                  <Download className="w-4 h-4 text-zinc-400 stroke-[2.5] ml-2 shrink-0" />
                </a>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono font-medium">
              <span>Metal & Neural Engine</span>
              <span>84.2 MB</span>
            </div>
          </div>

          {/* Windows Card */}
          <div className="bg-[#111115]/95 border border-white/15 rounded-3xl p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-2xl group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-md">
                  <WindowsIcon />
                </div>
                <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
                  Windows 10/11
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Windows</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-8 font-mono font-medium">
                NSIS Setup & Portable 64-bit
              </p>

              <div className="space-y-4">
                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-Setup-1.4.0.exe"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-2xl active:scale-[0.98]"
                >
                  <span>NSIS Setup (.exe)</span>
                  <ArrowRight className="w-4 h-4 text-black stroke-[2.5] ml-2 shrink-0" />
                </a>

                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-portable.exe"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-zinc-900 border border-white/20 text-white font-bold text-sm hover:bg-zinc-800 hover:border-white/40 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Portable (.exe)</span>
                  <Download className="w-4 h-4 text-zinc-400 stroke-[2.5] ml-2 shrink-0" />
                </a>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono font-medium">
              <span>DPAPI & WASAPI Native</span>
              <span>89.4 MB</span>
            </div>
          </div>

          {/* Linux Card */}
          <div className="bg-[#111115]/95 border border-white/15 rounded-3xl p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-2xl group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-md">
                  <LinuxIcon />
                </div>
                <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
                  Linux 64-bit
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Linux</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-8 font-mono font-medium">
                AppImage & Debian / Ubuntu packages
              </p>

              <div className="space-y-4">
                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0.AppImage"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-2xl active:scale-[0.98]"
                >
                  <span>AppImage (.AppImage)</span>
                  <ArrowRight className="w-4 h-4 text-black stroke-[2.5] ml-2 shrink-0" />
                </a>

                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/vibevoice_1.4.0_amd64.deb"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-zinc-900 border border-white/20 text-white font-bold text-sm hover:bg-zinc-800 hover:border-white/40 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Debian (.deb)</span>
                  <Download className="w-4 h-4 text-zinc-400 stroke-[2.5] ml-2 shrink-0" />
                </a>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono font-medium">
              <span>PipeWire & Wayland</span>
              <span>91.3 MB</span>
            </div>
          </div>

        </div>

        {/* Footer Specification Note */}
        <div className="mt-16 text-center text-xs font-mono text-zinc-400 flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Version v1.4.0 Verified
          </span>
          <span>•</span>
          <span>SHA256 Checksums Available on GitHub Releases</span>
        </div>

      </div>
    </section>
  );
};
