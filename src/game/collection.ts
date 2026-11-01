// Round 17: the Collection book (สมุดสะสม · Collection), in the style of NightCrows' collection system.
// Every collection is a set of specific items (with a minimum enhance level). Each item is registered on its own — it
// leaves the bag for good — and the set shows how many are in (2/4). A finished set gives a small permanent bonus.
// The old monster codex (loot → tiers I–V, src/game/codex.ts) is the "ของจากมอนสเตอร์" tab of the same book.
//
// Registrations live in the same saved map as the monster codex (`codex`), under keys `col:<setId>.<index>`, so the
// realm sync, the cloud save and the stat sum need no new storage. Fashion sets are filled by owning the pieces (they
// stay in the wardrobe) and give a title only: nothing sold for money changes stats.
import type { SpecialKey } from './balance/config';
import { RARITIES, weaponId, type WeaponKind } from './items';
import { STAT_LABEL } from './codex';

export type CollectionTab = 'weapon' | 'armor' | 'accessory' | 'fashion';
export type NeedItem = { id: string; plus: number };
export type CollectionSet = { id: string; tab: CollectionTab; th: string; tier: number; needs: NeedItem[]; reward: Partial<Record<SpecialKey, number>>; title?: string };
export const COLLECTION_TABS: [CollectionTab | 'monster', string][] = [['weapon', 'อาวุธ'], ['armor', 'เกราะ'], ['accessory', 'เครื่องประดับ'], ['fashion', 'แฟชั่น'], ['monster', 'ของจากมอนสเตอร์']];
export const RARITY_TH = ['ธรรมดา', 'ดี', 'หายาก', 'ยอดเยี่ยม', 'ตำนาน', 'เทพ', 'บรรพกาล', 'อาร์ค'];

const KINDS: WeaponKind[] = ['greatsword', 'greataxe', 'greathammer'];
const ARMOR = ['armor', 'helmet', 'gloves', 'boots'] as const;
const ARMOR_SETS = ['Ironbound', 'Mossguard', 'Azure Bastion', 'Duskwarden', 'Blood Regent', 'Sun Sentinel', 'Solar Sovereign', 'Astral Bulwark'];
const step = (a: number[], t: number) => a[Math.min(t, a.length - 1)];

function build(): CollectionSet[] {
  const out: CollectionSet[] = [];
  for (let t = 0; t < 8; t++) {
    out.push({ id: `w${t}`, tab: 'weapon', tier: t, th: `คลังอาวุธ${RARITY_TH[t]}`, needs: KINDS.map(k => ({ id: weaponId(k, t), plus: 0 })), reward: { atkPct: step([0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5], t) } });
    out.push({ id: `a${t}`, tab: 'armor', tier: t, th: `ชุด ${ARMOR_SETS[t]}`, needs: ARMOR.map(s => ({ id: `heavy-${s}-${t}`, plus: 0 })), reward: { hpPct: step([0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5], t) } });
    out.push({ id: `r${t}`, tab: 'accessory', tier: t, th: `ตราคู่${RARITY_TH[t]}`, needs: ['defense', 'physical'].map(f => ({ id: `accessory-${f}-${t}`, plus: 0 })), reward: { critRate: step([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6], t) } });
  }
  // enhanced sets: the same pieces at +3 and +5 for the first four grades
  for (let t = 0; t < 4; t++) for (const plus of [3, 5]) {
    out.push({ id: `w${t}p${plus}`, tab: 'weapon', tier: t, th: `คลังอาวุธ${RARITY_TH[t]} +${plus}`, needs: KINDS.map(k => ({ id: weaponId(k, t), plus })), reward: plus === 3 ? { critDmg: step([0.5, 0.75, 1, 1.25], t) } : { bossDmg: step([0.5, 0.75, 1, 1.25], t) } });
    out.push({ id: `a${t}p${plus}`, tab: 'armor', tier: t, th: `ชุด ${ARMOR_SETS[t]} +${plus}`, needs: ARMOR.map(s => ({ id: `heavy-${s}-${t}`, plus })), reward: plus === 3 ? { defPct: step([0.4, 0.6, 0.8, 1], t) } : { dmgReduce: step([0.2, 0.3, 0.4, 0.5], t) } });
  }
  // fashion: owning the pieces fills the set (titles only)
  out.push({ id: 'f-wings', tab: 'fashion', tier: 4, th: 'ปีกแห่งหิมพานต์', needs: ['wings-thai-garuda', 'wings-thai-ruby', 'wings-thai-kinnari'].map(id => ({ id, plus: 0 })), reward: {}, title: 'ผู้โบยบินแห่งหิมพานต์' });
  out.push({ id: 'f-thai', tab: 'fashion', tier: 4, th: 'ชุดไทยขาวทองครบชุด', needs: ['costume-thai-white-gold', 'skin-thai-naga-greatsword', 'aura-thai-ivory'].map(id => ({ id, plus: 0 })), reward: {}, title: 'อัศวินขาวทอง' });
  out.push({ id: 'f-light', tab: 'fashion', tier: 2, th: 'แสงและเปลวไฟ', needs: ['wings-dawn', 'aura-ember'].map(id => ({ id, plus: 0 })), reward: {}, title: 'ผู้ถือแสงรุ่งอรุณ' });
  return out.sort((a, b) => a.tab.localeCompare(b.tab) || a.tier - b.tier || a.needs[0].plus - b.needs[0].plus);
}
export const COLLECTIONS: CollectionSet[] = build();
export const COLLECTION_BY_ID: Record<string, CollectionSet> = Object.fromEntries(COLLECTIONS.map(c => [c.id, c]));
export const STAT_TH: Partial<Record<SpecialKey, string>> = { ...STAT_LABEL, dmgReduce: 'ลดดาเมจที่ได้รับ' };
export { RARITIES };

type Saved = Record<string, number>;
export const colKey = (setId: string, i: number) => `col:${setId}.${i}`;
/** is this saved key a valid collection slot? (cleanCodex keeps it) */
export function isColKey(k: string) { const m = /^col:([\w-]+)\.(\d+)$/.exec(k); if (!m) return false; const c = COLLECTION_BY_ID[m[1]]; return !!c && c.tab !== 'fashion' && +m[2] < c.needs.length; }
/** which slots of a set are filled (fashion: owned pieces) */
export function filled(set: CollectionSet, saved: Saved | undefined, owned: string[] = []): boolean[] {
  return set.needs.map((n, i) => set.tab === 'fashion' ? owned.includes(n.id) : !!saved?.[colKey(set.id, i)]);
}
export const isDone = (set: CollectionSet, saved: Saved | undefined, owned: string[] = []) => filled(set, saved, owned).every(Boolean);
/** the permanent bonus of every finished (non-fashion) set */
export function collectionBonus(saved: Saved | undefined): Partial<Record<SpecialKey, number>> {
  const out: Partial<Record<SpecialKey, number>> = {}; if (!saved) return out;
  for (const c of COLLECTIONS) if (c.tab !== 'fashion' && isDone(c, saved)) for (const [k, v] of Object.entries(c.reward) as [SpecialKey, number][]) out[k] = Math.round(((out[k] ?? 0) + v) * 100) / 100;
  return out;
}
export const collectionTitles = (saved: Saved | undefined, owned: string[]) => COLLECTIONS.filter(c => c.title && isDone(c, saved, owned)).map(c => c.title!);
export const rewardText = (r: Partial<Record<SpecialKey, number>>) => Object.entries(r).map(([k, v]) => `${STAT_TH[k as SpecialKey] ?? k} +${v}%`).join(' · ');
