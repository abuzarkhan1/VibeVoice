import React, { useState, useEffect } from 'react';
import { ChevronDown, Download, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenDownloadModal: (os?: 'mac' | 'win' | 'linux') => void;
  onExploreSandbox?: () => void;
  onExplore?: () => void;
}

// ─── Radar SVG Geometry & Config ──────────────────────────────────────────────
const CX = 800;
const CY = 420;
const RADIUS = 780;
const CIRCLE_RADII = [150, 250, 360, 480, 620];
const ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

const WIRE_ENDPOINTS = ANGLES.map((angle) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.round(CX + RADIUS * Math.cos(rad)),
    y: Math.round(CY + RADIUS * Math.sin(rad)),
    angle,
  };
});

const RadarSVG: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1600 840"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="di-rig absolute inset-0 w-full h-full pointer-events-none select-none opacity-40"
    >
      <defs>
        <style>{`
          @keyframes radar-scan {
            0% {
              r: 60px;
              opacity: 0.6;
              stroke-width: 2px;
            }
            60% {
              opacity: 0.2;
            }
            100% {
              r: 640px;
              opacity: 0;
              stroke-width: 0.5px;
            }
          }
          @keyframes radar-halo {
            0%, 100% {
              r: 12px;
              opacity: 0.4;
              stroke-width: 1px;
            }
            50% {
              r: 24px;
              opacity: 0.8;
              stroke-width: 2px;
            }
          }
          @keyframes radar-core {
            0%, 100% {
              r: 4px;
              opacity: 0.9;
            }
            50% {
              r: 6px;
              opacity: 1;
            }
          }
          .radar-scan-ring {
            animation: radar-scan 4.5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          }
          .radar-halo-ring {
            animation: radar-halo 3s ease-in-out infinite;
          }
          .radar-core-dot {
            animation: radar-core 2s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Concentric Circles */}
      {CIRCLE_RADII.map((r) => (
        <circle
          key={`circle-${r}`}
          cx={CX}
          cy={CY}
          r={r}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          fill="none"
        />
      ))}

      {/* Scanning Ring */}
      <circle
        className="radar-scan-ring"
        cx={CX}
        cy={CY}
        r={60}
        stroke="rgba(255,255,255,0.35)"
        fill="none"
      />

      {/* Radiating Wire Lines */}
      {WIRE_ENDPOINTS.map((pt, i) => (
        <line
          key={`wire-${i}`}
          x1={CX}
          y1={CY}
          x2={pt.x}
          y2={pt.y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Animated Flow Dots */}
      {WIRE_ENDPOINTS.map((pt, i) => {
        const pathD = `M ${pt.x},${pt.y} L ${CX},${CY}`;
        const dur = 3.6 + (i % 3) * 0.4;
        const delay1 = (i * 0.35) % 2.5;
        const delay2 = delay1 + dur / 2;

        return (
          <g key={`flow-${i}`}>
            <circle r="3" fill="rgba(255,255,255,0.9)">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                path={pathD}
                begin={`${delay1}s`}
              />
            </circle>
            <circle r="2" fill="rgba(255,255,255,0.5)">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                path={pathD}
                begin={`${delay2}s`}
              />
            </circle>
          </g>
        );
      })}

      {/* Glowing Center */}
      <circle
        className="radar-halo-ring"
        cx={CX}
        cy={CY}
        r={14}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
      />
      <circle
        className="radar-core-dot"
        cx={CX}
        cy={CY}
        r={5}
        fill="#ffffff"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,1))' }}
      />
    </svg>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDownloadModal,
  onExploreSandbox,
  onExplore,
}) => {
  const handleExplore = onExplore || onExploreSandbox || (() => {});
  const [detectedOS, setDetectedOS] = useState<string>('macOS');
  const [detectedOSKey, setDetectedOSKey] = useState<'mac' | 'win' | 'linux'>('mac');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('win')) {
        setDetectedOS('Windows');
        setDetectedOSKey('win');
      } else if (ua.includes('linux')) {
        setDetectedOS('Linux');
        setDetectedOSKey('linux');
      } else {
        setDetectedOS('macOS');
        setDetectedOSKey('mac');
      }
    }
  }, []);

  return (
    <section className="min-h-screen relative flex items-center justify-center pt-28 pb-20 bg-[#08080a] overflow-hidden">
      {/* Background SVG Radar */}
      <RadarSVG />

      {/* Center Main Content Stack */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Main H1 Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl drop-shadow-sm">
          Voice that speaks{' '}
          <em className="italic font-serif font-normal text-zinc-300">
            everywhere.
          </em>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-xl sm:text-2xl text-zinc-200 max-w-3xl leading-relaxed font-medium">
          The blazing-fast cross-platform voice launcher for macOS, Windows, and Linux.
        </p>

        {/* Crisp Bold High-Impact Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
          <button
            onClick={() => onOpenDownloadModal(detectedOSKey)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-white text-black font-extrabold text-base hover:bg-zinc-200 transition-all duration-200 shadow-2xl shadow-white/20 active:scale-[0.98] cursor-pointer"
          >
            <span>Download for {detectedOS}</span>
            <ArrowRight className="w-5 h-5 text-black stroke-[2.5]" />
          </button>

          <button
            onClick={() => onOpenDownloadModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-zinc-900/90 border border-white/20 text-white font-bold text-base hover:bg-zinc-800 hover:border-white/40 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg"
          >
            <Download className="w-5 h-5 text-white stroke-[2.5]" />
            <span>Download VibeVoice</span>
          </button>
        </div>

        {/* Subtext Note */}
        <p className="mt-6 text-xs font-mono font-semibold text-zinc-400 tracking-wider uppercase">
          Free Forever · Open Source · 100% On-Device Key Vault
        </p>

        {/* Scroll Hint */}
        <div
          onClick={handleExplore}
          className="mt-16 sm:mt-24 flex flex-col items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 select-none cursor-pointer group"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">scroll</span>
          <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-white animate-bounce stroke-[2.5]" />
        </div>
      </div>
    </section>
  );
};
