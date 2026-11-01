// Human-readable (Thai) summary of a skill at a level — used by the skill tree, NPC mentor and docs.
import { scaled, type SkillDef } from './engine';

export function describeSkill(def: SkillDef, level: number) {
  const l = Math.max(1, level), parts: string[] = [];
  for (const e of def.effects) {
    if (e.type === 'damage') parts.push(`ดาเมจ ${Math.round(scaled(e.coefficient, e.perLevel, l) * 100)}% ATK${e.hits && e.hits > 1 ? ` × ${e.hits} ครั้ง` : ''} (${e.shape === 'single' ? 'เป้าเดียว' : e.shape === 'line' ? 'เป็นแนว' : e.shape === 'cone' ? 'รูปพัด' : `รัศมี ${e.radius} ม.`})`);
    else if (e.type === 'heal') parts.push(`รักษา ${e.coefficient ? `${Math.round(scaled(e.coefficient, e.perLevel, l) * 100)}% ATK` : ''}${e.pctMaxHp ? ` ${e.pctMaxHp}% HP` : ''}`);
    else if (e.type === 'buff') parts.push(`${e.stat} +${scaled(e.value, e.perLevel, l)}% ${e.durationSec >= 120 ? `${Math.round(e.durationSec / 60)} นาที` : `${e.durationSec} วิ`}${e.target === 'ally' ? ' (ผู้เล่นอื่นได้)' : ''}`);
    else if (e.type === 'guard') parts.push(`ลดดาเมจที่ได้รับ ${scaled(e.reducePct, e.perLevel, l)}% ${e.durationSec} วิ`);
    else if (e.type === 'shield') parts.push(`โล่ ${scaled(e.pctMaxHp, e.perLevel, l)}% HP`);
    else if (e.type === 'dot') parts.push(`ต่อเนื่อง ${Math.round(scaled(e.coefficient, e.perLevel, l) * 100)}% × ${e.ticks}`);
    else if (e.type === 'debuff') parts.push(`ศัตรู ${e.stat === 'slow' ? 'ช้าลง' : e.stat === 'atkPct' ? 'ATK −' : 'DEF −'}${scaled(e.value, e.perLevel, l)}%`);
    else if (e.type === 'dash') parts.push(`พุ่ง ${e.distance} ม.`); else if (e.type === 'knockback') parts.push(`ผลัก ${e.distance} ม.`); else parts.push(`Rage +${e.amount}`);
  }
  for (const p of def.passive ?? []) parts.push(`${p.stat} +${Math.round(p.perLevel * l * 10) / 10}%`);
  return parts.join(' · ');
}
