'use client';
// In-game HUD — UX spec v1. A screen-scale checker picks one of two component sets:
//   PC (≥ 768 px)   ./hud/PCHUDLayout: frame top-left, HP orb · centre hotbar (attack + skills 1–6 + potions) · MP orb, EXP strip
//   Mobile          ./hud/MobileHUDLayout: mini bars + level tag, joystick, attack wheel (4 skills + page), potion / AUTO / menu
// Shared here: buffs, quest tracker, target / boss bars, minimap, menus, windows, tips and the boss dashboard.
// plus target / world-boss bars, one-time tips, the boss damage dashboard and the windows behind the menus.
import '@/styles/hud2.css';
import { spawnPoints } from '@/game/spawns';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConfigStore } from '@/store/useConfigStore';
import SkillTreePanel from './SkillTreePanel';
import NpcDialog from './NpcDialog';
import BuffStrip from './BuffStrip';
import { countOf, derivedOf, expRequired, useGameStore } from '@/store/useGameStore';
import { usePlayerStatic, usePlayerCell } from '@/store/usePlayerStatic';
import CloudSave from './CloudSave';
import { CITIES, WORLD_LIMIT, portalsOf, type MainCityId } from '@/game/content';
import OnlinePanel from './OnlinePanel';
import CollectionPanel from './CollectionPanel';
import WardrobePanel from './WardrobePanel';
import MonsterListPanel from './MonsterListPanel';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { gameConnection, titanInReach } from '@/lib/multiplayer/socket';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ZONES, zoneAt } from '@/game/world/zones';
import { NPCS, npcsIn, npcPosition } from '@/game/npcs';
import { CAPITAL_HALF, CAPITAL_PIECES, CANAL_IN, CITY_SCALE, GATE_D, GATE_TRIGGER, PLAZA_R } from '@/game/world/capitalPlan';
import { QUESTS, activeQuests, npcMarker, questProgressText } from '@/game/quests';
import { FOCUS_TH, LOOT_GRADES, LOOT_GRADES_TH, isSupportClass, skillRoles, type AutoFocus } from '@/game/auto';
import { FOOD_ITEMS } from '@/game/items';
import { audio } from '@/game/audio/engine';
import { skillIconStyle } from '@/game/skills/icons';
import { describeSkill } from '@/game/skills/describe';
import SettingsPanel from './SettingsPanel';
import { useScreenScale, useOrientation } from './hud/common';
import { ChannelButton } from './ChannelSwitch';
import PCHUDLayout from './hud/PCHUDLayout';
import MobileHUDLayout from './hud/MobileHUDLayout';
import PCMenu, { MenuButton, exitItems, type MenuGroup } from './hud/PCMenu';
import { PCInventoryPanel, MobileInventoryDrawer } from './hud/InventoryPanels';
import { PCStatusPanel, MobileStatusPanel } from './hud/StatusPanels';
import '@/styles/hud3.css';
import '@/styles/uikit.css';
import '@/styles/touch-controls.css';
import '@/styles/pc-menu.css';

