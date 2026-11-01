// Spec equipment layout: 12 slots (+ the game's fashion slot). The game currently has 6 gear slots + costume;
// the other spec slots are drawn and kept in the save format but locked until those item types exist.
import type { GearSlot } from '@/lib/types';

export type SpecSlot = 'head' | 'necklace' | 'chest' | 'shoulder' | 'gloves' | 'belt' | 'pants' | 'boots' | 'ring1' | 'ring2' | 'mainHand' | 'offHand' | 'costume';
export type SlotInfo = { id: SpecSlot; th: string; en: string; gear: GearSlot | null; side: 'left' | 'right' | 'top'; lockedNote?: string };
export const EQUIP_LAYOUT: SlotInfo[] = [
  { id: 'head', th: 'หมวก', en: 'Head', gear: 'helmet', side: 'left' },
  { id: 'necklace', th: 'สร้อยคอ', en: 'Necklace', gear: null, side: 'left', lockedNote: 'เปิดใช้ในอัปเดตถัดไป' },
  { id: 'chest', th: 'เกราะอก', en: 'Chest', gear: 'armor', side: 'left' },
  { id: 'shoulder', th: 'บ่า', en: 'Shoulder', gear: null, side: 'left', lockedNote: 'เปิดใช้ในอัปเดตถัดไป' },
  { id: 'gloves', th: 'ถุงมือ', en: 'Gloves', gear: 'gloves', side: 'left' },
  { id: 'belt', th: 'เข็มขัด', en: 'Belt', gear: null, side: 'left', lockedNote: 'เปิดใช้ในอัปเดตถัดไป' },
  { id: 'pants', th: 'กางเกง', en: 'Pants', gear: null, side: 'right', lockedNote: 'เปิดใช้ในอัปเดตถัดไป' },
  { id: 'boots', th: 'รองเท้า', en: 'Boots', gear: 'boots', side: 'right' },
  { id: 'ring1', th: 'แหวน 1', en: 'Ring 1', gear: 'ring', side: 'right' },
  { id: 'ring2', th: 'แหวน 2', en: 'Ring 2', gear: null, side: 'right', lockedNote: 'เปิดใช้ในอัปเดตถัดไป' },
  { id: 'mainHand', th: 'อาวุธหลัก', en: 'Main hand', gear: 'weapon', side: 'right' },
  { id: 'offHand', th: 'มือรอง', en: 'Off hand', gear: 'offhand', side: 'right' },
  { id: 'costume', th: 'ชุดแฟชั่น', en: 'Costume', gear: 'costume', side: 'top' },
];
export const SLOT_FOR_GEAR: Partial<Record<GearSlot, SpecSlot>> = Object.fromEntries(EQUIP_LAYOUT.filter(s => s.gear).map(s => [s.gear!, s.id]));
