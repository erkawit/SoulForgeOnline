// Registers every map's prop colliders (nature layout + the capitals' painted pieces + NPC bodies + the Sorrowlands ruins) so content.walkable()
// blocks trees, rocks, tombstones and NPCs for the player and monsters alike. Import once (side effect).
import { natureLayout } from './layout';
import { setColliderProvider, type Collider } from './colliders';
import { capitalColliders } from './capitalPlan';
import { isPainted } from './paintedCity';
import { npcsIn, npcPosition } from '../npcs';
import { CITIES, type CityId } from '../content';
import { sorrowlands } from './ruins';

export function collidersFor(city: CityId): Collider[] {
  if (!CITIES[city]) return [];
  // a painted capital has its own walk grid (paintedCity.ts) — the old procedural trees/rocks are not drawn there, so their
  // colliders would be invisible walls; only NPC bodies are added for it
  const list = isPainted(city) ? [] : [...natureLayout(city).colliders];
  if (city === 'wild0') list.push(...sorrowlands().colliders); // Ashen Outskirts: ruined village / keep / cathedral / cave walls
  if (!CITIES[city].parent) {
    if (!isPainted(city)) list.push(...capitalColliders(city as 'hollow' | 'dawnveil' | 'thornwatch')); // painted buildings, lamps, trees, the plaza centre (capitalPlan.ts)
    for (const n of npcsIn(city)) { const [x, z] = npcPosition(n, city); list.push({ kind: 'circle', x, z, r: n.id === 'warden' ? 0.55 : 0.4 }); }
  }
  return list;
}
setColliderProvider(c => collidersFor(c as CityId));
