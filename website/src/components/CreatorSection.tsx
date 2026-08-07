'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GithubIcon as Github } from './icons';

export const CreatorSection: React.FC = () => {
  return (
    <section
      id="creator"
      className="
        relative
        overflow-hidden
        bg-[#08080a]
        py-32
        sm:py-40
        border-t
        border-white/[0.06]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          top-[-250px]
          right-[-150px]
          w-[650px]
          h-[650px]
          rounded-full
          bg-white/[0.025]
          blur-[120px]
        "
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center gap-4 mb-16">
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
            Built in the Open
          </span>

          <span className="h-px w-16 bg-white/[0.1]" />

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
            Vibe Productivity Suite
          </span>
        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1.25fr_0.75fr]
            gap-16
            lg:gap-24
            items-end
          "
        >
          <div>
            <p
              className="
                text-sm
                sm:text-base
                text-zinc-400
                mb-5
              "
            >
              An independent project by
            </p>

            <h2
              className="
                text-5xl
                sm:text-7xl
                md:text-8xl
                font-extrabold
                tracking-tighter
                leading-[0.9]
                text-white
              "
              style={{
                fontFamily:
                  "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Abuzar
              <br />

              <span className="text-zinc-400 font-normal">
                Khan.
              </span>
            </h2>

            <p
              className="
                mt-9
                max-w-xl
                text-base
                sm:text-lg
                leading-relaxed
                text-zinc-400
              "
            >
              VibeVoice is built independently with a simple idea:
              desktop software should feel fast, native, and
              effortless.
            </p>
          </div>

          <div className="lg:pb-2">
            <div
              className="
                border-l
                border-white/[0.1]
                pl-6
                sm:pl-8
              "
            >
              <p
                className="
                  font-mono
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-zinc-500
                  mb-5
                "
              >
                The idea
              </p>

              <p
                className="
                  text-xl
                  sm:text-2xl
                  leading-relaxed
                  tracking-tighter
                  text-zinc-300
                "
              >
                Your voice should be available
                <span className="text-white">
                  {' '}everywhere you work.
                </span>
              </p>

              <p
                className="
                  mt-5
                  text-sm
                  leading-relaxed
                  text-zinc-400
                "
              >
                No browser tabs. No unnecessary interfaces.
                Just a native layer between you and your
                computer.
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            mt-24
            sm:mt-32
            py-7
            border-y
            border-white/[0.06]
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-5
          "
        >
          <div className="flex items-center gap-4">
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
              Part of
            </span>

            <span
              className="
                text-lg
                font-extrabold
                tracking-tighter
                text-white
              "
              style={{
                fontFamily:
                  "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Vibe
              <span className="text-zinc-400 font-normal">
                {' '}Productivity
              </span>
            </span>

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
              SUITE
            </span>
          </div>

          <div
            className="
              flex
              items-center
              gap-5
              font-mono
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-zinc-500
            "
          >
            <span>
              VibeVoice
            </span>

            <span className="text-zinc-800">
              /
            </span>

            <span>
              VibeGrid
            </span>

            <span className="text-zinc-800">
              /
            </span>

            <span>
              More to come
            </span>
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
            gap-6
          "
        >
          <p
            className="
              max-w-md
              text-xs
              sm:text-sm
              leading-relaxed
              text-zinc-400
            "
          >
            VibeVoice is open source. Follow the development,
            explore the code, or contribute to the project.
          </p>

          <a
            href="https://github.com/abuzarkhan1/VibeVoice"
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-3
              w-fit
              px-6
              py-3.5
              rounded-full
              bg-white
              text-black
              text-base
              sm:text-lg
              font-extrabold
              hover:bg-zinc-200
              transition-all
              duration-200
              active:scale-[0.98]
              cursor-pointer
              shrink-0
            "
            style={{
              fontFamily:
                "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            <Github
              className="w-4 h-4 stroke-[2.5]"
            />

            <span>
              View on GitHub
            </span>

            <ArrowUpRight
              className="
                w-4
                h-4
                stroke-[2.5]
                transition-transform
                duration-200
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </a>
        </div>

        <div
          className="
            mt-24
            flex
            items-center
            justify-between
            font-mono
            text-xs
            font-bold
            uppercase
            tracking-widest
            text-zinc-500
          "
        >
          <span>
            Independent software
          </span>

          <span>
            macOS · Windows · Linux
          </span>
        </div>
      </div>
    </section>
  );
};
