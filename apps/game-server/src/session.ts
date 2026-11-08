import {lineClear} from '@/game/monsterAI';
import {mapRoute} from '@/game/world/mapRoute';
// One online character on the realm: its authoritative state, the checks on what the client claims (kills, movement),
// and the operations it may ask for. The browser still runs the combat simulation; the realm decides what it is worth.
//
//  · KILL  — the spawn must exist on the character's current map, must have had time to respawn since this character
//            last killed it, must be within reach of where the character stands, and the character must have had the
//            damage to do it: a damage budget refills at the character's highest possible DPS (legitDps: basic
//            attacks plus every learned damage skill at its cooldown, AoE counted on several targets, × killDpsSlack)
//            up to killBurstSeconds of it, and a kill costs the monster's full HP. Computed from the live skill library,
//            so it follows any rework of the skills. The reward is rolled here with the server's RNG.
//  · POS   — walkable on the current map and no faster than the character can move (speed × 1.35 plus a dash budget).
//  · ACT   — the economy reducers, with NPC / waygate distances measured from the last accepted position.
import * as eco from '@/game/economy/core';
import * as cdx from '@/game/economy/codex';
import { walkable, isCity, homePoint, respawnPoint, type CityId } from '@/game/content';
import { QUEST_BY_ID } from '@/game/quests';
import { NPC_BY_ID, nearNpc } from '@/game/npcs';
import { isClass } from '@/game/content';
import type { GameConfig } from '@/game/balance/config';
import { scaled, type SkillLibrary } from '@/game/skills/engine';
import type { Monster } from '@/lib/types';
import type { ActOp } from '@/store/authority';
import type { QuestEvent } from '@/game/quests';

export type Limits = { killDpsSlack: number; aoeTargets: number; killBurstSeconds: number; killReach: number; speedSlack: number; dashBudget: number; respawnSlackMs: number };
export const DEFAULT_LIMITS: Limits = { killDpsSlack: 1, aoeTargets: 6, killBurstSeconds: 10, killReach: 40, speedSlack: 1.35, dashBudget: 14, respawnSlackMs: 1500 };
export type Live = { config: GameConfig; skills: SkillLibrary; limits: Limits };
export type ActResult = { ok: boolean; msg?: string; changed: boolean; extra?: Record<string, unknown> };
/** what a client may report as a quest event on its own (the realm produces kills, buys, levels… itself) */
const CLIENT_EVENTS = new Set(['talk', 'visit', 'auto']);

/** the spawn table of a map under the live config (re-built when admins change the balance) */
const monsterCache = new WeakMap<GameConfig, Map<CityId, Map<string, Monster>>>();
function spawnOf(city: CityId, id: string, config: GameConfig): Monster | undefined {
  let byCity = monsterCache.get(config); if (!byCity) { byCity = new Map(); monsterCache.set(config, byCity); }
  let m = byCity.get(city); if (!m) { m = new Map(eco.monstersFor(city, config).map(x => [x.id, x])); byCity.set(city, m); }
  return m.get(id);
}

/** the most HP any monster on a map has (cached per config) */
const topCache = new WeakMap<GameConfig, Map<CityId, number>>();
function toughest(city: CityId, config: GameConfig): number {
  let m = topCache.get(config); if (!m) { m = new Map(); topCache.set(config, m); }
  let v = m.get(city); if (v === undefined) { v = eco.monstersFor(city, config).reduce((a, x) => Math.max(a, x.maxHp), 0); m.set(city, v); } return v;
}

/** the most damage per second this character could deal: basic-attack chain (finisher ×1.6) at its attack speed, plus
 *  every learned damage / DoT skill at its cooldown (AoE on `aoeTargets` monsters), all at full crit damage. An upper
 *  bound on purpose: a real player never reaches it, a claim above it is not real. */
