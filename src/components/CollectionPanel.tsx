'use client';
// Round 17: the Collection book (สมุดสะสม · L), NightCrows-style. Tabs: weapons, armour, accessories, fashion and the
// monster codex. Each card is one collection: its pieces (with the enhance level they need), how many are in (2/4), and the
// permanent bonus when it is full. A piece that is in the bag can be registered on the spot — it is used up — and
// "ลงทะเบียนทั้งหมด" fills every slot it can at once. Equipped gear is never taken: unequip it first.
import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { COLLECTIONS, COLLECTION_TABS, RARITY_TH, collectionBonus, collectionTitles, filled, isDone, rewardText, STAT_TH, type CollectionSet, type CollectionTab } from '@/game/collection';
import { collectionCandidate } from '@/game/economy/codex';
import { makeItem, ITEM_DEFINITIONS } from '@/game/items';
import { FASHION, fashionIcon } from '@/game/fashion';
import type { SpecialKey } from '@/game/balance/config';
import { ItemArt } from './ItemDetails';
import CodexPanel from './CodexPanel';

type Filter = 'all' | 'ready' | 'open' | 'done';
const FILTERS: [Filter, string][] = [['all', 'ทั้งหมด'], ['ready', 'ลงได้ตอนนี้'], ['open', 'ยังไม่ครบ'], ['done', 'ครบแล้ว']];
const NAME = Object.fromEntries(ITEM_DEFINITIONS.map(d => [d.id, d.name]));
const FASH = Object.fromEntries(FASHION.map(f => [f.id, f]));
const ART: Record<string, ReturnType<typeof makeItem>> = {};
const art = (id: string) => (ART[id] ??= makeItem(id));

