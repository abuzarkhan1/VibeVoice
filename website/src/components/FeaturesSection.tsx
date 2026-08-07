'use client';

import React, { useEffect, useRef } from 'react';

interface FeatureItem {
  num: string;
  titlePrefix: string;
  titleAccent: string;
  desc: string;
  tag: string;
}

const features: FeatureItem[] = [
  {
    num: '04',
    titlePrefix: 'Hardware Keychain ',
    titleAccent: 'Security',
    desc: 'API keys encrypted in your OS hardware vault — macOS SecItem, Windows DPAPI, Linux Secret Service. Zero cloud storage.',
    tag: 'Secure',
  },
  {
    num: '05',
    titlePrefix: 'Cross-Platform ',
    titleAccent: 'Native Engine',
    desc: 'One codebase, three native runtimes. Swift on macOS, C# on Windows, C shared object on Linux — no Electron overhead.',
    tag: 'Native',
  },
];

export const FeaturesSection: React.FC = () => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-feature]');
    if (!items) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(32px)';
      item.style.transition = `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`;
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features-extended"
      className="
        relative
        overflow-hidden
        bg-[#08080a]
        pb-28
        sm:pb-36
        border-b
        border-white/[0.06]
      "
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        <div className="relative" ref={listRef}>
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
              from-white/[0.08]
              via-white/[0.04]
              to-transparent
            "
          />

          <div className="space-y-16 sm:space-y-24">
            {features.map((item) => (
              <article
                key={item.num}
                data-feature
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
                  <div className="flex items-center gap-3 mb-4">
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
                      {item.tag}
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

                    <span className="text-zinc-700 font-mono text-xs">/</span>

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
                      {item.num === '04' ? 'Hardware-Backed' : 'Cross-Platform'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
