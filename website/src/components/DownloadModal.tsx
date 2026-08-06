import React, { useEffect, useState } from 'react';
import { X, Check, Copy, Download } from 'lucide-react';
import { OS_DOWNLOAD_DATA, OSConfig } from './OSDownloadSection';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOS?: 'mac' | 'win' | 'linux';
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  defaultOS = 'mac',
}) => {
  const [selectedOS, setSelectedOS] = useState<'mac' | 'win' | 'linux'>(defaultOS);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  useEffect(() => {
    if (defaultOS) {
      setSelectedOS(defaultOS);
    }
  }, [defaultOS]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeData: OSConfig = OS_DOWNLOAD_DATA[selectedOS];

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Clean dark overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative z-10 bg-[#111113] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full text-white shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white tracking-tight">Download VibeVoice</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OS Switcher Tabs */}
        <div className="flex p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl my-5 gap-1">
          {(['mac', 'win', 'linux'] as const).map((osKey) => {
            const os = OS_DOWNLOAD_DATA[osKey];
            const isActive = selectedOS === osKey;

            return (
              <button
                key={osKey}
                onClick={() => setSelectedOS(osKey)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {os.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content: 2 download options */}
        <div className="space-y-4">
          {activeData.options.map((opt) => (
            <div
              key={opt.filename}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{opt.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                      {opt.format}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">{opt.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* SHA256 copy */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                <span className="truncate max-w-[200px]" title={opt.sha256}>
                  SHA256: {opt.sha256.substring(0, 12)}...
                </span>
                <button
                  onClick={() => handleCopySha(opt.sha256)}
                  className="text-zinc-300 hover:text-white flex items-center gap-1 shrink-0 ml-2 transition-colors"
                >
                  {copiedSha === opt.sha256 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Download Button */}
              <a
                href={opt.downloadUrl}
                className="btn-primary w-full justify-center text-xs py-2 mt-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
