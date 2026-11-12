'use client';
// Round 26 (PC): in a town, one button per NPC above the action cluster — click and the hero walks over and opens the
// dialog (the same walker as clicking the NPC in the world).
import { npcsIn, NPC_BY_ID } from '@/game/npcs';
import { walkToNpc } from '@/game/npcApproach';
import { slug } from '@/game/sprites/catalog';
import { useGameStore } from '@/store/useGameStore';

const SHORT: Record<string, string> = { guide: 'ผู้นำทาง', shop: 'ร้านค้า', merchant: 'ตีบวก/คราฟ', supplier: 'อุปกรณ์', buyer: 'รับซื้อ', blessing: 'พร',
  broker: 'ตลาด', mentor: 'สกิล', warden: 'วาร์ป', ranger: 'พราน' };

export default function TownNpcs() {
  const city = useGameStore(s => s.player.cityId), talking = useGameStore(s => s.npc);
  const list = npcsIn(city);
  if (!list.length) return null;
  return <nav className="pc-npcs pointer-events-auto" aria-label="NPC ในเมือง">
    {list.map(n => <button key={n.id} className={talking === n.id ? 'on' : ''} title={`${n.th} · ${n.title}`} style={{ ['--nc' as string]: n.color }}
      onClick={() => { const s = useGameStore.getState(); if (s.npc === n.id) return; walkToNpc(NPC_BY_ID[n.id]); }}>
      <img src={`/art/npc-heads/${slug(n.name)}.webp`} alt="" /><span>{SHORT[n.id] ?? n.th}</span></button>)}
  </nav>;
}
