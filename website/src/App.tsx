import React, { useState, useEffect } from 'react';
import { ChevronUp, X } from 'lucide-react';
import {
  Navbar,
  HeroSection,
  StatsBar,
  WhatWeBuildSection,
  FeaturesSection,
  InsideAppSection,
  ArchitectureShowcase,
  OSDownloadSection,
  PricingSection,
  ChangelogSection,
  CreatorSection,
  FAQSection,
  Footer,
  DownloadModal,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
} from './components';

interface DownloadModalState {
  isOpen: boolean;
  defaultOS: 'mac' | 'win' | 'linux';
}

const BANNER_KEY = 'vv-banner-dismissed';

export default function App() {
  const [downloadModal, setDownloadModal] = useState<DownloadModalState>({
    isOpen: false,
    defaultOS: 'mac',
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(() => {
    try {
      return localStorage.getItem(BANNER_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const pathname = window.location.pathname;
  const knownPaths = ['/', '/changelog', '/privacy', '/terms'];
  const is404 = !knownPaths.includes(pathname);

  if (pathname === '/changelog') {
    return <ChangelogSection standalone />
  }

  if (pathname === '/privacy') {
    return <PrivacyPage />;
  }

  if (pathname === '/terms') {
    return <TermsPage />;
  }

  const handleOpenDownloadModal = (os?: 'mac' | 'win' | 'linux') => {
    setDownloadModal({
      isOpen: true,
      defaultOS: os || 'mac',
    });
  };

  const handleCloseDownloadModal = () => {
    setDownloadModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDismissBanner = () => {
    setBannerVisible(false);
    try {
      localStorage.setItem(BANNER_KEY, 'true');
    } catch {}
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0);
      setShowBackToTop(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')
      ) {
        e.preventDefault();
        handleOpenDownloadModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExplore = () => {
    const el = document.getElementById('what') || document.getElementById('inside');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (is404) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-[#f0f0f4] flex flex-col font-sans selection:bg-white/15 selection:text-white">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div
        className="fixed top-0 left-0 z-[60] h-[2px] bg-white transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {bannerVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[70] bg-white text-black text-xs font-extrabold py-2 px-4 flex items-center justify-center gap-4"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", minHeight: '36px' }}
        >
          <span>
            🎉 VibeVoice v1.4.0 is out — now with Linux .deb support!
          </span>
          <a
            href="#downloads"
            onClick={() => handleOpenDownloadModal('linux')}
            className="underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer"
          >
            Download
          </a>
          <button
            onClick={handleDismissBanner}
            aria-label="Dismiss banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <Navbar onOpenDownloadModal={() => handleOpenDownloadModal()} />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <HeroSection
          onOpenDownloadModal={handleOpenDownloadModal}
          onExplore={handleExplore}
        />

        <StatsBar />

        <WhatWeBuildSection />

        <FeaturesSection />

        <InsideAppSection />

        <ArchitectureShowcase />

        <OSDownloadSection onOpenModal={handleOpenDownloadModal} />

        <PricingSection onOpenModal={handleOpenDownloadModal} />

        <CreatorSection />

        <FAQSection />
      </main>

      <Footer />

      <DownloadModal
        isOpen={downloadModal.isOpen}
        onClose={handleCloseDownloadModal}
        defaultOS={downloadModal.defaultOS}
      />

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full bg-white text-black shadow-xl hover:bg-zinc-200 transition-all duration-200 flex items-center justify-center"
        >
          <ChevronUp size={20} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
