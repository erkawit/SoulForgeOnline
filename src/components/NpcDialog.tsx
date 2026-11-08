'use client';
// Talking to a town NPC: greeting + the service that NPC provides.
import { ShopPanel, CraftPanel } from './WorkshopPanels';
import { ForgeArt } from './ForgeArt';
import { ItemArt } from './ItemDetails';
import { stoneFor } from '@/game/ui/forgeCatalog';
import { junkPlan } from '@/game/economy/codex';
import '@/styles/soulforge-beta.css';
import { useEffect, useMemo, useState } from 'react';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { useGameStore } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';
import { ITEM_BY_ID } from '@/game/items';
import { GUIDE_TOPICS, NPC_BY_ID, SHOP_ITEMS, STARTER_KITS, TALK_RANGE, npcPosition, type Npc } from '@/game/npcs';
import { CITIES, CITY_IDS, type CityId } from '@/game/content';
import { enhanceChance, enhanceCost, enhanceMultiplier } from '@/game/balance/enhance';
import { marketFloor, listingFee } from '@/game/balance/market';
import { newbieBuffLevel } from '@/game/balance/buffs';
import { resetCost } from '@/game/skills/engine';
import { makeGear, npcPrice, WEAPON_KINDS, type WeaponKind } from '@/game/items';
import { RARITY_COLOR, type GearSlot, type Item, type Rarity } from '@/lib/types';
import { RARITY_KEYS } from '@/game/balance/config';
import { useGameConfirm } from './GameConfirm';
import SkillTreePanel from './SkillTreePanel';
import Marketplace from './Marketplace';
import { questsOffered, questsToTurnIn } from '@/game/quests';
import { huntingGrounds } from '@/game/spawns';
import { FOOD_ITEMS, CRYSTAL_INFO } from '@/game/items';
import { CRAFT_SLOTS, CRAFT_SLOT_TH, CRYSTAL_TIERS, MATERIAL_TH, craftDefId, craftChance, craftCost, crystalId, type CraftSlot, type CrystalTier } from '@/game/balance/craft';
import { countOf } from '@/store/useGameStore';
import type { ClassId } from '@/game/content';

