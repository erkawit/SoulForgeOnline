import type {Monster} from '@/lib/types';
import {makeItem,weaponId} from './items';
import {DEFAULT_CONFIG,type GameConfig} from './balance/config';
export const monsterExp=(m:Monster)=>(30+m.level*13)*(m.expMultiplier??1);
/** SoulGod for one kill. Bosses pay a fixed purse from the admin config (economy.bossSoulGod): field bosses (Grave
 *  Marshal in Ashen Outskirts) and the three dungeon bosses. Round 10 lowered these from 1M / 5M / 10M, which printed
 *  ~12M SoulGod an hour per player at a 5-minute respawn and outweighed every sink in the game. */
export const monsterSoulGod=(m:Monster,cfg:GameConfig=DEFAULT_CONFIG)=>{if(!m.boss)return 12+m.level*3;const b=cfg.economy.bossSoulGod;return m.dungeon?b.dungeon[Math.min(b.dungeon.length,m.dungeon)-1]:b.field;};
/** round 13: each dungeon boss drops its own two-handed weapon kind (1 greatsword · 2 greataxe · 3 greathammer) */
export function bossDrops(m:Monster){if(!m.boss)return [];const d=(m.dungeon??1)-1,tier=[3,4,6][d];return [weaponId((['greatsword','greataxe','greathammer'] as const)[d],tier),`heavy-armor-${tier}`,`accessory-defense-${tier}`,`material-${tier}`,`trophy-${tier}`].map(makeItem);}