type Panel = 'inventory' | 'character' | 'skills' | 'quests' | 'codex' | 'wardrobe' | 'monsters' | 'auto' | 'settings' | 'cloud' | 'online' | null;
/** round 25 (PC): these open as full-screen pages; the rest dock on the right like a side panel */
const PC_PAGE: Panel[] = ['inventory', 'codex', 'wardrobe', 'quests', 'monsters', 'settings'];
const KEYS = ['1', 'Space', 'Q', 'E', 'R', 'T', 'X'];
const CLASS_COLOR: Record<string, string> = { Berserker: '#ff4a3a', Reaver: '#c03cff' };
const CLASS_TH: Record<string, string> = { Berserker: 'เบอร์เซิร์กเกอร์', Reaver: 'รีเวอร์' };
const fmt = (n: number) => Math.round(n).toLocaleString();
function Bar({ value, max, kind }: { value: number; max: number; kind: 'hp' | 'mp' | 'xp' }) {
  return <div className={`h2-bar ${kind}`}><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, value / Math.max(1, max)))})` }} />{kind !== 'xp' && <span>{fmt(value)} / {fmt(max)}</span>}</div>;
}

// inventory / status now live in ./hud (PCInventoryPanel · MobileInventoryDrawer · PCStatusPanel · MobileStatusPanel)
function SkillsPanel() { return <SkillTreePanel />; }
function QuestsPanel() {
  const quests = useGameStore(s => s.quests); const [all, setAll] = useState(false);
  const list = QUESTS.filter(q => all || (quests[q.id] && quests[q.id].status !== 'done'));
  const who = (id: string) => NPCS.find(n => n.id === id)?.th ?? id;
  return <div><div className="h2-tabs"><button className={!all ? 'on' : ''} onClick={() => setAll(false)}>กำลังทำ</button><button className={all ? 'on' : ''} onClick={() => setAll(true)}>ทั้งหมด ({QUESTS.length})</button></div>
    {list.length ? list.map(q => { const st = quests[q.id]; return <article key={q.id} className={`h2-quest ${st?.status ?? 'none'}`}><h4>{st?.status === 'ready' ? '? ' : st?.status === 'done' ? '✔ ' : !st ? '🔒 ' : ''}{q.title} <small>Lv.{q.minLevel}+</small></h4><p>{q.story}</p>
      <ul>{(st && st.status !== 'done' ? questProgressText(q, st) : q.objectives.map(o => o.text)).map((t, i) => <li key={i}>{t}</li>)}</ul><p className="h2-note">💡 {q.hint}</p>
      <p className="rw">รับจาก {who(q.giver)} · ส่งที่ {who(q.turnIn)} · EXP {fmt(q.rewards.xp)} · SoulGod {fmt(q.rewards.soulGod)}</p></article>; })
      : <p className="h2-note">ยังไม่มีเควส — มองหา NPC ที่มี <b>!</b> สีทองเหนือหัว (เริ่มที่ผู้เฒ่าคอร์วินกลางลานเมือง)</p>}</div>;
}
function AutoPanel() {
  const a = useGameStore(s => s.auto), cls = useGameStore(s => s.player.classId ?? 'Berserker'), hot = useGameStore(s => s.hotbar), extra = useGameStore(s => s.extraHotbar), inv = useGameStore(s => s.inventory);
  const defs = useConfigStore(s => s.skills.defs); const set = useGameStore.getState().patchAuto;
  useEffect(() => { useGameStore.getState().tip('auto-open'); }, []);
  const ids = [hot.skill, hot.buff, hot.special, ...extra];
  const levels = useGameStore(s => s.skillLevels); const [info, setInfo] = useState<number | null>(null); const mobile = useScreenScale() === 'mobile';
  // plain render helpers, NOT components: a component declared here would be a new type every render and React would
  // remount the slider on every change (dragging stopped after one step; only tapping the track worked)
  const Sw = ({ on, onClick }: { on: boolean; onClick: () => void }) => <button className={`h2-switch ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} />;
  const Range = ({ k, min, max, unit = '%' }: { k: 'hpPotionPct' | 'mpPotionPct' | 'healAllyPct' | 'radius'; min: number; max: number; unit?: string }) =>
    <span className="h2-range"><input type="range" min={min} max={max} value={a[k]} onChange={e => set({ [k]: +e.target.value })} /><b>{a[k]}{unit}</b></span>;
  return <div className="h2-auto">
    <button className={`sf-btn ${a.enabled ? '' : 'ghost'}`} onClick={() => useGameStore.getState().setAuto(!a.enabled)}>{a.enabled ? '■ หยุด AUTO' : '▶ เริ่ม AUTO'}</button> <small className="h2-note">Z เปิด/ปิด · ขยับเองแล้วพัก 3 วินาที</small>
    <div className="h2-sub">ยาและอาหาร</div>
    <div className="h2-row"><span>ดื่มยา HP <small>มี {['potion-hp-l', 'potion-hp-m', 'potion-hp-s'].reduce((x, id) => x + countOf(inv, id), 0)} ขวด</small></span>{Sw({ on: a.hpPotion, onClick: () => set({ hpPotion: !a.hpPotion }) })}</div>
    <div className="h2-row"><span>เมื่อ HP ต่ำกว่า</span>{Range({ k: "hpPotionPct", min: 10, max: 90 })}</div>
    <div className="h2-row"><span>ดื่มยา MP <small>มี {['potion-mp-m', 'potion-mp-s'].reduce((x, id) => x + countOf(inv, id), 0)} ขวด</small></span>{Sw({ on: a.mpPotion, onClick: () => set({ mpPotion: !a.mpPotion }) })}</div>
    <div className="h2-row"><span>เมื่อ MP ต่ำกว่า</span>{Range({ k: "mpPotionPct", min: 5, max: 80 })}</div>
    <div className="h2-row"><span>กินอาหารบัฟ <small>{FOOD_ITEMS.map(f => f.th).join(' / ')}</small></span>{Sw({ on: a.food, onClick: () => set({ food: !a.food }) })}</div>
    <div className="h2-sub">เก็บของ</div>
    <div className="h2-row"><span>เก็บของอัตโนมัติ <small>เดินผ่านก็เก็บ · AUTO เดินไปเก็บเองในระยะ 12 ม.</small></span>{Sw({ on: a.loot, onClick: () => set({ loot: !a.loot }) })}</div>
    {a.loot && <>
      <div className="h2-row col"><span>อุปกรณ์ระดับที่จะเก็บ <small>วัตถุดิบ ยา อาหาร เก็บเสมอ</small></span>
        <div className="h2-grades">{LOOT_GRADES.map(g => { const on = (a.lootRarities ?? LOOT_GRADES).includes(g);
          return <button key={g} className={`g-${g.toLowerCase()} ${on ? 'on' : ''}`} aria-pressed={on}
            onClick={() => { const cur = new Set<string>(a.lootRarities ?? LOOT_GRADES); if (on) cur.delete(g); else cur.add(g); set({ lootRarities: LOOT_GRADES.filter(x => cur.has(x)) }); }}>{on ? '✓ ' : ''}{LOOT_GRADES_TH[g]}</button>; })}</div></div>
      <div className="h2-row"><span>เก็บอุปกรณ์ตั้งแต่</span><span className="h2-range"><input type="range" min={0} max={10} value={a.lootMinEnhance ?? 0} onChange={e => set({ lootMinEnhance: +e.target.value })} /><b>{(a.lootMinEnhance ?? 0) ? `+${a.lootMinEnhance}` : 'ทุก +'}</b></span></div>
    </>}
    <div className="h2-row"><span>รัศมีล่า</span>{Range({ k: "radius", min: 6, max: 30, unit: " ม." })}</div>
    {isSupportClass(cls) && <><div className="h2-sub">รูปแบบการเล่น ({CLASS_TH[cls]})</div><div className="h2-focus">{(['attack', 'support', 'hybrid'] as AutoFocus[]).map(f => <button key={f} className={a.focus === f ? 'on' : ''} onClick={() => set({ focus: f })}><b>{FOCUS_TH[f].name}</b>{FOCUS_TH[f].desc}</button>)}</div>
      <div className="h2-row"><span>ช่วยเพื่อนเมื่อเลือดต่ำกว่า</span>{Range({ k: "healAllyPct", min: 20, max: 90 })}</div>
      <div className="h2-row"><span>รักษาบัฟยาวให้ทุกคน</span>{Sw({ on: a.keepBuffs, onClick: () => set({ keepBuffs: !a.keepBuffs }) })}</div></>}
    <div className="h2-sub">สกิลที่ให้ AUTO ใช้</div>
    <small className="h2-note">แตะไอคอนเพื่อดูว่าสกิลทำงานอย่างไรที่ขั้นปัจจุบัน</small>
    {ids.map((id, i) => { const d = defs.find(x => x.id === id); if (!d) return null; const on = a.skills[i + 1] !== false, rank = levels[d.id] ?? 0, open = info === i;
      return <div key={i} className="h2-autosk">
        <div className="h2-row"><span className="h2-sk-name"><button className={`h2-sk-ico ${open ? 'on' : ''}`} aria-label={`ข้อมูลสกิล ${d.name}`} aria-expanded={open} onClick={() => setInfo(open ? null : i)}>
            <i className="forge-skill-icon" style={skillIconStyle(d.id)} /><b>{mobile ? i + 1 : KEYS[i + 1]}</b></button>
          <span>{d.name} <small>ขั้น {rank}/{d.maxLevel} · {skillRoles(d).map(r => ({ damage: 'โจมตี', heal: 'ฮีล', buff: 'บัฟ', shield: 'โล่', debuff: 'ดีบัฟ' } as Record<string, string>)[r]).join(' · ')}</small></span></span>
          {Sw({ on: on, onClick: () => { const sk = [...a.skills]; sk[i + 1] = !on; set({ skills: sk }); } })}</div>
        {open && <div className="h2-sk-info">
          <small>{d.th} · {d.kind === 'passive' ? 'ติดตัว' : `MP ${d.mpCost} · คูลดาวน์ ${d.cooldownSec} วิ${d.castMs ? ` · ร่าย ${d.castMs / 1000} วิ` : ''}`}</small>
          <p>{d.description}</p>
          <dl><dt>ขั้นปัจจุบัน ({rank})</dt><dd>{rank > 0 ? describeSkill(d, rank) : 'ยังไม่ได้เรียน'}</dd>
            {rank > 0 && rank < d.maxLevel && <><dt>ขั้นถัดไป ({rank + 1})</dt><dd>{describeSkill(d, rank + 1)}</dd></>}</dl>
        </div>}
      </div>; })}
  </div>;
}
function TipCard() {
  const tip = useGameStore(s => s.tips[0]), more = useGameStore(s => s.tips.length - 1);
  useEffect(() => { if (!tip) return; audio.play('ui_open', { vol: .35 }); const t = setTimeout(() => useGameStore.getState().dismissTip(), 16000); return () => clearTimeout(t); }, [tip]);
  if (!tip) return null;
  return <aside className="h2-tip pointer-events-auto" role="status"><div className="h"><span>❖ คำแนะนำ</span>{more > 0 && <small>+{more}</small>}</div><h3>{tip.title}</h3><p>{tip.body}</p>
    {tip.keys && <div className="k">{tip.keys.split(' ').map(k => <kbd key={k}>{k}</kbd>)}</div>}<button className="sf-btn" onClick={() => useGameStore.getState().dismissTip()}>เข้าใจแล้ว</button></aside>;
}
function QuestTracker({ onOpen }: { onOpen: () => void }) {
  const quests = useGameStore(s => s.quests); const list = activeQuests(quests).slice(0, 4);
  return <section className="h2-tracker pointer-events-auto" onClick={onOpen}><div className="h">เควส <small>J</small></div>
    {list.length ? list.map(q => { const st = quests[q.id]; return <div key={q.id} className={`q ${st.status}`}><b>{st.status === 'ready' ? '✔ ' : ''}{q.title}</b>{st.status === 'ready' ? <small>ส่งเควสได้แล้ว</small> : questProgressText(q, st).map((t, i) => <small key={i}>{t}</small>)}</div>; })
      : <div className="q"><small>หา NPC ที่มี <b className="mk">!</b> สีทองเหนือหัวเพื่อรับเควส</small></div>}</section>;
}
function BossDashboard() {
  const r = useMultiplayerStore(s => s.bossResult), me = useMultiplayerStore(s => s.playerId);
  if (!r) return null; const top = r.ranked[0]?.damage || 1;
  return <div className="h2-modal pointer-events-auto" role="dialog" aria-label="ผลการล่าบอส"><section>
    <header><h2>ผลการล่าบอส · {r.boss}</h2><button className="sf-close" aria-label="ปิด" title="ปิด" onClick={() => useMultiplayerStore.getState().setState({ bossResult: null })} /></header>
    <p className="h2-note">ใช้เวลา <b>{r.minutes} นาที</b> · ผู้ร่วมรบ {r.players} คน · อันดับ 1 มีโอกาส 50% ได้ไอเทมระดับสูง (Legendary / God / Pre-arch / Arch)</p>
    <table><thead><tr><th>#</th><th>ผู้เล่น</th><th>ดาเมจ</th><th>รางวัล</th></tr></thead><tbody>{r.ranked.map(p => <tr key={p.id} className={p.id === me ? 'me' : ''}><td className="rk">{p.rank}</td>
      <td><b style={{ color: CLASS_COLOR[p.classId] }}>{p.name}</b><br /><small>{CLASS_TH[p.classId] ?? p.classId}</small></td>
      <td><div className="dm"><span>{fmt(p.damage)}</span><small>{(p.share * 100).toFixed(1)}%</small></div><div className="dmgbar"><i style={{ width: `${p.damage / top * 100}%` }} /></div></td>
      <td>SoulGod {fmt(p.soulGod)}{p.guaranteed ? ` · ${p.guaranteed}` : ''}{p.highTier ? <><br /><b className="hi">★ {p.highTier}!</b></> : null}</td></tr>)}</tbody></table></section></div>;
}

