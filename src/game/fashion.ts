// Round 12: the wardrobe (ตู้เสื้อผ้า). Fashion never changes stats; it changes how the character looks.
// Slots: outfit (whole costume sprite), weapon skin, wings, cape, head, other (aura / pet-style extras).
// The catalog below is the built-in set; the back office adds more rows (Supabase table fashion_items, same shape) and the
// client merges them over this list (mergeFashion), so new fashion ships without a game patch.
//
// How a piece is drawn (2.5D sprites):
//  • outfit → replaces the hero sprite with `sprite` (per gender), e.g. 'thai' → art/sprites/costume-thai-<g>.webp
//  • every other slot → an overlay layer on the hero: `art` (an image per gender, or the same for both) placed by
//    `anchor` (fraction of the hero's height for y, of its width for x), `scale` (× hero height) and `behind` (drawn
//    behind the body: wings, capes) — or `procedural` for built-in drawn pieces until their painted art exists.
export type FashionSlot = 'outfit' | 'weapon' | 'wings' | 'cape' | 'head' | 'other';
export const FASHION_SLOTS: FashionSlot[] = ['outfit', 'weapon', 'wings', 'cape', 'head', 'other'];
export const FASHION_SLOT_TH: Record<FashionSlot, string> = { outfit: 'ชุดแฟชั่น', weapon: 'อาวุธแฟชั่น', wings: 'ปีก', cape: 'ผ้าคลุม', head: 'แฟชั่นศีรษะ', other: 'แฟชั่นอื่นๆ' };
export type FashionItem = {
  id: string; slot: FashionSlot; name: string; th: string; description?: string;
  /** cash shop price in Thai baht (null = not sold for money) and / or a SoulGod price (null = not sold for SoulGod) */
  priceTHB: number | null; priceSG: number | null;
  /** outfit: costume sprite key */ sprite?: string;
  /** overlay art: one image for both genders or one per gender (paths relative to the art base, e.g. 'fashion/wings-dawn.webp') */
  art?: string | { m: string; f: string };
  anchor?: [number, number]; scale?: number; behind?: boolean;
  /** built-in drawn overlay while no painted art exists */ procedural?: 'dawn-wings' | 'ember-aura';
  /** round 13 · overlay art with one cell per direction (S, SW, W, NW, N, NE, E, SE) for the 8-way heroes */ views?: 8;
  /** round 13 · animated overlay: cells per direction row, played at fps (auras, flags) */ frames?: number; fps?: number;
  /** round 13 · follows the layered hero's head every frame (helms, crowns) */ attach?: 'head'; /** a helm that replaces the hair */ hidesHair?: boolean;
  /** round 13 · weapon skin: the painted weapon sheet (public/art/anim/weapon/<sheet>.webp, 3 views, same grips) that replaces
   *  the equipped weapon's look on the layered Berserker — stats still come from the real weapon */ weaponSheet?: string;
  /** off = hidden in the shop (kept for owners) */ active: boolean; tag?: string;
  /** round 17 · shop / wardrobe icon (path under /art/, one per gender allowed). Built-in pieces use art/fashion/icons/<id>.webp */
  icon?: string | { m: string; f: string };
};
/** the picture shown on the wardrobe / Cash Shop card */
export function fashionIcon(f: FashionItem, g: 'm' | 'f' = 'm'): string | null {
  if (f.icon) return '/art/' + (typeof f.icon === 'string' ? f.icon : f.icon[g]);
  return BUILTIN_ICONS.has(f.id) ? `/art/fashion/icons/${f.id}${f.slot === 'outfit' ? '-' + g : ''}.webp` : null;
}
const BUILTIN_ICONS = new Set(['costume-thai-white-gold', 'wings-dawn', 'aura-ember', 'skin-thai-naga-greatsword', 'skin-thai-garuda-greataxe', 'skin-thai-lotus-greathammer',
  'wings-thai-garuda', 'wings-thai-ruby', 'wings-thai-kinnari', 'head-thai-garuda', 'aura-thai-ivory']);
