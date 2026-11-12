// The NPC the player is walking toward (clicked in the world, or picked from the HUD's town NPC buttons). NpcLayer's
// walker steers toward it every frame and opens the dialog on arrival; any movement key cancels it.
import type { Npc } from './npcs';
export const approach: { current: Npc | null } = { current: null };
export const walkToNpc = (n: Npc | null) => { approach.current = n; };
