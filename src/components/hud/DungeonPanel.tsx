'use client';
// Round 26: dungeon menu — the three elite dungeons with their level band, monsters and boss; "เข้าดันเจี้ยน" travels
// there from anywhere (Gatewarden's paid travel, the same fee as a field).
import { CITIES, DUNGEON_IDS, type CityId } from '@/game/content';
import { monsterSpriteId } from '@/game/sprites/catalog';
import { useGameStore } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';

export default function DungeonPanel({ onClose }: { onClose: () => void }) {
  const here = useGameStore(s => s.player.cityId), level = useGameStore(s => s.player.level), gold = useGameStore(s => s.player.gold), dead = useGameStore(s => !!s.deadUntil);
  const fee = useConfigStore(c => c.config.economy.travelFeePerZone);
  return <div className="dg">
    <p className="dg-intro">มอนสเตอร์ในดันเจี้ยนเป็น Elite ทั้งหมด · HP/พลังโจมตี ×3 · EXP ×5 · บอสประจำดันเจี้ยนอยู่ลึกที่สุด</p>
    <div className="dg-list">{DUNGEON_IDS.map((id, i) => {
      const c = CITIES[id], [lo, hi] = c.levels ?? [1, 1], species = c.species ?? [], boss = species.at(-1), parent = c.parent ? CITIES[c.parent].name : '';
      const low = level < lo - 5, inside = here === id;
      return <article key={id} className={`dg-card ${inside ? 'on' : ''}`} style={{ ['--dg' as string]: c.ground }}>
        <header><b className="dg-no">{i + 1}</b><div><h3>{c.name}</h3><small>ทางเข้าจาก {c.entrance ? CITIES[c.entrance as CityId].name : parent} · เขต {parent}</small></div><span className={`dg-lv ${low ? 'low' : ''}`}>Lv. {lo}–{hi}</span></header>
        <div className="dg-mobs">{species.map(s => <figure key={s} className={s === boss ? 'boss' : ''}><img src={`/art/sprites/${monsterSpriteId(s)}.webp`} alt="" /><figcaption>{s === boss ? '☠ ' : ''}{s}</figcaption></figure>)}</div>
        <footer>{low && <small className="dg-warn">เลเวลต่ำกว่าที่แนะนำ — อันตราย</small>}
          {inside ? <span className="dg-here">อยู่ในดันเจี้ยนนี้</span>
            : <button className="mk-btn primary" disabled={dead || gold < fee} onClick={() => { useGameStore.getState().travel(id); onClose(); }}>เข้าดันเจี้ยน · {fee} SG</button>}</footer>
      </article>;
    })}</div>
  </div>;
}
