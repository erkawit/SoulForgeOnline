// Which browser save the running game reads and writes. Guest play keeps the old key; every signed-in account gets its
// own key, so logging out and in with another account on the same browser never loads the previous player's character.
export const GUEST_SAVE = 'soulforge_guest_v1';
export const accountSave = (userId: string) => `soulforge_acc_${userId}_v1`;
/** round 25: up to 4 characters — accounts save each character under its own id; guests use 4 browser slots */
export const MAX_SLOTS = 4;
export const characterSave = (userId: string, charId: string) => `soulforge_acc_${userId}_${charId}_v1`;
export const guestSlotKey = (slot: number) => slot <= 1 ? GUEST_SAVE : `${GUEST_SAVE}_s${slot}`;
export const isGuestKey = (key: string) => key === GUEST_SAVE || key.startsWith(`${GUEST_SAVE}_s`);
let current = GUEST_SAVE;
export const saveKey = () => current;
export const setSaveKey = (key: string) => { current = key; };

export type SaveSummary = { name: string; classId: string; level: number };
export function readSaveSummary(key: string): SaveSummary | null {
  try {
    const d = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    if (!d?.player) return null;
    return { name: String(d.player.name ?? ''), classId: String(d.player.classId ?? ''), level: Number(d.player.level) || 1 };
  } catch { return null; }
}
/** accounts used the guest key before round 25: carry that save over once when it is this account's character */
export function adoptGuestSave(key: string, name: string | null, from: string[] = [GUEST_SAVE]) {
  try {
    if (!name || window.localStorage.getItem(key)) return;
    for (const k of from) {
      const g = window.localStorage.getItem(k); if (!g) continue;
      if (JSON.parse(g)?.player?.name === name) { window.localStorage.setItem(key, g); return; }
    }
  } catch { /* storage blocked */ }
}

/** leaving the world: 'select' = back to the character screen, 'logout' = sign out (switch account) */
export type ExitTo = 'select' | 'logout';
export const requestExit = (to: ExitTo) => window.dispatchEvent(new CustomEvent<ExitTo>('sf-exit', { detail: to }));
/** set before the reload so a guest lands on the guest character screen again, not the login form */
export const GUEST_RETURN = 'sf_guest_return';
