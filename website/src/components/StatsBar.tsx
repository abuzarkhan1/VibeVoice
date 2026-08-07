import React from 'react';

const STATS = [
  { value: '18ms', label: 'Dictation Latency' },
  { value: '3', label: 'Platforms Supported' },
  { value: '100%', label: 'On-Device Privacy' },
  { value: 'MIT', label: 'Open Source License' },
  { value: '1.4.0', label: 'Current Version' },
];

export const StatsBar: React.FC = () => {
  return (
    <div className="w-full bg-[#08080a] border-t border-b border-white/[0.06] py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-0">
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <div className="flex flex-col items-center text-center px-8 py-4 sm:py-0">
                <span
                  className="text-3xl sm:text-4xl font-extrabold text-white leading-none tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  {stat.value}
                </span>
                <span className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
                  {stat.label}
                </span>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden sm:block h-10 w-px bg-white/[0.08] mx-2 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
