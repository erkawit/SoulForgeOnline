'use client';
// The monster codex (สมุดสะสม, round 11). Register monster loot for a small permanent bonus. Each tier costs more loot
// than the last for the same gain, tiers IV–V need Codex Seals (elites, more often in a party; bosses), and every stat is
// capped. Online the realm checks and spends the items (ACT 'codex'); this panel only shows the state and asks.
import { useMemo, useState } from 'react';
import { useGameStore, countOf } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';
import { CATEGORY, CODEX_SEAL, CODEX_TIERS, LOOT, STAT_LABEL, TIER_LABEL, codexBonus, tierOf, type LootCategory } from '@/game/codex';
import { codexMax, codexProgress, codexTitles, nextCost } from '@/game/economy/codex';
import { makeItem } from '@/game/items';
import type { SpecialKey } from '@/game/balance/config';
import { ItemArt } from './ItemDetails';

const ART = Object.fromEntries([...LOOT.map(l => l.id), CODEX_SEAL].map(id => [id, makeItem(id)]));
const fmt = (v: number | undefined) => `+${+(v ?? 0).toFixed(2)}%`;

export default function CodexPanel() {
  const codex = useGameStore(s => s.codex), inventory = useGameStore(s => s.inventory), register = useGameStore(s => s.registerCodex);
  const config = useConfigStore(c => c.config);
  const [cat, setCat] = useState<LootCategory | 'all'>('all'), [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const bonus = codexBonus(codex, config), max = useMemo(() => codexMax(config), [config]), titles = codexTitles(codex), prog = codexProgress(codex);
  const seals = countOf(inventory, CODEX_SEAL);
  const rows = LOOT.filter(l => cat === 'all' || l.category === cat);
  if (!config.codex.enabled) return <p className="npc-note">สมุดสะสมปิดอยู่ชั่วคราว</p>;
  const go = (id: string, th: string) => { const err = register(id); setMsg(err ? { ok: false, text: err } : { ok: true, text: `ส่ง ${th} ลงสมุดแล้ว` }); };

  return <div className="codex">
    <p className="npc-note">ล่ามอนสเตอร์แล้วเก็บของดรอปมาลงสมุดเพื่อรับค่าสถานะถาวรเล็กน้อย · ขั้นสูงใช้ของมากขึ้นแต่ได้เท่าเดิม · ขั้น IV–V ต้องใช้ตราสมุดสะสม (Elite ดรอปบ่อยขึ้นเมื่อมีเพื่อนในปาร์ตี้อยู่ใกล้ · บอสดรอปทุกตัว) · ของดรอปขายหรือซื้อขายในตลาดได้จนกว่าจะลงสมุด</p>
    <div className="codex-sum">
      <div><b>{prog.tiers}</b><small> / {prog.max} ขั้น</small></div>
      <div className="codex-seal"><ItemArt item={ART[CODEX_SEAL]} /><span>ตราสมุดสะสม <b>{seals}</b></span></div>
      {titles.length > 0 && <div className="codex-titles">{titles.map(t => <span key={t}>「{t}」</span>)}</div>}
    </div>
    <div className="codex-bonus" aria-label="ค่าสถานะจากสมุดสะสม">{(Object.keys(max) as SpecialKey[]).map(k => <span key={k}><small>{STAT_LABEL[k] ?? k}</small><b>{fmt(bonus[k])}</b><small> / {fmt(max[k])}</small></span>)}</div>
    <div className="npc-chips" role="tablist">{(['all', ...Object.keys(CATEGORY)] as (LootCategory | 'all')[]).map(c => <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c === 'all' ? 'ทั้งหมด' : CATEGORY[c].th}</button>)}</div>
    {msg && <p className={`npc-result ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.text}</p>}
    <div className="npc-list">{rows.map(l => {
      const t = tierOf(codex, l.id), cost = nextCost(codex, l.id, config), have = countOf(inventory, l.id), gain = config.codex.perTier[l.stat] ?? 0;
      const can = !!cost && have >= cost.loot && seals >= cost.seals;
      return <div className="npc-row codex-row" key={l.id}>
        <ItemArt item={ART[l.id]} />
        <span><b>{l.th}</b> <small>{l.en}</small><br /><small>{STAT_LABEL[l.stat]} +{gain}% ต่อขั้น · ดรอปจาก {l.monsters.join(', ')}</small>
          <span className="codex-pips" aria-label={`ขั้น ${t} จาก ${CODEX_TIERS}`}>{Array.from({ length: CODEX_TIERS }, (_, i) => <i key={i} className={i < t ? 'on' : ''} />)}</span></span>
        {cost ? <button disabled={!can} title={can ? '' : 'ของยังไม่พอ'} onClick={() => go(l.id, l.th)}>ขั้น {TIER_LABEL[cost.tier]}<small>{have}/{cost.loot}{cost.seals ? ` · ตรา ${seals}/${cost.seals}` : ''}</small></button>
          : <small className="codex-done">ครบ V</small>}
      </div>;
    })}</div>
  </div>;
}
