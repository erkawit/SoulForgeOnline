// Auto-hunt brain. Pure: the game builds an AutoView each think tick and executes the returned actions in order.
// Settings come from the AUTO window (potion thresholds, food upkeep, per-slot skill switches, hunt radius) and, for
// support classes (none since round 13 — the Berserker attacks), a focus: attack, support, or hybrid.
import type { SkillDef } from './skills/engine';

export type AutoFocus = 'attack' | 'support' | 'hybrid';
export type AutoSettings = {
  enabled: boolean; radius: number;
  hpPotion: boolean; hpPotionPct: number; mpPotion: boolean; mpPotionPct: number; food: boolean;
  /** hotbar skill slots 1–6 (index 0 = basic attack is always on) */
  skills: boolean[];
  focus: AutoFocus; healAllyPct: number; keepBuffs: boolean; loot: boolean;
};
export const SUPPORT_CLASSES = [] as const;
export const isSupportClass = (cls: string) => (SUPPORT_CLASSES as readonly string[]).includes(cls);
export function defaultAuto(cls: string): AutoSettings {
  return { enabled: false, radius: 14, hpPotion: true, hpPotionPct: 45, mpPotion: true, mpPotionPct: 25, food: true, skills: [true, true, true, true, true, true, true],
    focus: isSupportClass(cls) ? 'hybrid' : 'attack', healAllyPct: 60, keepBuffs: true, loot: true };
}
export const FOCUS_TH: Record<AutoFocus, { name: string; desc: string }> = {
  attack: { name: 'เน้นโจมตี', desc: 'ใช้สกิลโจมตีเต็มที่ ฮีล/บัฟเฉพาะตัวเองเมื่อจำเป็น' },
  support: { name: 'เน้นซัพพอร์ต', desc: 'อยู่ใกล้เพื่อน ฮีล/บัฟ/โล่ก่อนเสมอ ตีธรรมดาเมื่อว่าง' },
  hybrid: { name: 'ควบคู่', desc: 'ฮีลเมื่อเพื่อนเลือดต่ำกว่าที่ตั้ง นอกนั้นโจมตีด้วยสกิล' },
};

export type SkillRole = 'damage' | 'heal' | 'buff' | 'shield' | 'debuff';
export function skillRoles(def: SkillDef): SkillRole[] {
  const r = new Set<SkillRole>();
  for (const e of def.effects) {
    const t = (e as { type: string }).type;
    if (t === 'damage' || t === 'dot') r.add('damage'); else if (t === 'heal') r.add('heal'); else if (t === 'buff') r.add('buff'); else if (t === 'shield' || t === 'guard') r.add('shield'); else if (t === 'debuff') r.add('debuff');
  }
  return [...r];
}
/** long buffs (≥ 60 s) are re-applied when missing; short ones are combat cooldowns */
export const isLongBuff = (def: SkillDef) => def.effects.some(e => (e as { type: string; durationSec?: number }).type === 'buff' && ((e as { durationSec?: number }).durationSec ?? 0) >= 60);
export const healsOthers = (def: SkillDef) => def.effects.some(e => (e as { type: string; target?: string }).type === 'heal' && ['ally', 'party', 'area'].includes((e as { target?: string }).target ?? ''));
export const buffsOthers = (def: SkillDef) => def.effects.some(e => (e as { type: string; target?: string }).type === 'buff' && ['ally', 'party', 'area'].includes((e as { target?: string }).target ?? ''));

export type AutoAlly = { id: string; hpPct: number; dist: number; alive: boolean; buffs: string[]; self?: boolean };
export type AutoSlot = { slot: number; def: SkillDef | null; ready: boolean; mpCost: number };
export type AutoView = {
  hpPct: number; mpPct: number; mp: number; busy: boolean; inCombat: boolean;
  hasTarget: boolean; targetInRange: boolean; enemyNear: boolean; targetIsBoss: boolean; enemiesNear: number;
  allies: AutoAlly[]; slots: AutoSlot[]; hpPotions: number; mpPotions: number; foodCount: number; foodActive: boolean; potionReady: boolean; lootNear: boolean;
  cls: string;
};
export type AutoAction =
  | { type: 'potion'; kind: 'hp' | 'mp' } | { type: 'food' } | { type: 'skill'; slot: number; ally?: string }
  | { type: 'attack' } | { type: 'seek' } | { type: 'follow'; ally: string } | { type: 'loot' };

