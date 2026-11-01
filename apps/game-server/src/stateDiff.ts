import type { CharState } from '@/game/economy/core';
/** The parts of a character that changed since the last push. The economy reducers copy only what they change, so a
 *  reference check per part is exact. The client merges a patch over its copy (src/store/useGameStore.ts applyServerState). */
export const STATE_KEYS = ['player', 'inventory', 'equipment', 'soulShards', 'skillLevels', 'hotbar', 'buffs', 'starterKits', 'quests', 'drops', 'codex', 'wardrobe'] as const satisfies readonly (keyof CharState)[];
export function diffState(prev: CharState | undefined, next: CharState): Partial<CharState> {
  if (!prev) return next;
  const out: Partial<CharState> = {};
  for (const k of STATE_KEYS) if (prev[k] !== next[k]) (out as Record<string, unknown>)[k] = next[k];
  return out;
}
