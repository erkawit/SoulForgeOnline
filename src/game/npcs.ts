// Town NPCs stand in front of the building of their trade. The capitals follow the mmorpg-world-assets city maps
// (world/capitalPlan.ts): all nine service buildings stand in every capital, so every service is in every city, and each NPC
// waits a step in front of the door of the building whose sign matches their trade (on the camera side, never hidden).
// Ranger Kestrel (Thornwatch's hunter) waits beside the guardhouse there, next to Orrin and the gates out to the hunt.
// Art: public/art/sprites/npc-<slug>.webp (Ranger Kestrel is a placeholder made from the female archer sheet).
import type { CityId, MainCityId } from './content';
import { ROLES, doorSpot, buildingOf } from './world/capitalPlan';

export type NpcService = 'guide' | 'shop' | 'enhance' | 'starter' | 'buyer' | 'blessing' | 'market' | 'skills' | 'travel' | 'hunting';
export type Npc = {
  id: string; name: string; th: string; title: string; service: NpcService; color: string; icon: string;
  greeting: string[]; look: string; personality: string;
};
export const NPCS: Npc[] = [
  { id: 'guide', name: 'Elder Corvin', th: 'ผู้เฒ่าคอร์วิน', title: 'ผู้นำทางโลกใหม่', service: 'guide', color: '#9fd1ff', icon: '✧',
    greeting: ['ยินดีต้อนรับสู่ SoulForge เจ้าหนู ข้าจะอธิบายทุกอย่างให้ฟัง', 'อยากรู้เรื่องไหน ถามข้าได้ทุกเมื่อ'],
    look: 'ชายชราตัวเล็กหลังค่อม เคราขาวยาวถึงพื้น ฮู้ดสีน้ำเงินเข้ม ถือตะเกียงวิญญาณสีฟ้าและหนังสือเล่มหนา', personality: 'ใจดี พูดช้า ชอบเล่าตำนาน' },
  { id: 'shop', name: 'Mira Ashvale', th: 'มิร่า แอชเวล', title: 'ร้านของใช้', service: 'shop', color: '#ffb37a', icon: '⚗',
    greeting: ['ยา ม้วนคัมภีร์ ของจำเป็นสำหรับนักผจญภัย มีครบ!', 'ราคายุติธรรม ไม่ต่อนะ~'],
    look: 'สาวผมส้มหางม้า สะพายเป้ใหญ่ที่ห้อยขวดยาสีสด ผ้ากันเปื้อนสีน้ำตาล', personality: 'ร่าเริง พูดเร็ว ขี้เล่น' },
  { id: 'merchant', name: 'Brannoc Ironhand', th: 'แบรนน็อค มือเหล็ก', title: 'NPC Merchant · ช่างตีบวก', service: 'enhance', color: '#ff7a45', icon: '⚒',
    greeting: ['เอาอาวุธมา ข้าจะตีให้มันร้องเพลง', 'ตีบวกได้ที่ข้าที่เดียวในเมือง จำไว้'],
    look: 'ชายร่างหนาเคราแดงถักเปีย ผ้ากันเปื้อนหนัง แขนข้างหนึ่งเป็นถุงมือเหล็ก ถือค้อนที่ร้อนจนเรืองส้ม', personality: 'เสียงดัง ตรงไปตรงมา ภูมิใจในฝีมือ' },
  { id: 'supplier', name: 'Quartermaster Hale', th: 'เสนาธิการเฮล', title: 'แจกอุปกรณ์เริ่มต้น', service: 'starter', color: '#c9d38a', icon: '⛨',
    greeting: ['ทหารใหม่? รับชุดเริ่มต้นตามอาชีพไปได้เลย คนละชุด', 'อุปกรณ์ดีคือครึ่งหนึ่งของชัยชนะ'],
    look: 'ทหารผ่านศึกหญิงผมสั้นสีเทา ผ้าคาดตาข้างหนึ่ง เกราะหนังพร้อมกล่องเสบียง', personality: 'เคร่งครัด แต่ห่วงใยมือใหม่' },
  { id: 'buyer', name: 'Old Jessa', th: 'ยายเจสซ่า', title: 'รับซื้อไอเทม', service: 'buyer', color: '#d9c07a', icon: '⚖',
    greeting: ['ของไม่ใช้ ขายให้ยายเถอะ ยายให้ราคามาตรฐาน', 'ยายรับซื้อทุกอย่าง ยกเว้นวิญญาณเจ้านะ'],
    look: 'ยายตัวจิ๋วใส่แว่นกลมหนาเตอะ ผ้าคลุมไหล่ลายดาว ถือตาชั่งทองเหลือง', personality: 'ช่างต่อรอง ขี้บ่น แต่ซื่อตรง' },
  { id: 'blessing', name: 'Sister Lumen', th: 'ซิสเตอร์ลูเมน', title: 'พรสำหรับผู้มาใหม่', service: 'blessing', color: '#ffe7a0', icon: '✚',
    greeting: ['ขอแสงนำทางเจ้า ผู้มาใหม่', 'พรของข้าช่วยได้ถึงช่วงหนึ่ง หลังจากนั้นจงพึ่งเสียงคำรามแห่งเลือดของเจ้าเอง'],
    look: 'แม่ชีสาวชุดขาวครีม ผ้าคลุมผมพร้อมวงแหวนแสง ถือคทาประดับดวงอาทิตย์เล็ก', personality: 'อ่อนโยน สงบ พูดเป็นบทสวด' },
  { id: 'broker', name: 'Silas Vane', th: 'ไซลัส เวน', title: 'นายหน้าตลาด SoulGod', service: 'market', color: '#b685ff', icon: '◈',
    greeting: ['ตลาดของข้ามีกฎ ราคาขั้นต่ำ ภาษี และไม่มีใครปั่นราคาได้', 'ซื้อขายกับผู้เล่นทั่วอาณาจักร ผ่านข้า'],
    look: 'ชายผอมสูงใส่หมวกทรงสูงสีม่วง แว่นข้างเดียว สมุดบัญชีและเหรียญ SoulGod ลอยวนรอบตัว', personality: 'สุภาพ เจ้าเล่ห์นิดๆ รักตัวเลข' },
  { id: 'mentor', name: 'Master Ysolde', th: 'อาจารย์อีโซลด์', title: 'ครูสอนสกิล', service: 'skills', color: '#62dfdf', icon: '✺',
    greeting: ['ต้นไม้สกิลของเจ้าเติบโตตามการเลือก', 'เลือกผิด? ข้ารีเซ็ตให้ได้ แต่มีค่าตอบแทน'],
    look: 'นักดาบหญิงวัยกลางคน ผมเงินมวยสูง เสื้อคลุมยาวสีเขียวหัก ห้อยดาบไม้และม้วนคัมภีร์', personality: 'ใจเย็น ฉลาด พูดน้อยแต่คม' },
  { id: 'warden', name: 'Gatewarden Orrin', th: 'ผู้เฝ้าประตูออร์ริน', title: 'เดินทาง / วาร์ป', service: 'travel', color: '#8bdb9a', icon: '⟁',
    greeting: ['จะไปเมืองหลวงไหน บอกมา ประตูวิญญาณเปิดให้เสมอ — ส่วนทุ่งล่า เดินออกประตูวาร์ปที่มุมเมืองได้เลยไม่เสียเงิน', 'ค่าผ่านทางเล็กน้อย เพื่อหล่อเลี้ยงศิลาวาร์ป'],
    look: 'ยักษ์ใหญ่ใจดีในเกราะหินมีมอส ถือหอกที่ปลายเป็นคริสตัลเขียว', personality: 'พูดช้า หนักแน่น ซื่อสัตย์' },
  { id: 'ranger', name: 'Ranger Kestrel', th: 'พรานเคสเทรล', title: 'พรานป่า · จุดล่าและเสบียง', service: 'hunting', color: '#a7d693', icon: '➶',
    greeting: ['ในกำแพงนี้ปลอดภัย แต่หลังประตูวาร์ปทั้งสี่มุมไม่ใช่ — ช่องเขารากมังกรกับป่าหนามอสูรรอนักล่าฝีมือดีอยู่', 'อยากออกล่า? กินให้อิ่มก่อน แล้วข้าจะบอกว่าประตูไหนพาไปที่ใด'],
    look: 'พรานหญิงผมสีเถ้า ผ้าคลุมเขียวป่าขาดรุ่ย สะพายธนูไม้ดำและกระบอกลูกธนูขนเหยี่ยว', personality: 'พูดสั้น ห้วน แต่ดูแลคนในเมือง' },
];
export const NPC_BY_ID = Object.fromEntries(NPCS.map(n => [n.id, n])) as Record<string, Npc>;
export const NPC_CITIES: MainCityId[] = ['hollow', 'dawnveil', 'thornwatch'];
export const TALK_RANGE = 3.2;
/** where each NPC stands: in front of the door of their building (capitalPlan.doorSpot) */
function spots(city: MainCityId): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = Object.fromEntries(ROLES.map(r => [r, doorSpot(city, r)]));
  if (city === 'thornwatch') { // beside the guardhouse, a pace to the side of Orrin
    const w = buildingOf(city, 'warden'), [x, z] = out.warden, sx = Math.cos(w.facing), sz = -Math.sin(w.facing);
    out.ranger = [Math.round((x + sx * 2.2) * 100) / 100, Math.round((z + sz * 2.2) * 100) / 100];
  }
  return out;
}
export const NPC_SPOTS: Record<MainCityId, Record<string, [number, number]>> = { hollow: spots('hollow'), dawnveil: spots('dawnveil'), thornwatch: spots('thornwatch') };
const mainOf = (city: CityId | undefined): MainCityId => (city && (NPC_CITIES as string[]).includes(city) ? city : 'hollow') as MainCityId;
/** the NPCs working in a city (empty outside the three main cities) */
export function npcsIn(city: CityId | undefined): Npc[] {
  if (!city || !(NPC_CITIES as string[]).includes(city)) return [];
  return NPCS.filter(n => NPC_SPOTS[city as MainCityId][n.id]);
}
export function npcPosition(n: Npc, city?: CityId): [number, number] {
  const c = mainOf(city); return NPC_SPOTS[c][n.id] ?? NPC_SPOTS.hollow[n.id] ?? Object.values(NPC_SPOTS).find(m => m[n.id])![n.id];
}
/** the cities an NPC can be found in (for the guide / wiki) */
export const npcHomes = (n: Npc): MainCityId[] => NPC_CITIES.filter(c => NPC_SPOTS[c][n.id]);
/** NPC id used by the SQL `enhance_item` check. */
export const merchantKey = (city: CityId) => `merchant-${city}`;
export function nearNpc(city: CityId | undefined, pos: [number, number], service: NpcService, range = TALK_RANGE + 1) {
  return npcsIn(city).some(n => { if (n.service !== service) return false; const [x, z] = npcPosition(n, city); return Math.hypot(x - pos[0], z - pos[1]) <= range; });
}