export const FASHION_SLOT_ICON: Record<FashionSlot, string> = { outfit: '👘', weapon: '⚔', wings: '🪽', cape: '🧥', head: '👑', other: '✦' };
export const FASHION: FashionItem[] = [
  { id: 'costume-thai-white-gold', slot: 'outfit', name: 'Thai White & Gold Attire', th: 'ชุดไทยขาวทอง', description: 'ชุดไทยพิธีการสีขาวทอง ใส่ได้ทั้ง Berserker และ Reaver ชาย/หญิง · ไม่มีค่าสเตตัส', priceTHB: 349, priceSG: null, sprite: 'thai', active: true, tag: 'ใหม่' },
  { id: 'wings-dawn', slot: 'wings', name: 'Dawnlight Wings', th: 'ปีกแสงรุ่งอรุณ', description: 'ปีกแสงสีทองเรืองรองด้านหลังตัวละคร', priceTHB: 199, priceSG: null, procedural: 'dawn-wings', anchor: [0.5, 0.6], scale: 1.35, behind: true, active: true },
  // ---- round 13: the Thai ceremonial set for the Berserker / Reaver (art: output/thai-fashion-codex → Codex)
  { id: 'skin-thai-naga-greatsword', slot: 'weapon', name: 'Naga Ivory Greatsword', th: 'ดาบใหญ่นาคาคู่งาช้าง', description: 'อาวุธแฟชั่น: เปลี่ยนรูปอาวุธที่ถือเป็นดาบใหญ่ลายไทยงาช้างทอง (ค่าพลังมาจากอาวุธจริง)', priceTHB: 299, priceSG: null, weaponSheet: 'thai-greatsword', active: true, tag: 'thai' },
  { id: 'skin-thai-garuda-greataxe', slot: 'weapon', name: 'Garuda Twin-Moon Greataxe', th: 'ขวานคู่จันทร์ครุฑ', description: 'อาวุธแฟชั่น: ขวานใหญ่สองคมลายไทยทอง (ค่าพลังมาจากอาวุธจริง)', priceTHB: 299, priceSG: null, weaponSheet: 'thai-greataxe', active: false /* round 17: no in-game art yet — hidden from the shop */, tag: 'thai' },
  { id: 'skin-thai-lotus-greathammer', slot: 'weapon', name: 'Golden Lotus Greathammer', th: 'ค้อนใหญ่บัวทอง', description: 'อาวุธแฟชั่น: ค้อนใหญ่หัวบัวลายไทย (ค่าพลังมาจากอาวุธจริง)', priceTHB: 299, priceSG: null, weaponSheet: 'thai-greathammer', active: false /* round 17: no in-game art yet — hidden from the shop */, tag: 'thai' },
  { id: 'wings-thai-garuda', slot: 'wings', name: 'Golden Garuda Wings', th: 'ปีกครุฑทอง', description: 'ปีกขนนกสีทองงาช้าง ขยับตามทิศตัวละคร', priceTHB: 249, priceSG: null, art: 'fashion/wings-thai-garuda.webp', views: 8, frames: 8, fps: 8, anchor: [0.5, 0.62], scale: 1.3, behind: true, active: true, tag: 'thai' },
  { id: 'wings-thai-ruby', slot: 'wings', name: 'Ruby Hamsa Wings', th: 'ปีกหงส์ทับทิม', description: 'ปีกทองประดับทับทิม', priceTHB: 249, priceSG: null, art: 'fashion/wings-thai-ruby.webp', views: 8, frames: 8, fps: 8, anchor: [0.5, 0.62], scale: 1.3, behind: true, active: true, tag: 'thai' },
  { id: 'wings-thai-kinnari', slot: 'wings', name: 'Kinnari Veil Wings', th: 'ปีกกินรี', description: 'ปีกบางใสลายกินรี', priceTHB: 249, priceSG: null, art: 'fashion/wings-thai-kinnari.webp', views: 8, frames: 8, fps: 8, anchor: [0.5, 0.62], scale: 1.25, behind: true, active: true, tag: 'thai' },
  { id: 'head-thai-garuda', slot: 'head', name: 'Garuda Battle Crown', th: 'มงกุฎหน้ากากครุฑ', description: 'มงกุฎศึกหน้าครุฑ สวมแทนทรงผม', priceTHB: 199, priceSG: null, art: 'fashion/head-thai-garuda.webp', views: 8, attach: 'head', hidesHair: true, anchor: [0.5, 0.82], scale: 0.42, active: false /* round 17: no in-game art yet — hidden from the shop */, tag: 'thai' },
  { id: 'aura-thai-ivory', slot: 'other', name: 'Ivory Gold Aura', th: 'ออร่าทองงาช้าง', description: 'วงแสงทองและประกายลอยรอบตัว', priceTHB: null, priceSG: 80000, art: 'fashion/aura-thai-ivory.webp', frames: 8, fps: 10, anchor: [0.5, 0.05], scale: 0.9, behind: true, active: true, tag: 'thai' },
  { id: 'aura-ember', slot: 'other', name: 'Ember Aura', th: 'ออร่าถ่านเพลิง', description: 'ประกายไฟลอยรอบตัวละคร', priceTHB: null, priceSG: 50000, procedural: 'ember-aura', anchor: [0.5, 0.45], scale: 1.1, behind: false, active: true },
];
/** back-office rows over the built-in list (same id = replaced; unknown slots are dropped) */
export function mergeFashion(rows: unknown): FashionItem[] {
  const out = new Map(FASHION.map(f => [f.id, f]));
  if (Array.isArray(rows)) for (const r of rows as Partial<FashionItem>[]) {
    if (!r || typeof r.id !== 'string' || !FASHION_SLOTS.includes(r.slot as FashionSlot) || typeof r.name !== 'string') continue;
    out.set(r.id, { th: r.name, priceTHB: null, priceSG: null, active: true, ...out.get(r.id), ...r } as FashionItem);
  }
  return [...out.values()];
}
export const FASHION_BY_ID = (list: FashionItem[] = FASHION) => Object.fromEntries(list.map(f => [f.id, f])) as Record<string, FashionItem>;

