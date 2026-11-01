// Round 13: 8-direction flipbooks imported from Codex (scripts/import-codex-anims.mjs → anims8.json) replace the old
// one-direction sheets of the same id. An existing painted still keeps its world size (so a species does not change
// size when its art is upgraded); `aliases` let one sheet play for other species / bosses (e.g. a dungeon boss).
import { SPRITE_ANIMS, ANIM_ALIAS, type SpriteAnim } from './anims';
import { SPRITE_FRAMES, type SpriteFrame } from './frames';
import ANIMS8 from './anims8.json';

export type Anim8 = { anim: SpriteAnim; frame: SpriteFrame; hits: Record<string, number>; aliases: string[] };
export const CODEX_ANIMS = ANIMS8 as unknown as Record<string, Anim8>;
for (const [id, e] of Object.entries(CODEX_ANIMS)) {
  SPRITE_ANIMS[id] = e.anim; SPRITE_FRAMES[id] ??= e.frame; delete ANIM_ALIAS[id];
  for (const a of e.aliases) { ANIM_ALIAS[a] = id; SPRITE_FRAMES[a] ??= e.frame; }
}
/** fraction (0..1) of a clip where its blow lands, for syncing damage numbers with 8-way monster art */
export function animHitFraction(id: string, clip: string): number | null {
  const e = CODEX_ANIMS[id] ?? CODEX_ANIMS[ANIM_ALIAS[id] ?? '']; const f = e?.hits[clip], c = e?.anim.clips[clip];
  return f === undefined || !c ? null : f / c[1];
}
