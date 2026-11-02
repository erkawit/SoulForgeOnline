// Round 20: the seven new classes (Paladin, Hawkeye, Rune Master, Elementalist, Assassin, High Priest, Inquisitor).
// Each: 6 active skills (slots 1–3 = skill / buff / special, 4–6 taught by level) + 3 passives. MP costs, no Rage.
// Numbers are a first balance proposal (not play-tested) sized against the Berserker kit; admins tune them in Skill Forge.
import type { ClassId } from '../content';
import type { Element, FxRef, PassiveBonus, SkillDef, SkillEffect, TreeNode } from './engine';

type A = { id: string; name: string; th: string; motion: SkillDef['motion']; fx: FxRef['kind']; mp: number; cd: number; cast?: number; range: number; effects: SkillEffect[]; description: string; channelMs?: number; ultimate?: boolean };
const act = (cls: ClassId, s: A): SkillDef => ({ id: s.id, name: s.name, th: s.th, cls, kind: 'active', motion: s.motion, maxLevel: 5, mpCost: s.mp, mpPerLevel: Math.round(s.mp * 0.08), cooldownSec: s.cd, castMs: s.cast ?? 0, range: s.range,
  fx: { cls, kind: s.fx }, effects: s.effects, description: s.description, ...(s.channelMs ? { channelMs: s.channelMs, channelMove: 0.5 } : {}), ...(s.ultimate ? { ultimate: true } : {}) });
const pas = (cls: ClassId, id: string, name: string, th: string, bonus: PassiveBonus[], description: string): SkillDef => ({ id, name, th, cls, kind: 'passive', motion: 'Buff', maxLevel: 5, mpCost: 0, mpPerLevel: 0, cooldownSec: 0, castMs: 0, range: 0, fx: { cls, kind: 'buff' }, effects: [], passive: bonus, description });
const dmg = (shape: 'single' | 'circle' | 'cone' | 'line' | 'self-circle', coefficient: number, perLevel: number, element: Element, radius = 0, extra: { hits?: number; delayMs?: number; hitIntervalMs?: number; maxTargets?: number; execute?: { below: number; mul: number } } = {}): SkillEffect => ({ type: 'damage', shape, radius, coefficient, perLevel, element, ...extra });
const buff = (stat: 'atkPct' | 'defPct' | 'moveSpeed' | 'critRate' | 'atkSpeed' | 'hpRegen', value: number, perLevel: number, durationSec: number, target: 'self' | 'party' = 'self'): SkillEffect => ({ type: 'buff', target, stat, value, perLevel, durationSec, ...(target === 'party' ? { radius: 8 } : {}) });
const dot = (coefficient: number, element: Element, ticks = 3, radius?: number): SkillEffect => ({ type: 'dot', coefficient, perLevel: 0.01, ticks, intervalMs: 1000, element, ...(radius ? { radius } : {}) });
const debuff = (stat: 'defPct' | 'atkPct' | 'slow', value: number, durationSec: number, radius?: number): SkillEffect => ({ type: 'debuff', stat, value, perLevel: 2, durationSec, ...(radius ? { radius } : {}) });