export default function CollectionPanel() {
  const codex = useGameStore(s => s.codex), inventory = useGameStore(s => s.inventory), owned = useGameStore(s => s.wardrobe.owned);
  const g = useGameStore(s => s.player.gender === 'f' ? 'f' : 'm'), register = useGameStore(s => s.registerCollection);
  const [tab, setTab] = useState<CollectionTab | 'monster'>('weapon'), [filter, setFilter] = useState<Filter>('all'), [q, setQ] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const bonus = useMemo(() => collectionBonus(codex), [codex]), titles = collectionTitles(codex, owned);
  // which empty slots have a matching piece in the bag (each bag slot used once)
  const ready = useMemo(() => {
    const used = new Set<number>(), out: Record<string, number[]> = {};
    for (const c of COLLECTIONS) { if (c.tab === 'fashion') continue; const f = filled(c, codex);
      c.needs.forEach((n, i) => { if (f[i]) return; const at = collectionCandidate(inventory.map((it, k) => used.has(k) ? null : it), n.id, n.plus); if (at >= 0) { used.add(at); (out[c.id] ??= []).push(i); } }); }
    return out;
  }, [codex, inventory]);
  const count = (t: CollectionTab) => { const l = COLLECTIONS.filter(c => c.tab === t); return [l.filter(c => isDone(c, codex, owned)).length, l.length]; };
  if (tab === 'monster') return <div className="col"><Tabs tab={tab} setTab={setTab} count={count} /><CodexPanel /></div>;
  const list = COLLECTIONS.filter(c => c.tab === tab).filter(c => {
    const done = isDone(c, codex, owned);
    if (filter === 'ready' && !ready[c.id]) return false; if (filter === 'open' && done) return false; if (filter === 'done' && !done) return false;
    return !q || c.th.toLowerCase().includes(q.toLowerCase()) || c.needs.some(n => (NAME[n.id] ?? FASH[n.id]?.th ?? '').toLowerCase().includes(q.toLowerCase()));
  });
  const go = (c: CollectionSet, i: number) => { const err = register(c.id, i); setMsg(err ? { ok: false, text: err } : { ok: true, text: `ลงทะเบียนใน ${c.th} แล้ว` }); };
  const all = () => { let n = 0, err: string | null = null; for (const c of list) for (const i of ready[c.id] ?? []) { const e = register(c.id, i); if (e) err = e; else n++; }
    setMsg(err && !n ? { ok: false, text: err } : { ok: true, text: n ? `ลงทะเบียน ${n} ชิ้น` : 'ไม่มีชิ้นที่ลงได้ในหน้านี้' }); };
  const readyHere = list.reduce((a, c) => a + (ready[c.id]?.length ?? 0), 0);
  return <div className="col">
    <Tabs tab={tab} setTab={setTab} count={count} />
    <div className="col-sum">
      <div className="col-bonus" aria-label="ค่าสถานะถาวรจากคอลเลกชัน">{Object.keys(bonus).length === 0 ? <small>ยังไม่มีคอลเลกชันที่ครบ — ค่าสถานะจะขึ้นที่นี่</small>
        : (Object.entries(bonus) as [SpecialKey, number][]).map(([k, v]) => <span key={k}><small>{STAT_TH[k] ?? k}</small><b>+{v}%</b></span>)}</div>
      {titles.length > 0 && <div className="codex-titles">{titles.map(t => <span key={t}>「{t}」</span>)}</div>}
    </div>
    <div className="col-tools">
      <div className="fw-slots" role="group" aria-label="กรอง">{FILTERS.map(([f, th]) => <button type="button" key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{th}</button>)}</div>
      <input className="col-search" value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาคอลเลกชันหรือไอเทม…" aria-label="ค้นหา" />
      {tab !== 'fashion' && <button type="button" className="action-button" disabled={!readyHere} onClick={all}>ลงทะเบียนทั้งหมด{readyHere ? ` (${readyHere})` : ''}</button>}
    </div>
    {msg && <p className={`npc-result ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.text}</p>}
    <div className="col-grid">{list.length === 0 ? <p className="npc-note">ไม่มีคอลเลกชันที่ตรงกับตัวกรอง</p> : list.map(c => {
      const f = filled(c, codex, owned), n = f.filter(Boolean).length, done = n === c.needs.length, can = ready[c.id] ?? [];
      return <article key={c.id} className={`col-card r${c.tier}${done ? ' done' : ''}${can.length ? ' ready' : ''}`}>
        <div className="col-head"><b>{c.th}</b><span className="col-count">{n}/{c.needs.length}</span></div>
        <div className="col-bar"><i style={{ width: `${(n / c.needs.length) * 100}%` }} /></div>
        <ul className="col-needs">{c.needs.map((nd, i) => {
          const fa = c.tab === 'fashion' ? FASH[nd.id] : undefined, icon = fa ? fashionIcon(fa, g) : null, name = fa?.th ?? NAME[nd.id] ?? nd.id, ok = can.includes(i);
          return <li key={i} className={f[i] ? 'in' : ok ? 'can' : ''} title={`${name}${nd.plus ? ` +${nd.plus}` : ''}`}>
            <span className="col-ico">{fa ? (icon ? <img src={icon} alt="" /> : <i>✦</i>) : <ItemArt item={art(nd.id)} />}{nd.plus > 0 && <em>+{nd.plus}</em>}</span>
            <small>{name}</small>
            {f[i] ? <span className="col-state">✓</span> : ok ? <button type="button" onClick={() => go(c, i)}>ลงทะเบียน</button> : <span className="col-state off">{c.tab === 'fashion' ? 'ยังไม่มี' : 'ไม่มีในกระเป๋า'}</span>}
          </li>; })}</ul>
        <div className="col-foot">{c.tab === 'fashion' ? <>รางวัล: ฉายา「{c.title}」<small> (แฟชั่นไม่เพิ่มค่าสถานะ)</small></> : <>ครบชุด: {rewardText(c.reward)}</>}</div>
      </article>; })}</div>
    <p className="npc-note">ไอเทมที่ลงทะเบียนจะหายจากกระเป๋าถาวร · ของที่สวมอยู่ต้องถอดก่อน · ชุดที่ต้อง +3 / +5 รับไอเทมที่ตีบวกถึงระดับนั้นขึ้นไป · ระดับ {RARITY_TH.join(' → ')}</p>
  </div>;
}

function Tabs({ tab, setTab, count }: { tab: CollectionTab | 'monster'; setTab: (t: CollectionTab | 'monster') => void; count: (t: CollectionTab) => number[] }) {
  return <div className="npc-chips" role="tablist">{COLLECTION_TABS.map(([t, th]) => { const c = t === 'monster' ? null : count(t);
    return <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{th}{c && <small> {c[0]}/{c[1]}</small>}</button>; })}</div>;
}
