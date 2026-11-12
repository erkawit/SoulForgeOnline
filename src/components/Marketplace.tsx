'use client';
// Round 26: the exchange (ตลาดกลาง), laid out like the exchanges of Night Crows / Vampir:
//   ซื้อ   — categories on the left, search + grade + enhancement + sort on top, listings in the middle, the picked
//            listing on the right with its price history (this week's average, yesterday's average, the last sale)
//   ขาย   — the bag on the left, the picked item on the right: recent prices, floor, listing fee, tax, what you receive
//   รายการของฉัน · ประวัติซื้อขาย · จดหมาย (sales money and returned items arrive by mail)
// Everything is run by the realm (gameConnection.market pages + authority ACT operations), so an item is always in exactly
// one place. Offline (guest play / no realm) the window shows but trading is closed.
import { useEffect, useMemo, useState } from 'react';
import { useGameConfirm } from './GameConfirm';
import { useGameStore } from '@/store/useGameStore';
import { useMultiplayerStore, type MarketPrices } from '@/store/useMultiplayerStore';
import { gameConnection } from '@/lib/multiplayer/socket';
import { authority } from '@/store/authority';
import { useConfigStore } from '@/store/useConfigStore';
import { listingFee, marketFloor, saleSplit } from '@/game/balance/market';
import type { RarityKey } from '@/game/balance/config';
import { RARITIES } from '@/game/items';
import { RARITY_COLOR, type Item } from '@/lib/types';
import type { Listing } from '@/game/economy/market';
import ItemDetails, { ItemArt } from './ItemDetails';
import '@/styles/market.css';

type Tab = 'buy' | 'sell' | 'mine' | 'history' | 'mail';
type Cat = '' | 'weapon' | 'armor' | 'accessory' | 'material' | 'consumable';
const TABS: [Tab, string][] = [['buy', 'ซื้อ'], ['sell', 'ขาย'], ['mine', 'รายการของฉัน'], ['history', 'ประวัติซื้อขาย'], ['mail', 'จดหมาย']];
const CATS: [Cat, string, string][] = [['', 'ทั้งหมด', 'icon_bag_grid'], ['weapon', 'อาวุธ', 'icon_menu_combat_swords'], ['armor', 'ชุดเกราะ', 'icon_equipment_armor'],
  ['accessory', 'เครื่องประดับ', 'menu_14_treasure_orb_purple'], ['material', 'วัตถุดิบ', 'icon_menu_craft_anvil'], ['consumable', 'ของใช้', 'icon_potion_red']];
const SORTS: [string, string][] = [['new', 'ลงขายล่าสุด'], ['price', 'ราคาต่ำ → สูง'], ['priceDesc', 'ราคาสูง → ต่ำ']];
const MARKET_OPS = ['marketList', 'marketBuy', 'marketCancel', 'mailClaim'];
const sg = (n: number | null | undefined) => n == null ? '—' : `${Math.round(n).toLocaleString()}`;
const pct = (r: number) => `${+(r * 100).toFixed(1)}%`;
const ARMOR = ['armor', 'helmet', 'gloves', 'boots', 'offhand'];
const catOf = (i: Item): Cat => i.slot === 'weapon' ? 'weapon' : i.slot && ARMOR.includes(i.slot) ? 'armor' : i.slot === 'ring' ? 'accessory' : i.family === 'consumable' ? 'consumable' : 'material';
const when = (t: number) => new Date(t).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

function Coin() { return <img className="mk-coin" src="/art/ui-kit/currency_gold_coin.webp" alt="SG" />; }
function Price({ v }: { v: number | null | undefined }) { return <span className="mk-price"><Coin />{sg(v)}</span>; }

