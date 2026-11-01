// Data-driven skill engine. A skill is a list of effects; admins compose new skills from the same parts in Skill Forge.
import type { Derived } from '../balance/stats';
import type { ActiveBuff } from '../balance/stats';

export type Element = 'physical' | 'fire' | 'frost' | 'storm' | 'holy' | 'shadow' | 'arcane' | 'nature';
export type Shape = 'single' | 'circle' | 'cone' | 'line' | 'self-circle';
export type BuffStat = 'atkPct' | 'defPct' | 'moveSpeed' | 'critRate' | 'expPct' | 'hpRegen' | 'atkSpeed' | 'dmgTaken';
export type SkillEffect =
  | { type: 'damage'; shape: Shape; radius: number; coefficient: number; perLevel: number; element: Element; hits?: number; delayMs?: number;
      /** round 13: time between the hits (default 160 ms), most targets struck (default all), execute bonus on low-HP targets */
      hitIntervalMs?: number; maxTargets?: number; execute?: { below: number; mul: number } }
  | { type: 'heal'; /** ally = the selected party member, or yourself when none is selected */ target: 'self' | 'ally' | 'party' | 'area'; radius?: number; coefficient: number; perLevel: number; pctMaxHp?: number }
  | { type: 'buff'; target: 'self' | 'ally' | 'party' | 'area'; stat: BuffStat; value: number; perLevel: number; durationSec: number; radius?: number }
  | { type: 'shield'; pctMaxHp: number; perLevel: number; durationSec: number }
  | { type: 'guard'; reducePct: number; perLevel: number; durationSec: number }
  | { type: 'dot'; coefficient: number; perLevel: number; ticks: number; intervalMs: number; element: Element; radius?: number }
  | { type: 'debuff'; stat: 'defPct' | 'atkPct' | 'slow'; value: number; perLevel: number; durationSec: number; radius?: number }
  | { type: 'dash'; distance: number }
  /** round 13: Rage gained on cast (Blood / Dread Howl) */
  | { type: 'rage'; amount: number }
  | { type: 'knockback'; distance: number };
/** round 13: atkSpeed (Blood Tempo), and three Berserker-only stats that are not gear options: lowHpDmg (Red Resolve —
 *  damage while HP ≤ 40 %), rageGain (Rage Conduit), slowResist (Unbroken Fury) — all in % per level */
export type PassiveBonus = { stat: 'atkPct' | 'defPct' | 'hpPct' | 'mpPct' | 'critRate' | 'critDmg' | 'cdr' | 'healPower' | 'skillDmg' | 'moveSpeed' | 'lifesteal' | 'bossDmg' | 'dmgReduce' | 'atkSpeed' | 'lowHpDmg' | 'rageGain' | 'slowResist'; perLevel: number };
export type FxRef = { cls: 'Berserker'; kind: 'attack' | 'skill' | 'buff' | 'special' };
export type SkillDef = {
  id: string; name: string; th: string; cls: FxRef['cls']; kind: 'active' | 'passive';
  /** the animation the caster plays */ motion: 'Attack' | 'Skill' | 'Buff' | 'Special';
  maxLevel: number; mpCost: number; mpPerLevel: number; cooldownSec: number; castMs: number; range: number;
  fx: FxRef; effects: SkillEffect[]; passive?: PassiveBonus[]; description: string; custom?: boolean;
  /** round 13 (Berserker): Rage spent on cast (0–100) — most attacks cost Rage, the howl costs MP */
  rageCost?: number;
  /** a Reaver skill that evolves this Berserker skill at Lv60: it takes the slot, the old one is kept but not used */
  evolvesFrom?: string;
  /** usable only after the Reaver advancement */
  promotion?: 'Reaver';
  /** channelled for this long (Whirlwind): no other attack meanwhile, movement slowed to channelMove */
  channelMs?: number; channelMove?: number;
  ultimate?: boolean;
};
/** rankStep: character levels between ranks (default 2; Reaver skills 5 → ranks at 60 / 65 / 70 / 75 / 80) */
export type TreeNode = { skillId: string; tier: number; col: number; unlockLevel: number; requires: { skillId: string; level: number }[]; rankStep?: number; promotion?: 'Reaver' };
export type SkillLibrary = { defs: SkillDef[]; trees: Record<FxRef['cls'], TreeNode[]> };
export type SkillLevels = Record<string, number>;
export type Hotbar = { skill: string | null; buff: string | null; special: string | null };