/** minimap: the only HUD part that follows the player and the monsters every frame */
function Minimap({ cityId }: { cityId: string }) {
  const [px, pz] = usePlayerCell(.25);
  const level = useGameStore(s => s.player.level), quests = useGameStore(s => s.quests);
  const monsters = useGameStore(s => s.monsters), drops = useGameStore(s => s.drops);
  const connected = useMultiplayerStore(s => s.connected), players = useMultiplayerStore(s => s.players), playerId = useMultiplayerStore(s => s.playerId), boss = useMultiplayerStore(s => s.boss);
  return <section className="h2-mm pointer-events-auto"><svg viewBox={`${px - 28} ${pz - 28} 56 56`} aria-label="แผนที่ย่อ — คลิกเพื่อเปิดแผนที่โลก" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
      onClick={() => window.dispatchEvent(new CustomEvent('sf-open-win', { detail: 'map' }))} onKeyDown={e => { if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('sf-open-win', { detail: 'map' })); }}>
      <MinimapStatic cityId={cityId} level={level} quests={quests} />
      {monsters.filter(m => m.hp > 0).map(m => <circle key={m.id} cx={m.x} cy={m.z} r=".8" fill="#e37c6c" />)}
      {connected && players.filter(p => p.id !== playerId).map(p => <circle key={p.id} cx={p.x} cy={p.z} r=".8" fill="#6dc8db" />)}
      {drops.map(d => <circle key={d.id} cx={d.x} cy={d.z} r=".6" fill="#cb8ff2" />)}
      {connected && boss && <circle cx={boss.x} cy={boss.z} r="1.8" fill="#ef6357" />}
      <circle cx={px} cy={pz} r="1.3" fill="#ffe4a1" stroke="#000" strokeWidth=".3" /></svg><div className="ring" /><span className="n">N</span><span className="h2-coords" aria-label="พิกัด">X {px.toFixed(0)} · Y {pz.toFixed(0)}</span></section>;
}

