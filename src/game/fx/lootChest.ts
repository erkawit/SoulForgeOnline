// Round 26: ground loot chests — the 8 painted tiers (Common → Arch) and their sparkle loops.
import { RARITY_KEYS } from '../balance/config';
const NAMES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'god', 'prearch', 'arch'];
/** 1 (Common) … 8 (Arch); unknown rarities get the Common chest */
export const chestTier = (rarity: string) => Math.max(1, (RARITY_KEYS as readonly string[]).findIndex(r => r.toLowerCase() === String(rarity).toLowerCase()) + 1);
export const chestUrl = (tier: number) => `/art/loot/chest-${tier}-${NAMES[tier - 1]}.webp`;
export const sparkleUrl = (tier: number) => `/art/loot/sparkle-${tier}.webp`;
