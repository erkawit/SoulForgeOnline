// The bridge between the game store and the realm server (round 9). Online, the realm owns the character: the store
// still runs every economy reducer locally for deterministic operations (instant feedback, identical result), and sends
// the same operation as an ACT; the server applies it with its own RNG and answers with the authoritative state, which
// replaces the local copy. Operations that roll dice (kill rewards, enhancing, crafting, starter kits) are not applied
// locally at all: the store waits for the server's answer.
//
// The socket module (src/lib/multiplayer/socket.ts) installs the sender; this file has no imports so the store and
// the socket can both use it without a cycle.
export type ActOp =
  | 'swap' | 'equip' | 'unequip' | 'sell' | 'buyShop' | 'buyCatalog' | 'use' | 'enhance' | 'craft' | 'crystalCraft'
  | 'brewPotion' | 'starter' | 'blessing' | 'forge' | 'learn' | 'resetSkills' | 'hotbar' | 'promote' | 'acceptQuest' | 'turnIn'
  | 'travel' | 'pickup' | 'event' | 'kill' | 'respawn'
  // round 10: the player market and the mailbox — run by the realm only (database transaction), never applied locally
  | 'marketList' | 'marketBuy' | 'marketCancel' | 'mailClaim'
  // round 11: the monster codex and the shop's sell-junk button (deterministic: run locally too)
  | 'codex' | 'collect' | 'sellJunk'
  // round 12: the wardrobe (deterministic)
  | 'wear' | 'takeOff';
/** operations whose outcome is random: the client shows "waiting" and applies only the server's answer */
export const RNG_OPS: ActOp[] = ['enhance', 'craft', 'crystalCraft', 'starter', 'kill', 'marketList', 'marketBuy', 'marketCancel', 'mailClaim'];
type Sender = (op: ActOp, args: unknown[], ids: string[]) => number;
let sender: Sender | null = null;
let live = () => false;
export const authority = {
  /** true while the realm owns this character (authenticated, character loaded) */
  online: () => live(),
  install(send: Sender, isLive: () => boolean) { sender = send; live = isLive; },
  uninstall() { sender = null; live = () => false; },
  /** queue an operation; returns its sequence number (0 when not online) */
  send(op: ActOp, args: unknown[], ids: string[] = []): number { return sender && live() ? sender(op, args, ids) : 0; },
};
/** fresh item ids for one operation, shared by the optimistic local run and the server (so bag positions survive) */
export const newIds = (n = 6) => Array.from({ length: n }, () => crypto.randomUUID());