export const ELEMENT_COLOR: Record<Element, string> = { physical: '#d8d2c8', fire: '#ff7a45', frost: '#8fd8ff', storm: '#b9a0ff', holy: '#ffdb86', shadow: '#9a6bd8', arcane: '#b685ff', nature: '#8bdb9a' };

// ---------------------------------------------------------------- skill points & learning
/** 1 point per level from Lv2, plus a bonus point every 10 levels. */
export const skillPointsAt = (level: number) => Math.max(0, level - 1) + Math.floor(level / 10);
export const spentPoints = (levels: SkillLevels) => Object.values(levels).reduce((a, b) => a + b, 0);

export function canLearn(lib: SkillLibrary, cls: FxRef['cls'], skillId: string, levels: SkillLevels, charLevel: number, promoted = false): { ok: boolean; reason?: string } {
  const node = lib.trees[cls]?.find(n => n.skillId === skillId), def = lib.defs.find(d => d.id === skillId);
  if (!node || !def) return { ok: false, reason: 'สกิลนี้ไม่อยู่ในสายอาชีพของคุณ' };
  const cur = levels[skillId] ?? 0;
  if (cur >= def.maxLevel) return { ok: false, reason: 'เลเวลสกิลเต็มแล้ว' };
  if ((node.promotion || def.promotion) && !promoted) return { ok: false, reason: 'ต้องเลื่อนขั้นเป็น Reaver ก่อน (Lv60)' };
  const need = node.unlockLevel + cur * (node.rankStep ?? 2);
  if (charLevel < need) return { ok: false, reason: `ต้องการเลเวลตัวละคร ${need}` };
  for (const r of node.requires) if ((levels[r.skillId] ?? 0) < r.level) return { ok: false, reason: `ต้องอัป ${lib.defs.find(d => d.id === r.skillId)?.name ?? r.skillId} ถึง Lv.${r.level} ก่อน` };
  if (spentPoints(levels) - freePoints(lib, cls) >= skillPointsAt(charLevel)) return { ok: false, reason: 'แต้มสกิลไม่พอ' };
  return { ok: true };
}
export function learn(lib: SkillLibrary, cls: FxRef['cls'], skillId: string, levels: SkillLevels, charLevel: number, promoted = false) {
  const check = canLearn(lib, cls, skillId, levels, charLevel, promoted); if (!check.ok) return { levels, ...check };
  return { levels: { ...levels, [skillId]: (levels[skillId] ?? 0) + 1 }, ok: true as const };
}
/** Points still available to spend (starter levels are free). */
export const freePoints = (lib: SkillLibrary, cls: FxRef['cls']) => Object.keys(starterLevels(lib, cls)).length;
export const availablePoints = (lib: SkillLibrary, cls: FxRef['cls'], levels: SkillLevels, charLevel: number) => Math.max(0, skillPointsAt(charLevel) - (spentPoints(levels) - freePoints(lib, cls)));
/** Skills every character knows at Lv1 (tier-1 nodes with no requirements get one free level). */
export function starterLevels(lib: SkillLibrary, cls: FxRef['cls']): SkillLevels {
  return Object.fromEntries(lib.trees[cls].filter(n => n.tier === 1 && n.requires.length === 0 && !n.promotion && lib.defs.find(d => d.id === n.skillId && !d.promotion)?.kind === 'active').map(n => [n.skillId, 1]));
}
export function resetCost(charLevel: number, base: number, perLevel: number) { return base + perLevel * charLevel; }