/** the fixed layer of the minimap (ground, buildings, gates, NPCs, elite spawns) — drawn once per field */
const MinimapStatic = memo(function MinimapStatic({ cityId, level, quests }: { cityId: string; level: number; quests: ReturnType<typeof useGameStore.getState>['quests'] }) {
  const city = CITIES[cityId as keyof typeof CITIES];
  return <>
      <rect x={-100} y={-100} width={200} height={200} fill="#0b0a0d" />
      {city.parent ? <rect x={-(WORLD_LIMIT[city.id] ?? 23)} y={-(WORLD_LIMIT[city.id] ?? 23)} width={2 * (WORLD_LIMIT[city.id] ?? 23)} height={2 * (WORLD_LIMIT[city.id] ?? 23)} fill="#17151a" />
        : <><rect x={-CAPITAL_HALF} y={-CAPITAL_HALF} width={2 * CAPITAL_HALF} height={2 * CAPITAL_HALF} fill={city.id === 'dawnveil' ? '#2f6f74' : '#1d1f25'} stroke="#000" strokeWidth="1.4" />
          {city.id === 'dawnveil' && <rect x={-CANAL_IN} y={-CANAL_IN} width={2 * CANAL_IN} height={2 * CANAL_IN} fill="#1d1f25" />}
          <path d={`M${-GATE_D} ${-GATE_D}L${GATE_D} ${GATE_D}M${-GATE_D} ${GATE_D}L${GATE_D} ${-GATE_D}M0 ${-24 * CITY_SCALE}V${24 * CITY_SCALE}M${-24 * CITY_SCALE} 0H${24 * CITY_SCALE}`} stroke="#4a443f" strokeWidth="5.4" strokeLinecap="round" /><circle r={13.6 * CITY_SCALE} fill="none" stroke="#4a443f" strokeWidth="5" /><circle r={PLAZA_R} fill="#4a443f" />
          {CAPITAL_PIECES[city.id as MainCityId].filter(p => p.role || p.piece === 'tree').map((p, i) => <circle key={'b' + i} cx={p.x} cy={p.z} r={p.r} fill={p.role ? city.roof : '#2e4a30'} stroke={city.accent} strokeWidth=".3" />)}</>}
      {city.id === 'wild0' && ZONES.map(z => <circle key={z.id} cx={z.x} cy={z.z} r={z.radius} fill="rgba(160,60,50,.16)" stroke="rgba(224,90,70,.45)" strokeWidth=".5" />)}
      {city.buildings.map((b, i) => <rect key={i} x={b.x - b.w / 2} y={b.z - b.d / 2} width={b.w} height={b.d} fill={city.roof} stroke={city.accent} strokeWidth={.3} />)}
      {portalsOf(city.id).map(p => <circle key={'g' + p.dir} cx={p.x} cy={p.z} r={GATE_TRIGGER} fill="none" stroke={p.kind === 'dungeon' ? '#c98aff' : '#62e6d2'} strokeWidth=".6" />)}
      {npcsIn(city.id).map(n => { const [x, z] = npcPosition(n, city.id), mk = npcMarker(n.id, level, quests); return <text key={n.id} x={x} y={z + 1} fontSize="2.6" textAnchor="middle" fill={mk && mk !== '…' ? '#ffd36e' : n.color}>{mk && mk !== '…' ? mk : n.icon}</text>; })}
      {spawnPoints(city.id).filter(p => p.elite).map(p => <circle key={p.id} cx={p.position[0]} cy={p.position[1]} r={p.boss ? 1.8 : 1.3} fill="none" stroke={p.boss ? '#ff9a3c' : '#ffd36e'} strokeWidth=".4" />)}
  </>;
});

