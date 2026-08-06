'use client';

import React, { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'What we build', href: '#what' },
  { label: 'Inside', href: '#inside' },
  { label: 'Downloads', href: '#downloads' },
  { label: 'FAQ', href: '#faq' },
];

export interface NavbarProps {
  onOpenDownloadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDownloadModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onOpenDownloadModal) {
      e.preventDefault();
      onOpenDownloadModal();
    }
  };

  return (
    <>
      {/* Full-Width Clean Obsidian Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
          scrolled
            ? 'bg-[#08080a]/90 backdrop-blur-xl border-white/10 shadow-2xl py-3.5'
            : 'bg-[#08080a]/60 backdrop-blur-md border-white/[0.06] py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between h-12">
          
          {/* Logo Wordmark — Pure Clean VibeVoice (No Version Tag) */}
          <a
            href="#"
            className="font-extrabold text-white text-xl sm:text-2xl tracking-tight select-none flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span>VibeVoice</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold text-zinc-300 hover:text-white transition-colors duration-150 tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Primary Download CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href="#downloads"
              onClick={handleDownloadClick}
              className="text-sm font-extrabold px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-200 shadow-xl active:scale-95 inline-flex items-center justify-center cursor-pointer select-none"
            >
              Download
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-200 origin-center ${
                menuOpen ? 'rotate-45 translate-y-[8px]' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-200 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-200 origin-center ${
                menuOpen ? '-rotate-45 -translate-y-[8px]' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#08080a]/95 backdrop-blur-3xl flex flex-col justify-center items-center gap-8 md:hidden px-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-2xl font-bold text-white hover:text-zinc-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#downloads"
            className="text-base font-extrabold px-8 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all mt-4 w-full text-center shadow-2xl"
            onClick={(e) => {
              setMenuOpen(false);
              handleDownloadClick(e);
            }}
          >
            Download VibeVoice
          </a>
        </div>
      )}
    </>
  );
};
