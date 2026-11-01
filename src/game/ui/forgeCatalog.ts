import type { GearSlot } from '@/lib/types';

export const SOUL_STONES = [
  { id: 'soul-stone-weapon', name: 'หินวิญญาณอาวุธ', price: 150, color: '#ed5858', cell: 0 },
  { id: 'soul-stone-armor', name: 'หินวิญญาณเกราะ', price: 100, color: '#60aaff', cell: 1 },
  { id: 'soul-stone-accessory', name: 'หินวิญญาณเครื่องประดับ', price: 120, color: '#63d995', cell: 2 },
] as const;
export function stoneFor(slot: GearSlot) {
  return SOUL_STONES[slot === 'weapon' || slot === 'offhand' ? 0 : slot === 'ring' ? 2 : 1];
}
// Initial alchemy recipes deliberately use existing, obtainable materials.
export const POTION_RECIPES = [
  { id: 'potion-hp-s', fee: 10, materials: [{ id: 'material-ore', qty: 1 }] },
  { id: 'potion-hp-m', fee: 30, materials: [{ id: 'potion-hp-s', qty: 3 }, { id: 'material-ore', qty: 2 }] },
  { id: 'potion-hp-l', fee: 100, materials: [{ id: 'potion-hp-m', qty: 3 }, { id: 'material-ore', qty: 4 }] },
  { id: 'potion-mp-s', fee: 10, materials: [{ id: 'material-ore', qty: 1 }] },
  { id: 'potion-mp-m', fee: 30, materials: [{ id: 'potion-mp-s', qty: 3 }, { id: 'material-ore', qty: 2 }] },
];
