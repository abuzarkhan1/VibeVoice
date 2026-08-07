import React, { useEffect } from 'react';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Page Not Found — VibeVoice';
  }, []);

  return (
    <div
      className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
    >
      <a
        href="/"
        className="flex items-center gap-2 mb-16 group"
        aria-label="VibeVoice home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="none"
          className="w-7 h-7 flex-shrink-0"
        >
          <rect width="32" height="32" rx="8" fill="#0f0f13" />
          <rect x="7" y="14" width="2" height="6" rx="1" fill="url(#nf-gw)" />
          <rect x="11" y="10" width="2" height="13" rx="1" fill="url(#nf-gw)" />
          <rect x="15" y="7" width="2" height="18" rx="1" fill="url(#nf-gw)" />
          <rect x="19" y="5" width="2" height="22" rx="1" fill="url(#nf-gw)" />
          <rect x="23" y="9" width="2" height="14" rx="1" fill="url(#nf-gw)" />
          <defs>
            <linearGradient id="nf-gw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-white font-semibold text-lg tracking-tight">
          VibeVoice
        </span>
      </a>

      <div className="text-center max-w-lg">
        <p className="text-[10rem] leading-none font-extrabold text-white/[0.06] select-none tracking-tighter">
          404
        </p>

        <div className="-mt-8 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Page not found
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-[#08080a] font-semibold px-8 py-3 rounded-full text-sm hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3H8v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};