/** Sum passive bonuses from learned passives (feeds the same special-stat slots as gear). */
export function passiveTotals(lib: SkillLibrary, levels: SkillLevels) {
  const out: Partial<Record<PassiveBonus['stat'], number>> = {};
  // an evolved (Reaver) passive replaces its Berserker original — the two never stack
  const evolved = new Set(lib.defs.filter(d => (levels[d.id] ?? 0) > 0 && d.evolvesFrom).map(d => d.evolvesFrom));
  for (const d of lib.defs) { const l = levels[d.id] ?? 0; if (!l || d.kind !== 'passive' || evolved.has(d.id)) continue; for (const p of d.passive ?? []) out[p.stat] = (out[p.stat] ?? 0) + p.perLevel * l; }
  return out;
}

// ---------------------------------------------------------------- resolution
export type Target = { id: string; x: number; z: number; defense: number; boss?: boolean; hp: number; maxHp?: number };
/** hp: the caster's current HP (Red Resolve / Deathless Wrath: more damage at ≤ 40 %) */
export type Ctx = { caster: Derived; x: number; z: number; yaw: number; targetId: string | null; targets: Target[]; maxHp: number; now: number; rng?: () => number; hp?: number };
export type Outcome = {
  hits: { id: string; damage: number; crit: boolean; delayMs: number }[]; heal: number; buffs: ActiveBuff[]; shield: number; guard: { reduce: number; until: number } | null;
  dots: { id: string; perTick: number; ticks: number; intervalMs: number }[]; debuffs: { id: string; stat: string; value: number; until: number }[]; dash: number; knockback: number; mpCost: number; cooldownMs: number;
  /** round 13: Rage spent / gained by this cast */ rageCost: number; rage: number;
};
export const scaled = (base: number, perLevel: number, level: number) => base + perLevel * Math.max(0, level - 1);

function inShape(t: Target, ctx: Ctx, shape: Shape, radius: number, range: number, primary: Target | undefined) {
  const dx = t.x - ctx.x, dz = t.z - ctx.z, d = Math.hypot(dx, dz);
  if (shape === 'single') return t === primary;
  if (shape === 'self-circle') return d <= radius;
  if (shape === 'circle') return !!primary && Math.hypot(t.x - primary.x, t.z - primary.z) <= radius;
  const fx = Math.sin(ctx.yaw), fz = Math.cos(ctx.yaw), along = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
  if (shape === 'cone') return d <= radius && along > 0 && Math.acos(Math.min(1, along / Math.max(d, 1e-6))) <= Math.PI / 3;
  return along > 0 && along <= Math.max(range, radius) && side <= 0.9; // line
}

