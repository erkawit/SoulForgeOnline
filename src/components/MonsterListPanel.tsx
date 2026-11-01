'use client';
// In-game bestiary (round 12): every field monster and elite with its picture, numbers at mid level and where it spawns.
// Bosses are not listed (they have their own lore page on the website, without numbers).
import { useMemo, useState } from 'react';
import { monsterEntries } from '@/game/wiki/data';
import { useGameStore } from '@/store/useGameStore';
export default function MonsterListPanel() {
  const lv = useGameStore(s => s.player.level), [q, setQ] = useState(''), all = useMemo(() => monsterEntries(), []);
  const list = all.filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase()));
  return <div className="codex">
    <input className="ad-search" placeholder="ค้นหามอนสเตอร์" value={q} onChange={e => setQ(e.target.value)} aria-label="ค้นหามอนสเตอร์" />
    <p className="npc-note">มอนสเตอร์ทั่วไปและ Elite {list.length} ชนิด (ไม่รวมบอส)</p>
    <div className="npc-list">{list.map(m => <div key={m.id} className="npc-row">
      <img src={m.image} alt="" width={52} height={52} style={{ objectFit: 'contain' }} loading="lazy" />
      <span>{m.elite ? '★ ' : ''}{m.name} <small>Lv.{m.levels}{Math.abs(m.level - lv) <= 5 ? ' · เหมาะกับคุณ' : ''}</small><br />
        <small>HP {m.hp.toLocaleString()} · ATK {m.attack.toLocaleString()} · DEF {m.defense.toLocaleString()}</small><br />
        {m.spawns.length > 0 && <small>จุดเกิด: {m.spawns.map(s => s.where + (s.levels ? ` (Lv.${s.levels})` : '')).join(' · ')}</small>}</span></div>)}</div>
  </div>;
}
