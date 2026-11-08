import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/styles/forge-ui.css';
import '@/styles/forge-chrome.css';
import '@/styles/responsive.css';
import '@/styles/fashion.css';

export const metadata: Metadata = {
  title: 'Soulforge: Eclipse Frontier — MMORPG Prototype',
  description: 'Isometric dark-fantasy action farming RPG powered by Next.js and React Three Fiber.',
  manifest: '/manifest.webmanifest',
  icons: { icon: [{ url: '/favicon-32.png', sizes: '32x32' }, { url: '/icons/soulforge-64.png', sizes: '64x64' }, { url: '/icons/soulforge-192.png', sizes: '192x192' }], apple: '/icons/soulforge-512.png' },
  appleWebApp: { capable: true, title: 'SoulForge', statusBarStyle: 'black-translucent' },
};
// installable web app (PWA) and the shell for the Capacitor (mobile) / Tauri (PC) builds — see docs/PLATFORM_ROADMAP_TH.md
export const viewport: Viewport = { themeColor: '#07060a', width: 'device-width', initialScale: 1, viewportFit: 'cover', userScalable: false };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
