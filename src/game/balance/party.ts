// Round 12: party rules shared by the realm, the client and the preview.
// • Nobody is put in a party automatically: a player invites, the other accepts (realm PARTY_INVITE / PARTY_ACCEPT).
// • At most 5 members including you.
// • EXP bonus by how many members are on the same map and within PARTY_EXP_RANGE of the kill (you included):
//   5 → +100%, 4 → +75%, 3 → +50%, 2 → +25%, alone → +0%. A member on another map or too far simply does not count,
//   so the bonus drops exactly as if the party were smaller. Every member who counts gets the full monster EXP × bonus.
export const PARTY_MAX = 5;
export const PARTY_EXP_RANGE = 30;
export const PARTY_EXP_BONUS = [0, 0, 0.25, 0.5, 0.75, 1] as const;
export const partyExpBonus = (near: number) => PARTY_EXP_BONUS[Math.max(1, Math.min(PARTY_MAX, Math.floor(near)))];
export type MemberPlace = { id: string; name: string; sameMap: boolean; dist: number };
/** what the party list shows: who counts for the bonus, who is on another map (grey), who is too far and by how much */
export function partyStatus(members: MemberPlace[], range = PARTY_EXP_RANGE) {
  const rows = members.map(m => ({ ...m, counts: m.sameMap && m.dist <= range, over: m.sameMap ? Math.max(0, Math.round(m.dist - range)) : null }));
  const near = rows.filter(r => r.counts).length;
  return { rows, near, bonus: partyExpBonus(near), otherMap: rows.filter(r => !r.sameMap).length, tooFar: rows.filter(r => r.sameMap && !r.counts).length };
}