/** what a character owns and wears (account-bound, not tradeable, no stats) */
export type Wardrobe = { owned: string[]; worn: Partial<Record<FashionSlot, string>> };
export const emptyWardrobe = (): Wardrobe => ({ owned: [], worn: {} });
export function wear(w: Wardrobe, id: string, list: FashionItem[] = FASHION): Wardrobe | string {
  const f = FASHION_BY_ID(list)[id]; if (!f) return 'ไม่มีไอเทมนี้'; if (!w.owned.includes(id)) return 'ยังไม่มีไอเทมนี้ในตู้เสื้อผ้า';
  return { ...w, worn: { ...w.worn, [f.slot]: id } };
}
export const takeOff = (w: Wardrobe, slot: FashionSlot): Wardrobe => { const worn = { ...w.worn }; delete worn[slot]; return { ...w, worn }; };
export function grant(w: Wardrobe, id: string): Wardrobe { return w.owned.includes(id) ? w : { ...w, owned: [...w.owned, id] }; }
/** the costume sprite key the hero shows (outfit slot), or null for the class look */
export const outfitSprite = (w: Wardrobe | undefined, list: FashionItem[] = FASHION) => { const id = w?.worn.outfit; return id ? FASHION_BY_ID(list)[id]?.sprite ?? null : null; };
/** worn overlay pieces in draw order (behind first) */
export const overlays = (w: Wardrobe | undefined, list: FashionItem[] = FASHION) => {
  const by = FASHION_BY_ID(list); return FASHION_SLOTS.filter(s => s !== 'outfit').map(s => w?.worn[s] ? by[w.worn[s]!] : undefined).filter((f): f is FashionItem => !!f && (!!f.art || !!f.procedural))
    .sort((a, b) => Number(!!b.behind) - Number(!!a.behind));
};
