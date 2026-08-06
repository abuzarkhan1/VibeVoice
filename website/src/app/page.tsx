'use client';

import React, { useState } from 'react';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  ArchitectureShowcase,
  CreatorSection,
  FAQSection,
  Footer,
  OSDownloadSection,
  DownloadModal,
  InteractiveLauncherSandbox,
} from '@/components';

export default function Home() {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [presetOS, setPresetOS] = useState<'mac' | 'win' | 'linux'>('mac');

  const handleOpenDownloadModal = (osPreset?: 'mac' | 'win' | 'linux') => {
    if (osPreset) {
      setPresetOS(osPreset);
    }
    setDownloadModalOpen(true);
  };

  const handleScrollToSandbox = () => {
    const el = document.getElementById('sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Navigation Bar */}
      <Navbar onOpenDownloadModal={() => handleOpenDownloadModal()} />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onOpenDownloadModal={handleOpenDownloadModal}
          onExploreSandbox={handleScrollToSandbox}
        />

        {/* 4 Interactive Feature Cards */}
        <FeaturesSection />

        {/* Live Interactive Dictation & AI Sandbox */}
        <InteractiveLauncherSandbox />

        {/* Visual Native Abstraction Layer (NAL) Diagram */}
        <ArchitectureShowcase />

        {/* Platform Download Specs & Installers */}
        <OSDownloadSection onOpenModal={handleOpenDownloadModal} />

        {/* Creator Showcase: Abuzar Khan & Vibe Productivity Suite */}
        <CreatorSection />

        {/* Accordion FAQ */}
        <FAQSection />
      </main>

      {/* Main Footer */}
      <Footer />

      {/* Interactive OS Download Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        defaultOS={presetOS}
      />
    </div>
  );
}
