// Player Wiki: beginner guide, quests, map, monsters (HP / MP / ATK / DEF), elites (+1 skill), bosses (lore and skills,
// raid-sized so no stats), the boss damage dashboard, items, crafting and AUTO. Built from the game data (game/wiki/site.ts).
import { buildWikiHtml } from '@/game/wiki/site';

export const revalidate = 300;
export function GET() {
  return new Response(buildWikiHtml({ gameUrl: '/play', homeUrl: '/', wikiUrl: '/wiki', codexUrl: '/guide', art: '/art/' }),
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}