/** target frame: follows only the selected monster's own fields */
function TargetFrame() {
  const t = useGameStore(s => { const m = s.monsters.find(x => x.id === s.selectedMonster); return m ? `${m.hp}|${m.maxHp}|${m.name}|${m.level}|${m.elite ? 1 : 0}|${m.boss ? 1 : 0}|${m.telegraph?.kind ?? ''}` : ''; });
  if (!t) return null;
  const [hp, maxHp, name, level, elite, boss, tele] = t.split('|');
  if (+hp <= 0) return null;
  return <div className="h2-target"><b className={elite === '1' ? 'elite' : ''}>{boss === '1' ? '☠ ' : elite === '1' ? '★ ' : ''}{name} <small>Lv.{level}{elite === '1' && boss !== '1' ? ' · ELITE' : ''}{tele === 'skill' ? ' · กำลังร่าย!' : ''}</small></b><Bar value={+hp} max={+maxHp} kind="hp" /></div>;
}

/** zone name + coordinates: re-renders only when the whole-metre position changes */
function ZoneLabel({ cityName, cityId }: { cityName: string; cityId: string }) {
  const [px, pz] = usePlayerCell(1);
  const zone = cityId === 'wild0' ? zoneAt(px, pz) : null;
  return <div className="h2-zone">{zone ? zone.th : cityName}<small>{px.toFixed(0)}, {pz.toFixed(0)}</small><ChannelButton /></div>;
}