export function resolveSkill(def: SkillDef, level: number, ctx: Ctx): Outcome {
  const rng = ctx.rng ?? Math.random, c = ctx.caster;
  const out: Outcome = { hits: [], heal: 0, buffs: [], shield: 0, guard: null, dots: [], debuffs: [], dash: 0, knockback: 0, mpCost: Math.round(scaled(def.mpCost, def.mpPerLevel, level)), cooldownMs: Math.round(def.cooldownSec * 1000 * (1 - c.cdr)), rageCost: def.rageCost ?? 0, rage: 0 };
  const lowHp = ctx.hp !== undefined && ctx.maxHp > 0 && ctx.hp / ctx.maxHp <= 0.4 ? 1 + (c.lowHpDmg ?? 0) : 1;
  const inRange = ctx.targets.filter(t => t.hp > 0 && Math.hypot(t.x - ctx.x, t.z - ctx.z) <= def.range + 0.5);
  const primary = inRange.find(t => t.id === ctx.targetId) ?? [...inRange].sort((a, b) => Math.hypot(a.x - ctx.x, a.z - ctx.z) - Math.hypot(b.x - ctx.x, b.z - ctx.z))[0];
  for (const e of def.effects) {
    if (e.type === 'damage') {
      const coef = scaled(e.coefficient, e.perLevel, level), hits = e.hits ?? 1;
      // the area's centre for maxTargets ordering: the primary target for 'circle', the caster otherwise
      const cx = e.shape === 'circle' && primary ? primary.x : ctx.x, cz = e.shape === 'circle' && primary ? primary.z : ctx.z;
      let struck = ctx.targets.filter(t => t.hp > 0 && inShape(t, ctx, e.shape, e.radius, def.range, primary));
      if (e.maxTargets && struck.length > e.maxTargets) struck = [...struck].sort((a, b) => (a === primary ? -1 : b === primary ? 1 : Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz))).slice(0, e.maxTargets);
      for (const t of struck) {
        const exec = e.execute && t.maxHp && t.hp / t.maxHp <= e.execute.below ? e.execute.mul : 1;
        for (let h = 0; h < hits; h++) {
          const crit = rng() < c.crit;
          const raw = c.attack * (0.9 + rng() * 0.2) * coef * exec * lowHp * (1 + c.skillDmg) * (t.boss ? 1 + c.bossDmg : 1) * (crit ? c.critDamage : 1);
          out.hits.push({ id: t.id, damage: Math.max(1, Math.round(raw - t.defense * 0.35)), crit, delayMs: (e.delayMs ?? 0) + h * (e.hitIntervalMs ?? 160) });
        }
      }
    } else if (e.type === 'heal') out.heal += Math.round((c.attack * scaled(e.coefficient, e.perLevel, level) + ctx.maxHp * (e.pctMaxHp ?? 0) / 100) * c.healPower);
    else if (e.type === 'buff') out.buffs.push({ id: `${def.id}-${e.stat}`, source: def.name, [e.stat]: Math.round(scaled(e.value, e.perLevel, level) * c.buffPotency * 10) / 10, until: ctx.now + e.durationSec * 1000 } as ActiveBuff);
    else if (e.type === 'shield') out.shield += Math.round(ctx.maxHp * scaled(e.pctMaxHp, e.perLevel, level) / 100 * c.buffPotency);
    else if (e.type === 'guard') out.guard = { reduce: Math.min(0.85, scaled(e.reducePct, e.perLevel, level) / 100), until: ctx.now + e.durationSec * 1000 };
    else if (e.type === 'dot') for (const t of ctx.targets) { if (t.hp > 0 && (e.radius ? primary && Math.hypot(t.x - primary.x, t.z - primary.z) <= e.radius : t === primary)) out.dots.push({ id: t.id, perTick: Math.max(1, Math.round(c.attack * scaled(e.coefficient, e.perLevel, level))), ticks: e.ticks, intervalMs: e.intervalMs }); }
    else if (e.type === 'debuff') for (const t of ctx.targets) { if (t.hp > 0 && (e.radius ? primary && Math.hypot(t.x - primary.x, t.z - primary.z) <= e.radius : t === primary)) out.debuffs.push({ id: t.id, stat: e.stat, value: scaled(e.value, e.perLevel, level), until: ctx.now + e.durationSec * 1000 }); }
    else if (e.type === 'dash') out.dash = Math.max(out.dash, e.distance);
    else if (e.type === 'knockback') out.knockback = Math.max(out.knockback, e.distance);
    else if (e.type === 'rage') out.rage += e.amount;
  }
  return out;
}
/** Does the skill need an enemy target to be cast? */
export const needsTarget = (def: SkillDef) => def.effects.some(e => (e.type === 'damage' && e.shape !== 'self-circle') || e.type === 'dot' || e.type === 'debuff');

