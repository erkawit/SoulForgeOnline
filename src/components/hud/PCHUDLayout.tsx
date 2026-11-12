'use client';
// PCHUDLayout (≥ 768 px): character frame top-left, HP orb left · centre hotbar (attack + skills 1–6 + potions / food)
// with a thin gold EXP strip · MP orb right, AUTO beside it. Menus / minimap stay in GameHUD.
import { skillIconStyle } from '@/game/skills/icons';
import { Swords } from 'lucide-react';
import { useGameStore, countOf, expRequired } from '@/store/useGameStore';
import { usePlayerStatic } from '@/store/usePlayerStatic';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { FOCUS_TH, isSupportClass } from '@/game/auto';
import { FOOD_ITEMS } from '@/game/items';
import { levelTitle } from '@/game/ui/layout';
import { CLASS_COLOR, CLASS_TH, KEYS, SkullOrb, basicDown, basicUp, castSlot, crest, useSkillSlots, fmt } from './common';

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
    <div className="h3-dock pointer-events-auto" style={{ ['--cc' as string]: color }}>
      <SkullOrb value={hp} max={maxHp} kind="hp" />
      <div className="mid"><div className="row">
        <div className="bar">
          <button className="slot basic" title="โจมตีธรรมดา (1)" onPointerDown={e => { e.preventDefault(); basicDown(); }} onPointerUp={basicUp} onPointerLeave={basicUp}><Swords size={26} /><b className="k">{KEYS[0]}</b><span className="al">โจมตี</span></button>
          {slots.map(s => <button key={s.i} className={`slot ${s.off ? 'off' : ''} ${s.nomp ? 'nomp' : ''} ${s.autoOff ? 'autooff' : ''}`} title={s.title} onPointerDown={e => { e.preventDefault(); castSlot(s.i); }}>
            <span className="g">{s.glyph}</span><i className="ic" aria-hidden style={skillIconStyle(s.shows)} /><b className="n">{s.i}</b><b className="k">{KEYS[s.i]}</b>{s.id && <b className="mpc">{s.cost}</b>}
            {s.left > 0 && <span className="cd" style={{ ['--p' as string]: `${Math.min(100, s.left / s.total * 100)}%` }}><b>{Math.ceil(s.left / 1000)}</b></span>}</button>)}
        </div><i className="sep" />
        <div className="belt">
          <button className="slot pot" title="ยา HP (7)" onClick={() => g().usePotion('hp')} disabled={!hpCount}><img src="/art/ui-kit/item_potion_hp_small.webp" alt="" /><b className="k">7</b><b className="q">{hpCount}</b></button>
          <button className="slot pot mp" title="ยา MP (8)" onClick={() => g().usePotion('mp')} disabled={!mpCount}><img src="/art/ui-kit/item_potion_mp_small.webp" alt="" /><b className="k">8</b><b className="q">{mpCount}</b></button>
          <button className={`slot pot ${fed ? 'fed' : ''}`} title="อาหารบัฟ 15 นาที (9)" onClick={() => g().eatFood()} disabled={!foodCount}><span className="ico">🍲</span><b className="k">9</b><b className="q">{foodCount}</b></button>
        </div></div>
        <div className="xp"><i style={{ transform: `scaleX(${Math.min(1, player.exp / expRequired(player.level))})` }} /></div></div>
      <SkullOrb value={mp} max={maxMp} kind="mp" />
      <div className={`h2-auto-btn ${auto.enabled ? 'on' : ''} ${auto.enabled && now < pauseUntil ? 'paused' : ''}`}>
        <button className="a" onClick={() => g().setAuto(!auto.enabled)} title="ล่าอัตโนมัติ (Z)"><b>AUTO</b><small>{!auto.enabled ? 'ปิด' : now < pauseUntil ? 'พัก' : isSupportClass(cls) ? FOCUS_TH[auto.focus].name : 'ล่าอยู่'}</small></button>
        <button className="g" onClick={onAuto} title="ตั้งค่า AUTO">⚙</button></div>
    </div>
  </>;
}
