'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: 'What is VibeVoice?',
    answer:
      'VibeVoice is the cross-platform desktop voice launcher created by Abuzar Khan. Hold a key, speak, and your words appear anywhere instantly.',
  },
  {
    question: 'Which platforms does it support?',
    answer:
      'macOS (Apple Silicon M-Series & Intel), Windows 10/11 (x64), and Linux (AppImage & .deb packages).',
  },
  {
    question: 'Is it private?',
    answer:
      'Yes. All voice processing runs on-device. API keys are encrypted in your OS hardware keychain (macOS SecItem, Windows DPAPI, Linux Secret Service). Zero data leaves your machine.',
  },
  {
    question: 'Which AI models work with it?',
    answer:
      'Bring your own accounts and keys: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and local models via Ollama or Whisper.cpp.',
  },
  {
    question: 'What are the default hotkeys?',
    answer:
      'Hold Fn to dictate anywhere, press ⌘+Shift+P (or Alt+Space) to summon the floating AI prompt bar, or highlight text for instant speech.',
  },
  {
    question: 'Is it free and open source?',
    answer:
      'Yes, VibeVoice is 100% free and open source under the MIT license.',
  },
  {
    question: 'Where do I get help or report issues?',
    answer:
      'Our GitHub repository and issue tracker at https://github.com/abuzarkhan1/VibeVoice.',
  },
];

export const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = faqItems[activeIndex];

  return (
    <section
      id="faq"
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
                text-zinc-500
              "
            >
              FAQ
            </span>

            <span className="h-px w-12 bg-white/[0.1]" />

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
              Frequently asked
            </span>
          </div>

          <h2
            className="
              text-5xl
              sm:text-7xl
              md:text-8xl
              font-extrabold
              tracking-tighter
              leading-[0.92]
              text-white
            "
            style={{
              fontFamily:
                "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            Questions,
            <br />

            <span className="text-zinc-400 font-normal">
              answered.
            </span>
          </h2>

          <p
            className="
              mt-7
              max-w-xl
              text-base
              sm:text-lg
              leading-relaxed
              text-zinc-400
            "
          >
            Everything you need to know about VibeVoice,
            from supported platforms to privacy and
            integrations.
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[0.85fr_1.15fr]
            border-t
            border-white/[0.08]
          "
        >

          <div className="lg:border-r border-white/[0.08]">

            {faqItems.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`
                    group
                    relative
                    w-full
                    text-left
                    py-5
                    sm:py-6
                    pr-6
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

                  <div className="flex items-start gap-5 pl-4 sm:pl-5">

                    <span
                      className={`
                        shrink-0
                        pt-0.5
                        font-mono
                        text-xs
                        font-bold
                        uppercase
                        tracking-widest
                        transition-colors
                        ${
                          isActive
                            ? 'text-zinc-400'
                            : 'text-zinc-500'
                        }
                      `}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className="
                        text-base
                        sm:text-lg
                        font-extrabold
                        leading-snug
                      "
                      style={{
                        fontFamily:
                          "'Space Grotesk', system-ui, sans-serif",
                      }}
                    >
                      {item.question}
                    </span>

                  </div>
                </button>
              );
            })}

          </div>

          <div className="relative min-h-[360px] lg:min-h-[460px]">

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                top-0
                right-0
                w-[350px]
                h-[350px]
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
                justify-between
              "
            >

              <div className="flex items-center justify-between">

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
                  Answer
                </span>

                <span
                  className="
                    text-5xl
                    sm:text-6xl
                    font-extrabold
                    tracking-tighter
                    text-white/[0.05]
                  "
                  style={{
                    fontFamily:
                      "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>

              </div>

              <div className="my-14">

                <h3
                  className="
                    text-2xl
                    sm:text-3xl
                    md:text-4xl
                    font-extrabold
                    tracking-tighter
                    leading-tight
                    text-white
                    max-w-xl
                  "
                  style={{
                    fontFamily:
                      "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  {activeItem.question}
                </h3>

                <p
                  className="
                    mt-6
                    max-w-xl
                    text-base
                    sm:text-lg
                    leading-relaxed
                    text-zinc-400
                  "
                >
                  {activeItem.answer}
                </p>

              </div>

              <div
                className="
                  pt-6
                  border-t
                  border-white/[0.06]
                  flex
                  items-center
                  justify-between
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
                  "
                >
                  VibeVoice / FAQ
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
                  {String(activeIndex + 1).padStart(2, '0')}
                  {' / '}
                  {String(faqItems.length).padStart(2, '0')}
                </span>

              </div>

            </div>

          </div>

        </div>

        <div
          className="
            mt-16
            pt-8
            border-t
            border-white/[0.06]
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-5
          "
        >

          <div>
            <p className="text-sm text-zinc-400">
              Still have a question?
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Check the repository or open an issue.
            </p>
          </div>

          <a
            href="https://github.com/abuzarkhan1/VibeVoice/issues"
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
            <span>
              Open GitHub Issues
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

      </div>
    </section>
  );
};