// ---------------------------------------------------------------- Skill Forge validation (admin-created skills)
export const LIMITS = { coefficient: 12, perLevel: 3, cooldownMin: 0.5, cooldownMax: 600, castMax: 4000, rangeMax: 20, radiusMax: 14, buffMax: 60, durationMax: 3600, hitsMax: 36, effectsMax: 6, maxLevel: 10 };
export function validateSkill(d: SkillDef, existing: SkillDef[] = []): string[] {
  const e: string[] = [], L = LIMITS;
  if (!/^[a-z0-9-]{3,48}$/.test(d.id)) e.push('ID ใช้ a-z 0-9 และ - ยาว 3–48 ตัว');
  if (existing.some(x => x.id === d.id && x !== d)) e.push('ID ซ้ำกับสกิลที่มีอยู่');
  if (!d.name.trim()) e.push('ต้องมีชื่อสกิล');
  if (!(d.maxLevel >= 1 && d.maxLevel <= L.maxLevel)) e.push(`เลเวลสูงสุด 1–${L.maxLevel}`);
  if (d.kind === 'active') {
    if (!(d.cooldownSec >= L.cooldownMin && d.cooldownSec <= L.cooldownMax)) e.push(`คูลดาวน์ ${L.cooldownMin}–${L.cooldownMax} วินาที`);
    if (!(d.castMs >= 0 && d.castMs <= L.castMax)) e.push(`เวลาร่าย 0–${L.castMax} ms`);
    if (!(d.range >= 0 && d.range <= L.rangeMax)) e.push(`ระยะ 0–${L.rangeMax} เมตร`);
    if (!d.effects.length) e.push('สกิลกดใช้ต้องมีเอฟเฟกต์อย่างน้อย 1 อย่าง');
  } else if (!d.passive?.length) e.push('สกิลติดตัวต้องมีโบนัสอย่างน้อย 1 อย่าง');
  if (d.effects.length > L.effectsMax) e.push(`เอฟเฟกต์ไม่เกิน ${L.effectsMax} อย่าง`);
  for (const x of d.effects) {
    if ('coefficient' in x && !(x.coefficient >= 0 && x.coefficient <= L.coefficient)) e.push(`ค่าคูณ (coefficient) 0–${L.coefficient}`);
    if ('perLevel' in x && !(x.perLevel >= 0 && x.perLevel <= L.perLevel * 10)) e.push('ค่าต่อเลเวลสูงเกินไป');
    if ('radius' in x && x.radius !== undefined && !(x.radius >= 0 && x.radius <= L.radiusMax)) e.push(`รัศมี 0–${L.radiusMax}`);
    if (x.type === 'buff' && !(x.value >= 0 && x.value <= L.buffMax)) e.push(`บัฟไม่เกิน ${L.buffMax}%`);
    if ('durationSec' in x && !(x.durationSec > 0 && x.durationSec <= L.durationMax)) e.push(`ระยะเวลา 1–${L.durationMax} วินาที`);
    if (x.type === 'damage' && x.hits !== undefined && !(x.hits >= 1 && x.hits <= L.hitsMax)) e.push(`จำนวนครั้งที่ตี 1–${L.hitsMax}`);
  }
  return [...new Set(e)];
}
/** Tree sanity: every node references a real skill, requirements exist and sit on a lower tier (no cycles). */
export function validateTree(lib: SkillLibrary, cls: FxRef['cls']): string[] {
  const e: string[] = [], nodes = lib.trees[cls] ?? [], ids = new Set(nodes.map(n => n.skillId));
  for (const n of nodes) {
    const d = lib.defs.find(x => x.id === n.skillId);
    if (!d) e.push(`${n.skillId}: ไม่พบสกิล`); else if (d.cls !== cls) e.push(`${d.name}: อยู่ผิดอาชีพ`);
    for (const r of n.requires) { const p = nodes.find(x => x.skillId === r.skillId); if (!ids.has(r.skillId)) e.push(`${n.skillId}: ต้องการสกิลที่ไม่อยู่ในต้นไม้`); else if (p && p.tier >= n.tier) e.push(`${n.skillId}: สกิลที่ต้องการต้องอยู่แถวก่อนหน้า`); }
  }
  const pos = new Set<string>(); for (const n of nodes) { const k = `${n.tier}:${n.col}`; if (pos.has(k)) e.push(`ช่อง แถว ${n.tier} คอลัมน์ ${n.col} ซ้ำ`); pos.add(k); }
  return e;
}
export function mergeLibrary(base: SkillLibrary, patch: Partial<SkillLibrary> | null | undefined): SkillLibrary {
  if (!patch) return base;
  const defs = [...base.defs]; for (const d of patch.defs ?? []) { const i = defs.findIndex(x => x.id === d.id); if (i >= 0) defs[i] = d; else defs.push(d); }
  return { defs, trees: { ...base.trees, ...(patch.trees ?? {}) } };
}
