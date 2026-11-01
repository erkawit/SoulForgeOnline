// Round 11: the monster codex (สมุดสะสม). Monsters drop "loot" (junk with a use): sell it to the shop, trade it on the
// market, or register it here for a small permanent bonus. Data only — the rules that spend items live in
// src/game/economy/codex.ts so the realm and the client run the same code.
//
// The design (docs/ROUND11_CODEX_TH.md):
//  • 24 loot entries (the user's art sheet "Fantasy Monster Materials", 6 × 4), each with five tiers. Every tier gives
//    the same small bonus, but costs more loot than the one before (10 / 25 / 50 / 100 / 200), so the last tiers are
//    mostly prestige. Tier IV–V also need Codex Seals, which drop from elites — three times as often with a party
//    member nearby — and from bosses.
//  • Totals per stat are capped (config.codex.caps): a full codex is a few percent, never a requirement for content.
//  • Loot is tradeable until it is registered, and a character far above a monster gets less of its loot, so veterans
//    buy from newer players instead of farming starter fields.
//  • Finished categories give titles (cosmetic), shown to other players.
import type { GameConfig, SpecialKey } from './balance/config';

export type LootCategory = 'beast' | 'vermin' | 'kin' | 'undead' | 'arcane' | 'dragon';
export type LootDef = { id: string; index: number; en: string; th: string; sell: number; stat: SpecialKey; category: LootCategory; monsters: string[] };

/** [en, th, NPC price, stat, category, monsters that drop it] in art-sheet order (loot_01 … loot_24) */
const ROWS: [string, string, number, SpecialKey, LootCategory, string[]][] = [
  ['Wolf Fang', 'เขี้ยวหมาป่า', 3, 'atkPct', 'beast', ['Ash Hound']],
  ['Dire Wolf Pelt', 'หนังหมาป่าดุร้าย', 4, 'hpPct', 'beast', ['Briar Wolf']],
  ['Boar Tusk', 'เขี้ยวหมูป่า', 5, 'defPct', 'beast', ['Ironhide Rhino']],
  ['Bear Claw', 'กรงเล็บหมี', 6, 'critDmg', 'beast', ['Fen Maw Otter']],
  ['Bat Wing', 'ปีกค้างคาว', 7, 'moveSpeed', 'vermin', ['Moon Moth']],
  ['Spider Silk', 'ใยแมงมุม', 8, 'critRate', 'vermin', ['Thorn Spider', 'Venom Spider']],
  ['Scorpion Stinger', 'หางแมงป่อง', 9, 'critDmg', 'vermin', ['Tide Crab']],
  ['Serpent Scale', 'เกล็ดอสรพิษ', 10, 'defPct', 'vermin', ['Rime Serpent', 'Thorn Hydra']],
  ['Slime Gel', 'เมือกสไลม์', 11, 'hpPct', 'kin', ['Spore Beast']],
  ['Goblin Trinket', 'เครื่องรางก็อบลิน', 12, 'mpPct', 'kin', ['Root Weaver']],
  ['Kobold Pickaxe Shard', 'เศษจอบโคบอลด์', 13, 'defPct', 'kin', ['Anvil Guard']],
  ['Orc War Badge', 'ตราศึกออร์ค', 14, 'atkPct', 'kin', ['Oathscar Aurochs']],
  ['Cracked Bone', 'กระดูกร้าว', 15, 'defPct', 'undead', ['Bone Sentinel']],
  ['Rotten Cloth', 'ผ้าเปื่อยซอมบี้', 16, 'hpPct', 'undead', ['Grave Crawler']],
  ['Ghoul Nail', 'เล็บกูล', 17, 'critRate', 'undead', ['Crypt Crawler']],
  ['Ectoplasm', 'เศษไอวิญญาณ', 18, 'mpPct', 'undead', ['Frost Wraith', 'Astral Wraith', 'Tide Wraith']],
  ['Golem Core Chip', 'เศษแก่นโกเลม', 19, 'defPct', 'arcane', ['Crystal Golem', 'Furnace Golem', 'Crown Colossus']],
  ['Living Bark', 'เปลือกไม้มีชีวิต', 20, 'hpPct', 'arcane', ['Bark Guardian', 'Ancient Treant']],
  ['Harpy Feather', 'ขนฮาร์ปี', 21, 'moveSpeed', 'arcane', ['Reed Stalker', 'Halo Seraph']],
  ['Torn Cult Seal', 'ตราลัทธิฉีกขาด', 22, 'mpPct', 'arcane', ['Void Reaper', 'Root Reaper']],
  ['Imp Horn', 'เขาอิมป์', 23, 'atkPct', 'dragon', ['Slag Hound']],
  ['Ember Scale', 'เกล็ดเพลิง', 24, 'bossDmg', 'dragon', ['Cinder Beetle']],
  ['Emerald Shard', 'เศษผลึกมรกต', 25, 'critRate', 'dragon', ['Prism Sentinel']],
  ['Drake Tooth', 'เขี้ยวมังกรน้อย', 26, 'bossDmg', 'dragon', ['Ember Drake', 'Eclipse Drake']],
];
export const LOOT: LootDef[] = ROWS.map(([en, th, sell, stat, category, monsters], i) => ({ id: `loot-${String(i + 1).padStart(2, '0')}`, index: i, en, th, sell, stat, category, monsters }));
export const LOOT_BY_ID: Record<string, LootDef> = Object.fromEntries(LOOT.map(l => [l.id, l]));
export const LOOT_OF_SPECIES: Record<string, string> = Object.fromEntries(LOOT.flatMap(l => l.monsters.map(m => [m, l.id])));
export const isLoot = (definitionId: string | undefined | null) => !!definitionId && definitionId in LOOT_BY_ID;
export const CODEX_SEAL = 'codex-seal';
export const CODEX_TIERS = 5;
export const TIER_LABEL = ['—', 'I', 'II', 'III', 'IV', 'V'];

