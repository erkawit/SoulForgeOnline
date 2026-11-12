'use client';
// PCHUDLayout (≥ 768 px): character frame top-left (HP / MP / EXP), action cluster bottom-right (attack + skills 1–6 on an
// arc), potion / food / AUTO row beside it, town NPC shortcuts above it. Menus / minimap stay in GameHUD.
import { skillIconStyle } from '@/game/skills/icons';
import { Swords } from 'lucide-react';
import { useGameStore, countOf, expRequired } from '@/store/useGameStore';
import { usePlayerStatic } from '@/store/usePlayerStatic';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { FOCUS_TH, isSupportClass } from '@/game/auto';
import { FOOD_ITEMS } from '@/game/items';
import { levelTitle } from '@/game/ui/layout';
import { CLASS_COLOR, CLASS_TH, KEYS, basicDown, basicUp, castSlot, crest, useSkillSlots, fmt } from './common';
import TownNpcs from './TownNpcs';

/** [radius px, angle°] from the attack button's centre (0° = right, 90° = up): an inner ring of 4, an outer pair */
const PC_ARC: [number, number][] = [[134, 180], [134, 150], [134, 120], [134, 90], [222, 166], [222, 137]];
const arc = ([r, a]: [number, number]) => ({ ['--x' as string]: `${Math.cos(a * Math.PI / 180) * r}px`, ['--y' as string]: `${-Math.sin(a * Math.PI / 180) * r}px` });

function Bar({ value, max, kind }: { value: number; max: number; kind: 'hp' | 'mp' | 'xp' }) {
  return <div className={`h2-bar ${kind}`}><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, value / Math.max(1, max)))})` }} />{kind !== 'xp' && <span>{fmt(value)} / {fmt(max)}</span>}</div>;
}
export default function PCHUDLayout({ hp, maxHp, mp, maxMp, now, onAuto }: { hp: number; maxHp: number; mp: number; maxMp: number; now: number; onAuto: () => void }) {
  const player = usePlayerStatic(), inventory = useGameStore(s => s.inventory), buffs = useGameStore(s => s.buffs), auto = useGameStore(s => s.auto), pauseUntil = useGameStore(s => s.autoPauseUntil);
  const online = useMultiplayerStore(s => s.online);
  const cls = player.classId ?? 'Berserker', color = CLASS_COLOR[cls], slots = useSkillSlots(now, mp);
  const hpCount = ['potion-hp-l', 'potion-hp-m', 'potion-hp-s'].reduce((a, id) => a + countOf(inventory, id), 0), mpCount = ['potion-mp-m', 'potion-mp-s'].reduce((a, id) => a + countOf(inventory, id), 0);
  const foodCount = FOOD_ITEMS.reduce((a, f) => a + countOf(inventory, f.id), 0), fed = buffs.some(b => b.id.startsWith('food-') && b.until > now);
  const g = useGameStore.getState;
  return <>
    <section className="h2-frame pointer-events-auto" style={{ ['--cc' as string]: color }}>
      <div className="pt" style={{ backgroundImage: `url(${crest(cls)})` }} title={cls}><span>{player.level}</span></div>
      <div><div className="nm">{player.name} <small>{CLASS_TH[cls]} · {levelTitle(player.level)}</small></div><Bar value={hp} max={maxHp} kind="hp" /><Bar value={mp} max={maxMp} kind="mp" /><Bar value={player.exp} max={expRequired(player.level)} kind="xp" /></div>
    </section>
    {/* round 26: a clean PC HUD — the centre bar is gone. Skills sit on an arc around a big attack button in the
        bottom-right (the phone layout, scaled for a mouse), potions / food / AUTO in a short row beside it, the EXP line
        along the bottom edge; HP / MP live in the frame top-left. */}
    <div className="h3-mxp pc-xp"><i style={{ transform: `scaleX(${Math.min(1, player.exp / expRequired(player.level))})` }} /></div>
    <div className="pc-belt pointer-events-auto">
      <button className="slot pot" title="ยา HP (7)" onClick={() => g().usePotion('hp')} disabled={!hpCount}><img src="/art/ui-kit/item_potion_hp_small.webp" alt="" /><b className="k">7</b><b className="q">{hpCount}</b></button>
      <button className="slot pot mp" title="ยา MP (8)" onClick={() => g().usePotion('mp')} disabled={!mpCount}><img src="/art/ui-kit/item_potion_mp_small.webp" alt="" /><b className="k">8</b><b className="q">{mpCount}</b></button>
      <button className={`slot pot ${fed ? 'fed' : ''}`} title="อาหารบัฟ 15 นาที (9)" onClick={() => g().eatFood()} disabled={!foodCount}><img src="/art/ui-kit/item_food_campfire_ration.webp" alt="" /><b className="k">9</b><b className="q">{foodCount}</b></button>
      <div className={`h2-auto-btn ${auto.enabled ? 'on' : ''} ${auto.enabled && now < pauseUntil ? 'paused' : ''}`}>
        <button className="a" onClick={() => g().setAuto(!auto.enabled)} title="ล่าอัตโนมัติ (Z)"><b>AUTO</b><small>{!auto.enabled ? 'ปิด' : now < pauseUntil ? 'พัก' : isSupportClass(cls) ? FOCUS_TH[auto.focus].name : 'ล่าอยู่'}</small></button>
        <button className="g" onClick={onAuto} title="ตั้งค่า AUTO">⚙</button></div>
    </div>
    <div className="tc-act pc-act pointer-events-auto" style={{ ['--cc' as string]: color }}>
      <button className="basic" title="โจมตีธรรมดา (1)" onPointerDown={e => { e.preventDefault(); basicDown(); }} onPointerUp={basicUp} onPointerLeave={basicUp}><Swords size={34} className="sw" /><span>โจมตี</span><b className="k">{KEYS[0]}</b></button>
      {slots.map((s, j) => <button key={s.i} className={`sk ${s.off ? 'off' : ''} ${s.nomp ? 'nomp' : ''} ${s.autoOff ? 'autooff' : ''}`} style={arc(PC_ARC[j])} title={s.title} aria-label={s.name}
        onPointerDown={e => { e.preventDefault(); castSlot(s.i); }}>
        <span className="g">{s.glyph}</span><i className="ic" aria-hidden style={skillIconStyle(s.shows)} /><b className="k">{KEYS[s.i]}</b>{s.id && <b className="mpc">{s.cost}</b>}
        {s.left > 0 && <span className="cd" style={{ ['--p' as string]: `${Math.min(100, s.left / s.total * 100)}%` }}><b>{Math.ceil(s.left / 1000)}</b></span>}</button>)}
    </div>
    <TownNpcs />
  </>;
}
