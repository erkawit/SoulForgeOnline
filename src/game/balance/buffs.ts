// Newbie blessing (NPC Sister Lumen) and Enchanter inscriptions on other players (no party needed).
import { DEFAULT_CONFIG, type GameConfig } from './config';
import type { ActiveBuff } from './stats';

/** Buff level for a character level, or 0 when the character has outgrown the blessing. Ranges are admin-editable. */
export function newbieBuffLevel(level: number, cfg: GameConfig = DEFAULT_CONFIG) {
  const n = cfg.newbieBuff; if (!n.enabled || level > n.maxLevel) return 0;
  return n.tiers.find(t => level >= t.from && level <= t.to)?.buffLevel ?? 0;
}
export function newbieBuff(level: number, now = Date.now(), cfg: GameConfig = DEFAULT_CONFIG): ActiveBuff | null {
  const l = newbieBuffLevel(level, cfg), e = cfg.newbieBuff.effects[String(l)]; if (!l || !e) return null;
  return { id: 'newbie', source: `Newbie Blessing Lv.${l}`, ...e, until: now + cfg.newbieBuff.durationMinutes * 60_000 };
}
/** Drop a newbie blessing that no longer matches the character's level (e.g. after levelling past the tier). */
export function refreshNewbie(buffs: ActiveBuff[], level: number, cfg: GameConfig = DEFAULT_CONFIG) {
  const l = newbieBuffLevel(level, cfg);
  return buffs.filter(b => b.id !== 'newbie' || (l > 0 && b.source.endsWith(`Lv.${l}`)));
}

export type InscriptionId = 'might' | 'ward' | 'haste' | 'focus';
export const INSCRIPTIONS: Record<InscriptionId, { name: string; th: string; effect: (potency: number, skillLevel: number) => Partial<ActiveBuff> }> = {
  might: { name: 'Might Inscription', th: 'จารึกพละกำลัง · ATK', effect: (p, l) => ({ atkPct: Math.round((10 + 2 * (l - 1)) * p) }) },
  ward: { name: 'Ward Inscription', th: 'จารึกปราการ · DEF', effect: (p, l) => ({ defPct: Math.round((10 + 2 * (l - 1)) * p) }) },
  haste: { name: 'Haste Inscription', th: 'จารึกวายุ · ความเร็ว', effect: (p, l) => ({ moveSpeed: Math.round((6 + l) * p) }) },
  focus: { name: 'Focus Inscription', th: 'จารึกสมาธิ · คริติคอล', effect: (p, l) => ({ critRate: Math.round((3 + l) * p) }) },
};
/** Enchanter → any player in range. Returns null with a reason when not allowed. */
export function inscribe(kind: InscriptionId, casterPotency: number, skillLevel: number, distance: number, now = Date.now(), cfg: GameConfig = DEFAULT_CONFIG): { buff: ActiveBuff | null; reason?: string } {
  if (distance > cfg.enchanterBuff.range) return { buff: null, reason: `อยู่ไกลเกิน ${cfg.enchanterBuff.range} เมตร` };
  const i = INSCRIPTIONS[kind];
  return { buff: { id: `inscription-${kind}`, source: i.name, ...i.effect(casterPotency, Math.max(1, Math.min(5, skillLevel))), until: now + cfg.enchanterBuff.durationMinutes * 60_000 } };
}
