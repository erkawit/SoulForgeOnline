// The layered heroes (body + hair + weapon sheets from Codex) are retired: every hero wears its painted class sheet.
import type { LayeredRig } from '../layered';
/** rig key → rig, plus the hero actor ids (catalog heroId) that play it */
export const HERO_RIGS: Record<string, { rig: LayeredRig; ids: string[] }> = {};