export default function NpcDialog() {
  const id = useGameStore(s => s.npc), pos = useGameStore(s => s.player.position), city = useGameStore(s => s.player.cityId);
  const npc = id ? NPC_BY_ID[id] : null;
  const [line] = useState(() => Math.floor(Math.random() * 2));
  const far = npc ? Math.hypot(npcPosition(npc, city)[0] - pos[0], npcPosition(npc, city)[1] - pos[1]) > TALK_RANGE + 1.3 : false;
  useEffect(() => { if (far) useGameStore.getState().openNpc(null); }, [far]);
  useEffect(() => { if (!npc) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') useGameStore.getState().openNpc(null); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [npc]);
  if (!npc) return null;
  return <section className={`npc-dialog ${['shop','enhance'].includes(npc.service) ? 'forge-dialog' : ''}`} style={{ ['--npc' as string]: npc.color }} role="dialog" aria-label={npc.name}>
    <header className="npc-head"><span className="npc-badge" aria-hidden="true">{npc.icon}</span><div><b>{npc.th}</b><small>{npc.name} · {npc.title}</small></div><button className="sf-close" aria-label="ปิด" title="ปิด (Esc)" onClick={() => useGameStore.getState().openNpc(null)} /></header>
    <div className="npc-body"><p className="npc-line">{npc.greeting[line % npc.greeting.length]}</p><NpcQuests npc={npc} /><Service npc={npc} /></div>
  </section>;
}

function Result({ text }: { text: { ok: boolean; m: string } | null }) { return text ? <div className={`npc-result ${text.ok ? 'ok' : 'bad'}`} role="status">{text.m}</div> : null; }
const done = (err: string | null, ok: string) => ({ ok: !err, m: err ?? ok });

function Service({ npc }: { npc: Npc }) {
  const [res, setRes] = useState<{ ok: boolean; m: string } | null>(null);
  const s = useGameStore(); const config = useConfigStore(c => c.config);
  const { confirm, dialog } = useGameConfirm();
  if (npc.service === 'guide') return <Guide />;
  if (npc.service === 'shop') return <ShopPanel />;
  if (npc.service === 'enhance') return <Forge />;
  if (npc.service === 'starter') { const cls = s.player.classId ?? 'Berserker', got = s.starterKits.includes(cls); return <>
    <p className="npc-note">ชุดเริ่มต้น {cls}: {ITEM_BY_ID[(STARTER_KITS[cls] ?? STARTER_KITS.Berserker)[0]]?.name ?? 'อาวุธประจำอาชีพ'} + ชุดเกราะ 4 ชิ้น ({(STARTER_KITS[cls] ?? STARTER_KITS.Berserker).length} ชิ้น) รับได้ครั้งเดียวต่อตัวละคร</p>
    <button className="action-button" disabled={got} onClick={() => setRes(done(s.claimStarterKit(), 'รับชุดเริ่มต้นแล้ว เปิดกระเป๋า (I) แล้วดับเบิลคลิกเพื่อสวม'))}>{got ? 'รับไปแล้ว' : 'รับชุดเริ่มต้น'}</button><Result text={res} /></>; }
  if (npc.service === 'buyer') { const items = s.inventory.map((it, i) => [it, i] as const).filter(([it]) => it); return <>{dialog}
    <div className="npc-list">{items.length ? items.map(([it]) => <div key={it!.id} className="npc-row"><span style={{ color: RARITY_COLOR[it!.rarity] }}>{it!.name}{it!.qty ? ` ×${it!.qty}` : ''}</span>
      <b>{Math.max(1, Math.round(npcPrice(it!) * (it!.qty ?? 1) * config.economy.npcSellRate)).toLocaleString()} SG</b>
      <button className="action-button ghost" onClick={async () => { if (await confirm(`ขาย ${it!.name} ให้ยายเจสซ่า?`)) { s.sellNPC(it!.id, true); setRes({ ok: true, m: `ขาย ${it!.name} แล้ว` }); } }}>ขาย</button></div>) : <p className="npc-note">กระเป๋าว่าง</p>}</div>
    <JunkSale onDone={setRes} />
    <p className="npc-note">ราคามาตรฐาน NPC ต่ำกว่าตลาดผู้เล่นมาก ของดีควรขายผ่าน Silas Vane</p><Result text={res} /></>; }
  if (npc.service === 'blessing') { const lv = newbieBuffLevel(s.player.level, config), n = config.newbieBuff, e = n.effects[String(lv)]; return <>
    <div className="npc-list">{n.tiers.map(t => <div key={t.from} className="npc-row" style={lv === t.buffLevel ? { borderColor: npc.color } : undefined}><span>เลเวล {t.from}–{t.to}</span><b>บัฟ Lv.{t.buffLevel}</b><small>ATK +{n.effects[String(t.buffLevel)]?.atkPct}% DEF +{n.effects[String(t.buffLevel)]?.defPct}% EXP +{n.effects[String(t.buffLevel)]?.expPct}%</small></div>)}</div>
    {lv ? <button className="action-button" onClick={() => setRes(done(s.receiveBlessing(), `ได้รับพร Lv.${lv} นาน ${n.durationMinutes} นาที (ATK +${e?.atkPct}%)`))}>รับพรมือใหม่ Lv.{lv}</button>
      : <p className="npc-note">เจ้าแข็งแกร่งเกินกว่าพรของข้าแล้ว (เกินเลเวล {n.maxLevel}) จงพึ่ง Blood Howl ของเจ้าเอง และอาหารบัฟจากร้านค้า</p>}<Result text={res} /></>; }
  if (npc.service === 'market') return <>
    <div className="npc-list">{RARITY_KEYS.slice(2).map(r => <div key={r} className="npc-row"><span style={{ color: RARITY_COLOR[r] }}>{r}</span><small>ราคาขั้นต่ำ</small><b>{marketFloor(r, 0, null, config).toLocaleString()} SG</b></div>)}</div>
    <p className="npc-note">ไม่มีเพดานราคา · ค่าลงขาย {Math.round(config.market.listingFeePct * 100)}% (ขั้นต่ำ {listingFee(0, config)} SG ไม่คืน) · ภาษีขาย {Math.round(config.market.salesTaxPct * 100)}% ถูกเบิร์น · ยกเลิกแล้วรอ {config.market.relistCooldownMinutes} นาที · ขั้นต่ำขยับตามราคากลาง 7 วัน</p>
    <div className="npc-market"><Marketplace /></div></>;
  if (npc.service === 'skills') { const cost = resetCost(s.player.level, config.economy.skillResetBase, config.economy.skillResetPerLevel); return <>{dialog}
    <SkillTreePanel />
    <button className="action-button ghost" onClick={async () => { if (await confirm(`รีเซ็ตต้นไม้สกิลทั้งหมด ราคา ${cost.toLocaleString()} SoulGod?`)) setRes(done(s.resetSkills(), 'รีเซ็ตแล้ว แต้มสกิลคืนทั้งหมด')); }}>รีเซ็ตแต้มสกิล ({cost.toLocaleString()} SG)</button><Result text={res} /></>; }
  if (npc.service === 'hunting') { const spots = huntingGrounds(s.player.cityId ?? 'thornwatch'); return <>
    <p className="npc-note">ในเมืองไม่มีมอนสเตอร์ · ออกล่าผ่านประตูวาร์ปที่มุมกำแพง (เดินเข้าวงแล้ววาร์ปทันที ไม่เสียค่าเดินทาง) · ประตูแต่ละมุมพาไปทุ่งล่าคนละเลเวล</p>
    <div className="npc-list">{spots.map((p, i) => <div key={i} className="npc-row"><span>{p.name}<br /><small>{p.dir.startsWith('ประตู') ? p.dir : 'ทิศ' + p.dir} · ห่างลาน ~{p.dist} ม.</small></span><b>Lv {p.level}</b></div>)}</div>
    <div className="npc-list">{FOOD_ITEMS.map(f => <div key={f.id} className="npc-row"><span>🍖 {f.th}<br /><small>เสบียงพราน · บัฟ {f.minutes} นาที</small></span><b>{f.price.toLocaleString()} SG</b>
      <button className="action-button ghost" onClick={() => setRes(done(s.buyCatalog(f.id), `ซื้อ ${f.th}`))}>ซื้อ</button></div>)}</div><Result text={res} /></>; }
  if (npc.service === 'travel') { const here = s.player.cityId ?? 'hollow'; const list = CITY_IDS.filter(c => c !== here && (CITIES[c].parent === here || !CITIES[c].parent || CITIES[here].parent === c)); return <>
    <div className="npc-list">{list.map(c => { const fee = !CITIES[c].parent ? 0 : config.economy.travelFeePerZone; return <div key={c} className="npc-row"><span>{CITIES[c].name}<br /><small>{CITIES[c].levels ? `Lv ${CITIES[c].levels!.join('–')}` : CITIES[c].subtitle}</small></span><b>{fee ? `${fee} SG` : 'ฟรี'}</b>
      <button className="action-button ghost" onClick={() => { useGameStore.getState().travel(c as CityId); }}>เดินทาง</button></div>; })}</div>
    <p className="npc-note">กลับเมืองหลักฟรี · ไปพื้นที่ล่า/ดันเจี้ยนเสียค่าผ่านทาง (เบิร์น)</p></>; }
  return null;
}

function Guide() {
  const [topic, setTopic] = useState(GUIDE_TOPICS[0].id); const t = GUIDE_TOPICS.find(x => x.id === topic)!;
  return <><div className="npc-actions">{GUIDE_TOPICS.map(x => <button key={x.id} className={`action-button ${x.id === topic ? '' : 'ghost'}`} onClick={() => setTopic(x.id)}>{x.title}</button>)}</div>
    <div className="npc-list">{t.body.map((b, i) => <div key={i} className="npc-row"><span style={{ whiteSpace: 'normal' }}>{b}</span></div>)}</div></>;
}

export function Enhance() {
  const s = useGameStore(); const config = useConfigStore(c => c.config);
  const gear = useMemo(() => [
    ...(Object.entries(s.equipment) as [GearSlot, Item | null][]).filter(([, i]) => i && i.slot !== 'costume').map(([slot, i]) => ({ key: `eq-${slot}`, item: i!, ref: { slot }, where: 'สวมอยู่' })),
    ...s.inventory.map((i, idx) => ({ key: `inv-${idx}`, item: i, ref: { inventory: idx }, where: 'กระเป๋า' })).filter(x => x.item?.slot && x.item.slot !== 'costume') as { key: string; item: Item; ref: { inventory: number }; where: string }[],
  ], [s.equipment, s.inventory]);
  const [pick, setPick] = useState<string | null>(null); const [protect, setProtect] = useState(false); const [res, setRes] = useState<{ ok: boolean; m: string } | null>(null);
  const chosen = gear.find(g => g.key === pick) ?? gear[0]; const lv = chosen?.item.enhance ?? 0; useServerResult(setRes);
  const cost = chosen ? enhanceCost(chosen.item.rarity as Rarity, lv, config) + (protect ? config.enhance.protectionScrollPrice : 0) : 0;
  return <div className="forge-enhance"><h2>ENCHANT <small>ตีบวกอุปกรณ์</small></h2>
    <div className="forge-enhance-grid"><div className="npc-list" style={{ maxHeight: 420, overflowY: 'auto' }}>{gear.length ? gear.map(g => <button key={g.key} className="npc-row" style={g.key === chosen?.key ? { borderColor: '#ff7a45' } : undefined} onClick={() => { setPick(g.key); setRes(null); }}>
      <ItemArt item={g.item}/><span style={{ color: RARITY_COLOR[g.item.rarity] }}>{g.item.name}</span><small>{g.where}</small></button>) : <p className="npc-note">ไม่มีอุปกรณ์ให้ตีบวก</p>}</div>
    {chosen && <div className="forge-enhance-detail"><div className="forge-item-preview"><ItemArt item={chosen.item}/><h3>{chosen.item.name}</h3></div><div className="forge-materials"><div className="forge-card"><ForgeArt id={stoneFor(chosen.item.slot!).id}/><small>{stoneFor(chosen.item.slot!).name}</small><b className={countOf(s.inventory,stoneFor(chosen.item.slot!).id)>=1?'forge-good':'forge-bad'}>{countOf(s.inventory,stoneFor(chosen.item.slot!).id)} / 1</b></div><div className="forge-card"><h4>ก่อน → หลัง</h4>{(['atk','def'] as const).map(k=><p key={k}>{k.toUpperCase()} {Math.round((chosen.item.bonuses[k]??0)*enhanceMultiplier(lv,config))} → <b className="forge-good">{Math.round((chosen.item.bonuses[k]??0)*enhanceMultiplier(lv+1,config))}</b></p>)}</div></div>
      <span>+{lv} → +{lv + 1} · โอกาส <b>{Math.round(enhanceChance(lv, config) * 100)}%</b> · ATK/DEF ×{enhanceMultiplier(lv + 1, config).toFixed(2)}<br />
        <small>{lv < config.enhance.safeLevel ? 'ระดับปลอดภัย: พลาดไม่ลดขั้น' : protect ? 'มีคัมภีร์ป้องกัน: พลาดไม่ลดขั้น' : `พลาดจะลดเหลือ +${Math.max(0, lv - config.enhance.downgradeOnFail)}`}</small></span>
      <label className="npc-note"><input id="enh-protect" type="checkbox" checked={protect} onChange={e => setProtect(e.target.checked)} disabled={lv < config.enhance.safeLevel} /> คัมภีร์ป้องกัน (+{config.enhance.protectionScrollPrice.toLocaleString()} SG)</label>
      <button className="action-button" disabled={lv >= config.enhance.maxLevel || s.player.gold < cost || countOf(s.inventory,stoneFor(chosen.item.slot!).id)<1} onClick={() => { const r = useGameStore.getState().enhance(chosen.ref, protect && lv >= config.enhance.safeLevel); setRes({ ok: r.ok, m: r.message }); }}>ตีบวก {cost.toLocaleString()} SG</button>
    </div>}
    </div><p className="npc-note">ใช้หิน 1 ก้อนต่อครั้ง ทั้งสำเร็จและล้มเหลว · ซื้อหินได้ที่ร้าน Mira</p><p className="npc-note">SoulGod ของคุณ {s.player.gold.toLocaleString()} · ค่าตีบวกถูกเบิร์นออกจากระบบทั้งหมด</p><Result text={res} />
  </div>;
}

/** quests this NPC gives ("!") or takes back ("?") */
function NpcQuests({ npc }: { npc: Npc }) {
  const quests = useGameStore(s => s.quests), level = useGameStore(s => s.player.level); const [msg, setMsg] = useState<string | null>(null);
  const offer = questsOffered(npc.id, level, quests), ready = questsToTurnIn(npc.id, quests);
  useEffect(() => { if (offer.length) useGameStore.getState().tip('quest-offer'); }, [offer.length]);
  if (!offer.length && !ready.length) return msg ? <div className="npc-result ok">{msg}</div> : null;
  const rw = (q: typeof offer[number]) => `EXP ${q.rewards.xp.toLocaleString()} · SoulGod ${q.rewards.soulGod.toLocaleString()}`;
  return <div>{ready.map(q => <div key={q.id} className="npc-quest"><h4>? {q.title}</h4><p>{q.story}</p><p className="rw">รางวัล: {rw(q)}</p>
      <button className="action-button" onClick={() => { const e = useGameStore.getState().turnInQuest(q.id); setMsg(e ?? `ส่งเควส “${q.title}” แล้ว`); }}>ส่งเควส</button></div>)}
    {offer.map(q => <div key={q.id} className="npc-quest"><h4>! {q.title}</h4><p>{q.story}</p><ul>{q.objectives.map((o, i) => <li key={i}>{o.text}</li>)}</ul><p className="rw">รางวัล: {rw(q)}</p>
      <button className="action-button" onClick={() => { useGameStore.getState().acceptQuest(q.id); setMsg(`รับเควส “${q.title}” แล้ว — ดูความคืบหน้าที่ซ้ายบน`); }}>รับเควส</button></div>)}
    {msg && <div className="npc-result ok">{msg}</div>}</div>;
}
/** online, enhancing / crafting is rolled by the realm: show its answer in the window when it arrives */
function useServerResult(setRes: (r: { ok: boolean; m: string }) => void) {
  const r = useMultiplayerStore(n => n.actResult);
  useEffect(() => { if (r) setRes({ ok: r.ok, m: r.msg }); }, [r?.seq]); // eslint-disable-line react-hooks/exhaustive-deps
}
/** Brannoc: enhancement + crafting (SoulGod + materials; Legendary+ may fail into a crystal, 3 crystals = guaranteed craft) */
function Forge() {
  const [tab, setTab] = useState<'enhance' | 'craft'>('enhance');
  return <><div className="npc-actions"><button className={`action-button ${tab === 'craft' ? '' : 'ghost'}`} onClick={() => { setTab('craft'); useGameStore.getState().tip('craft-open'); }}>⚒ คราฟอุปกรณ์</button>
    <button className={`action-button ${tab === 'enhance' ? '' : 'ghost'}`} onClick={() => { setTab('enhance'); useGameStore.getState().tip('enhance-open'); }}>ตีบวก</button></div>{tab === 'craft' ? <CraftPanel gear={category => <Craft key={category} category={category}/>} /> : <Enhance />}</>;
}
export function Craft({ category }: { category: string }) {
  const s = useGameStore(); const config = useConfigStore(c => c.config);
  const [rarity, setRarity] = useState<Rarity>('Rare'), cls: ClassId = 'Berserker', [kind, setKind] = useState<WeaponKind>('greatsword'), [slot, setSlot] = useState<CraftSlot>(category === 'armor' ? 'armor' : category === 'accessories' ? 'ring' : 'weapon'); const [res, setRes] = useState<{ ok: boolean; m: string } | null>(null);
  const cost = craftCost(rarity, slot, config), ch = craftChance(rarity, config); useServerResult(setRes);
  const preview = useMemo(() => makeGear(craftDefId(rarity, cls, slot, kind), cls, () => 0.5), [rarity, cls, slot, kind]);
  useEffect(() => { useGameStore.getState().tip('craft-open'); }, []);
  return <>
    <div className="forge-item-preview"><ItemArt item={preview}/><div><h3 style={{color:RARITY_COLOR[rarity]}}>{preview.name}</h3><p>{CRAFT_SLOT_TH[slot]} · {rarity}</p><small>ตัวอย่างรูปลักษณ์ · ค่าสถานะและออปชันสุ่มเมื่อคราฟ</small></div></div><div className="npc-note">ระดับ</div><div className="npc-chips">{RARITY_KEYS.map(r => <button key={r} className={rarity === r ? 'on' : ''} style={{ ['--cc' as string]: RARITY_COLOR[r] }} onClick={() => { setRarity(r); setRes(null); }}>{r}</button>)}</div>
    <div className="npc-note">ประเภท</div><div className="npc-chips">{CRAFT_SLOTS.filter(k => category === 'weapons' ? k === 'weapon' : category === 'accessories' ? k === 'ring' : k !== 'weapon' && k !== 'ring').map(k => <button key={k} className={slot === k ? 'on' : ''} onClick={() => setSlot(k)}>{CRAFT_SLOT_TH[k]}</button>)}</div>
    {slot === 'weapon' && <><div className="npc-note">อาวุธ (คราฟปกติสุ่ม 1 ใน 3 · คริสตัลเลือกได้)</div><div className="npc-chips">{(Object.keys(WEAPON_KINDS) as WeaponKind[]).map(k => <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{WEAPON_KINDS[k].th}</button>)}</div></>}
    <div className="npc-list">
      <div className="npc-row"><span>SoulGod</span><b style={{ color: s.player.gold >= cost.soulGod ? '#7fd69a' : '#ff8a7a' }}>{cost.soulGod.toLocaleString()} / {s.player.gold.toLocaleString()}</b></div>
      {cost.materials.map(m => { const have = countOf(s.inventory, m.id); return <div key={m.id} className="npc-row"><span>{MATERIAL_TH[m.id] ?? m.id}</span><b style={{ color: have >= m.qty ? '#7fd69a' : '#ff8a7a' }}>{m.qty} / {have}</b></div>; })}
      <div className="npc-row"><span>โอกาสสำเร็จ</span><b style={{ color: ch < 1 ? '#ffb15a' : '#7fd69a' }}>{Math.round(ch * 100)}%</b>{ch < 1 && <small>พลาด = ได้ {CRYSTAL_INFO[rarity as CrystalTier].th} 1 เม็ด</small>}</div></div>
    <button className="action-button" onClick={() => { const r = useGameStore.getState().craft(rarity, cls, slot); setRes({ ok: r.ok, m: r.message }); }}>คราฟ {rarity} · {CRAFT_SLOT_TH[slot]}</button>
    <div className="npc-note" style={{ marginTop: 10 }}>คริสตัลชดเชย — ครบ 3 เม็ดระดับเดียวกัน คราฟสำเร็จ 100% ตามประเภท/อาวุธที่เลือก</div>
    {CRYSTAL_TIERS.map(t => { const n = countOf(s.inventory, crystalId(t)), c = CRYSTAL_INFO[t]; return <div key={t} className="npc-crystal" style={{ ['--cc' as string]: c.color }}><span style={{ color: c.color, flex: 1 }}>◆ {c.th} <small>({t})</small></span>
      {[0, 1, 2].map(i => <i key={i} className={i < Math.min(3, n) ? 'on' : ''} />)}<small>{n}/3</small>
      <button className="action-button ghost" disabled={n < 3} onClick={() => { const r = useGameStore.getState().crystalCraft(t, cls, slot, kind); setRes({ ok: r.ok, m: r.message }); }}>คราฟด้วยคริสตัล</button></div>; })}
    <Result text={res} /></>;
}

/** round 11: sell monster loot the codex no longer needs, in one go (shows the total first; seals are never sold) */
function JunkSale({ onDone }: { onDone: (r: { ok: boolean; m: string }) => void }) {
  const inventory = useGameStore(s => s.inventory), codex = useGameStore(s => s.codex), config = useConfigStore(c => c.config);
  const { confirm, dialog } = useGameConfirm();
  const plan = junkPlan({ inventory, codex }, config), n = plan.lines.reduce((a, l) => a + l.qty, 0);
  return <div className="npc-row">{dialog}<span>✦ ขายของดรอปส่วนเกิน<br /><small>{n ? `${n} ชิ้น · เก็บส่วนที่สมุดสะสมยังต้องใช้ไว้ให้` : 'ไม่มีของดรอปเกินจากที่สมุดสะสมยังต้องใช้'}</small></span><b>{plan.total.toLocaleString()} SG</b>
    <button className="action-button ghost" disabled={!n} onClick={async () => {
      if (!await confirm(`ขายของดรอป ${n} ชิ้น ได้ ${plan.total.toLocaleString()} SoulGod?\n${plan.lines.map(l => `${l.name} ×${l.qty}`).join('\n')}`)) return;
      const err = useGameStore.getState().sellJunk(); onDone(err ? { ok: false, m: err } : { ok: true, m: `ขายของดรอป ${n} ชิ้น` }); }}>ขายทั้งหมด</button></div>;
}