export function legitDps(s: eco.CharState, live: Live, now: number): number {
  const d = eco.derive(s, { config: live.config, skills: live.skills, now }), crit = Math.max(1, d.critDamage), n = live.limits.aoeTargets;
  let dps = d.attack * 1.6 * crit * Math.max(0.1, d.attackSpeed) / 0.7;
  for (const [id, lvl] of Object.entries(s.skillLevels)) {
    const def = live.skills.defs.find(x => x.id === id); if (!def || def.kind !== 'active' || !(lvl > 0)) continue;
    let per = 0;
    for (const e of def.effects) {
      if (e.type === 'damage') per += scaled(e.coefficient, e.perLevel, lvl) * (e.hits ?? 1) * (e.shape === 'single' ? 1 : Math.min(n, e.maxTargets ?? n)) * (e.execute?.mul ?? 1);
      else if (e.type === 'dot') per += scaled(e.coefficient, e.perLevel, lvl) * e.ticks * (e.radius ? n : 1);
    }
    if (per > 0) dps += d.attack * per * (1 + d.skillDmg) * crit / Math.max(0.5, def.cooldownSec * (1 - d.cdr), def.castMs / 1000);
  }
  return dps;
}

export class CharacterSession {
  rev: number; dirty = false; dirtyAt = 0; saving: Promise<void> | null = null;
  lastKill = new Map<string, number>(); budget: number; budgetAt: number;
  moveBudget: number; moveAt: number; strikes = { kill: 0, move: 0, act: 0 };
  usedIds = new Set<string>();
  /** party members on this map near this character, itself included (wired by the realm; 1 = solo) */
  partyNear: (range: number) => number = () => 1;
  /** every change to this character (POS, ACT, market, boss pay, saves) runs one after another through this chain, so an
   *  operation that waits for the database can never be overtaken by another one on stale state */
  private chain: Promise<unknown> = Promise.resolve();
  enqueue<T>(fn: () => T | Promise<T>): Promise<T> { const next = this.chain.then(fn, fn); this.chain = next.catch(() => undefined); return next; }
  constructor(public user: string, public state: eco.CharState, rev: number, public live: () => Live, now: number) {
    this.rev = rev; this.budgetAt = now; this.moveAt = now;
    this.budget = this.budgetCap(); this.moveBudget = live().limits.dashBudget;
  }
  ctx(ids: string[] = [], now = Date.now()): eco.Ctx {
    const q = ids.filter(id => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id) && !this.usedIds.has(id));
    const { config, skills } = this.live();
    return { config, skills, rng: Math.random, now, uuid: () => { const id = q.shift() ?? crypto.randomUUID(); this.usedIds.add(id); if (this.usedIds.size > 4000) this.usedIds = new Set([...this.usedIds].slice(-2000)); return id; } };
  }
  derived(now = Date.now()) { const { config, skills } = this.live(); return eco.derive(this.state, { config, skills, now }); }
  dps(now = Date.now()) { return legitDps(this.state, this.live(), now) * this.live().limits.killDpsSlack; }
  /** the same upper bound on ONE target (a world boss): AoE counts once. Used to size the boss HP (round 13 fix). */
  singleTargetDps(now = Date.now()) { const l = this.live(); return legitDps(this.state, { ...l, limits: { ...l.limits, aoeTargets: 1 } }, now); }
  /** the bucket holds killBurstSeconds of top DPS — or, on a map with a monster tougher than that (bosses, dungeon
   *  elites), enough for its full HP, so a weaker but honest character who spends minutes on a boss is not refused.
   *  It still only refills at top DPS, so nothing is ever paid faster than the character could deal the damage. */
  private budgetCap(now = Date.now()) {
    const { config, limits } = this.live();
    return Math.max(this.dps(now) * limits.killBurstSeconds, toughest(this.city, config));
  }
  private touch(now: number) { this.dirty = true; if (!this.dirtyAt) this.dirtyAt = now; }
  get city(): CityId { return this.state.player.cityId ?? 'hollow'; }
  get position(): [number, number] { return this.state.player.position; }

  /** POS: accept or refuse a reported position; refused positions return the one the client must snap back to */
  move(city: unknown, x: unknown, z: unknown, now: number): { ok: true } | { ok: false; fix: [number, number]; city: CityId } {
    const c = this.city, l = this.live().limits;
    if (city !== c || typeof x !== 'number' || typeof z !== 'number' || !Number.isFinite(x) || !Number.isFinite(z)) return { ok: false, fix: this.position, city: c };
    const speed = this.derived(now).speed * l.speedSlack;
    this.moveBudget = Math.min(l.dashBudget, this.moveBudget + speed * Math.max(0, now - this.moveAt) / 1000); this.moveAt = now;
    const [px, pz] = this.position, dist = Math.hypot(x - px, z - pz);
    if (dist > this.moveBudget || !walkable(c, x, z)) { this.strikes.move++; return { ok: false, fix: this.position, city: c }; }
    // Network reports may span a corner. Accept a real detour within the movement budget,
    // never a shortcut through water/walls merely because its endpoint is dry.
    let travelled=dist;
    if(!lineClear(c,[px,pz],[x,z])){
      const route=mapRoute(c,[px,pz],[x,z],0,this.moveBudget);
      if(!route){this.strikes.move++;return {ok:false,fix:this.position,city:c};}
      let last:[number,number]=[px,pz];travelled=0;
      for(const point of route){travelled+=Math.hypot(point[0]-last[0],point[1]-last[1]);last=point;}
    }
    this.moveBudget -= travelled; this.state = { ...this.state, player: { ...this.state.player, position: [x, z] } };
    if (dist > 0.05) this.touch(now);
    return { ok: true };
  }

  /** KILL: check the claim, then pay it with the economy core's grantKill (server RNG) */
  kill(city: unknown, spawnId: unknown, ctx: eco.Ctx): ActResult {
    const now = ctx.now, l = this.live().limits;
    if (city !== this.city || typeof spawnId !== 'string') return this.killRefused('wrong map');
    const m = spawnOf(this.city, spawnId, ctx.config); if (!m) return this.killRefused('unknown spawn');
    const last = this.lastKill.get(spawnId) ?? 0;
    if (now - last < eco.respawnMs(m) - l.respawnSlackMs) return this.killRefused('not respawned yet');
    const [px, pz] = this.position, home = m.home ?? [m.x, m.z];
    if (Math.hypot(home[0] - px, home[1] - pz) > l.killReach) return this.killRefused('too far');
    this.budget = Math.min(this.budgetCap(now), this.budget + this.dps(now) * Math.max(0, now - this.budgetAt) / 1000); this.budgetAt = now;
    if (this.budget < m.maxHp) return this.killRefused('faster than possible');
    this.budget -= m.maxHp; this.lastKill.set(spawnId, now);
    const r = eco.grantKill(this.state, { ...m, hp: 0 }, { ...ctx, party: this.partyNear(ctx.config.codex.partyRange) });
    this.commit(r, now);
    return { ok: true, changed: true, extra: { levelUps: r.levelUps ?? 0 } };
  }
  private killRefused(reason: string): ActResult { this.strikes.kill++; return { ok: false, msg: `kill refused: ${reason}`, changed: false }; }

  private commit(r: eco.Ok, now: number) {
    const ev = eco.applyEvents(r.state, r.events);
    this.state = ev.state; this.touch(now);
  }

  /** ACT: one economy operation (same reducers as the client) */
  act(op: ActOp, args: unknown[], ids: string[], now = Date.now()): ActResult {
    const ctx = this.ctx(ids, now), s = this.state, a = args;
    const str = (i: number) => typeof a[i] === 'string' ? a[i] as string : '';
    const num = (i: number) => typeof a[i] === 'number' && Number.isFinite(a[i]) ? a[i] as number : NaN;
    let r: eco.Result;
    switch (op) {
      case 'kill': return this.kill(a[0], a[1], ctx);
      case 'swap': r = eco.swapInventory(s, num(0), num(1)); break;
      case 'equip': r = eco.equip(s, num(0), ctx); break;
      case 'unequip': r = eco.unequip(s, str(0) as never); break;
      case 'sell': r = eco.sellNpc(s, str(0), ctx); break;
      case 'brewPotion': r = eco.brewPotion(s, str(0), num(1), ctx); break;
      case 'buyShop': r = eco.buyShop(s, str(0), num(1), ctx); break;
      case 'buyCatalog': r = eco.buyCatalog(s, str(0), ctx); break;
      case 'use': r = eco.useItem(s, num(0), ctx); break;
      case 'enhance': { const ref = a[0] && typeof a[0] === 'object' ? a[0] as eco.EnhanceRef : {}; r = eco.enhance(s, { slot: typeof ref.slot === 'string' ? ref.slot : undefined, inventory: typeof ref.inventory === 'number' ? ref.inventory : undefined }, a[1] === true, ctx); break; }
      case 'craft': if (!isClass(a[1])) return { ok: false, msg: 'invalid class', changed: false }; r = eco.craft(s, str(0) as never, a[1], str(2) as never, ctx); break;
      case 'crystalCraft': if (!isClass(a[1])) return { ok: false, msg: 'invalid class', changed: false }; r = eco.crystalCraft(s, str(0) as never, a[1], str(2) as never, ctx, (['greatsword', 'greataxe', 'greathammer'] as const).find(k => k === a[3]) ?? 'greatsword'); break;
      case 'starter': r = eco.claimStarterKit(s, ctx); break;
      case 'blessing': r = eco.receiveBlessing(s, ctx); break;
      case 'forge': r = eco.forgeSoul(s); break;
      case 'learn': r = eco.learnSkill(s, str(0), ctx); break;
      case 'resetSkills': r = eco.resetSkills(s, ctx); break;
      case 'hotbar': r = eco.setHotbar(s, str(0) as never, str(1), ctx); break;
      case 'promote': r = eco.promote(s, str(0) as never); break;
      case 'acceptQuest': { const q = QUEST_BY_ID[str(0)]; if (!q) return { ok: false, msg: 'unknown quest', changed: false }; r = eco.acceptQuest(s, q.id, ctx); break; }
      case 'turnIn': { const npc = str(1); if (!NPC_BY_ID[npc] || !nearNpc(this.city, this.position, NPC_BY_ID[npc].service, 6)) return { ok: false, msg: 'ต้องคุยกับ NPC ที่รับเควส', changed: false }; r = eco.turnInQuest(s, str(0), npc, ctx); break; }
      case 'travel': { const to = str(0); if (!isCity(to)) return { ok: false, msg: 'unknown map', changed: false };
        const t = eco.travel(s, to, a[1] === true, ctx, { checkPosition: true }); if (t.ok) { this.lastKill.clear(); this.moveBudget = this.live().limits.dashBudget; } r = t; break; }
      case 'pickup': r = eco.pickup(s, str(0)); break;
      case 'codex': r = cdx.registerCodex(s, str(0), ctx); break;
      case 'collect': r = cdx.registerCollection(s, str(0), num(1)); break;
      case 'sellJunk': r = cdx.sellJunk(s, ctx); break;
      case 'wear': r = eco.wearFashion(s, str(0)); break;
      case 'takeOff': { const sl = str(0); if (!['outfit', 'weapon', 'wings', 'cape', 'head', 'other'].includes(sl)) return { ok: false, msg: 'invalid slot', changed: false }; r = eco.takeOffFashion(s, sl as never); break; }
      case 'respawn': { const home = respawnPoint(this.city, s.player.name); this.state = { ...s, player: { ...s.player, position: home } }; this.touch(now); return { ok: true, changed: true }; }
      case 'event': { const e = a[0] as QuestEvent; if (!e || typeof e !== 'object' || !CLIENT_EVENTS.has(e.type)) return { ok: false, msg: 'event not accepted', changed: false };
        if (e.type === 'talk' && (!NPC_BY_ID[(e as { npc: string }).npc] || !nearNpc(this.city, this.position, NPC_BY_ID[(e as { npc: string }).npc].service, 6))) return { ok: false, msg: 'too far to talk', changed: false };
        const ev = eco.applyEvents(s, [e]); if (ev.state === s) return { ok: true, changed: false }; this.state = ev.state; this.touch(now); return { ok: true, changed: true }; }
      default: this.strikes.act++; return { ok: false, msg: 'unknown operation', changed: false };
    }
    if (!r.ok) return { ok: false, msg: r.msg, changed: false };
    this.commit(r, now);
    return { ok: true, msg: r.msg, changed: true };
  }
}
