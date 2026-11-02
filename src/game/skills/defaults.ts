// The shipped skill library — round 13: one class. Berserker v2 (6 active incl. the Whirlwind ultimate + 6 passive) and
// Reaver v1 (Lv60 advancement: 6 + 6 that EVOLVE the Berserker skills slot for slot). Numbers from the balance proposal in
// output/berserker-reaver-review/sources/berserker_reaver_skill_vfx_v3/{berserker,reaver}/data/balance.json
// ("balance-proposal-not-playtested"). Admins add or override skills in Skill Forge.
import { CLASS_DEFS, CLASS_EXTRA, CLASS_HOTBAR, CLASS_TREES } from './classes';
import type { Element, FxRef, PassiveBonus, SkillDef, SkillEffect, SkillLibrary, TreeNode } from './engine';

type Cls = FxRef['cls'];
type ActiveSpec = { id: string; name: string; th: string; motion: SkillDef['motion']; fx: FxRef['kind']; mp: number; cd: number; cast?: number; range: number; effects: SkillEffect[]; description: string; max?: number;
  rage?: number; evolvesFrom?: string; channelMs?: number; channelMove?: number; ultimate?: boolean };
const active = (cls: Cls, s: ActiveSpec): SkillDef => ({ id: s.id, name: s.name, th: s.th, cls, kind: 'active', motion: s.motion, maxLevel: s.max ?? 5, mpCost: s.mp, mpPerLevel: Math.round(s.mp * 0.08), cooldownSec: s.cd, castMs: s.cast ?? 0, range: s.range, fx: { cls, kind: s.fx }, effects: s.effects, description: s.description,
  ...(s.rage ? { rageCost: s.rage } : {}), ...(s.evolvesFrom ? { evolvesFrom: s.evolvesFrom, promotion: 'Reaver' as const } : {}), ...(s.channelMs ? { channelMs: s.channelMs, channelMove: s.channelMove ?? 0.6 } : {}), ...(s.ultimate ? { ultimate: true } : {}) });
const passive = (cls: Cls, id: string, name: string, th: string, bonus: PassiveBonus[], description: string, evolvesFrom?: string): SkillDef => ({ id, name, th, cls, kind: 'passive', motion: 'Buff', maxLevel: 5, mpCost: 0, mpPerLevel: 0, cooldownSec: 0, castMs: 0, range: 0, fx: { cls, kind: 'buff' }, effects: [], passive: bonus, description, ...(evolvesFrom ? { evolvesFrom, promotion: 'Reaver' as const } : {}) });
const dmg = (shape: SkillEffect & { type: 'damage' } extends infer T ? T extends { shape: infer S } ? S : never : never, coefficient: number, perLevel: number, element: Element, radius = 0, extra: { hits?: number; delayMs?: number; hitIntervalMs?: number; maxTargets?: number; execute?: { below: number; mul: number } } = {}): SkillEffect => ({ type: 'damage', shape, radius, coefficient, perLevel, element, ...extra });
const node = (skillId: string, tier: number, col: number, unlockLevel: number, requires: [string, number][] = []): TreeNode => ({ skillId, tier, col, unlockLevel, requires: requires.map(([skillId, level]) => ({ skillId, level })) });
/** a Reaver node: right half of the tree, open after the advancement, ranks every 5 levels from 60 */
const reaver = (skillId: string, tier: number, col: number): TreeNode => ({ ...node(skillId, tier, col, 60), rankStep: 5, promotion: 'Reaver' });

