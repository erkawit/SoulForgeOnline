import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  // Railway / Docker: self-contained server bundle (.next/standalone). Netlify builds with its own Next.js runtime
  // (NETLIFY=true is set in its build), which wants the default output.
  ...(process.env.NETLIFY ? {} : { output: 'standalone' as const }),
  // "/" is the game website (src/app/site/route.ts, big "เข้าเกม" button → /play); the game itself lives at /play
  async rewrites() { return { beforeFiles: [{ source: '/', destination: '/site' }], afterFiles: [], fallback: [] }; },
};

export default nextConfig;