type Kit = { cls: ClassId; actives: SkillDef[]; passives: SkillDef[] };
const P: ClassId = 'Paladin', H: ClassId = 'Hawkeye', R: ClassId = 'RuneMaster', E: ClassId = 'Elementalist', S: ClassId = 'Assassin', Q: ClassId = 'HighPriest', I: ClassId = 'Inquisitor';
const KITS: Kit[] = [
  { cls: P, actives: [
    act(P, { id: 'p-shield-bash', name: 'Shield Bash', th: 'กระแทกโล่', motion: 'Attack', fx: 'attack', mp: 8, cd: 5, range: 2.2, effects: [dmg('single', 1.3, 0.08, 'physical'), debuff('slow', 30, 2), { type: 'knockback', distance: 1 }], description: 'กระแทกด้วยโล่ 130% ATK ผลักถอยและทำให้ช้าลง 2 วินาที' }),
    act(P, { id: 'p-sacred-vow', name: 'Sacred Vow', th: 'คำปฏิญาณศักดิ์สิทธิ์', motion: 'Buff', fx: 'buff', mp: 16, cd: 25, range: 0, effects: [buff('defPct', 20, 3, 12), buff('hpRegen', 6, 1, 12)], description: 'DEF +20% และฟื้น HP ต่อเนื่องนาน 12 วินาที' }),
    act(P, { id: 'p-judgement-blade', name: 'Judgement Blade', th: 'ดาบพิพากษา', motion: 'Special', fx: 'special', mp: 22, cd: 12, range: 2.8, effects: [dmg('circle', 1.1, 0.1, 'holy', 2.6, { hits: 2, hitIntervalMs: 300, maxTargets: 5 })], description: 'ฟาดแสงศักดิ์สิทธิ์ 2 ครั้ง รัศมี 2.6 ม. สูงสุด 5 เป้า' }),
    act(P, { id: 'p-holy-cleave', name: 'Holy Cleave', th: 'ฟันวงพระจันทร์', motion: 'Skill', fx: 'skill', mp: 18, cd: 9, range: 0, effects: [dmg('self-circle', 0.9, 0.06, 'holy', 2.4, { maxTargets: 6 })], description: 'ฟันวนรอบตัว 90% ATK รัศมี 2.4 ม.' }),
    act(P, { id: 'p-bulwark', name: 'Bulwark of Dawn', th: 'ปราการรุ่งอรุณ', motion: 'Buff', fx: 'special', mp: 30, cd: 40, range: 0, effects: [{ type: 'guard', reducePct: 50, perLevel: 3, durationSec: 5 }, { type: 'shield', pctMaxHp: 12, perLevel: 1, durationSec: 8 }], description: 'ตั้งโล่ลดดาเมจ 50% นาน 5 วินาที และเกราะพลัง 12% ของ HP' }),
    act(P, { id: 'p-dawn-crusade', name: 'Dawn Crusade', th: 'สงครามรุ่งอรุณ', motion: 'Special', fx: 'special', mp: 45, cd: 70, range: 3, ultimate: true, effects: [{ type: 'dash', distance: 3 }, dmg('circle', 2.4, 0.3, 'holy', 3.4, { hits: 3, hitIntervalMs: 350, maxTargets: 8 }), { type: 'heal', target: 'party', radius: 8, coefficient: 0.8, perLevel: 0.1 }], description: 'ท่าไม้ตาย: พุ่งเข้าแนวหน้า ฟาดแสง 3 ครั้ง รัศมี 3.4 ม. และรักษาปาร์ตี้' }),
  ], passives: [
    pas(P, 'p-plate-mastery', 'Plate Mastery', 'ชำนาญเกราะหนัก', [{ stat: 'defPct', perLevel: 3 }], 'DEF +3% ต่อเลเวล'),
    pas(P, 'p-stalwart', 'Stalwart', 'ไม่หวั่นไหว', [{ stat: 'hpPct', perLevel: 3 }], 'HP สูงสุด +3% ต่อเลเวล'),
    pas(P, 'p-aegis', 'Aegis', 'โล่ศรัทธา', [{ stat: 'dmgReduce', perLevel: 1.5 }], 'ลดดาเมจที่ได้รับ 1.5% ต่อเลเวล'),
  ] },
  { cls: H, actives: [
    act(H, { id: 'h-piercing-arrow', name: 'Piercing Arrow', th: 'ศรทะลวง', motion: 'Attack', fx: 'skill', mp: 8, cd: 5, range: 10, effects: [dmg('line', 1.6, 0.1, 'physical', 10, { maxTargets: 4 })], description: 'ยิงศรทะลุแนวตรง 160% ATK สูงสุด 4 เป้า' }),
    act(H, { id: 'h-eagle-eye', name: 'Eagle Eye', th: 'ตาเหยี่ยว', motion: 'Buff', fx: 'buff', mp: 14, cd: 25, range: 0, effects: [buff('critRate', 15, 2, 12), buff('atkSpeed', 15, 2, 12)], description: 'คริ +15% และความเร็วโจมตี +15% นาน 12 วินาที' }),
    act(H, { id: 'h-arrow-rain', name: 'Arrow Rain', th: 'ฝนศร', motion: 'Special', fx: 'special', mp: 24, cd: 12, range: 9, effects: [dmg('circle', 0.45, 0.04, 'physical', 3, { hits: 6, hitIntervalMs: 250, maxTargets: 8 })], description: 'ศรตกเป็นห่า 6 ระลอก รัศมี 3 ม. สูงสุด 8 เป้า' }),
    act(H, { id: 'h-twin-shot', name: 'Twin Shot', th: 'ศรคู่', motion: 'Attack', fx: 'attack', mp: 10, cd: 6, range: 9, effects: [dmg('single', 0.95, 0.06, 'physical', 0, { hits: 2, hitIntervalMs: 150 })], description: 'ยิงศร 2 ดอกติดกัน ดอกละ 95% ATK' }),
    act(H, { id: 'h-crippling-shot', name: 'Crippling Shot', th: 'ศรตรึงขา', motion: 'Attack', fx: 'attack', mp: 12, cd: 10, range: 9, effects: [dmg('single', 1.2, 0.08, 'physical'), debuff('slow', 40, 3)], description: '120% ATK และทำให้เป้าช้าลง 40% นาน 3 วินาที' }),
    act(H, { id: 'h-talon-storm', name: 'Storm of Talons', th: 'พายุกรงเล็บ', motion: 'Special', fx: 'special', mp: 45, cd: 70, range: 10, ultimate: true, channelMs: 3000, effects: [dmg('circle', 0.5, 0.06, 'physical', 4, { hits: 12, hitIntervalMs: 250, maxTargets: 10 })], description: 'ท่าไม้ตาย: ยิงห่าศรต่อเนื่อง 3 วินาที 12 ระลอก รัศมี 4 ม.' }),
  ], passives: [
    pas(H, 'h-keen-sight', 'Keen Sight', 'สายตาคม', [{ stat: 'critRate', perLevel: 1.5 }], 'คริ +1.5% ต่อเลเวล'),
    pas(H, 'h-quick-draw', 'Quick Draw', 'ชักศรไว', [{ stat: 'atkSpeed', perLevel: 2.4 }], 'ความเร็วโจมตี +2.4% ต่อเลเวล'),
    pas(H, 'h-hunter', 'Hunter Instinct', 'สัญชาตญาณพราน', [{ stat: 'critDmg', perLevel: 4 }], 'ดาเมจคริ +4% ต่อเลเวล'),
  ] },
  { cls: R, actives: [
    act(R, { id: 'r2-rune-bolt', name: 'Rune Slash', th: 'ฟันอักขระ', motion: 'Attack', fx: 'attack', mp: 8, cd: 4, range: 2.4, effects: [dmg('single', 0.75, 0.05, 'arcane', 0, { hits: 2, hitIntervalMs: 200 })], description: 'ฟันดาบรูน 2 ครั้ง ครั้งละ 75% ATK (ดาเมจเวท)' }),
    act(R, { id: 'r2-inscription', name: 'Inscription', th: 'จารึกพลัง', motion: 'Buff', fx: 'buff', mp: 16, cd: 25, range: 0, effects: [buff('atkPct', 12, 2, 12, 'party'), buff('defPct', 8, 1, 12, 'party')], description: 'ปาร์ตี้ ATK +12% และ DEF +8% นาน 12 วินาที' }),
    act(R, { id: 'r2-rune-fracture', name: 'Rune Fracture', th: 'อักขระแตกสลาย', motion: 'Special', fx: 'special', mp: 24, cd: 12, range: 3, effects: [dmg('circle', 1.6, 0.12, 'arcane', 2.8, { delayMs: 300, maxTargets: 6 })], description: 'ปักดาบลงพื้น อักขระระเบิด 160% ATK รัศมี 2.8 ม.' }),
    act(R, { id: 'r2-rune-trap', name: 'Rune Trap', th: 'กับดักอักขระ', motion: 'Skill', fx: 'skill', mp: 18, cd: 10, range: 6, effects: [dot(0.35, 'arcane', 5, 2.4), debuff('slow', 35, 4, 2.4)], description: 'ขว้างแผ่นอักขระวางวงกับดัก ดาเมจต่อเนื่อง 5 วินาทีและทำให้ช้าลง' }),
    act(R, { id: 'r2-sigil-ward', name: 'Sigil Ward', th: 'ตราผนึกป้องกัน', motion: 'Buff', fx: 'buff', mp: 20, cd: 30, range: 0, effects: [{ type: 'shield', pctMaxHp: 15, perLevel: 1.5, durationSec: 10 }], description: 'เกราะอักขระ 15% ของ HP นาน 10 วินาที' }),
    act(R, { id: 'r2-concord-circle', name: 'Concord Circle', th: 'วงอักขระสามัคคี', motion: 'Special', fx: 'special', mp: 45, cd: 70, range: 0, ultimate: true, effects: [dmg('self-circle', 0.7, 0.08, 'arcane', 3.6, { hits: 8, hitIntervalMs: 400, maxTargets: 10 })], description: 'ท่าไม้ตาย: วงอักขระใหญ่รอบตัวระเบิดต่อเนื่อง 8 ครั้ง รัศมี 3.6 ม.' }),
  ], passives: [
    pas(R, 'r2-glyph-lore', 'Glyph Lore', 'ปราชญ์อักขระ', [{ stat: 'skillDmg', perLevel: 2 }], 'ดาเมจสกิล +2% ต่อเลเวล'),
    pas(R, 'r2-deep-well', 'Rune Edge', 'คมอักขระ', [{ stat: 'critRate', perLevel: 1.5 }], 'คริ +1.5% ต่อเลเวล'),
    pas(R, 'r2-swift-script', 'Swift Script', 'จารเร็ว', [{ stat: 'cdr', perLevel: 1.5 }], 'ลดคูลดาวน์ 1.5% ต่อเลเวล'),
  ] },
  { cls: E, actives: [
    act(E, { id: 'e-firebolt', name: 'Firebolt', th: 'ลูกไฟ', motion: 'Attack', fx: 'attack', mp: 10, cd: 4, range: 9, cast: 400, effects: [dmg('single', 1.7, 0.1, 'fire'), dot(0.12, 'fire')], description: 'ลูกไฟ 170% ATK และไฟไหม้ 3 วินาที' }),
    act(E, { id: 'e-attunement', name: 'Elemental Attunement', th: 'ประสานธาตุ', motion: 'Buff', fx: 'buff', mp: 16, cd: 25, range: 0, effects: [buff('atkPct', 15, 2, 12), buff('critRate', 8, 1, 12)], description: 'ATK +15% และคริ +8% นาน 12 วินาที' }),
    act(E, { id: 'e-chain-lightning', name: 'Chain Lightning', th: 'สายฟ้าลูกโซ่', motion: 'Special', fx: 'special', mp: 26, cd: 11, range: 9, effects: [dmg('circle', 1.2, 0.1, 'storm', 3.5, { hits: 2, hitIntervalMs: 200, maxTargets: 5 })], description: 'สายฟ้ากระโดดไปหาศัตรูใกล้เคียง สูงสุด 5 เป้า 2 ครั้ง' }),
    act(E, { id: 'e-frost-nova', name: 'Frost Nova', th: 'ระเบิดน้ำแข็ง', motion: 'Skill', fx: 'skill', mp: 20, cd: 10, range: 0, effects: [dmg('self-circle', 1.1, 0.08, 'frost', 3, { maxTargets: 8 }), debuff('slow', 50, 3, 3)], description: 'ระเบิดน้ำแข็งรอบตัว 110% ATK รัศมี 3 ม. ทำให้ช้าลง 50%' }),
    act(E, { id: 'e-meteor', name: 'Meteor', th: 'อุกกาบาต', motion: 'Special', fx: 'special', mp: 34, cd: 18, range: 9, cast: 900, effects: [dmg('circle', 3.0, 0.2, 'fire', 3, { delayMs: 500, maxTargets: 8 }), dot(0.2, 'fire', 3, 3)], description: 'อุกกาบาต 300% ATK รัศมี 3 ม. และไฟไหม้พื้น' }),
    act(E, { id: 'e-cataclysm', name: 'Cataclysm', th: 'มหาวิบัติธาตุ', motion: 'Special', fx: 'special', mp: 50, cd: 75, range: 9, ultimate: true, cast: 1000, effects: [dmg('circle', 1.4, 0.15, 'fire', 4, { maxTargets: 10 }), dmg('circle', 1.4, 0.15, 'frost', 4, { delayMs: 500, maxTargets: 10 }), dmg('circle', 1.4, 0.15, 'storm', 4, { delayMs: 1000, maxTargets: 10 })], description: 'ท่าไม้ตาย: ไฟ น้ำแข็ง สายฟ้า ถล่มพื้นที่รัศมี 4 ม. 3 ระลอก' }),
  ], passives: [
    pas(E, 'e-arcane-focus', 'Arcane Focus', 'สมาธิเวท', [{ stat: 'skillDmg', perLevel: 2.4 }], 'ดาเมจสกิล +2.4% ต่อเลเวล'),
    pas(E, 'e-mana-flow', 'Mana Flow', 'กระแสมานา', [{ stat: 'mpPct', perLevel: 4 }], 'MP สูงสุด +4% ต่อเลเวล'),
    pas(E, 'e-overload', 'Overload', 'พลังล้น', [{ stat: 'critDmg', perLevel: 4 }], 'ดาเมจคริ +4% ต่อเลเวล'),
  ] },
  { cls: S, actives: [
    act(S, { id: 's-twin-fang', name: 'Twin Fang', th: 'เขี้ยวคู่', motion: 'Attack', fx: 'attack', mp: 8, cd: 4, range: 2, effects: [dmg('single', 0.6, 0.04, 'physical', 0, { hits: 3, hitIntervalMs: 120 }), dot(0.1, 'shadow')], description: 'แทงมีดคู่ 3 ครั้ง ครั้งละ 60% และพิษ 3 วินาที' }),
    act(S, { id: 's-shadow-veil', name: 'Shadow Veil', th: 'ม่านเงา', motion: 'Buff', fx: 'buff', mp: 14, cd: 25, range: 0, effects: [buff('critRate', 15, 2, 10), buff('moveSpeed', 20, 2, 10)], description: 'คริ +15% และความเร็วเดิน +20% นาน 10 วินาที' }),
    act(S, { id: 's-shadow-step', name: 'Shadow Step', th: 'ก้าวเงา', motion: 'Special', fx: 'special', mp: 20, cd: 10, range: 6, effects: [{ type: 'dash', distance: 4 }, dmg('single', 2.2, 0.15, 'shadow', 0, { delayMs: 200, execute: { below: 0.3, mul: 1.3 } })], description: 'พุ่งไปด้านหลังเป้า แทง 220% · เป้า HP ≤ 30% รับ ×1.3' }),
    act(S, { id: 's-fan-of-blades', name: 'Fan of Blades', th: 'พัดใบมีด', motion: 'Skill', fx: 'skill', mp: 18, cd: 9, range: 0, effects: [dmg('self-circle', 0.5, 0.04, 'physical', 2.6, { hits: 3, hitIntervalMs: 150, maxTargets: 6 })], description: 'ขว้างมีดรอบตัว 3 ระลอก รัศมี 2.6 ม.' }),
    act(S, { id: 's-cripple', name: 'Hamstring', th: 'ตัดเอ็น', motion: 'Attack', fx: 'attack', mp: 12, cd: 10, range: 2, effects: [dmg('single', 1.3, 0.08, 'physical'), debuff('defPct', 15, 6)], description: '130% ATK และลดเกราะเป้า 15% นาน 6 วินาที' }),
    act(S, { id: 's-death-lotus', name: 'Death Lotus', th: 'บัวมรณะ', motion: 'Skill', fx: 'skill', mp: 45, cd: 70, range: 0, ultimate: true, channelMs: 3000, effects: [dmg('self-circle', 0.35, 0.04, 'shadow', 3, { hits: 30, hitIntervalMs: 100, maxTargets: 8 })], description: 'ท่าไม้ตาย: หมุนมีดคู่ 3 วินาที 30 ครั้ง รัศมี 3 ม.' }),
  ], passives: [
    pas(S, 's-lethality', 'Lethality', 'ชำนาญจุดตาย', [{ stat: 'critDmg', perLevel: 5 }], 'ดาเมจคริ +5% ต่อเลเวล'),
    pas(S, 's-agility', 'Shadow Agility', 'ว่องไวดั่งเงา', [{ stat: 'atkSpeed', perLevel: 2.4 }], 'ความเร็วโจมตี +2.4% ต่อเลเวล'),
    pas(S, 's-bloodletter', 'Bloodletter', 'ดูดเลือด', [{ stat: 'lifesteal', perLevel: 0.6 }], 'ดูดเลือด +0.6% ต่อเลเวล'),
  ] },
  { cls: Q, actives: [
    act(Q, { id: 'q-holy-light', name: 'Holy Light', th: 'แสงศักดิ์สิทธิ์', motion: 'Attack', fx: 'attack', mp: 8, cd: 4, range: 8, effects: [dmg('single', 1.3, 0.08, 'holy')], description: 'ยิงแสง 130% ATK' }),
    act(Q, { id: 'q-blessing', name: 'Blessing', th: 'พร', motion: 'Buff', fx: 'buff', mp: 18, cd: 25, range: 0, effects: [buff('atkPct', 10, 2, 15, 'party'), buff('defPct', 10, 2, 15, 'party'), buff('hpRegen', 5, 1, 15, 'party')], description: 'ปาร์ตี้ ATK/DEF +10% และฟื้น HP นาน 15 วินาที' }),
    act(Q, { id: 'q-greater-heal', name: 'Greater Heal', th: 'รักษาใหญ่', motion: 'Buff', fx: 'special', mp: 24, cd: 8, range: 0, cast: 600, effects: [{ type: 'heal', target: 'ally', coefficient: 2.4, perLevel: 0.2, pctMaxHp: 10 }], description: 'รักษาเพื่อน (หรือตัวเอง) 240% ATK + 10% ของ HP' }),
    act(Q, { id: 'q-sanctuary', name: 'Sanctuary', th: 'เขตศักดิ์สิทธิ์', motion: 'Skill', fx: 'skill', mp: 26, cd: 16, range: 0, effects: [{ type: 'heal', target: 'party', radius: 8, coefficient: 1.2, perLevel: 0.1 }, dmg('self-circle', 0.9, 0.06, 'holy', 3, { maxTargets: 6 })], description: 'รักษาปาร์ตี้ และแสงเผาศัตรูรอบตัว รัศมี 3 ม.' }),
    act(Q, { id: 'q-smite', name: 'Smite', th: 'ทัณฑ์สวรรค์', motion: 'Special', fx: 'special', mp: 22, cd: 10, range: 8, effects: [dmg('circle', 1.8, 0.12, 'holy', 2.2, { delayMs: 300, maxTargets: 5 })], description: 'ลำแสงฟ้าผ่าลง 180% ATK รัศมี 2.2 ม.' }),
    act(Q, { id: 'q-divine-grace', name: 'Divine Grace', th: 'พระกรุณาธิคุณ', motion: 'Special', fx: 'special', mp: 50, cd: 75, range: 0, ultimate: true, effects: [{ type: 'heal', target: 'party', radius: 10, coefficient: 3, perLevel: 0.3, pctMaxHp: 25 }, { type: 'shield', pctMaxHp: 20, perLevel: 2, durationSec: 10 }], description: 'ท่าไม้ตาย: รักษาปาร์ตี้ครั้งใหญ่ และเกราะ 20% ของ HP' }),
  ], passives: [
    pas(Q, 'q-devotion', 'Devotion', 'ศรัทธา', [{ stat: 'healPower', perLevel: 4 }], 'พลังรักษา +4% ต่อเลเวล'),
    pas(Q, 'q-serenity', 'Serenity', 'สงบใจ', [{ stat: 'mpPct', perLevel: 4 }], 'MP สูงสุด +4% ต่อเลเวล'),
    pas(Q, 'q-grace', 'Grace', 'พระคุณ', [{ stat: 'cdr', perLevel: 1.5 }], 'ลดคูลดาวน์ 1.5% ต่อเลเวล'),
  ] },
  { cls: I, actives: [
    act(I, { id: 'i-holy-bolt', name: 'Judgement Hammer', th: 'ค้อนพิพากษา', motion: 'Attack', fx: 'attack', mp: 8, cd: 4, range: 2.2, effects: [dmg('single', 1.5, 0.1, 'holy'), debuff('slow', 25, 2)], description: 'ทุบค้อนศักดิ์สิทธิ์ 150% ATK และทำให้ช้าลง 2 วินาที' }),
    act(I, { id: 'i-mark-of-guilt', name: 'Mark of Guilt', th: 'ตราบาป', motion: 'Buff', fx: 'buff', mp: 14, cd: 20, range: 4, effects: [debuff('defPct', 20, 10), debuff('atkPct', 10, 10)], description: 'ประทับตราบาป เป้าเกราะ −20% และพลังโจมตี −10% นาน 10 วินาที' }),
    act(I, { id: 'i-purging-volley', name: 'Purging Slam', th: 'ทุบชำระบาป', motion: 'Special', fx: 'special', mp: 24, cd: 12, range: 0, effects: [dmg('self-circle', 0.9, 0.06, 'holy', 2.8, { hits: 2, hitIntervalMs: 300, maxTargets: 6 })], description: 'ทุบพื้นแสงศักดิ์สิทธิ์ 2 ครั้ง รัศมี 2.8 ม.' }),
    act(I, { id: 'i-zeal', name: 'Zeal', th: 'ศรัทธาเดือด', motion: 'Buff', fx: 'buff', mp: 16, cd: 25, range: 0, effects: [buff('atkSpeed', 20, 2, 12), buff('atkPct', 10, 2, 12)], description: 'ความเร็วโจมตี +20% และ ATK +10% นาน 12 วินาที' }),
    act(I, { id: 'i-chain-of-faith', name: 'Shield of Faith', th: 'โล่ศรัทธา', motion: 'Buff', fx: 'buff', mp: 18, cd: 20, range: 0, effects: [{ type: 'guard', reducePct: 40, perLevel: 3, durationSec: 4 }, { type: 'heal', target: 'self', coefficient: 0.8, perLevel: 0.08, pctMaxHp: 5 }], description: 'ยกโล่ลดดาเมจ 40% นาน 4 วินาที และฟื้น HP' }),
    act(I, { id: 'i-final-verdict', name: 'Final Verdict', th: 'คำตัดสินสุดท้าย', motion: 'Special', fx: 'special', mp: 45, cd: 70, range: 2.6, ultimate: true, cast: 600, effects: [dmg('circle', 4.5, 0.5, 'holy', 2.4, { maxTargets: 5, execute: { below: 0.35, mul: 1.5 } })], description: 'ท่าไม้ตาย: ฟาดค้อนศักดิ์สิทธิ์ลงเต็มแรง 450% รัศมี 2.4 ม. · HP ≤ 35% รับ ×1.5' }),
  ], passives: [
    pas(I, 'i-conviction', 'Conviction', 'ปณิธาน', [{ stat: 'defPct', perLevel: 2.5 }], 'DEF +2.5% ต่อเลเวล'),
    pas(I, 'i-hunter-of-heretics', 'Heretic Hunter', 'นักล่านอกรีต', [{ stat: 'bossDmg', perLevel: 3 }], 'ดาเมจบอส +3% ต่อเลเวล'),
    pas(I, 'i-iron-faith', 'Iron Faith', 'ศรัทธาเหล็ก', [{ stat: 'dmgReduce', perLevel: 1 }], 'ลดดาเมจที่ได้รับ 1% ต่อเลเวล'),
  ] },
];
const node = (skillId: string, tier: number, col: number, unlockLevel: number): TreeNode => ({ skillId, tier, col, unlockLevel, requires: [] });
const ACTIVE_LV = [1, 3, 8, 5, 12, 15], ACTIVE_TIER = [1, 2, 4, 3, 5, 6], PASSIVE_LV = [4, 9, 14], PASSIVE_TIER = [2, 4, 6];
export const CLASS_DEFS: SkillDef[] = KITS.flatMap(k => [...k.actives, ...k.passives]);
export const CLASS_TREES = Object.fromEntries(KITS.map(k => [k.cls, [
  ...k.actives.map((d, i) => node(d.id, ACTIVE_TIER[i], 0, ACTIVE_LV[i])),
  ...k.passives.map((d, i) => node(d.id, PASSIVE_TIER[i], 1, PASSIVE_LV[i])),
]])) as Record<Exclude<ClassId, 'Berserker'>, TreeNode[]>;
/** slots 1–3 (skill / buff / special) and 4–6 per class */
export const CLASS_HOTBAR = Object.fromEntries(KITS.map(k => [k.cls, { skill: k.actives[0].id, buff: k.actives[1].id, special: k.actives[2].id }])) as Record<Exclude<ClassId, 'Berserker'>, { skill: string; buff: string; special: string }>;
export const CLASS_EXTRA = Object.fromEntries(KITS.map(k => [k.cls, k.actives.slice(3).map(d => d.id)])) as Record<Exclude<ClassId, 'Berserker'>, string[]>;
