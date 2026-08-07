'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const [selectedOS, setSelectedOS] = useState<'mac' | 'win' | 'linux'>(
    defaultOS
  );

  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (defaultOS) {
      setSelectedOS(defaultOS);
    }
  }, [defaultOS]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusables =
            modalRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

          if (focusables.length > 0) {
            focusables[0].focus();
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    }

    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;

        const focusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
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

  if (!isOpen) {
    return null;
  }

  const activeData: OSConfig = OS_DOWNLOAD_DATA[selectedOS];

  const handleCopySha = async (sha: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(sha);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');

        textArea.value = sha;
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

    setCopiedSha(sha);

    setTimeout(() => {
      setCopiedSha(null);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        className="relative z-10 bg-[#0d0d10] border border-white/[0.1] rounded-3xl p-7 max-w-md w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl animate-in zoom-in-95 fade-in duration-200"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #ffffff 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <h3
              id="download-modal-title"
              className="font-space text-xl font-extrabold text-white tracking-tight whitespace-nowrap"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Download VibeVoice
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex p-1 bg-white/[0.04] border border-white/[0.08] rounded-full my-6 gap-1">
            {(['mac', 'win', 'linux'] as const).map((osKey) => {
              const os = OS_DOWNLOAD_DATA[osKey];
              const isActive = selectedOS === osKey;

              return (
                <button
                  type="button"
                  key={osKey}
                  onClick={() => setSelectedOS(osKey)}
                  aria-selected={isActive}
                  className={`flex-1 py-2 px-3 rounded-full font-space text-xs font-extrabold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  {os.name}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {activeData.options.map((opt) => (
              <div
                key={opt.filename}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4
                      className="font-space text-sm font-extrabold text-white tracking-tight whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      {opt.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-500">
                        {opt.format}
                      </span>

                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
                        {opt.fileSize}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                  <span
                    className="truncate max-w-[200px]"
                    title={opt.sha256}
                  >
                    SHA256: {opt.sha256.substring(0, 12)}...
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopySha(opt.sha256)}
                    className="text-zinc-500 hover:text-white flex items-center gap-1.5 shrink-0 ml-2 transition-colors cursor-pointer"
                  >
                    {copiedSha === opt.sha256 ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                          Copied
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">
                          Copy
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <a
                  href={opt.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-space font-extrabold tracking-tight whitespace-nowrap text-xs hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/10 active:scale-[0.98] cursor-pointer"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  <Download className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
