// Status panel schema (the spec's §4 was empty, so this is the game's own): categories of rows built from the
// derived character. Both PCStatusPanel (scrolling list) and MobileStatusPanel (cards) render this same data.
import { ATTRIBUTES, ATTRIBUTE_LABEL, type AttributeId } from '@/game/balance/config';
import type { Derived } from '@/game/balance/stats';

export type StatFormat = 'int' | 'pct' | 'mult' | 'perSec' | 'speed';
export type StatusRow = { key: string; label: string; value: number; format: StatFormat; bonus?: number; hint?: string };
export type StatusCategory = { id: 'core' | 'offense' | 'defense' | 'speed' | 'recovery' | 'support'; label: string; icon: string; rows: StatusRow[] };

export function formatStat(r: Pick<StatusRow, 'value' | 'format'>) {
  const v = r.value;
  switch (r.format) {
    case 'pct': return `${(v * 100).toFixed(1)}%`;
    case 'mult': return `×${v.toFixed(2)}`;
    case 'perSec': return `${v.toFixed(1)}/วิ`;
    case 'speed': return `${v.toFixed(2)} ม./วิ`;
    default: return Math.round(v).toLocaleString();
  }
}
/** `base` = class base attributes; d.attrs already includes gear, so bonus = d.attrs − base */
export function buildStatus(d: Derived, base: Record<AttributeId, number>, moveSpeed = d.speed): StatusCategory[] {
  const physical = d.damageKind === 'physical';
  return [
    { id: 'core', label: 'ค่าพื้นฐาน', icon: '◆', rows: ATTRIBUTES.map(a => ({ key: a, label: ATTRIBUTE_LABEL[a], value: d.attrs[a], format: 'int' as const, bonus: d.attrs[a] - base[a] })) },
    { id: 'offense', label: 'การโจมตี', icon: '⚔', rows: [
      { key: 'attack', label: physical ? 'พลังโจมตีกายภาพ' : 'พลังเวท', value: d.attack, format: 'int' },
      { key: 'crit', label: 'โอกาสคริติคอล', value: d.crit, format: 'pct' },
      { key: 'critDamage', label: 'แรงคริติคอล', value: d.critDamage, format: 'mult' },
      { key: 'hit', label: 'ความแม่นยำ', value: d.hit, format: 'pct' },
      { key: 'skillDmg', label: 'พลังสกิล', value: d.skillDmg, format: 'pct' },
      { key: 'bossDmg', label: 'ดาเมจต่อบอส', value: d.bossDmg, format: 'pct' },
      { key: 'lifesteal', label: 'ดูดเลือด', value: d.lifesteal, format: 'pct' },
    ] },
    { id: 'defense', label: 'การป้องกัน', icon: '⛨', rows: [
      { key: 'maxHp', label: 'HP สูงสุด', value: d.maxHp, format: 'int' },
      { key: 'defense', label: 'ป้องกัน', value: d.defense, format: 'int' },
      { key: 'evade', label: 'หลบหลีก', value: d.evade, format: 'pct' },
      { key: 'dmgReduce', label: 'ลดดาเมจที่ได้รับ', value: d.dmgReduce, format: 'pct' },
    ] },
    { id: 'speed', label: 'ความเร็ว', icon: '➠', rows: [
      { key: 'attackSpeed', label: 'ความเร็วโจมตี', value: d.attackSpeed, format: 'mult' },
      { key: 'moveSpeed', label: 'ความเร็ววิ่ง', value: moveSpeed, format: 'speed' },
      { key: 'cdr', label: 'ลดคูลดาวน์', value: d.cdr, format: 'pct' },
    ] },
    { id: 'recovery', label: 'การฟื้นฟู', icon: '✚', rows: [
      { key: 'maxMp', label: 'MP สูงสุด', value: d.maxMp, format: 'int' },
      { key: 'hpRegen', label: 'ฟื้น HP', value: d.hpRegen, format: 'perSec' },
      { key: 'mpRegen', label: 'ฟื้น MP', value: d.mpRegen, format: 'perSec' },
    ] },
    { id: 'support', label: 'สนับสนุน', icon: '✧', rows: [
      { key: 'healPower', label: 'พลังรักษา', value: d.healPower, format: 'mult' },
      { key: 'buffPotency', label: 'พลังบัฟ', value: d.buffPotency, format: 'mult' },
      { key: 'expBonus', label: 'โบนัส EXP', value: d.expBonus, format: 'pct' },
    ] },
  ];
}

/** per-row change between two status builds (e.g. now vs. "if I wore the selected item") */
export function diffStatus(before: StatusCategory[], after: StatusCategory[]) {
  const out = new Map<string, number>(), a = new Map(after.flatMap(c => c.rows.map(r => [c.id + ':' + r.key, r.value] as const)));
  for (const c of before) for (const r of c.rows) { const v = a.get(c.id + ':' + r.key); if (v !== undefined && Math.abs(v - r.value) > (r.format === 'int' ? 0.5 : 0.0005)) out.set(c.id + ':' + r.key, v - r.value); }
  return out;
}
export function formatStatDelta(r: Pick<StatusRow, 'format'>, d: number) {
  const s = d > 0 ? '▲ +' : '▼ −', v = Math.abs(d);
  return s + (r.format === 'pct' ? `${(v * 100).toFixed(1)}%` : r.format === 'int' ? Math.round(v).toLocaleString() : r.format === 'perSec' ? v.toFixed(1) : v.toFixed(2));
}
