// The SoulForge Online website home page, served at / through the rewrite in next.config.ts (prominent "เข้าเกม" button in the middle of the top menu → /play).
// Rendered from the live game data by game/wiki/site.ts — the same builder that exports the preview's home.html.
import { buildHomeHtml } from '@/game/wiki/site';

export const revalidate = 300;
export function GET() {
  return new Response(buildHomeHtml({ gameUrl: '/play', homeUrl: '/', wikiUrl: '/wiki', codexUrl: '/guide', art: '/art/' }),
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}
