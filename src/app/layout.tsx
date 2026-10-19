import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Soulforge: Eclipse Frontier — MMORPG Prototype',
  description: 'Isometric dark-fantasy action farming RPG powered by Next.js and React Three Fiber.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
