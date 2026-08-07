import React from 'react';

interface BuildItem {
  num: string;
  titlePrefix: string;
  titleAccent: string;
  desc: string;
}

const BUILD_ITEMS: BuildItem[] = [
  {
    num: '01',
    titlePrefix: 'Sub-100ms ',
    titleAccent: 'Voice Dictation',
    desc: 'Hold Fn. Speak. Text appears in any active application instantly via hardware-level OS hooks.',
  },
  {
    num: '02',
    titlePrefix: 'Synchronized ',
    titleAccent: 'Text-To-Speech',
    desc: 'Highlight text anywhere. Hear it read back with real-time word-by-word visual karaoke highlighting.',
  },
  {
    num: '03',
    titlePrefix: 'Global AI ',
    titleAccent: 'Prompt Launcher',
    desc: '⌘+Shift+P anywhere. Summon Claude, GPT-4o, and Llama directly in your active application.',
  },
];

export const WhatWeBuildSection: React.FC = () => {
  return (
    <section
      id="features"
      className="
        relative
        overflow-hidden
        bg-[#08080a]
        py-28
        sm:py-36
        border-t
        border-white/[0.06]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[700px]
          h-[500px]
          rounded-full
          bg-white/[0.025]
          blur-[120px]
        "
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">

        <div className="max-w-3xl mb-20 sm:mb-28">
          <p
            className="
              text-xs
              font-mono
              font-bold
              uppercase
              tracking-widest
              text-zinc-400
              mb-6
            "
          >
            What We Build
          </p>

          <h2
            className="
              text-4xl
              sm:text-6xl
              font-extrabold
              text-white
              tracking-tight
              leading-[1.08]
            "
          >
            Everything you need
            <br />

            <span className="text-zinc-400 font-normal">
              within a single keystroke.
            </span>
          </h2>

          <p
            className="
              mt-7
              max-w-2xl
              text-base
              sm:text-lg
              leading-relaxed
              text-zinc-400
              font-normal
            "
          >
            VibeVoice puts voice, playback, and AI interaction
            directly at the center of your desktop workflow.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="
              absolute
              left-[23px]
              sm:left-[31px]
              top-8
              bottom-8
              w-px
              bg-gradient-to-b
              from-white/20
              via-white/[0.08]
              to-transparent
            "
          />

          <div className="space-y-16 sm:space-y-24">
            {BUILD_ITEMS.map((item, index) => (
              <article
                key={item.num}
                className="group relative grid grid-cols-[48px_1fr] sm:grid-cols-[64px_1fr] gap-6 sm:gap-10"
              >
                <div className="relative z-10">
                  <div
                    className="
                      w-12
                      h-12
                      sm:w-16
                      sm:h-16
                      rounded-full
                      bg-[#08080a]
                      border
                      border-white/[0.12]
                      group-hover:border-white/30
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-300
                    "
                  >
                    <span
                      className="
                        text-xs
                        sm:text-sm
                        font-extrabold
                        text-zinc-500
                        group-hover:text-white
                        transition-colors
                      "
                      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                      {item.num}
                    </span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      inset-0
                      rounded-full
                      bg-white/[0.04]
                      blur-xl
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                      duration-300
                      -z-10
                    "
                  />
                </div>

                <div className="pt-1 sm:pt-2 max-w-3xl">
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      mb-4
                    "
                  >
                    <span
                      className="
                        h-px
                        w-6
                        bg-white/20
                        group-hover:w-10
                        group-hover:bg-white/50
                        transition-all
                        duration-300
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
                        group-hover:text-zinc-400
                        transition-colors
                      "
                    >
                      Capability
                    </span>
                  </div>

                  <h3
                    className="
                      text-2xl
                      sm:text-4xl
                      md:text-5xl
                      font-extrabold
                      tracking-tight
                      leading-[1.05]
                      text-white
                    "
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {item.titlePrefix}

                    <span className="text-zinc-400 font-normal">
                      {item.titleAccent}
                    </span>
                  </h3>

                  <p
                    className="
                      mt-5
                      text-sm
                      sm:text-base
                      md:text-lg
                      leading-relaxed
                      text-zinc-400
                      font-normal
                      max-w-2xl
                    "
                  >
                    {item.desc}
                  </p>

                  <div className="mt-7 flex items-center gap-3">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        font-mono
                        text-xs
                        font-bold
                        uppercase
                        tracking-widest
                        text-zinc-500
                      "
                    >
                      <span
                        className="
                          w-1.5
                          h-1.5
                          rounded-full
                          bg-zinc-500
                          group-hover:bg-white
                          group-hover:shadow-[0_0_8px_rgba(255,255,255,0.7)]
                          transition-all
                        "
                      />

                      Native
                    </span>

                    <span className="text-zinc-700 font-mono text-xs">
                      /
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
                      {index === 0
                        ? 'Instant'
                        : index === 1
                        ? 'Synchronized'
                        : 'Global'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div
          className="
            mt-24
            sm:mt-32
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
          <p
            className="
              font-mono
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-zinc-500
            "
          >
            One system. Three ways to speak.
          </p>

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
            Built for the desktop
          </span>
        </div>

      </div>
    </section>
  );
};