export default function GameHUD() {
  const network = { connected: useMultiplayerStore(s => s.connected), boss: useMultiplayerStore(s => s.boss) };
  const deadUntil = useGameStore(s => s.deadUntil), pending = useGameStore(s => s.pending), charge = useGameStore(s => s.charge);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(t); }, []);
  const [panel, setPanel] = useState<Panel>(null);
  const layout = useScreenScale(), orientation = useOrientation(); const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<Panel>(null); panelRef.current = panel; const pc = layout === 'pc';
  const player = usePlayerStatic(), equipment = useGameStore(s => s.equipment);
  const log = useGameStore(s => s.log), selectedMonster = useGameStore(s => s.selectedMonster), buffs = useGameStore(s => s.buffs), skillLevels = useGameStore(s => s.skillLevels);
  const hotbar = useGameStore(s => s.hotbar), extra = useGameStore(s => s.extraHotbar), cooldowns = useGameStore(s => s.cooldowns), auto = useGameStore(s => s.auto), pauseUntil = useGameStore(s => s.autoPauseUntil);
  const inventory = useGameStore(s => s.inventory);
  const skillDefs = useConfigStore(s => s.skills.defs);
  const cls = player.classId ?? 'Berserker', color = CLASS_COLOR[cls];
  const city = CITIES[player.cityId ?? 'hollow'];
  const derived = useMemo(() => derivedOf({ player, equipment, buffs, skillLevels }), [player, equipment, buffs, skillLevels]);
  // HP / MP are simulated here (online too: the realm owns money, items and levels, not the fight)
  const hp = player.hp, maxHp = derived.maxHp, mp = player.mp, maxMp = derived.maxMp;
  const zoneId = useGameStore(s => (s.player.cityId ?? 'hollow') === 'wild0' ? zoneAt(s.player.position[0], s.player.position[1])?.id ?? null : null); // the Sorrowlands ruins of Ashen Outskirts
  const zone = zoneId ? ZONES.find(z => z.id === zoneId) ?? null : null;
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggle = (p: Panel) => { audio.play('ui_click', { vol: .35 }); setPanel(v => v === p ? null : p); };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select') || e.target.isContentEditable)) return;
      if (e.repeat) return; const k = e.key.toLowerCase(), g = useGameStore.getState();
      if (g.journal) { if (k === 'escape') g.setJournal(false); return; }
      const map: Record<string, Panel> = { i: 'inventory', c: 'character', k: 'skills', j: 'quests', l: 'codex', u: 'wardrobe', n: 'monsters', o: 'settings' };
      if (map[k]) setPanel(p => p === map[k] ? null : map[k]);
      // round 25: Esc closes the open window; with none open it opens / closes the menu
      if (k === 'escape') { if (panelRef.current) setPanel(null); else setMenuOpen(v => !v); }
      { const slot = { r: 4, t: 5, x: 6 }[k as 'r' | 't' | 'x']; if (slot) g.castSlot(slot);
        if (k === '7') g.usePotion('hp'); if (k === '8') g.usePotion('mp'); if (k === '9') g.eatFood(); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  // zone banner when walking into a ruined area of the Sorrowlands
  const [banner, setBanner] = useState<string | null>(null);
  useEffect(() => { if (!zone) return; setBanner(zone.id); useGameStore.getState().emit({ type: 'visit', zone: zone.id }); useGameStore.getState().tip('ruins'); const t = setTimeout(() => setBanner(null), 4200); return () => clearTimeout(t); }, [zone?.id]);

  const ids = [hotbar.skill, hotbar.buff, hotbar.special, ...extra];
  const basic = () => {
    if (titanInReach()) { gameConnection.attack(); return; }
    const st = useGameStore.getState(); const t = st.monsters.find(m => m.id === st.selectedMonster && m.hp > 0) ?? st.monsters.filter(m => m.hp > 0).sort((a, b) => Math.hypot(a.x - st.player.position[0], a.z - st.player.position[1]) - Math.hypot(b.x - st.player.position[0], b.z - st.player.position[1]))[0];
    if (t) { st.selectMonster(t.id); st.attack(t.id); }
  };
  const hpCount = ['potion-hp-l', 'potion-hp-m', 'potion-hp-s'].reduce((a, id) => a + countOf(inventory, id), 0), mpCount = ['potion-mp-m', 'potion-mp-s'].reduce((a, id) => a + countOf(inventory, id), 0);
  const foodCount = FOOD_ITEMS.reduce((a, f) => a + countOf(inventory, f.id), 0), fed = buffs.some(b => b.id.startsWith('food-') && b.until > now);
  const menu: [Exclude<Panel, null>, string, string, string][] = [['inventory', '🎒', 'I', 'กระเป๋า · อุปกรณ์'], ['character', '♜', 'C', 'ตัวละคร'], ['skills', '✺', 'K', 'สกิล'], ['quests', '❡', 'J', 'เควส'], ['codex', '✦', 'L', 'สมุดสะสม'], ['wardrobe', '👘', 'U', 'ตู้เสื้อผ้า'], ['monsters', '☠', 'N', 'สมุดมอนสเตอร์'],
    ['auto', '⟳', 'Z', 'AUTO'], ['online', '⚑', '', 'ออนไลน์ / ปาร์ตี้'], ['cloud', '☁', '', 'เซฟคลาวด์'], ['settings', '⚙', 'O', 'ตั้งค่า']];
  const SHORT: Record<Exclude<Panel, null>, string> = { inventory: 'กระเป๋า', character: 'ตัวละคร', skills: 'สกิล', quests: 'เควส', codex: 'สะสม', wardrobe: 'ตู้ชุด', monsters: 'มอนสเตอร์', auto: 'ออโต้', online: 'ออนไลน์', cloud: 'เซฟคลาวด์', settings: 'ตั้งค่า' };
  const MENU_ART: Record<Exclude<Panel, null>, string> = { inventory: 'menu_03_inventory', character: 'menu_12_character_helm', skills: 'menu_04_skill_book', quests: 'menu_22_quest_scrolls', codex: 'menu_11_codex_book', wardrobe: 'menu_09_avatar_armor', monsters: 'menu_32_boss_battle_locked', auto: 'icon_refresh', online: 'menu_28_community_friends', cloud: 'icon_crystal_orb', settings: 'icon_menu_settings_gear' };
  const title: Record<Exclude<Panel, null>, string> = { inventory: 'กระเป๋า · อุปกรณ์', character: 'ข้อมูลตัวละคร', skills: 'ต้นไม้สกิล', quests: 'สมุดเควส', codex: 'สมุดสะสม · Collection', wardrobe: 'ตู้เสื้อผ้า · Cash Shop', monsters: 'สมุดมอนสเตอร์', auto: 'ตั้งค่า AUTO', settings: 'ตั้งค่า', cloud: 'Cloud Save', online: 'Online Realm' };

  const openWin = (id: Exclude<Panel, null>) => () => { audio.play('ui_click', { vol: .35 }); setPanel(id); };
  const ev = (detail: string) => () => window.dispatchEvent(new CustomEvent('sf-open-win', { detail }));
  const it = (id: Exclude<Panel, null>, label: string, key?: string) => ({ id, label, key, art: MENU_ART[id], on: panel === id, run: openWin(id) });
  const pcGroups: MenuGroup[] = [
    { title: 'ตัวละคร', items: [it('inventory', 'กระเป๋า', 'I'), it('character', 'ตัวละคร', 'C'), it('skills', 'สกิล', 'K'), it('wardrobe', 'ตู้ชุด', 'U')] },
    { title: 'การผจญภัย', items: [it('quests', 'เควส', 'J'), { id: 'map', label: 'แผนที่', key: 'M', art: 'map_waypoint_node_swords', run: ev('map') }, it('monsters', 'มอนสเตอร์', 'N'), it('codex', 'สมุดสะสม', 'L')] },
    { title: 'สังคม', items: [it('online', 'ออนไลน์'), { id: 'party', label: 'ปาร์ตี้', key: 'P', art: 'menu_27_guild_shield_royal', run: ev('party') }, { id: 'wiki', label: 'วิกิ', art: 'menu_23_daily_request', run: () => window.open('/wiki', '_blank', 'noopener') }] },
    { title: 'ระบบ', items: [it('auto', 'ออโต้', 'Z'), it('cloud', 'เซฟคลาวด์')] },
  ];

  return <div className={`hud-root h2 pointer-events-none ${layout === 'mobile' ? `touch ${orientation}` : 'pc'} ${pc && panel && PC_PAGE.includes(panel) ? 'paged' : ''}`}>
    <div className="h2-vignette" />
    {/* PC / Mobile component sets (UX spec): frame, orbs, hotbar or touch wheel */}
    {layout === 'pc' ? <PCHUDLayout hp={hp} maxHp={maxHp} mp={mp} maxMp={maxMp} now={now} onAuto={() => toggle('auto')} />
      : <MobileHUDLayout hp={hp} maxHp={maxHp} mp={mp} maxMp={maxMp} now={now} menuOpen={menuOpen} onMenu={() => setMenuOpen(v => !v)} onStatus={() => toggle('character')} />}
    <div className="h2-buffs"><BuffStrip /></div>
    <QuestTracker onOpen={() => toggle('quests')} />
    {/* top-centre: target / world boss */}
    {network.connected && network.boss ? <div className="h2-boss"><div className="t"><b>☠ ABYSSAL FORGE TITAN · {network.boss.phase === 'enraged' ? 'คลั่ง!' : 'Raid'}</b><span>{(network.boss.hp / network.boss.maxHp * 100).toFixed(1)}%</span></div>
      <div className="h2-bar hp boss"><i style={{ transform: `scaleX(${Math.max(0, network.boss.hp / network.boss.maxHp)})` }} /></div><small>เลือดปรับตามจำนวนผู้ท้าชิง · ออกแบบให้ใช้เวลา 15–30 นาที · หลบวงสีส้ม</small></div>
      : <TargetFrame />}
    {banner && (() => { const z = ZONES.find(x => x.id === banner)!; return <div className="h2-banner"><h1>{z.name.toUpperCase()}</h1><p>{z.th}</p></div>; })()}
    {/* top-right: minimap + menus */}
    <Minimap cityId={city.id} />
    {/* round 25: on PC the corner button opens the menu drawer (the settings live inside it); phones keep their menu button */}
    {pc && !panel && <MenuButton className="pc-corner" open={menuOpen} onClick={() => setMenuOpen(v => !v)} />}
    {pc && menuOpen && <PCMenu groups={pcGroups} system={[{ id: 'settings', label: 'ตั้งค่า', key: 'O', art: 'icon_menu_settings_gear', on: panel === 'settings', run: () => setPanel('settings') }, ...exitItems()]} onClose={closeMenu} />}
    <ZoneLabel cityName={city.name} cityId={city.id} />
    {!pc && <nav className={`h2-menu pointer-events-auto ${layout === 'mobile' ? 'mobile' : ''} ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>{menu.map(([id, ico, key, t]) => <button key={id} title={`${t}${key ? ` (${key})` : ''}`} aria-label={t} className={panel === id ? 'on' : ''} onClick={() => toggle(id)}><img className="sf-menu-ico" src={`/art/ui-kit/${MENU_ART[id]}.webp`} alt="" data-glyph={ico} />{layout === 'mobile' ? <span className="nm">{SHORT[id]}</span> : key && <small>{key}</small>}</button>)}
      <button title="แผนที่โลก (M)" aria-label="แผนที่โลก" onClick={() => window.dispatchEvent(new CustomEvent('sf-open-win', { detail: 'map' }))}><img className="sf-menu-ico" src="/art/ui-kit/map_waypoint_node_swords.webp" alt="" />{layout === 'mobile' ? <span className="nm">แผนที่</span> : <small>M</small>}</button>
      <button title="ปาร์ตี้ · แชแนล (P)" aria-label="ปาร์ตี้" onClick={() => window.dispatchEvent(new CustomEvent('sf-open-win', { detail: 'party' }))}><img className="sf-menu-ico" src="/art/ui-kit/menu_27_guild_shield_royal.webp" alt="" />{layout === 'mobile' ? <span className="nm">ปาร์ตี้</span> : <small>P</small>}</button>
      <button title="Wiki · ข้อมูลเกม (เปิดแท็บใหม่)" aria-label="Wiki" onClick={() => window.open('/wiki', '_blank', 'noopener')}><img className="sf-menu-ico" src="/art/ui-kit/menu_23_daily_request.webp" alt="" />{layout === 'mobile' ? <span className="nm">วิกิ</span> : <small>W</small>}</button>
      {layout === 'mobile' && <button title="หมุนจอ" aria-label={orientation === 'portrait' ? 'สลับเป็นแนวนอน' : 'สลับเป็นแนวตั้ง'} onClick={() => window.dispatchEvent(new Event('sf-rotate'))}><span className="rot-ico" aria-hidden>{orientation === 'portrait' ? '▭' : '▯'}</span><span className="nm">{orientation === 'portrait' ? 'แนวนอน' : 'แนวตั้ง'}</span></button>}
      {exitItems().map(m => <button key={m.id} title={m.label} aria-label={m.label} onClick={m.run}><img className="sf-menu-ico" src={`/art/ui-kit/${m.art}.webp`} alt="" /><span className="nm">{m.label}</span></button>)}</nav>}
    {/* windows */}
    {panel && layout === 'mobile' && (panel === 'inventory' || panel === 'character') ? <div className="h3-drawer pointer-events-auto" role="dialog" aria-label="กระเป๋าและสเตตัส">
      <header><span className="dtabs"><button className={panel === 'inventory' ? 'on' : ''} onClick={() => setPanel('inventory')}>🎒 อุปกรณ์ & กระเป๋า</button><button className={panel === 'character' ? 'on' : ''} onClick={() => setPanel('character')}>♜ สเตตัส</button></span>
        <button className="sf-close" onClick={() => setPanel(null)} aria-label="ปิด" title="ปิด (Esc)" /></header>
      <div className="body">{panel === 'inventory' ? <MobileInventoryDrawer /> : <MobileStatusPanel />}</div></div>
    : panel && <div className={`h2-win pointer-events-auto ${panel === 'inventory' || panel === 'wardrobe' || panel === 'codex' ? 'wide' : ''} ${pc ? (PC_PAGE.includes(panel) ? 'pc-page' : 'pc-dock') : ''}`} data-panel={panel}>
      <header><img className="sf-win-ico" src={`/art/ui-kit/${MENU_ART[panel]}.webp`} alt="" /><h2>{title[panel]}</h2>{pc && <MenuButton open={menuOpen} onClick={() => setMenuOpen(v => !v)} />}<button className="sf-close" onClick={() => setPanel(null)} aria-label="ปิด" title="ปิด (Esc)" /></header><div className="body">
      {panel === 'inventory' && <PCInventoryPanel />}{panel === 'character' && <PCStatusPanel />}{panel === 'skills' && <SkillsPanel />}{panel === 'quests' && <QuestsPanel />}{panel === 'codex' && <CollectionPanel />}{panel === 'wardrobe' && <WardrobePanel />}{panel === 'monsters' && <MonsterListPanel />}
      {panel === 'auto' && <AutoPanel />}{panel === 'settings' && <SettingsPanel />}{panel === 'cloud' && <CloudSave />}{panel === 'online' && <OnlinePanel />}</div></div>}
    <div className={`h2-log ${layout === 'mobile' ? 'hidden' : ''}`}>{log.slice(0, 5).map((l, i) => <div key={`${l}-${i}`} style={{ opacity: 1 - i * .16 }}>› {l}</div>)}</div>
    {(pending || charge) && <div className="h2-cast">{charge ? `ง้างสายธนู ×${(1 + 2 * Math.min(1, (now - charge.start) / 1600)).toFixed(1)}` : `ร่าย ${skillDefs.find(d => d.id === pending?.skillId)?.name ?? ''}`}<i style={{ transform: `scaleX(${charge ? Math.min(1, (now - charge.start) / 1600) : pending ? Math.min(1, 1 - (pending.at - now) / Math.max(1, (skillDefs.find(d => d.id === pending.skillId)?.castMs ?? 1))) : 0})` }} /></div>}
    <TipCard /><BossDashboard /><NpcDialog />
    {deadUntil > 0 && <div className="death-overlay"><div><h2>วิญญาณของเจ้ายังคงอยู่</h2><p>กลับสู่วิหาร</p><button disabled={now < deadUntil} onClick={() => useGameStore.getState().respawn()}>{now < deadUntil ? 'กำลังล้ม…' : 'ฟื้นคืนชีพ'}</button></div></div>}
  </div>;
}