const B: Cls = 'Berserker';
const buff = (stat: 'atkPct' | 'atkSpeed' | 'dmgTaken', value: number, perLevel: number, durationSec: number): SkillEffect => ({ type: 'buff', target: 'self', stat, value, perLevel, durationSec });
const bleed = (coefficient: number): SkillEffect => ({ type: 'dot', coefficient, perLevel: 0, ticks: 3, intervalMs: 1000, element: 'physical' });
const defs: SkillDef[] = [
  // ---------------- Berserker (class 1) — attacks cost Rage (0–100: +8 per basic attack that lands, +3 when hit, fades after 5 s out of combat)
  active(B, { id: 'b-rending-rush', name: 'Rending Rush', th: 'กระหน่ำฉีกเกราะ', motion: 'Attack', fx: 'attack', mp: 0, rage: 8, cd: 5, range: 2.2,
    effects: [dmg('single', 0.55, 0.025, 'physical', 0, { hits: 4, hitIntervalMs: 180 }), bleed(0.12)], description: 'ฟันเป้าเดียว 4 ครั้ง (55% ATK ต่อครั้ง) และเลือดไหล 3 วินาที' }),
  active(B, { id: 'b-blood-howl', name: 'Blood Howl', th: 'คำรามปลุกคลั่ง', motion: 'Buff', fx: 'buff', mp: 12, cd: 25, range: 0,
    effects: [buff('atkPct', 12, 2, 10), buff('atkSpeed', 25, 0, 10), buff('dmgTaken', 10, 0, 10), { type: 'rage', amount: 20 }], description: 'ATK +12% และความเร็วโจมตี +25% นาน 10 วินาที ได้ Rage 20 · แลกกับรับดาเมจเพิ่ม 10%' }),
  active(B, { id: 'b-carnage-cyclone', name: 'Carnage Cyclone', th: 'พายุสังหาร', motion: 'Skill', fx: 'skill', mp: 0, rage: 25, cd: 12, range: 0,
    effects: [dmg('self-circle', 0.28, 0.02, 'physical', 2.4, { hits: 12, hitIntervalMs: 200, maxTargets: 5 })], description: 'หมุนฟัน 2.4 วินาที 12 ครั้ง รัศมี 2.4 ม. สูงสุด 5 เป้า' }),
  active(B, { id: 'b-bloodquake', name: 'Bloodquake', th: 'ทลายปฐพีเดือด', motion: 'Special', fx: 'special', mp: 0, rage: 20, cd: 14, range: 3,
    effects: [dmg('circle', 0.85, 0.1, 'physical', 2.8, { hits: 3, hitIntervalMs: 350, maxTargets: 5 })], description: 'ทุบพื้น 3 ครั้งรอบเป้า รัศมี 2.8 ม. สูงสุด 5 เป้า' }),
  active(B, { id: 'b-execution-frenzy', name: 'Execution Frenzy', th: 'คลั่งประหาร', motion: 'Attack', fx: 'attack', mp: 0, rage: 30, cd: 18, range: 2.2,
    effects: [dmg('single', 0.8, 0.1, 'physical', 0, { hits: 2, hitIntervalMs: 300, execute: { below: 0.3, mul: 1.35 } }), dmg('single', 2.2, 0.1, 'physical', 0, { delayMs: 800, execute: { below: 0.3, mul: 1.35 } })],
    description: 'ฟัน 2 ครั้งแล้วปิดฉากหนัก 220% · เป้าที่ HP ≤ 30% รับดาเมจ ×1.35' }),
  active(B, { id: 'b-whirlwind', name: 'Whirlwind', th: 'มหาพายุคลั่ง', motion: 'Special', fx: 'special', mp: 0, rage: 100, cd: 70, range: 0, channelMs: 6000, channelMove: 0.6, ultimate: true,
    effects: [dmg('self-circle', 0.4, 0.05, 'physical', 3.5, { hits: 36, hitIntervalMs: 167, maxTargets: 8 })], description: 'ท่าไม้ตาย: หมุนอาวุธสองมือ 6 วินาที 36 ครั้ง รัศมี 3.5 ม. สูงสุด 8 เป้า เดินได้ 60% และใช้ท่าอื่นไม่ได้ระหว่างหมุน' }),
  passive(B, 'b-greatweapon-mastery', 'Greatweapon Mastery', 'เชี่ยวชาญอาวุธมหึมา', [{ stat: 'atkPct', perLevel: 2 }], 'พลังโจมตี +2% ต่อเลเวล (สูงสุด 10%)'),
  passive(B, 'b-blood-tempo', 'Blood Tempo', 'จังหวะเลือดเดือด', [{ stat: 'atkSpeed', perLevel: 2.4 }], 'ความเร็วโจมตี +2.4% ต่อเลเวล (สูงสุด 12%)'),
  passive(B, 'b-red-resolve', 'Red Resolve', 'ปณิธานเลือดสุดท้าย', [{ stat: 'lowHpDmg', perLevel: 3 }], 'เมื่อ HP ≤ 40% ทำดาเมจ +3% ต่อเลเวล (สูงสุด 15%)'),
  passive(B, 'b-blood-harvest', 'Blood Harvest', 'เก็บเกี่ยวโลหิต', [{ stat: 'lifesteal', perLevel: 0.6 }], 'ดูดเลือด +0.6% ต่อเลเวล (สูงสุด 3%)'),
  passive(B, 'b-unbroken-fury', 'Unbroken Fury', 'คลั่งไม่ยอมจำนน', [{ stat: 'slowResist', perLevel: 3 }], 'ลดเวลาติดสถานะช้าลง 3% ต่อเลเวล (ไม่กันสตัน)'),
  passive(B, 'b-rage-conduit', 'Rage Conduit', 'สายธารโทสะ', [{ stat: 'rageGain', perLevel: 4 }], 'ได้ Rage เพิ่ม 4% ต่อเลเวล (สูงสุด 20%)'),
  // ---------------- Reaver (advancement at Lv60) — each skill evolves the Berserker skill in the same slot
  active(B, { id: 'r-savage-rend', name: 'Savage Rend', th: 'ฉีกกระชากอำมหิต', motion: 'Attack', fx: 'attack', mp: 0, rage: 12, cd: 6, range: 2.6, evolvesFrom: 'b-rending-rush',
    effects: [dmg('single', 0.6, 0.05, 'physical', 0, { hits: 6, hitIntervalMs: 150 }), bleed(0.2)], description: 'ฟันเป้าเดียว 6 ครั้ง (60% ATK ต่อครั้ง) และเลือดไหลแรง 3 วินาที' }),
  active(B, { id: 'r-dread-howl', name: 'Dread Howl', th: 'คำรามเข่นฆ่า', motion: 'Buff', fx: 'buff', mp: 16, cd: 25, range: 0, evolvesFrom: 'b-blood-howl',
    effects: [buff('atkPct', 20, 2, 10), buff('atkSpeed', 30, 0, 10), buff('dmgTaken', 15, 0, 10), { type: 'rage', amount: 25 }], description: 'ATK +20% และความเร็วโจมตี +30% นาน 10 วินาที ได้ Rage 25 · รับดาเมจเพิ่ม 15%' }),
  active(B, { id: 'r-reaping-cyclone', name: 'Reaping Cyclone', th: 'กงจักรเก็บเกี่ยว', motion: 'Skill', fx: 'skill', mp: 0, rage: 30, cd: 14, range: 0, evolvesFrom: 'b-carnage-cyclone',
    effects: [dmg('self-circle', 0.48, 0.04, 'physical', 3.2, { hits: 10, hitIntervalMs: 250, maxTargets: 6 })], description: 'หมุน 2.5 วินาที 10 ครั้ง รัศมี 3.2 ม. สูงสุด 6 เป้า' }),
  active(B, { id: 'r-ruinbreaker', name: 'Ruinbreaker', th: 'ทลายเกราะพินาศ', motion: 'Special', fx: 'special', mp: 0, rage: 25, cd: 16, range: 3.5, evolvesFrom: 'b-bloodquake',
    effects: [dmg('circle', 1.2, 0.1, 'physical', 3.2, { hits: 3, hitIntervalMs: 400, maxTargets: 6 }), { type: 'debuff', stat: 'defPct', value: 15, perLevel: 2.5, durationSec: 6, radius: 3.2 }],
    description: 'ทุบ 3 ครั้ง รัศมี 3.2 ม. สูงสุด 6 เป้า แล้วลดเกราะศัตรู 15–25% นาน 6 วินาที' }),
  active(B, { id: 'r-soul-reave', name: 'Soul Reave', th: 'พิพากษาวิญญาณ', motion: 'Attack', fx: 'attack', mp: 0, rage: 35, cd: 20, range: 2.6, evolvesFrom: 'b-execution-frenzy',
    effects: [dmg('single', 1.0, 0.1, 'physical', 0, { hits: 2, hitIntervalMs: 350, execute: { below: 0.35, mul: 1.4 } }), dmg('single', 3.5, 0.1, 'physical', 0, { delayMs: 900, execute: { below: 0.35, mul: 1.4 } })],
    description: 'ฟันเปิด 2 ครั้งแล้วปิดฉาก 350% · เป้าที่ HP ≤ 35% รับดาเมจ ×1.4' }),
  active(B, { id: 'r-cataclysm-descent', name: 'Cataclysm Descent', th: 'จุติมหาวินาศ', motion: 'Special', fx: 'special', mp: 0, rage: 90, cd: 80, range: 8, ultimate: true, evolvesFrom: 'b-whirlwind',
    effects: [dmg('circle', 4, 1, 'physical', 3, { delayMs: 900, maxTargets: 8 }), dmg('circle', 8, 2, 'physical', 6, { delayMs: 1500, maxTargets: 12 })],
    description: 'ท่าไม้ตาย: กระโดดฟาดลงพื้น — กระแทก 400% รัศมี 3 ม. แล้วระเบิด 2 เท่าของแรงกระแทก รัศมี 6 ม.' }),
  passive(B, 'r-dreadweapon-mastery', 'Dreadweapon Mastery', 'ชำนาญศาสตราพินาศ', [{ stat: 'atkPct', perLevel: 3.2 }], 'พลังโจมตี +3.2% ต่อเลเวล (สูงสุด 16%) · แทน Greatweapon Mastery', 'b-greatweapon-mastery'),
  passive(B, 'r-slaughter-tempo', 'Slaughter Tempo', 'จังหวะเข่นฆ่า', [{ stat: 'atkSpeed', perLevel: 3.6 }], 'ความเร็วโจมตี +3.6% ต่อเลเวล (สูงสุด 18%) · แทน Blood Tempo', 'b-blood-tempo'),
  passive(B, 'r-deathless-wrath', 'Deathless Wrath', 'โทสะใกล้ตาย', [{ stat: 'lowHpDmg', perLevel: 4 }], 'เมื่อ HP ≤ 40% ทำดาเมจ +4% ต่อเลเวล (สูงสุด 20%) · แทน Red Resolve', 'b-red-resolve'),
  passive(B, 'r-soul-harvest', 'Soul Harvest', 'เก็บเกี่ยววิญญาณ', [{ stat: 'lifesteal', perLevel: 0.8 }], 'ดูดเลือด +0.8% ต่อเลเวล (สูงสุด 4%) · แทน Blood Harvest', 'b-blood-harvest'),
  passive(B, 'r-iron-frenzy', 'Iron Frenzy', 'คลั่งไม่หวั่นไหว', [{ stat: 'slowResist', perLevel: 5 }], 'ลดเวลาติดสถานะช้าลง 5% ต่อเลเวล (สูงสุด 25%) · แทน Unbroken Fury', 'b-unbroken-fury'),
  passive(B, 'r-abyssal-rage', 'Abyssal Rage', 'โทสะห้วงลึก', [{ stat: 'rageGain', perLevel: 6 }], 'ได้ Rage เพิ่ม 6% ต่อเลเวล (สูงสุด 30%) · แทน Rage Conduit', 'b-rage-conduit'),
];