export const CATEGORY: Record<LootCategory, { th: string; collector: string; master: string }> = {
  beast: { th: 'สัตว์ป่า', collector: 'นักล่าแห่งพงไพร', master: 'เจ้าป่าผู้จารึก' },
  vermin: { th: 'สัตว์พิษและปีก', collector: 'ผู้รู้พิษ', master: 'ราชันแห่งพิษ' },
  kin: { th: 'เผ่าพันธุ์เร้นลับ', collector: 'นักสะสมเครื่องราง', master: 'ผู้ครองตราศึก' },
  undead: { th: 'อมตะและวิญญาณ', collector: 'ผู้เดินสุสาน', master: 'ผู้สะกดวิญญาณ' },
  arcane: { th: 'สิ่งปลุกเสก', collector: 'นักศึกษาอาคม', master: 'ปราชญ์แห่งแก่นศิลา' },
  dragon: { th: 'อสูรเพลิงและมังกร', collector: 'ผู้ต้านเปลวไฟ', master: 'ผู้พิชิตมังกร' },
};
export const GRAND_TITLE = 'ผู้จารึกตำนานอสูร';

export const STAT_LABEL: Partial<Record<SpecialKey, string>> = {
  atkPct: 'พลังโจมตี', hpPct: 'HP สูงสุด', defPct: 'พลังป้องกัน', critDmg: 'ความแรงคริติคอล', moveSpeed: 'ความเร็วเคลื่อนที่', critRate: 'โอกาสคริติคอล', mpPct: 'MP สูงสุด', bossDmg: 'ดาเมจต่อบอส',
};

/** loot id → registered tiers (0–5) */
export type Codex = Record<string, number>;
export const tierOf = (codex: Codex | undefined, id: string) => Math.max(0, Math.min(CODEX_TIERS, Math.floor(codex?.[id] ?? 0)));

/** the permanent bonus of a codex: per stat Σ(tiers × perTier), each total capped */
export function codexBonus(codex: Codex | undefined, cfg: GameConfig): Partial<Record<SpecialKey, number>> {
  const out: Partial<Record<SpecialKey, number>> = {}; if (!codex || !cfg.codex.enabled) return out;
  for (const l of LOOT) { const t = tierOf(codex, l.id); if (t) out[l.stat] = (out[l.stat] ?? 0) + t * (cfg.codex.perTier[l.stat] ?? 0); }
  for (const k of Object.keys(out) as SpecialKey[]) out[k] = Math.round(Math.min(out[k]!, cfg.codex.caps[k] ?? Infinity) * 100) / 100;
  return out;
}
