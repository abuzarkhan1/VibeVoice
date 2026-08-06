import React, { useState } from 'react';
import {
  Navbar,
  HeroSection,
  WhatWeBuildSection,
  InsideAppSection,
  OSDownloadSection,
  FAQSection,
  Footer,
  DownloadModal,
} from './components';

interface DownloadModalState {
  isOpen: boolean;
  defaultOS: 'mac' | 'win' | 'linux';
}

export default function App() {
  const [downloadModal, setDownloadModal] = useState<DownloadModalState>({
    isOpen: false,
    defaultOS: 'mac',
  });

  const handleOpenDownloadModal = (os?: 'mac' | 'win' | 'linux') => {
    setDownloadModal({
      isOpen: true,
      defaultOS: os || 'mac',
    });
  };

  const handleCloseDownloadModal = () => {
    setDownloadModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleExplore = () => {
    const el = document.getElementById('what-we-build') || document.getElementById('inside-app');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-[#f0f0f4] flex flex-col font-sans selection:bg-white/15 selection:text-white">
      {/* 1. Navbar */}
      <Navbar onOpenDownloadModal={() => handleOpenDownloadModal()} />

      <main className="flex-1">
        {/* 2. HeroSection */}
        <HeroSection
          onOpenDownloadModal={handleOpenDownloadModal}
          onExplore={handleExplore}
        />

        {/* 3. WhatWeBuildSection (01, 02, 03 lines) */}
        <WhatWeBuildSection />

        {/* 4. InsideAppSection (01, 02, 03, 04 screenshot plates) */}
        <InsideAppSection />

        {/* 5. OSDownloadSection (Download hub) */}
        <OSDownloadSection onOpenModal={handleOpenDownloadModal} />

        {/* 6. FAQSection (Common questions) */}
        <FAQSection />
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* 8. DownloadModal (Overlay) */}
      <DownloadModal
        isOpen={downloadModal.isOpen}
        onClose={handleCloseDownloadModal}
        defaultOS={downloadModal.defaultOS}
      />
    </div>
  );
}