/** Starter-kit contents per class (catalog ids). One kit per character class. */
/** round 13: the Berserker kit — a Common greatsword (two-handed, no off-hand) + 4 pieces of heavy armour */
export const STARTER_KITS: Record<string, string[]> = {
  Berserker: ['weapon-Berserker-0', 'heavy-armor-0', 'heavy-helmet-0', 'heavy-gloves-0', 'heavy-boots-0'],
  // round 22: every class gets its own weapon + the shared armour set
  ...Object.fromEntries(['Paladin', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor'].map(c => [c, [`weapon-${c}-0`, 'heavy-armor-0', 'heavy-helmet-0', 'heavy-gloves-0', 'heavy-boots-0']])),
};
export type ShopItem = { id: string; name: string; th: string; price: number; effect: { hp?: number; mp?: number; hpPct?: number; mpPct?: number; returnHome?: boolean; protect?: boolean; revive?: boolean } };
export const SHOP_ITEMS: ShopItem[] = [
  { id: 'potion-hp-s', name: 'Small Healing Draught', th: 'ยาฟื้น HP เล็ก', price: 30, effect: { hp: 120 } },
  { id: 'potion-hp-m', name: 'Healing Draught', th: 'ยาฟื้น HP', price: 120, effect: { hpPct: 35 } },
  { id: 'potion-hp-l', name: 'Greater Healing Draught', th: 'ยาฟื้น HP ใหญ่', price: 480, effect: { hpPct: 70 } },
  { id: 'potion-mp-s', name: 'Small Mana Tonic', th: 'ยาฟื้น MP เล็ก', price: 30, effect: { mp: 80 } },
  { id: 'potion-mp-m', name: 'Mana Tonic', th: 'ยาฟื้น MP', price: 120, effect: { mpPct: 40 } },
  { id: 'scroll-return', name: 'Return Scroll', th: 'คัมภีร์กลับเมือง', price: 80, effect: { returnHome: true } },
  // round 25: revive where you fell (50 % HP / MP) — priced well above potions so dying still costs something
  { id: 'scroll-revive', name: 'Scroll of Resurrection', th: 'ม้วนคัมภีร์ชุบชีวิต', price: 2500, effect: { revive: true } },
];
export const REVIVE_SCROLL = 'scroll-revive';
export const PROTECTION_SCROLL: ShopItem = { id: 'scroll-protect', name: 'Enhancement Protection Scroll', th: 'คัมภีร์ป้องกันการตีบวก', price: 25000, effect: { protect: true } };

export const GUIDE_TOPICS: { id: string; title: string; body: string[] }[] = [
  { id: 'controls', title: 'การควบคุม', body: ['WASD เดิน · คลิกมอนสเตอร์เพื่อไล่ตีอัตโนมัติ · ลากเมาส์หมุนกล้อง', 'Space สกิลหลัก · Q บัฟ · E ท่าพิเศษ (ตั้งได้ที่ต้นไม้สกิล) · I กระเป๋า · K ต้นไม้สกิล', 'คลิก NPC ในลานเมืองเพื่อพูดคุยและใช้บริการ'] },
  { id: 'stats', title: 'สเตตัส 6 ค่า', body: ['STR INT DEX AGI WIS VIT เป็นค่าพื้นฐานตายตัว (Berserker / Reaver) ผู้เล่นไม่ต้องอัปค่าเอง', '1 แต้มมีผลชัดเจน เช่น STR +1 = โจมตี +4, VIT +1 = HP +18', 'เพิ่มสเตตัสได้จากออปชันบนอุปกรณ์ระดับ Rare ขึ้นไปเท่านั้น'] },
  { id: 'gear', title: 'ระดับอุปกรณ์และออปชัน', body: ['Rare +1 สเตตัส · Epic +2 · Legendary +3 · God/Pre-arch/Arch +4 สเตตัส', 'God มีค่าพิเศษ 1 ค่า · Pre-arch 2 ค่า · Arch 3 ค่า เช่น ATK% DEF% คริ ลดคูลดาวน์', 'ค่าพิเศษแรงขึ้นเท่าตัวทุกระดับ: God ×1 · Pre-arch ×2 · Arch ×4', 'อาวุธและชุดเกราะล็อกตามอาชีพ ใส่ข้ามอาชีพไม่ได้'] },
  { id: 'enhance', title: 'การตีบวก', body: ['ตีบวกได้ที่ Brannoc Ironhand (NPC Merchant) ในเมืองเท่านั้น', '+1 ถึง +6 ตีพลาดไม่ลดขั้น · ตั้งแต่ +7 พลาดแล้วลด 1 ขั้น ใช้คัมภีร์ป้องกันกันลดขั้นได้', 'ค่าตีบวกทุกเหรียญถูกนำออกจากระบบ (เบิร์น) เพื่อรักษามูลค่า SoulGod'] },
  { id: 'market', title: 'ตลาดและ SoulGod', body: ['ลงขายผ่าน Silas Vane ได้ทุกราคาที่ไม่ต่ำกว่าราคาขั้นต่ำ (ไม่มีเพดาน)', 'ค่าลงขาย 1% ไม่คืน และภาษีการขาย 5% ถูกเบิร์นทั้งหมด', 'ยกเลิกแล้วต้องรอ 30 นาทีก่อนลงใหม่ ราคาขั้นต่ำขยับตามราคากลาง 7 วัน กันการปั่นราคา'] },
  { id: 'buffs', title: 'บัฟ', body: ['Sister Lumen ให้พรมือใหม่ เลเวล 1–10 ได้บัฟ Lv1 · 11–20 Lv2 · 21–30 Lv3 (ทีมงานปรับช่วงได้)', 'หลังจากนั้นใช้ Blood Howl (Q) และอาหารบัฟ (15 นาที) จากร้านค้า', 'บัฟชนิดเดียวกันไม่ทบกัน ระบบใช้ค่าที่สูงที่สุด'] },
  { id: 'skills', title: 'ต้นไม้สกิล', body: ['ได้ 1 แต้มสกิลทุกเลเวล และโบนัสอีก 1 แต้มทุก 10 เลเวล', 'แต่ละแถวปลดล็อกที่เลเวล 1 / 5 / 12 / 25 / 40 และบางสกิลต้องอัปสกิลก่อนหน้าก่อน', 'ตั้งสกิลใดก็ได้ที่เรียนแล้วลงปุ่ม Space / Q / E · รีเซ็ตแต้มได้ที่ Master Ysolde ณ สำนักฝึกของทุกเมืองหลวง (มีค่าใช้จ่าย)'] },
];