/** this week's / yesterday's average and the last sale of one item (unit price) */
function PriceBox({ p, loading }: { p: MarketPrices | null; loading: boolean }) {
  return <div className="mk-stats">
    <div><small>เฉลี่ย 7 วัน</small><Price v={p?.week} /></div>
    <div><small>เฉลี่ยเมื่อวาน</small><Price v={p?.yesterday} /></div>
    <div><small>ขายล่าสุด</small><Price v={p?.last} /></div>
    <p className="mk-note">{loading ? 'กำลังโหลดราคา…' : p && p.sold7d ? `ขายไปแล้ว ${p.sold7d} รายการใน 7 วัน (ราคาต่อชิ้น)` : 'ยังไม่มีประวัติการซื้อขาย'}</p>
  </div>;
}

export default function Marketplace() {
  const { confirm, dialog } = useGameConfirm();
  const online = useMultiplayerStore(n => n.connected && authority.online()), market = useMultiplayerStore(n => n.market), mailCount = useMultiplayerStore(n => n.mailCount);
  const result = useMultiplayerStore(n => n.actResult), me = useMultiplayerStore(n => n.playerId);
  const gold = useGameStore(s => s.player.gold), inventory = useGameStore(s => s.inventory), config = useConfigStore(c => c.config);
  const [tab, setTab] = useState<Tab>('buy'), [cat, setCat] = useState<Cat>(''), [text, setText] = useState(''), [rarity, setRarity] = useState(''), [enhMin, setEnhMin] = useState(0);
  const [sort, setSort] = useState<'new' | 'price' | 'priceDesc'>('new'), [page, setPage] = useState(0), [busy, setBusy] = useState<number | null>(null);
  const [pick, setPick] = useState<Listing | null>(null), [sellPick, setSellPick] = useState<string | null>(null), [price, setPrice] = useState(''), [priceKey, setPriceKey] = useState('');
  const tax = market?.tax || config.market.salesTaxPct;

  const load = (t: Tab = tab, p = page) => {
    if (!online) return;
    if (t === 'buy') gameConnection.market('browse', { text: text.trim() || undefined, rarity: rarity || undefined, page: p, cat, sort, enhMin });
    else if (t === 'mine') gameConnection.market('mine'); else if (t === 'history') gameConnection.market('history'); else if (t === 'mail') gameConnection.market('mail');
  };
  const askPrices = (def: string, enhance: number) => { const k = `${def}:${enhance}`; setPriceKey(k); if (online && def) gameConnection.market('prices', { def, enhance }); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [online, tab, page, rarity, cat, sort, enhMin]);
  // the realm answered our operation: stop waiting and refresh what is on screen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (result && busy !== null && result.seq === busy) { setBusy(null); setPick(null); load(); } }, [result]);
  const act = (op: 'marketList' | 'marketBuy' | 'marketCancel' | 'mailClaim', args: unknown[]) => { const seq = authority.send(op, args); if (seq) setBusy(seq); };

  const listings = market && (market.view === 'browse' || market.view === 'mine') ? market.listings : [];
  const shown = tab === 'buy' && market?.view === 'browse' ? listings : [];
  const mine = market?.view === 'mine' ? listings : [];
  const prices = market?.prices && `${market.prices.def}:${market.prices.enhance}` === priceKey ? market.prices : null;
  const sellable = useMemo(() => inventory.filter((i): i is Item => !!i), [inventory]);
  const chosen = sellable.find(i => i.id === sellPick) ?? null;
  const lastMsg = result && MARKET_OPS.includes(result.op) ? result : null;

  const buy = async (l: Listing) => {
    if (await confirm(`ซื้อ ${l.item.name}${l.qty > 1 ? ` ×${l.qty}` : ''} จาก ${l.sellerName || 'ผู้เล่น'}\nราคา ${sg(l.price)} SoulGod`)) act('marketBuy', [l.id]);
  };
  const list = async (i: Item) => {
    const p = Math.floor(Number(price)), floor = marketFloor(i.rarity as RarityKey, i.enhance ?? 0, null, config); if (!Number.isSafeInteger(p) || p < 1) return;
    const fee = listingFee(p, config), net = saleSplit(p, config, tax).seller;
    if (await confirm(`ลงขาย ${i.name}${(i.qty ?? 1) > 1 ? ` ×${i.qty}` : ''} ราคา ${sg(p)} SoulGod\nค่าลงขาย ${sg(fee)} (จ่ายทันที ไม่คืนแม้ยกเลิก)\nขายได้แล้วรับ ${sg(net)} ทางจดหมาย (ภาษี ${pct(tax)})${p < floor ? `\n⚠ ต่ำกว่าราคาขั้นต่ำ ${sg(floor)} — ระบบจะไม่รับ` : ''}`)) act('marketList', [i.id, p]);
  };

  return <div className="mk">{dialog}
    <header className="mk-head">
      <nav className="mk-tabs" role="tablist">{TABS.map(([t, l]) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''}
        onClick={() => { setTab(t); setPage(0); setPick(null); }}>{l}{t === 'mail' && mailCount ? <i>{mailCount}</i> : null}</button>)}</nav>
      <div className="mk-wallet"><Coin /><b>{gold.toLocaleString()}</b><small>ภาษีขาย {pct(tax)} · ค่าลงขาย {pct(config.market.listingFeePct)}</small></div>
    </header>
    {!online && <p className="mk-closed">ตลาดกลางเปิดเมื่อเชื่อมต่อเซิร์ฟเวอร์ Realm (เมนู → ออนไลน์) — ทุกการซื้อขายทำบนเซิร์ฟเวอร์ ไอเทมจึงอยู่ที่เดียวเสมอ ปลอมหรือปั๊มไม่ได้</p>}
    {lastMsg && <p className={`mk-msg ${lastMsg.ok ? 'ok' : 'bad'}`} role="status">{lastMsg.msg}</p>}
    {market?.error && <p className="mk-msg bad">{market.error}</p>}

    {tab === 'buy' && <div className="mk-body three">
      <aside className="mk-cats">{CATS.map(([c, l, art]) => <button key={c || 'all'} className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setPage(0); setPick(null); }}>
        <img src={`/art/ui-kit/${art}.webp`} alt="" /><span>{l}</span></button>)}</aside>
      <section className="mk-main">
        <div className="mk-filters">
          <input aria-label="ค้นหาไอเทม" placeholder="ค้นหาชื่อไอเทม…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPage(0); load('buy', 0); } }} />
          <select aria-label="ระดับ" value={rarity} onChange={e => { setRarity(e.target.value); setPage(0); }}><option value="">ทุกระดับ</option>{RARITIES.map(r => <option key={r} value={r}>{r}</option>)}</select>
          <select aria-label="ตีบวกขั้นต่ำ" value={enhMin} onChange={e => { setEnhMin(Number(e.target.value)); setPage(0); }}>{[0, 3, 5, 7, 9, 11, 13].map(n => <option key={n} value={n}>{n ? `+${n} ขึ้นไป` : 'ทุกขั้น'}</option>)}</select>
          <select aria-label="เรียง" value={sort} onChange={e => { setSort(e.target.value as typeof sort); setPage(0); }}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <button className="mk-btn" onClick={() => { setPage(0); load('buy', 0); }}>ค้นหา</button>
        </div>
        <div className="mk-list" role="list">
          <div className="mk-row mk-hd"><span>ไอเทม</span><span>ผู้ขาย</span><span>จำนวน</span><span>ราคา</span></div>
          {shown.map(l => <button key={l.id} role="listitem" className={`mk-row ${pick?.id === l.id ? 'on' : ''}`} onClick={() => { setPick(l); askPrices(l.definitionId, l.enhance); }}>
            <span className="mk-item"><ItemArt item={l.item} /><b style={{ color: RARITY_COLOR[l.rarity] }}>{l.enhance ? `+${l.enhance} ` : ''}{l.item.name.replace(/^\+\d+ /, '')}</b></span>
            <span className="mk-dim">{l.seller === me ? 'คุณ' : l.sellerName || 'ผู้เล่น'}</span><span>{l.qty}</span><Price v={l.price} /></button>)}
          {online && market?.view === 'browse' && !shown.length && <p className="mk-empty">ยังไม่มีรายการที่ตรงกับการค้นหา</p>}
        </div>
        <div className="mk-pager"><button className="mk-btn ghost" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>‹</button><small>หน้า {page + 1}</small>
          <button className="mk-btn ghost" disabled={shown.length < 40} onClick={() => setPage(p => p + 1)}>›</button></div>
      </section>
      <aside className="mk-side">{pick ? <>
        <ItemDetails item={pick.item}><button className="mk-big" aria-label={pick.item.name}><ItemArt item={pick.item} /></button></ItemDetails>
        <h3 style={{ color: RARITY_COLOR[pick.rarity] }}>{pick.item.name}{pick.qty > 1 ? ` ×${pick.qty}` : ''}</h3>
        <p className="mk-dim">{pick.rarity}{pick.enhance ? ` · +${pick.enhance}` : ''} · ผู้ขาย {pick.sellerName || 'ผู้เล่น'} · หมดเวลา {when(pick.expiresAt)}</p>
        <PriceBox p={prices} loading={!prices && online} />
        <div className="mk-total"><span>ราคารวม</span><Price v={pick.price} /></div>
        {pick.seller === me ? <p className="mk-note">รายการของคุณเอง</p>
          : <button className="mk-btn primary" disabled={busy !== null || gold < pick.price || !online} onClick={() => void buy(pick)}>{gold < pick.price ? 'SoulGod ไม่พอ' : 'ซื้อ'}</button>}
      </> : <p className="mk-empty">เลือกรายการเพื่อดูราคาและซื้อ</p>}</aside>
    </div>}

    {tab === 'sell' && <div className="mk-body two">
      <section className="mk-main">
        <p className="mk-note">ลงขายทั้งช่อง (ทั้งกอง) · ของที่สวมอยู่ต้องถอดก่อน · ประกาศอยู่ {config.market.listingHours} ชม. แล้วของกลับมาทางจดหมาย · ลงขายพร้อมกันได้ {config.market.maxActiveListings} รายการ</p>
        <div className="mk-bag">{sellable.map(i => <button key={i.id} className={sellPick === i.id ? 'on' : ''} title={i.name} style={{ ['--rc' as string]: RARITY_COLOR[i.rarity] }}
          onClick={() => { setSellPick(i.id); setPrice(''); askPrices(i.definitionId ?? '', i.enhance ?? 0); }}><ItemArt item={i} />{(i.qty ?? 1) > 1 && <b>{i.qty}</b>}{i.enhance ? <em>+{i.enhance}</em> : null}</button>)}
          {!sellable.length && <p className="mk-empty">กระเป๋าว่าง</p>}</div>
      </section>
      <aside className="mk-side">{chosen ? (() => {
        const floor = marketFloor(chosen.rarity as RarityKey, chosen.enhance ?? 0, null, config), p = Math.floor(Number(price)) || 0;
        const fee = p ? listingFee(p, config) : 0, net = p ? saleSplit(p, config, tax).seller : 0;
        return <>
          <ItemDetails item={chosen} inventory><button className="mk-big" aria-label={chosen.name}><ItemArt item={chosen} /></button></ItemDetails>
          <h3 style={{ color: RARITY_COLOR[chosen.rarity] }}>{chosen.name}{(chosen.qty ?? 1) > 1 ? ` ×${chosen.qty}` : ''}</h3>
          <p className="mk-dim">{chosen.rarity} · {({ weapon: 'อาวุธ', armor: 'ชุดเกราะ', accessory: 'เครื่องประดับ', material: 'วัตถุดิบ', consumable: 'ของใช้', '': '' } as Record<Cat, string>)[catOf(chosen)]}</p>
          <PriceBox p={prices} loading={!prices && online} />
          <label className="mk-field"><span>ราคาขาย (ทั้งกอง)</span><input type="number" min={floor} step={1} value={price} placeholder={String(prices?.last ?? floor)} onChange={e => setPrice(e.target.value)} /></label>
          <div className="mk-quick">{prices?.last ? <button className="mk-btn ghost" onClick={() => setPrice(String(prices.last! * (chosen.qty ?? 1)))}>ราคาล่าสุด</button> : null}
            <button className="mk-btn ghost" onClick={() => setPrice(String(floor))}>ราคาขั้นต่ำ</button></div>
          <dl className="mk-calc"><dt>ราคาขั้นต่ำ</dt><dd><Price v={floor} /></dd><dt>ค่าลงขาย (ไม่คืน)</dt><dd><Price v={fee} /></dd>
            <dt>ภาษีขาย {pct(tax)}</dt><dd><Price v={p ? p - net : 0} /></dd><dt>ได้รับเมื่อขายได้</dt><dd className="get"><Price v={net} /></dd></dl>
          <button className="mk-btn primary" disabled={busy !== null || !p || !online} onClick={() => void list(chosen)}>ลงทะเบียนขาย</button>
        </>;
      })() : <p className="mk-empty">เลือกไอเทมจากกระเป๋าเพื่อลงขาย</p>}</aside>
    </div>}

    {tab === 'mine' && <div className="mk-list solo">{mine.map(l => <div key={l.id} className="mk-row">
      <span className="mk-item"><ItemArt item={l.item} /><b style={{ color: RARITY_COLOR[l.rarity] }}>{l.item.name}{l.qty > 1 ? ` ×${l.qty}` : ''}</b></span>
      <span className="mk-dim">หมดเวลา {when(l.expiresAt)}</span><Price v={l.price} />
      <button className="mk-btn ghost" disabled={busy !== null} onClick={async () => { if (await confirm(`ถอน ${l.item.name} ออกจากตลาด?\nค่าลงขาย ${sg(l.fee)} จะไม่ได้คืน`)) act('marketCancel', [l.id]); }}>ถอน</button></div>)}
      {online && market?.view === 'mine' && !mine.length && <p className="mk-empty">ยังไม่มีของที่ลงขาย</p>}</div>}

    {tab === 'history' && <div className="mk-list solo">{(market?.trades ?? []).map(t => <div key={t.id} className="mk-row">
      <span className={`mk-side-tag ${t.side}`}>{t.side === 'sold' ? 'ขาย' : 'ซื้อ'}</span>
      <span className="mk-item"><ItemArt item={t.item} /><b style={{ color: RARITY_COLOR[t.rarity] }}>{t.item.name}{t.qty > 1 ? ` ×${t.qty}` : ''}</b></span>
      <span className="mk-dim">{when(t.closedAt)}</span><Price v={t.price} /></div>)}
      {online && !(market?.trades ?? []).length && <p className="mk-empty">ยังไม่มีประวัติการซื้อขาย</p>}</div>}

    {tab === 'mail' && <><div className="mk-list solo">{(market?.mail ?? []).map(m => <div key={m.id} className="mk-row">
      {m.item ? <span className="mk-item"><ItemArt item={m.item} /><b>{m.item.name}</b></span> : <Price v={m.gold} />}<span className="mk-dim">{m.note}</span></div>)}
      {online && !(market?.mail ?? []).length && <p className="mk-empty">ไม่มีจดหมาย</p>}</div>
      <div className="mk-pager"><button className="mk-btn primary" disabled={busy !== null || !(market?.mail ?? []).length} onClick={() => act('mailClaim', [])}>รับทั้งหมด</button></div></>}
  </div>;
}
