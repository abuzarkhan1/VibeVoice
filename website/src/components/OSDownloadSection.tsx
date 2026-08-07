'use client';

import React, { useState } from 'react';
import {
  Download,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Laptop,
} from 'lucide-react';

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

export const OS_DOWNLOAD_DATA: Record<
  'mac' | 'win' | 'linux',
  OSConfig
> = {
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
        sha256:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-arm64.dmg',
      },
      {
        title: 'Intel Processor',
        architecture: 'x86_64 Intel Mac',
        filename: 'VibeVoice-1.4.0-x64.dmg',
        fileSize: '88.7 MB',
        format: '.dmg',
        sha256:
          'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
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
        sha256:
          '3a187900b8e6146c6460e46b856b3e735e5d16568972b2203713838274712497',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-Setup-1.4.0.exe',
      },
    ],
  },

  linux: {
    id: 'linux',
    name: 'Linux',
    requirements: 'Linux 64-bit (Debian / Ubuntu)',
    options: [
      {
        title: 'Debian / Ubuntu Package (.deb)',
        architecture: 'x86_64 Debian/Ubuntu',
        filename: 'VibeVoice-1.4.0-amd64.deb',
        fileSize: '78.5 MB',
        format: '.deb',
        recommended: true,
        sha256:
          'c72e81b6748981290d23812838974a9190283401238918239081293812903812',
        downloadUrl:
          'https://github.com/abuzarkhan1/VibeVoice/releases/download/v1.4.0/VibeVoice-1.4.0-amd64.deb',
      },
    ],
  },
};

const AppleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-7 h-7"
    aria-hidden="true"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.07.08 2.15-.57 2.81-1.37z" />
  </svg>
);

const WindowsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-7 h-7"
    aria-hidden="true"
  >
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const LinuxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-7 h-7"
    aria-hidden="true"
  >
    <path d="M12.504 0c-.155 0-.315.008-.48.021C7.309.356 4.189 3.685 4.189 7.498c0 1.244.35 2.426.966 3.424l-.001.004-.013.033c-.091.2-.264.35-.452.35h-.007c-.243 0-.484-.066-.704-.198-.22-.133-.392-.323-.492-.552C3.217 9.99 3 9.329 3 8.634c0-.695.217-1.356.493-1.925.275-.568.617-1.076.617-1.764 0-.979-.674-1.842-1.694-1.842-1.14 0-1.694.935-1.694 1.842 0 .929.397 1.802 1.023 2.486-.24.16-.49.297-.76.4C.378 7.945 0 8.47 0 9.035c0 .557.37 1.08.989 1.38.621.3 1.402.356 2.04.356h.013c.24 0 .48-.015.716-.044.37-.044.735-.135 1.074-.27.34-.134.655-.31.933-.526.277-.217.522-.474.724-.76.203-.286.366-.605.482-.944.116-.34.18-.7.18-1.07 0-.37-.062-.73-.179-1.072a5.12 5.12 0 0 0-.483-.942 5.096 5.096 0 0 0-.724-.76 5.096 5.096 0 0 0-.933-.526 4.897 4.897 0 0 0-1.074-.27 5.2 5.2 0 0 0-.716-.044h-.013c-.638 0-1.419.056-2.04.356-.619.3-.989.823-.989 1.38 0 .564.378 1.09.989 1.38l.01.005c.277-.104.527-.24.768-.4C.627 8.06 1.024 7.187 1.024 6.258c0-.907.554-1.842 1.694-1.842 1.02 0 1.694.863 1.694 1.842 0 .688-.342 1.196-.617 1.764-.276.569-.493 1.23-.493 1.925 0 .695.217 1.356.493 1.925l.001.003c.1.23.272.42.492.552.22.132.46.198.704.198h.007c.188 0 .361-.15.452-.35l.013-.033.001-.004a7.475 7.475 0 0 1-.966-3.424c0-3.813 3.12-7.142 7.835-7.477C12.19.008 12.349 0 12.504 0zm-.504 4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4z" />
  </svg>
);

interface OSDownloadSectionProps {
  onOpenModal?: (os?: 'mac' | 'win' | 'linux') => void;
}

const OS_ICONS = {
  mac: AppleIcon,
  win: WindowsIcon,
  linux: LinuxIcon,
};

