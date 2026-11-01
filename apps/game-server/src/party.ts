// Server-owned parties. The roster never lives in the browser: a member who drops keeps their seat for a reconnect
// grace (default 120 s) and rejoins automatically on AUTH; the leader role only moves after that grace expires.
// Pure logic (no sockets / db) so it is unit-tested; index.ts wires it to the network and to Supabase (save_party).
import { PARTY_MAX } from '@/game/balance/party';
import { randomUUID } from 'node:crypto';

export type PartyMember = { id: string; name: string; classId: string; online: boolean; graceUntil: number | null; joinedAt: number };
export type Party = { id: string; leader: string; members: PartyMember[]; createdAt: number };
export type PartyOpts = { max: number; graceMs: number; inviteMs: number };
export const PARTY_DEFAULTS: PartyOpts = { max: PARTY_MAX, graceMs: 120_000, inviteMs: 30_000 };
type Invite = { from: string; partyId: string | null; until: number };
export type PartyError = 'SELF' | 'FULL' | 'IN_PARTY' | 'NOT_LEADER' | 'NO_INVITE' | 'EXPIRED' | 'NOT_IN_PARTY' | 'UNKNOWN_PLAYER';

export class PartyManager {
  parties = new Map<string, Party>(); byPlayer = new Map<string, string>(); invites = new Map<string, Invite>();
  /** called with every party whose roster changed (null members = disbanded) */
  onChange: (p: Party, disbanded: boolean) => void = () => {};
  constructor(public opts: PartyOpts = PARTY_DEFAULTS) {}
  of(playerId: string) { const id = this.byPlayer.get(playerId); return id ? this.parties.get(id) ?? null : null; }

  invite(from: { id: string }, to: { id: string } | undefined, now: number): PartyError | null {
    if (!to) return 'UNKNOWN_PLAYER'; if (to.id === from.id) return 'SELF';
    const mine = this.of(from.id);
    if (mine && mine.leader !== from.id) return 'NOT_LEADER';
    if (mine && mine.members.length >= this.opts.max) return 'FULL';
    if (this.of(to.id)) return 'IN_PARTY';
    this.invites.set(to.id, { from: from.id, partyId: mine?.id ?? null, until: now + this.opts.inviteMs });
    return null;
  }
  accept(player: { id: string; name: string; classId: string }, inviter: { id: string; name: string; classId: string } | undefined, now: number): Party | PartyError {
    const inv = this.invites.get(player.id); this.invites.delete(player.id);
    if (!inv) return 'NO_INVITE'; if (inv.until < now) return 'EXPIRED'; if (this.of(player.id)) return 'IN_PARTY';
    let p = inv.partyId ? this.parties.get(inv.partyId) ?? null : this.of(inv.from);
    if (!p) {
      if (!inviter || inviter.id !== inv.from || this.of(inviter.id)) return 'EXPIRED';
      p = { id: randomUUID(), leader: inviter.id, members: [this.member(inviter, now)], createdAt: now };
      this.parties.set(p.id, p); this.byPlayer.set(inviter.id, p.id);
    }
    if (p.members.length >= this.opts.max) return 'FULL';
    p.members.push(this.member(player, now)); this.byPlayer.set(player.id, p.id); this.onChange(p, false);
    return p;
  }
  decline(playerId: string) { this.invites.delete(playerId); }
  leave(playerId: string): Party | PartyError {
    const p = this.of(playerId); if (!p) return 'NOT_IN_PARTY';
    this.remove(p, playerId); return p;
  }
  kick(leaderId: string, targetId: string): Party | PartyError {
    const p = this.of(leaderId); if (!p) return 'NOT_IN_PARTY'; if (p.leader !== leaderId) return 'NOT_LEADER';
    if (!p.members.some(m => m.id === targetId) || targetId === leaderId) return 'NOT_IN_PARTY';
    this.remove(p, targetId); return p;
  }
  /** connection dropped: keep the seat, start the grace timer */
  disconnect(playerId: string, now: number) {
    const p = this.of(playerId); if (!p) return null; const m = p.members.find(x => x.id === playerId)!;
    m.online = false; m.graceUntil = now + this.opts.graceMs; this.onChange(p, false); return p;
  }
  /** AUTH again (refresh, new tab, network back): rejoin the same party in the same slot */
  reconnect(playerId: string, name?: string, classId?: string) {
    const p = this.of(playerId); if (!p) return null; const m = p.members.find(x => x.id === playerId)!;
    m.online = true; m.graceUntil = null; if (name) m.name = name; if (classId) m.classId = classId; this.onChange(p, false); return p;
  }
  /** expire graces and invites; returns parties that changed */
  tick(now: number) {
    for (const [k, v] of this.invites) if (v.until < now) this.invites.delete(k);
    const changed: Party[] = [];
    for (const p of [...this.parties.values()]) {
      const gone = p.members.filter(m => !m.online && m.graceUntil != null && m.graceUntil <= now);
      for (const m of gone) this.remove(p, m.id);
      if (gone.length) changed.push(p);
    }
    return changed;
  }
  /** rebuild from storage after a server restart: everyone starts offline with a fresh grace */
  restore(rows: { partyId: string; leader: string; members: { id: string; name: string; classId: string }[] }[], now: number) {
    for (const r of rows) {
      if (r.members.length < 2) continue;
      const p: Party = { id: r.partyId, leader: r.leader, createdAt: now, members: r.members.slice(0, this.opts.max).map(m => ({ ...m, online: false, graceUntil: now + this.opts.graceMs, joinedAt: now })) };
      this.parties.set(p.id, p); for (const m of p.members) this.byPlayer.set(m.id, p.id);
    }
  }
  view(p: Party, live: (id: string) => { hp: number; maxHp: number; mp: number; maxMp: number; level: number; x: number; z: number } | undefined, now: number) {
    return { id: p.id, leader: p.leader, members: p.members.map(m => { const a = live(m.id); return { id: m.id, name: m.name, classId: m.classId, online: m.online, graceLeft: m.graceUntil ? Math.max(0, Math.ceil((m.graceUntil - now) / 1000)) : 0, ...(a ? { hp: a.hp, maxHp: a.maxHp, mp: a.mp, maxMp: a.maxMp, level: a.level, x: a.x, z: a.z } : {}) }; }) };
  }
  private member(a: { id: string; name: string; classId: string }, now: number): PartyMember { return { id: a.id, name: a.name, classId: a.classId, online: true, graceUntil: null, joinedAt: now }; }
  private remove(p: Party, playerId: string) {
    p.members = p.members.filter(m => m.id !== playerId); this.byPlayer.delete(playerId);
    if (p.leader === playerId && p.members.length) p.leader = (p.members.find(m => m.online) ?? p.members[0]).id;
    if (p.members.length < 2) { for (const m of p.members) this.byPlayer.delete(m.id); this.parties.delete(p.id); this.onChange(p, true); }
    else this.onChange(p, false);
  }
}