/** one think tick (call ~5×/s). Returns the actions to try, most urgent first; the game runs the first one that works. */
export function decideAuto(v: AutoView, s: AutoSettings): AutoAction[] {
  if (!s.enabled) return [];
  const out: AutoAction[] = [];
  // survival first
  if (s.hpPotion && v.hpPct * 100 <= s.hpPotionPct && v.hpPotions > 0 && v.potionReady) out.push({ type: 'potion', kind: 'hp' });
  if (s.mpPotion && v.mpPct * 100 <= s.mpPotionPct && v.mpPotions > 0 && v.potionReady) out.push({ type: 'potion', kind: 'mp' });
  if (s.food && !v.foodActive && v.foodCount > 0) out.push({ type: 'food' });
  if (v.busy) return out;
  const support = isSupportClass(v.cls), focus: AutoFocus = support ? s.focus : 'attack';
  const usable = v.slots.filter(x => x.def && x.ready && x.mpCost <= v.mp && s.skills[x.slot] !== false);
  const hurt = v.allies.filter(a => a.alive && a.dist < 12).sort((a, b) => a.hpPct - b.hpPct);
  const lowest = hurt[0];
  const healThreshold = focus === 'attack' ? 0.35 : s.healAllyPct / 100;
  // heals: support/hybrid heal anyone below the threshold; attack focus only saves itself
  if (lowest && lowest.hpPct <= healThreshold && (focus !== 'attack' || lowest.self)) {
    const many = hurt.filter(a => a.hpPct <= healThreshold).length >= 2;
    const heal = usable.filter(x => skillRoles(x.def!).includes('heal')).sort((a, b) => (many ? Number(groupHeal(b.def!)) - Number(groupHeal(a.def!)) : Number(groupHeal(a.def!)) - Number(groupHeal(b.def!))))[0];
    if (heal) out.push({ type: 'skill', slot: heal.slot, ally: lowest.id });
  }
  // keep long buffs on the party (Enchanter inscriptions, Priest covenant …) when out of heavy danger
  if (s.keepBuffs && (focus !== 'attack' || !v.inCombat)) {
    for (const x of usable) {
      const d = x.def!; if (!isLongBuff(d)) continue;
      const missing = v.allies.find(a => a.alive && a.dist < 10 && !a.buffs.includes(d.id) && (buffsOthers(d) || a.self));
      if (missing) { out.push({ type: 'skill', slot: x.slot, ally: missing.id }); break; }
    }
  }
  if (focus === 'support') {
    // shields / short party buffs in combat, then basic attacks; stay with the party
    const sh = usable.find(x => { const r = skillRoles(x.def!); return v.inCombat && (r.includes('shield') || (r.includes('buff') && !isLongBuff(x.def!))); });
    if (sh) out.push({ type: 'skill', slot: sh.slot, ally: lowest?.id });
    const far = v.allies.find(a => !a.self && a.alive && a.dist > 7);
    if (far && !v.hasTarget) out.push({ type: 'follow', ally: far.id });
  }
  if (v.hasTarget || v.enemyNear) {
    if (focus !== 'support' && v.targetInRange) {
      // short self buffs at the start of a fight, then damage — area skills when several enemies are close or on bosses
      const burst = usable.find(x => { const r = skillRoles(x.def!); return v.inCombat && !isLongBuff(x.def!) && (r.includes('buff') || r.includes('debuff')) && !r.includes('damage') && !r.includes('heal'); });
      if (burst) out.push({ type: 'skill', slot: burst.slot });
      const dmg = usable.filter(x => skillRoles(x.def!).includes('damage')).sort((a, b) => score(b.def!, v) - score(a.def!, v));
      for (const d of dmg.slice(0, 2)) out.push({ type: 'skill', slot: d.slot });
    }
    out.push({ type: 'attack' });
  } else {
    if (s.loot && v.lootNear) out.push({ type: 'loot' });
    out.push({ type: 'seek' });
  }
  return out;
}
const groupHeal = (d: SkillDef) => d.effects.some(e => ['party', 'area'].includes((e as { target?: string }).target ?? ''));
function score(d: SkillDef, v: AutoView) {
  const area = d.effects.some(e => (e as { type: string; shape?: string }).type === 'damage' && !['single', undefined].includes((e as { shape?: string }).shape));
  return d.cooldownSec + (area && (v.enemiesNear >= 3 || v.targetIsBoss) ? 30 : 0) + (v.targetIsBoss ? d.cooldownSec : 0);
}
