// Two-layer tooltip data (shared by the preview and the React game):
//   layer 1 (always)  — name, tier, slot, base ATK/DEF, options, and an "if you wear this" comparison
//   layer 2 (hold Alt / long-press) — each option's roll range for this tier and how good the roll is
import { DEFAULT_CONFIG, type GameConfig, type RarityKey } from '@/game/balance/config';
import type { Derived, ItemOption } from '@/game/balance/stats';

export function optionRange(rarity: string, o: ItemOption, cfg: GameConfig = DEFAULT_CONFIG): [number, number] {
  const r = rarity as RarityKey;
  if (o.kind === 'attr') return cfg.options.attributeRange[r] ?? [o.value, o.value];
  const base = (cfg.options.specialGodValue[o.stat] ?? 0) * (cfg.options.specialTierMultiplier[r] ?? 0);
  return [Math.round(base * 0.75 * 10) / 10, Math.round(base * 1.25 * 10) / 10];
}
/** 0 = lowest possible roll for this tier, 1 = perfect */
export function rollQuality(rarity: string, o: ItemOption, cfg: GameConfig = DEFAULT_CONFIG) {
  const [lo, hi] = optionRange(rarity, o, cfg); return hi > lo ? Math.max(0, Math.min(1, (o.value - lo) / (hi - lo))) : 1;
}
export const qualityLabel = (q: number) => q >= 0.95 ? 'สมบูรณ์แบบ' : q >= 0.7 ? 'ดีมาก' : q >= 0.4 ? 'ปานกลาง' : 'ต่ำ';

export type CompareRow = { key: keyof Derived; label: string; before: number; after: number; delta: number; pct: boolean };
const ROWS: [keyof Derived, string, boolean][] = [
  ['attack', 'พลังโจมตี', false], ['defense', 'ป้องกัน', false], ['maxHp', 'HP สูงสุด', false], ['maxMp', 'MP สูงสุด', false],
  ['crit', 'คริติคอล', true], ['critDamage', 'แรงคริ', false], ['attackSpeed', 'ความเร็วโจมตี', false], ['evade', 'หลบหลีก', true],
  ['cdr', 'ลดคูลดาวน์', true], ['skillDmg', 'พลังสกิล', true], ['healPower', 'พลังรักษา', false], ['buffPotency', 'พลังบัฟ', false],
  ['bossDmg', 'ดาเมจบอส', true], ['lifesteal', 'ดูดเลือด', true], ['dmgReduce', 'ลดดาเมจ', true], ['hpRegen', 'ฟื้น HP/วิ', false], ['mpRegen', 'ฟื้น MP/วิ', false],
];
/** stat changes if the candidate replaced what is worn now (only rows that actually change) */
export function compareDerived(before: Derived, after: Derived): CompareRow[] {
  return ROWS.map(([key, label, pct]) => { const b = before[key] as number, a = after[key] as number; return { key, label, before: b, after: a, delta: a - b, pct }; })
    .filter(r => Math.abs(r.delta) > (r.pct ? 0.0005 : 0.005));
}
export function formatDelta(r: CompareRow) {
  const v = r.pct ? `${(Math.abs(r.delta) * 100).toFixed(1)}%` : Number.isInteger(Math.round(r.delta * 100) / 100) ? Math.abs(Math.round(r.delta)).toLocaleString() : Math.abs(r.delta).toFixed(2);
  return `${r.delta > 0 ? '▲ +' : '▼ −'}${v}`;
}
