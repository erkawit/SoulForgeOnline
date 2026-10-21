'use client';

import { useEffect, useMemo, useState } from 'react';
import { Backpack, Swords, Shield, Sparkles, Gem, Skull, Crown, Flame, UserRound, Settings2, Cloud, MousePointer2, Coins, Zap, Heart, WandSparkles, Crosshair, X, ScrollText, Info, Map, Volume2 } from 'lucide-react';
import { deriveStats } from '@/lib/combat';
import { RARITY_COLOR } from '@/lib/types';
import type { GearSlot, Item } from '@/lib/types';
import { expRequired, useGameStore } from '@/store/useGameStore';
import CloudSave from './CloudSave';
import {CITIES,CLASSES} from '@/game/content';
import OnlinePanel from './OnlinePanel';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { gameConnection } from '@/lib/multiplayer/socket';

type Panel = 'inventory' | 'character' | 'forge' | 'cloud' | 'online' | null;
const slotNames: GearSlot[] = ['weapon', 'armor', 'ring'];
const slotIcons = { weapon: '⚔', armor: '⬡', ring: '◇' };

function Meter({ value, max, kind, label }: { value: number; max: number; kind: 'hp' | 'mp' | 'xp'; label: string }) {
  return <div className="meter-group">
    <div className="meter-line"><span>{label}</span><span>{Math.floor(value)} <small>/ {Math.floor(max)}</small></span></div>
    <div className={`meter-track ${kind}`}><div style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%` }} /></div>
  </div>;
}

function ItemTile({ item, index, onEquip, onSwap }: {
  item: Item | null; index: number; onEquip: (index: number) => void; onSwap: (from: number, to: number) => void;
}) {
  return <button title={item ? `${item.name}\n${JSON.stringify(item.bonuses)}\nDouble click to equip` : 'Empty slot'}
    className={`item-slot ${item ? 'filled' : ''}`}
    draggable={Boolean(item)}
    onDragStart={e => e.dataTransfer.setData('text/plain', String(index))}
    onDragOver={e => e.preventDefault()}
    onDrop={e => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) onSwap(from, index); }}
    onDoubleClick={() => onEquip(index)}>
    {item && <><span className="item-glyph" style={{ color: RARITY_COLOR[item.rarity] }}>{item.slot === 'weapon' ? '⚔' : item.slot === 'armor' ? '⬡' : '◇'}</span><span className="item-glow" style={{ background: RARITY_COLOR[item.rarity] }} /></>}
  </button>;
}

function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory);
  const equipment = useGameStore(s => s.equipment);
  const gold = useGameStore(s => s.player.gold);
  const equip = useGameStore(s => s.equip);
  const unequip = useGameStore(s => s.unequip);
  const swap = useGameStore(s => s.swapInventory);
  const count = inventory.filter(Boolean).length;
  return <div>
    <div className="panel-subheading">EQUIPPED GEAR</div>
    <div className="equipment-row">{slotNames.map(slot => <button key={slot} className="equipment-slot" onClick={() => unequip(slot)} title="Click to unequip">
      <span className="equipment-glyph">{slotIcons[slot]}</span>
      <span className="equipment-name">{equipment[slot]?.name ?? slot.toUpperCase()}</span>
    </button>)}</div>
    <div className="panel-subheading flex justify-between"><span>INVENTORY / 24 SLOTS</span><span>{count}/24</span></div>
    <div className="inventory-grid">{inventory.map((item, index) => <ItemTile key={index} item={item} index={index} onEquip={equip} onSwap={swap} />)}</div>
    <div className="inventory-footer"><span><Coins size={15} color="#e8c27b" /> {gold.toLocaleString()} Gold</span><span>Double click to equip · Drag to move</span></div>
  </div>;
}

function CharacterPanel() {
  const player = useGameStore(s => s.player);
  const equipment = useGameStore(s => s.equipment);
  const calculated = useMemo(() => deriveStats(player.stats, equipment), [player.stats, equipment]);
  const attributes = Object.entries(player.stats);
  return <div>
    <div className="portrait-frame"><div className="portrait-symbol">✦</div><div><span className="label-quiet">ECLIPSE WANDERER</span><h3>{player.name}</h3><span className="level-tag">LEVEL {player.level}</span></div></div>
    <div className="panel-subheading">BASE ATTRIBUTES</div>
    <div className="attributes-grid">{attributes.map(([name, value]) => <div key={name}><span>{name.toUpperCase()}</span><strong>{value}</strong></div>)}</div>
    <div className="panel-subheading">COMBAT RATING</div>
    <div className="stats-grid">
      <div><Swords size={15} /> ATK <b>{calculated.attack}</b></div>
      <div><Shield size={15} /> DEF <b>{calculated.defense}</b></div>
      <div><Crosshair size={15} /> CRIT <b>{Math.round(calculated.crit * 100)}%</b></div>
      <div><Zap size={15} /> SPD <b>{calculated.speed.toFixed(1)}</b></div>
      <div><Heart size={15} /> MAX HP <b>{calculated.maxHp}</b></div>
      <div><WandSparkles size={15} /> MAX MP <b>{calculated.maxMp}</b></div>
    </div>
    <div className="info-note">Gear attributes automatically modify your combat statistics. Leveling grants STR, AGI and VIT.</div>
  </div>;
}

function ForgePanel() {
  const shards = useGameStore(s => s.soulShards);
  const weapon = useGameStore(s => s.equipment.weapon);
  const forge = useGameStore(s => s.forge);
  return <div className="forge-panel">
    <div className="forge-orb"><Sparkles size={42} strokeWidth={1} /><div className="forge-halo" /></div>
    <h3>SOUL-FORGE ALTAR</h3>
    <p>Bind a monster spirit into your weapon to change its power and aura.</p>
    <div className="forge-item"><span>CURRENT WEAPON</span><b>{weapon?.name ?? 'No weapon equipped'}</b></div>
    <div className="forge-item"><span>SOUL SHARDS</span><b><Gem size={16} color="#b88fff" /> {shards} / 3</b></div>
    <button className="action-button forge-button" onClick={forge} disabled={!weapon || shards < 3}><Flame size={17} /> FUSE MONSTER SOUL</button>
    <div className="info-note">Demo cycle: Ember → Frost → Void. Each bound soul grants +6 ATK and a colored weapon aura. Full monster-specific souls and skill mutations are planned.</div>
  </div>;
}

export default function GameHUD() {
  const network = useMultiplayerStore();
  const journal=useGameStore(s=>s.journal);
  const deadUntil=useGameStore(s=>s.deadUntil);
  const buffUntil=useGameStore(s=>s.buffUntil);
  const guardUntil=useGameStore(s=>s.guardUntil);
  const pending=useGameStore(s=>s.pending);
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),200);return()=>clearInterval(t);},[]);
  const [panel, setPanel] = useState<Panel>(null);
  const player = useGameStore(s => s.player);
  const city=CITIES[network.online?'hollow':player.cityId??'hollow'];
  const cls=CLASSES[player.classId??'Warrior'];
  const monsters = useGameStore(s => s.monsters);
  const drops = useGameStore(s => s.drops);
  const equipment = useGameStore(s => s.equipment);
  const log = useGameStore(s => s.log);
  const selectedMonster = useGameStore(s => s.selectedMonster);
  const selected = monsters.find(m => m.id === selectedMonster);
  const derived = useMemo(() => deriveStats(player.stats, equipment), [player.stats, equipment]);
  const self = network.connected ? network.players.find(p=>p.id===network.playerId) : undefined;
  const health = self?.hp ?? player.hp;
  const maxHealth = self?.maxHp ?? derived.maxHp;
  const mana = self?.mp ?? player.mp;
  const maxMana = self?.maxMp ?? derived.maxMp;
  const nearbyDrops = drops.filter(d => Math.hypot(player.position[0] - d.x, player.position[1] - d.z) <= 4);
  const toggle = (p: Panel) => setPanel(v => v === p ? null : p);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select') || e.target.isContentEditable)) return;
      if (e.repeat) return;
      if (e.key.toLowerCase()==='j'){useGameStore.getState().setJournal(!useGameStore.getState().journal);return;}
      if(useGameStore.getState().journal)return;
      if (e.key.toLowerCase() === 'i') setPanel(p => p === 'inventory' ? null : 'inventory');
      if (e.key.toLowerCase() === 'f') setPanel(p => p === 'forge' ? null : 'forge');
      if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  return <div className="hud-root pointer-events-none">
    <header className="topbar pointer-events-auto">
      <div className="brand"><div className="brand-mark"><Sparkles size={23} /></div><div><b>SOUL<span>FORGE</span></b><small>ECLIPSE FRONTIER</small></div></div>
      <div className="top-center"><span className="world-indicator"><span /> {city.name.toUpperCase()}</span><span className="beta-pill">ALPHA PROTOTYPE</span></div>
      <div className="top-controls"><span className="top-online"><span /> {network.connected ? 'ONLINE WORLD' : 'LOCAL WORLD'}</span><button title="Cloud save" onClick={() => toggle('cloud')}><Cloud size={17} /></button><button title="Character" onClick={() => toggle('character')}><UserRound size={17} /></button></div>
    </header>
    <section className="character-hud pointer-events-auto">
      <div className="hud-avatar">✦ <span>{player.level}</span></div>
      <div className="character-status"><div className="character-name">{player.name}<small> LEVEL {player.level} · {player.classId??'Warrior'}</small></div>
        <Meter value={health} max={maxHealth} kind="hp" label="HEALTH" />
        <Meter value={mana} max={maxMana} kind="mp" label="MANA" />
        <Meter value={player.exp} max={expRequired(player.level)} kind="xp" label="EXP" />
      </div>
    </section>
    <section className="world-top-right"><div className="mini-map pointer-events-auto"><div className="mini-map-grid" /><svg viewBox="-30 -30 60 60" className="live-map" aria-label="World minimap: gold player, red enemies, purple loot">
      <path d={city.mapPath} fill="none" stroke="#857355" strokeWidth="1"/>
      {city.buildings.map((b,i)=><rect key={i} x={b.x-b.w/2} y={b.z-b.d/2} width={b.w} height={b.d} fill={city.roof} stroke={city.accent} strokeWidth={.3}/>)}
      <circle r="6" fill="none" stroke="#61a89a"/>
      {(network.connected ? network.players.filter(p=>p.id!==network.playerId).map(p=>({id:p.id,x:p.x,z:p.z,hp:1})) : monsters).filter(m=>m.hp>0).map(m=><circle key={m.id} cx={m.x} cy={m.z} r=".8" fill={network.connected?'#6dc8db':'#e37c6c'}/>)}
      {(network.connected?network.loot:drops).map(d=><circle key={d.id} cx={d.x} cy={d.z} r=".65" fill="#cb8ff2"/>)}
      {network.connected&&network.boss&&<circle cx={network.boss.x} cy={network.boss.z} r="1.6" fill="#ef6357"/>}
      <circle cx={player.position[0]} cy={player.position[1]} r="1.2" fill="#ffe4a1" stroke="#fff" strokeWidth=".3"/>
    </svg></div>
      <div className="mini-map-label">{city.name.toUpperCase()} <span>{city.subtitle} · Lv. {city.levels?.join('–')??'1–5'}</span></div>
    </section>
    <button className="journal-open" onClick={()=>useGameStore.getState().setJournal(true)}>J · CLASSES / TRAVEL / ART</button>
    <div className="left-quest"><span className="eyebrow">◈ WORLD QUEST</span><b>Whispers of the Fallen</b><p>Defeat shadow creatures and gather soul fragments for your forge.</p>
      <div className="quest-count"><Skull size={14} /> {monsters.filter(m => m.hp === 0).length} / {monsters.length} defeated now</div>
      <div className="quest-rule" /><span className="eyebrow muted">NEXT WORLD EVENT</span><div className="quest-event"><Crown size={17} /> World Boss <em>{network.connected ? (network.boss ? 'Active' : 'Awaiting spawn') : 'Online realm'}</em></div>
    </div>
    {network.connected && network.boss && <div className="boss-banner"><span>♛ WORLD BOSS · {network.boss.phase}</span><b>ABYSSAL FORGE TITAN</b><div className="target-health"><span style={{width:`${Math.max(0,network.boss.hp/network.boss.maxHp*100)}%`}}/></div><small>{Math.ceil(network.boss.hp).toLocaleString()} / {network.boss.maxHp.toLocaleString()}</small></div>}
    {!network.connected && selected && selected.hp > 0 && <div className="target-card"><Skull size={18} color="#e8a4c2" /><div><b>{selected.name} · LV {selected.level}</b><div className="target-health"><span style={{ width: `${(selected.hp / selected.maxHp) * 100}%` }} /></div></div></div>}
    <div className="event-feed">{log.slice(0, 4).map((line, i) => <div key={`${line}-${i}`} style={{ opacity: 1 - i * 0.18 }}><span>›</span> {line}</div>)}</div>
    <div className="right-panel-container pointer-events-auto">
      <div className="panel-nav">
        {([['inventory', Backpack, 'Inventory'], ['character', UserRound, 'Character'], ['forge', Flame, 'Soul Forge'], ['cloud', Cloud, 'Cloud Save'], ['online', Swords, 'Online Realm']] as const).map(([id, Icon, label]) => <button title={label} key={id} onClick={() => toggle(id)} className={panel === id ? 'active' : ''}><Icon size={18} /></button>)}
      </div>
      {panel && <div className="game-panel"><div className="panel-header"><div><span className="eyebrow">THE WANDERER</span><h2>{panel === 'inventory' ? 'Inventory' : panel === 'character' ? 'Character' : panel === 'forge' ? 'Soul-Forge' : panel === 'online' ? 'Online Realm' : 'Cloud Save'}</h2></div><button onClick={() => setPanel(null)} aria-label="Close panel"><X size={18} /></button></div>
        {panel === 'inventory' && <InventoryPanel />}{panel === 'character' && <CharacterPanel />}{panel === 'forge' && <ForgePanel />}{panel === 'cloud' && <CloudSave />}{panel === 'online' && <OnlinePanel />}
      </div>}
    </div>
    <div className="bottom-center pointer-events-auto"><div className="action-tray"><ResourceOrb value={health} max={maxHealth} kind="health" />
      <button title="Basic attack: click a monster" onClick={() => {
        if (network.connected) { gameConnection.attack(); return; }
        const state = useGameStore.getState();
        const target = state.monsters.filter(m => m.hp > 0).sort((a, b) => Math.hypot(a.x - state.player.position[0], a.z - state.player.position[1]) - Math.hypot(b.x - state.player.position[0], b.z - state.player.position[1]))[0];
        if (target) state.selectMonster(target.id);
      }}><div className="skill-icon slash"><Swords size={26} /></div><small>LMB</small></button>
      <button title={`${cls.skills[0]} (Space, 20 MP)`} onClick={() => network.connected ? gameConnection.attack('abyssal-forge-titan','soul_burst') : useGameStore.getState().castNearest()}><div className="skill-icon burst"><Flame size={26} /></div><small>SPACE</small></button>
      <button title="Pick up nearby loot" onClick={() => { if(network.connected) network.loot.filter(d=>Math.hypot(player.position[0]-d.x,player.position[1]-d.z)<=4).forEach(d=>gameConnection.pickup(d.id)); else nearbyDrops.forEach(d => useGameStore.getState().pickup(d.id)); }}><div className="skill-icon loot"><Gem size={24} /></div><small>LOOT</small></button>
      <button disabled={network.online} title={`${cls.skills[1]} (Q, 15 MP)`} onClick={()=>useGameStore.getState().cast('buff')}><div className="skill-icon secondary"><Sparkles size={22}/></div><small>Q · BUFF</small></button>
      <button disabled={network.online} title={`${cls.skills[2]} (E, 30 MP)`} onClick={()=>useGameStore.getState().cast('special')}><div className="skill-icon secondary"><Shield size={22}/></div><small>E · SPECIAL</small></button>
      <div className="tray-separator" />
      <button title="Inventory" onClick={() => toggle('inventory')}><div className="skill-icon secondary"><Backpack size={23} /></div><small>I</small></button>
      <button title="Soul Forge" onClick={() => toggle('forge')}><div className="skill-icon secondary"><WandSparkles size={23} /></div><small>F</small></button>
    <ResourceOrb value={mana} max={maxMana} kind="mana" /></div><div className="hotbar-hint"><MousePointer2 size={13} /> CLICK MONSTER TO CHASE & ATTACK <span>·</span> WASD MOVE <span>·</span> DRAG ROTATE <span>·</span> SCROLL ZOOM</div></div>
    {!network.online&&(pending||now<buffUntil||now<guardUntil)&&<div className="skill-status">{pending?'CHANNELING…':now<guardUntil?'PROTECTION ACTIVE':'BUFF · +20% DAMAGE'}</div>}
    {deadUntil>0&&<div className="death-overlay"><div><h2>Your soul endures</h2><p>Return to the sanctuary.</p><button disabled={now<deadUntil} onClick={()=>useGameStore.getState().respawn()}>{now<deadUntil?'Falling…':'REVIVE'}</button></div></div>}
    <div className="bottom-left"><span className="demo-dot" /> DEMO WORLD <span className="divider-dot">·</span> GUEST AUTOSAVE</div>
    <div className="bottom-right"><Settings2 size={14} /> R3F ENGINE <span>·</span> 60 FPS TARGET</div>
  </div>;
}

function ResourceOrb({value,max,kind}:{value:number;max:number;kind:'health'|'mana'}) {
 const percent=Math.max(0,Math.min(100,value/Math.max(1,max)*100));
 return <div className={`resource-orb ${kind}`} role="meter" aria-label={kind} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}><div className="orb-liquid" style={{height:`${percent}%`}}/><div className="orb-glass"/><strong>{Math.floor(value)}</strong><small>{kind==='health'?'LIFE':'MANA'}</small></div>;
}
