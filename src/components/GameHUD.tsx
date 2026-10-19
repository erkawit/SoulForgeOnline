'use client';

import { useMemo, useState } from 'react';
import { Backpack, Swords, Shield, Sparkles, Gem, Skull, Crown, Flame, UserRound, Settings2, Cloud, MousePointer2, Coins, Zap, Heart, WandSparkles, Crosshair, X, ScrollText, Info, Map, Volume2 } from 'lucide-react';
import { deriveStats } from '@/lib/combat';
import { RARITY_COLOR } from '@/lib/types';
import type { GearSlot, Item } from '@/lib/types';
import { expRequired, useGameStore } from '@/store/useGameStore';
import CloudSave from './CloudSave';

type Panel = 'inventory' | 'character' | 'forge' | 'cloud' | null;
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
  const [panel, setPanel] = useState<Panel>('inventory');
  const player = useGameStore(s => s.player);
  const monsters = useGameStore(s => s.monsters);
  const drops = useGameStore(s => s.drops);
  const equipment = useGameStore(s => s.equipment);
  const log = useGameStore(s => s.log);
  const selectedMonster = useGameStore(s => s.selectedMonster);
  const selected = monsters.find(m => m.id === selectedMonster);
  const derived = useMemo(() => deriveStats(player.stats, equipment), [player.stats, equipment]);
  const nearbyDrops = drops.filter(d => Math.hypot(player.position[0] - d.x, player.position[1] - d.z) <= 4);
  const toggle = (p: Panel) => setPanel(v => v === p ? null : p);
  return <div className="hud-root pointer-events-none">
    <header className="topbar pointer-events-auto">
      <div className="brand"><div className="brand-mark"><Sparkles size={23} /></div><div><b>SOUL<span>FORGE</span></b><small>ECLIPSE FRONTIER</small></div></div>
      <div className="top-center"><span className="world-indicator"><span /> HOLLOW REACH</span><span className="beta-pill">ALPHA PROTOTYPE</span></div>
      <div className="top-controls"><span className="top-online"><span /> LOCAL WORLD</span><button title="Cloud save" onClick={() => toggle('cloud')}><Cloud size={17} /></button><button title="Character" onClick={() => toggle('character')}><UserRound size={17} /></button></div>
    </header>
    <section className="character-hud pointer-events-auto">
      <div className="hud-avatar">✦ <span>{player.level}</span></div>
      <div className="character-status"><div className="character-name">{player.name}<small> LEVEL {player.level} · SOULBINDER</small></div>
        <Meter value={player.hp} max={derived.maxHp} kind="hp" label="HEALTH" />
        <Meter value={player.mp} max={derived.maxMp} kind="mp" label="MANA" />
        <Meter value={player.exp} max={expRequired(player.level)} kind="xp" label="EXP" />
      </div>
    </section>
    <section className="world-top-right"><div className="mini-map pointer-events-auto"><div className="mini-map-grid" /><div className="mini-rune">✧</div><span className="mini-dot" /></div>
      <div className="mini-map-label">THE HOLLOW REACH <span>ZONE 01 · Lv. 1–5</span></div>
    </section>
    <div className="left-quest"><span className="eyebrow">◈ WORLD QUEST</span><b>Whispers of the Fallen</b><p>Defeat shadow creatures and gather soul fragments for your forge.</p>
      <div className="quest-count"><Skull size={14} /> {monsters.filter(m => m.hp === 0).length} / {monsters.length} defeated now</div>
      <div className="quest-rule" /><span className="eyebrow muted">NEXT WORLD EVENT</span><div className="quest-event"><Crown size={17} /> World Boss <em>Planned</em></div>
    </div>
    {selected && selected.hp > 0 && <div className="target-card"><Skull size={18} color="#e8a4c2" /><div><b>{selected.name} · LV {selected.level}</b><div className="target-health"><span style={{ width: `${(selected.hp / selected.maxHp) * 100}%` }} /></div></div></div>}
    <div className="event-feed">{log.slice(0, 4).map((line, i) => <div key={`${line}-${i}`} style={{ opacity: 1 - i * 0.18 }}><span>›</span> {line}</div>)}</div>
    <div className="right-panel-container pointer-events-auto">
      <div className="panel-nav">
        {([['inventory', Backpack, 'Inventory'], ['character', UserRound, 'Character'], ['forge', Flame, 'Soul Forge'], ['cloud', Cloud, 'Cloud Save']] as const).map(([id, Icon, label]) => <button title={label} key={id} onClick={() => toggle(id)} className={panel === id ? 'active' : ''}><Icon size={18} /></button>)}
      </div>
      {panel && <div className="game-panel"><div className="panel-header"><div><span className="eyebrow">THE WANDERER</span><h2>{panel === 'inventory' ? 'Inventory' : panel === 'character' ? 'Character' : panel === 'forge' ? 'Soul-Forge' : 'Cloud Save'}</h2></div><button onClick={() => setPanel(null)} aria-label="Close panel"><X size={18} /></button></div>
        {panel === 'inventory' && <InventoryPanel />}{panel === 'character' && <CharacterPanel />}{panel === 'forge' && <ForgePanel />}{panel === 'cloud' && <CloudSave />}
      </div>}
    </div>
    <div className="bottom-center pointer-events-auto"><div className="action-tray">
      <button title="Basic attack: click a monster" onClick={() => {
        const state = useGameStore.getState();
        const target = state.monsters.filter(m => m.hp > 0).sort((a, b) => Math.hypot(a.x - state.player.position[0], a.z - state.player.position[1]) - Math.hypot(b.x - state.player.position[0], b.z - state.player.position[1]))[0];
        if (target) state.selectMonster(target.id);
      }}><div className="skill-icon slash"><Swords size={26} /></div><small>LMB</small></button>
      <button title="Soul burst (Space, 20 MP)" onClick={() => useGameStore.getState().castNearest()}><div className="skill-icon burst"><Flame size={26} /></div><small>SPACE</small></button>
      <button title="Pick up nearby loot" onClick={() => { nearbyDrops.forEach(d => useGameStore.getState().pickup(d.id)); }}><div className="skill-icon loot"><Gem size={24} /></div><small>LOOT</small></button>
      <div className="tray-separator" />
      <button title="Inventory" onClick={() => toggle('inventory')}><div className="skill-icon secondary"><Backpack size={23} /></div><small>I</small></button>
      <button title="Soul Forge" onClick={() => toggle('forge')}><div className="skill-icon secondary"><WandSparkles size={23} /></div><small>F</small></button>
    </div><div className="hotbar-hint"><MousePointer2 size={13} /> CLICK MONSTER TO CHASE & ATTACK <span>·</span> WASD MOVE <span>·</span> DRAG ROTATE <span>·</span> SCROLL ZOOM</div></div>
    <div className="bottom-left"><span className="demo-dot" /> DEMO WORLD <span className="divider-dot">·</span> GUEST AUTOSAVE</div>
    <div className="bottom-right"><Settings2 size={14} /> R3F ENGINE <span>·</span> 60 FPS TARGET</div>
  </div>;
}