/** Berserker on the left (active · passive, unlocked by level), Reaver on the right (after the advancement) */
const trees: SkillLibrary['trees'] = {
  ...CLASS_TREES,
  Berserker: [
    node('b-rending-rush', 1, 0, 1), node('b-greatweapon-mastery', 1, 1, 2), reaver('r-savage-rend', 1, 2), reaver('r-dreadweapon-mastery', 1, 3),
    node('b-blood-howl', 2, 0, 3), node('b-blood-tempo', 2, 1, 4), reaver('r-dread-howl', 2, 2), reaver('r-slaughter-tempo', 2, 3),
    node('b-carnage-cyclone', 3, 0, 5), node('b-red-resolve', 3, 1, 6), reaver('r-reaping-cyclone', 3, 2), reaver('r-deathless-wrath', 3, 3),
    node('b-bloodquake', 4, 0, 8), node('b-blood-harvest', 4, 1, 9), reaver('r-ruinbreaker', 4, 2), reaver('r-soul-harvest', 4, 3),
    node('b-execution-frenzy', 5, 0, 12), node('b-unbroken-fury', 5, 1, 11), reaver('r-soul-reave', 5, 2), reaver('r-iron-frenzy', 5, 3),
    node('b-whirlwind', 6, 0, 15), node('b-rage-conduit', 6, 1, 14), reaver('r-cataclysm-descent', 6, 2), reaver('r-abyssal-rage', 6, 3),
  ],
};
export const DEFAULT_SKILLS: SkillLibrary = { defs: [...defs, ...CLASS_DEFS], trees };
export { CLASS_EXTRA };
/** What Space / Q / E cast for a fresh character (slots 4–6 are taught by quests: Carnage Cyclone, Execution Frenzy, Whirlwind). */
export const DEFAULT_HOTBAR: Record<Cls, { skill: string; buff: string; special: string }> = {
  ...CLASS_HOTBAR,
  Berserker: { skill: 'b-rending-rush', buff: 'b-blood-howl', special: 'b-bloodquake' },
};
/** the skill actually cast from a slot: its Reaver evolution once that one is learned */
export function evolvedSkill(lib: SkillLibrary, id: string | null, levels: Record<string, number>): string | null {
  if (!id) return id; const e = lib.defs.find(d => d.evolvesFrom === id && (levels[d.id] ?? 0) > 0); return e ? e.id : id;
}
/** Reaver skills granted at rank 1 on the advancement (balance proposal: new_skill_initial_rank 1) */
export const REAVER_SKILLS = defs.filter(d => d.promotion === 'Reaver').map(d => d.id);