export const OSDownloadSection: React.FC<OSDownloadSectionProps> = ({
  onOpenModal,
}) => {
  const [selectedOS, setSelectedOS] =
    useState<'mac' | 'win' | 'linux'>('mac');

  const activeOS = OS_DOWNLOAD_DATA[selectedOS];
  const ActiveIcon = OS_ICONS[selectedOS];

  return (
    <section
      id="downloads"
      className="
        relative
        overflow-hidden
        bg-[#08080a]
        py-32
        sm:py-40
        border-t
        border-white/[0.06]
        text-white
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          top-[-200px]
          left-1/2
          -translate-x-1/2
          w-[700px]
          h-[500px]
          rounded-full
          bg-white/[0.02]
          blur-[120px]
        "
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">

        <div className="max-w-3xl mb-20 sm:mb-24">

          <div className="flex items-center gap-4 mb-6">
            <span
              className="
                font-mono
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-zinc-400
              "
            >
              Downloads
            </span>

            <span className="h-px w-12 bg-white/[0.1]" />

            <span
              className="
                font-mono
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-zinc-400
              "
            >
              Native installers
            </span>
          </div>

          <h2
            className="
              text-4xl
              sm:text-6xl
              font-extrabold
              tracking-tight
              leading-[1.08]
              text-white
            "
          >
            Your platform,
            <br />

            <span className="text-zinc-400 font-normal">
              your build.
            </span>
          </h2>

          <p
            className="
              mt-7
              max-w-2xl
              text-base
              sm:text-lg
              leading-relaxed
              text-zinc-500
            "
          >
            Native hardware-optimized desktop builds for macOS,
            Windows, and Linux. Choose your platform and download
            the appropriate installer.
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[0.72fr_1.28fr]
            border-t
            border-white/[0.08]
          "
        >

          <div className="lg:border-r border-white/[0.08]">

            {(
              Object.keys(OS_DOWNLOAD_DATA) as Array<
                'mac' | 'win' | 'linux'
              >
            ).map((osKey) => {
              const os = OS_DOWNLOAD_DATA[osKey];
              const Icon = OS_ICONS[osKey];
              const isActive = selectedOS === osKey;

              return (
                <button
                  key={osKey}
                  type="button"
                  onClick={() => setSelectedOS(osKey)}
                  className={`
                    group
                    relative
                    w-full
                    text-left
                    py-7
                    sm:py-8
                    border-b
                    border-white/[0.06]
                    transition-all
                    duration-200
                    cursor-pointer
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-600 hover:text-zinc-300'
                    }
                  `}
                >

                  <span
                    className={`
                      absolute
                      left-0
                      top-0
                      bottom-0
                      w-[2px]
                      transition-all
                      duration-300
                      ${
                        isActive
                          ? 'bg-white'
                          : 'bg-transparent'
                      }
                    `}
                  />

                  <div className="flex items-center gap-5 pl-5 sm:pl-6 pr-5">

                    <div
                      className={`
                        w-11
                        h-11
                        shrink-0
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        border
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? 'bg-white/[0.08] border-white/[0.14] text-white'
                            : 'bg-white/[0.02] border-white/[0.05] text-zinc-700'
                        }
                      `}
                    >
                      <Icon />
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        <span
                          className="
                            font-space
                            text-base
                            sm:text-lg
                            font-extrabold
                            tracking-tight
                          "
                          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                        >
                          {os.name}
                        </span>

                        <span
                          className="
                            hidden
                            sm:inline-flex
                            font-mono
                            text-xs
                            font-bold
                            uppercase
                            tracking-widest
                            text-zinc-500
                          "
                        >
                          {osKey === 'mac'
                            ? '01'
                            : osKey === 'win'
                            ? '02'
                            : '03'}
                        </span>

                      </div>

                      <p
                        className="
                          mt-1
                          font-mono
                          text-xs
                          font-bold
                          uppercase
                          tracking-widest
                          text-zinc-500
                        "
                      >
                        {os.requirements}
                      </p>

                    </div>

                  </div>
                </button>
              );
            })}

          </div>

          <div className="relative min-h-[500px]">

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                top-0
                right-0
                w-[400px]
                h-[400px]
                rounded-full
                bg-white/[0.018]
                blur-[100px]
              "
            />

            <div
              className="
                relative
                h-full
                p-8
                sm:p-12
                lg:p-16
                flex
                flex-col
              "
            >

              <div className="flex items-start justify-between gap-6">

                <div>

                  <div className="flex items-center gap-3 mb-5">

                    <ActiveIcon />

                    <span
                      className="
                        font-mono
                        text-xs
                        font-bold
                        uppercase
                        tracking-widest
                        text-zinc-500
                      "
                    >
                      Selected platform
                    </span>

                  </div>

                  <h3
                    className="
                      font-space
                      text-3xl
                      sm:text-4xl
                      md:text-5xl
                      font-extrabold
                      tracking-tight
                      whitespace-nowrap
                      text-white
                    "
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {activeOS.name}
                  </h3>

                  <p
                    className="
                      mt-3
                      font-mono
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      text-zinc-500
                    "
                  >
                    {activeOS.requirements}
                  </p>

                </div>

                <span
                  className="
                    font-space
                    text-5xl
                    sm:text-6xl
                    font-extrabold
                    tracking-tight
                    text-white/[0.04]
                  "
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  {selectedOS === 'mac'
                    ? '01'
                    : selectedOS === 'win'
                    ? '02'
                    : '03'}
                </span>

              </div>

              <div className="mt-12 space-y-3">

                {activeOS.options.map((option, index) => (
                  <div
                    key={option.filename}
                    className="
                      group
                      relative
                      border
                      border-white/[0.08]
                      bg-white/[0.015]
                      hover:bg-white/[0.035]
                      hover:border-white/[0.15]
                      transition-all
                      duration-200
                      rounded-2xl
                      p-5
                      sm:p-6
                    "
                  >



                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-5
                      "
                    >

                      <div className="min-w-0">

                        <div className="flex items-center gap-3">

                          {selectedOS === 'mac' ? (
                            index === 0 ? (
                              <Cpu className="w-4 h-4 text-zinc-300 shrink-0" />
                            ) : (
                              <Laptop className="w-4 h-4 text-zinc-500 shrink-0" />
                            )
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                          )}

                          <h4
                            className="
                              font-space
                              text-sm
                              sm:text-base
                              font-extrabold
                              tracking-tight
                              whitespace-nowrap
                              text-white
                            "
                            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                          >
                            {option.title}
                          </h4>

                        </div>

                        <div
                          className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-x-3
                            gap-y-1
                            font-mono
                            text-xs
                            font-bold
                            uppercase
                            tracking-widest
                            text-zinc-500
                          "
                        >
                          <span>
                            {option.architecture}
                          </span>

                          <span className="text-zinc-500">
                            /
                          </span>

                          <span>
                            {option.format}
                          </span>

                          <span className="text-zinc-500">
                            /
                          </span>

                          <span>
                            {option.fileSize}
                          </span>
                        </div>

                      </div>

                      <a
                        href={option.downloadUrl}
                        onClick={(e) => {
                          if (onOpenModal) {
                            e.preventDefault();
                            onOpenModal(selectedOS);
                          }
                        }}
                        style={{
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                          letterSpacing: '-0.01em',
                        }}
                        className="
                          shrink-0
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-6
                          py-3.5
                          rounded-full
                          bg-white
                          text-black
                          text-sm
                          font-extrabold
                          tracking-tight
                          whitespace-nowrap
                          hover:bg-zinc-200
                          transition-all
                          duration-200
                          active:scale-[0.98]
                          cursor-pointer
                          shadow-lg
                        "
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', system-ui, sans-serif",
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Download {option.format}
                        </span>
                      </a>

                    </div>

                    <div
                      className="
                        mt-5
                        pt-4
                        border-t
                        border-white/[0.05]
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-2
                      "
                    >
                      <span
                        className="
                          font-mono
                          text-xs
                          font-bold
                          uppercase
                          tracking-widest
                          text-zinc-500
                          truncate
                        "
                        title={option.filename}
                      >
                        {option.filename}
                      </span>

                      <span
                        className="
                          font-mono
                          text-xs
                          font-bold
                          uppercase
                          tracking-widest
                          text-zinc-500
                          shrink-0
                        "
                      >
                        SHA256 VERIFIED
                      </span>
                    </div>

                  </div>
                ))}

              </div>

              <div
                className="
                  mt-auto
                  pt-8
                  border-t
                  border-white/[0.06]
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    className="
                      w-3.5
                      h-3.5
                      text-zinc-500
                      stroke-[2]
                    "
                  />

                  <span
                    className="
                      font-mono
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      text-zinc-500
                    "
                  >
                    Version 1.4.0 verified
                  </span>

                </div>

                <a
                  href="https://github.com/abuzarkhan1/VibeVoice/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    font-mono
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    text-zinc-500
                    hover:text-white
                    transition-colors
                  "
                >
                  <span>
                    Release details
                  </span>

                  <ArrowUpRight
                    className="
                      w-3.5
                      h-3.5
                      stroke-[2.5]
                      transition-transform
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </a>

              </div>

            </div>
          </div>
        </div>

        <div
          className="
            mt-10
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            font-mono
            text-xs
            font-bold
            uppercase
            tracking-widest
            text-zinc-500
          "
        >
          <span>
            Native installers / Hardware optimized
          </span>

          <span>
            SHA256 checksums available
          </span>
        </div>

      </div>
    </section>
  );
};
