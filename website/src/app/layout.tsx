import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VibeVoice — High-Performance Voice Dictation, Synchronized TTS & AI Launcher',
  description:
    'Cross-platform desktop application for macOS, Windows, and Linux. Sub-100ms voice dictation, synchronized text-to-speech, global AI launcher, and hardware keychain security created by Abuzar Khan.',
  keywords: [
    'VibeVoice',
    'Voice Dictation',
    'Text to Speech',
    'TTS',
    'AI Launcher',
    'Abuzar Khan',
    'Vibe Productivity Suite',
    'Native Abstraction Layer',
    'Whisper AI',
    'Desktop Voice AI',
    'macOS',
    'Windows',
    'Linux',
  ],
  authors: [{ name: 'Abuzar Khan', url: 'https://github.com/abuzarkhan1' }],
  creator: 'Abuzar Khan',
  openGraph: {
    title: 'VibeVoice — Sub-100ms Voice Dictation & AI Workflows',
    description:
      'Engineered for speed, privacy, and seamless OS integration. Native C/Swift, C#, and C/Python bridges with hardware keychain security.',
    type: 'website',
    url: 'https://github.com/abuzarkhan1/VibeVoice',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeVoice — Cross-Platform Desktop Voice AI',
    description: 'Sub-100ms dictation, synchronized TTS & AI launcher created by Abuzar Khan.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#09090b] text-zinc-100 antialiased selection:bg-white/20 selection:text-white min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
