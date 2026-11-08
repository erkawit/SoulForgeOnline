'use client';
// Shared pieces of the UX-spec HUD: screen-scale hook, the skull-framed orbs, hotbar data and the basic attack.
// PC and Mobile layouts are separate component sets (spec) — only data/logic lives here.
import { useEffect, useState } from 'react';
import { currentLayout, orientationFor, type Layout, type Orientation } from '@/game/ui/layout';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGameStore } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { gameConnection, titanInReach } from '@/lib/multiplayer/socket';
import { scaled } from '@/game/skills/engine';
import { ForgeFire } from '@/game/ui/forgeFire';
import { evolvedSkill } from '@/game/skills/defaults';

export const CLASS_COLOR: Record<string, string> = { Berserker: '#ff4a3a', Reaver: '#c03cff' };
export const CLASS_TH: Record<string, string> = { Berserker: 'เบอร์เซิร์กเกอร์', Reaver: 'รีเวอร์' };
/** keyboard labels: slot 0 = basic attack, 1–6 = skills */
export const KEYS = ['1', 'Space', 'Q', 'E', 'R', 'T', 'X'];
export const fmt = (n: number) => Math.round(n).toLocaleString();
/** painted portraits: public/art/portraits/[f-]<class>-face.png · -full.png */
const NEW_PORTRAIT = ['Paladin','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor','Berserker'];
export const portrait = (cls: string, g?: string, kind: 'face' | 'full' = 'face') => {
  const c = cls === 'Reaver' ? 'Berserker' : cls;
  if (g !== 'f' && NEW_PORTRAIT.includes(c)) return `/art/portraits/${c.toLowerCase()}-${kind}.png`; // Round 20 class art (male)
  return ['Berserker','Reaver'].includes(cls) ? `/art/sprites/${g === 'f' ? 'f' : 'm'}-look-${cls}.webp` : `/art/portraits/${g === 'f' ? 'f-' : ''}${cls.toLowerCase()}-${kind}.png`;
};

/** spec screen-scale checker: < 768 px (or a phone held sideways) → Mobile component set */
export function useScreenScale(): Layout {
  const [l, setL] = useState<Layout>('pc'); const mode = useSettingsStore(s => s.controls);
  useEffect(() => { const f = () => setL(currentLayout(mode)); f(); addEventListener('resize', f); addEventListener('orientationchange', f); return () => { removeEventListener('resize', f); removeEventListener('orientationchange', f); }; }, [mode]);
  return l;
}
/** round 22: portrait / landscape — the touch controller lays itself out differently for each */
export function useOrientation(): Orientation {
  const [o, setO] = useState<Orientation>('portrait');
  useEffect(() => { const f = () => setO(orientationFor(innerWidth, innerHeight)); f(); addEventListener('resize', f); addEventListener('orientationchange', f); return () => { removeEventListener('resize', f); removeEventListener('orientationchange', f); }; }, []);
  return o;
}

export function OrbFrame({ kind }: { kind: 'hp' | 'mp' }) {
  const g = kind === 'hp' ? '#C89B3C' : '#b7a27a', eye = kind === 'hp' ? '#ff5a2a' : '#7a6cff';
  const rivets = [30, 75, 105, 150, 210, 250, 290, 330].map(a => a * Math.PI / 180);
  return <svg className="ofr" viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id={`rm-${kind}`} cx="50%" cy="40%" r="60%"><stop offset="0" stopColor="#4a423c" /><stop offset=".7" stopColor="#2A2725" /><stop offset="1" stopColor="#16130f" /></radialGradient>
      <linearGradient id={`gd-${kind}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0d38a" /><stop offset=".5" stopColor={g} /><stop offset="1" stopColor="#5a4318" /></linearGradient></defs>
    <circle cx="100" cy="104" r="91" fill="none" stroke={`url(#rm-${kind})`} strokeWidth="16" />
    <circle cx="100" cy="104" r="99" fill="none" stroke={`url(#gd-${kind})`} strokeWidth="2.5" /><circle cx="100" cy="104" r="83" fill="none" stroke={`url(#gd-${kind})`} strokeWidth="1.6" opacity=".8" />
    {rivets.map((r, i) => <circle key={i} cx={100 + Math.cos(r) * 91} cy={104 + Math.sin(r) * 91} r="3.2" fill="#8a7650" stroke="#1a140c" />)}
    <g transform="translate(100 16)"><path d="M-24 4 Q-26 -20 0 -22 Q26 -20 24 4 Q24 14 14 18 L14 26 L-14 26 L-14 18 Q-24 14 -24 4Z" fill="#d8cdb4" stroke="#2a2016" strokeWidth="2.5" />
      <ellipse cx="-10" cy="2" rx="7" ry="8" fill="#140e0a" /><ellipse cx="10" cy="2" rx="7" ry="8" fill="#140e0a" /><circle cx="-10" cy="3" r="2.3" fill={eye} /><circle cx="10" cy="3" r="2.3" fill={eye} />
      <path d="M-3 12 L0 7 L3 12Z" fill="#140e0a" /><path d="M-10 19 V26 M-5 19 V26 M0 19 V26 M5 19 V26 M10 19 V26" stroke="#2a2016" strokeWidth="1.6" />
      <path d="M-40 10 Q-30 -2 -24 2 M40 10 Q30 -2 24 2" stroke={`url(#gd-${kind})`} strokeWidth="4" fill="none" strokeLinecap="round" /></g></svg>;
}
/** Diablo-style orb: HP deep blood with an orange inner glow, MP indigo → violet */
export function SkullOrb({ value, max, kind }: { value: number; max: number; kind: 'hp' | 'mp' }) {
  const k = Math.max(0, Math.min(1, value / Math.max(1, max)));
  return <div className={`h3-orb ${kind} ${kind === 'hp' && k < .3 ? 'low' : ''}`} role="meter" aria-label={kind === 'hp' ? 'HP' : 'MP'} aria-valuenow={Math.round(value)} aria-valuemax={Math.round(max)}>
    <div className="glass"><i className="liquid" style={{ clipPath: `inset(${((1 - k) * 100).toFixed(1)}% 0 0 0)` }}><b /></i><span className="inglow" /><span className="shine" /></div>
    <OrbFrame kind={kind} /><div className="kit-ring" aria-hidden="true" /><div className="txt">{fmt(value)}<small>/ {fmt(max)}</small></div><div className="lbl">{kind === 'hp' ? 'HP' : 'MP'}</div></div>;
}

export type SlotView = { i: number; id: string | null; /** the skill that actually fires (Reaver evolution) — its icon */ shows: string | null; name: string; glyph: string; title: string; left: number; total: number; cost: number; off: boolean; nomp: boolean; autoOff: boolean };
/** the 6 skill slots (Space Q E R T X) as plain data for either layout */
export function useSkillSlots(now: number, mp: number): SlotView[] {
  const hotbar = useGameStore(s => s.hotbar), extra = useGameStore(s => s.extraHotbar), cooldowns = useGameStore(s => s.cooldowns), skillLevels = useGameStore(s => s.skillLevels), auto = useGameStore(s => s.auto);
  const defs = useConfigStore(s => s.skills.defs);
  const ids = [hotbar.skill, hotbar.buff, hotbar.special, ...extra];
  return ids.map((id, i) => {
    const d = defs.find(x => x.id === id), lvl = id ? skillLevels[id] ?? 0 : 0, shows = id ? evolvedSkill({ defs, trees: {} as never }, id, skillLevels) : null;
    const left = d ? Math.max(0, (cooldowns[d.id] ?? 0) - now) : 0, total = d ? d.cooldownSec * 1000 : 1, cost = d ? Math.round(scaled(d.mpCost, d.mpPerLevel, Math.max(1, lvl))) : 0;
    return { i: i + 1, id: id ?? null, shows, name: d ? d.name : 'ว่าง', glyph: d ? (d.th || d.name).slice(0, 2) : '+', title: d ? `${d.name} · ${d.th}\n${d.description}\nMP ${cost} · CD ${d.cooldownSec}s${lvl < 1 ? '\n(ยังไม่ได้เรียน — กด K)' : ''}` : 'ว่าง',
      left, total, cost, off: !d || lvl < 1, nomp: mp < cost, autoOff: auto.enabled && auto.skills[i + 1] === false };
  });
}
export function castSlot(i: number) {
  if (i === 1 && titanInReach()) { gameConnection.attack('abyssal-forge-titan', 'soul_burst'); return; }
  useGameStore.getState().castSlot(i);
}
export function basicDown() {
  if (titanInReach()) { gameConnection.attack(); return; }
  const st = useGameStore.getState();
  const t = st.monsters.find(m => m.id === st.selectedMonster && m.hp > 0) ?? st.monsters.filter(m => m.hp > 0).sort((a, b) => Math.hypot(a.x - st.player.position[0], a.z - st.player.position[1]) - Math.hypot(b.x - st.player.position[0], b.z - st.player.position[1]))[0];
  if (t) { st.selectMonster(t.id); st.attack(t.id); }
}
/** round 13: the Berserker has no charged shot — releasing the key does nothing */
export function basicUp() { /* no-op */ }

export const FORGE_TIP = 'ไฟเตาหลอม — ลุกโชนขึ้นทุกครั้งที่โจมตีโดน และค่อย ๆ มอดลงเมื่อหยุดสู้ (ตอนนี้แสดงจังหวะการต่อสู้เท่านั้น ยังไม่มีผลต่อสเตตัส)';
/** forge-fire gauge value, fed by the store's floating combat numbers that land on monsters */
export function useForgeFire() {
  const [v, setV] = useState({ value: 0, heat: 0 });
  useEffect(() => {
    const f = new ForgeFire(); let last = useGameStore.getState().combat.at(-1)?.seq ?? 0, t = performance.now(), raf = 0;
    const loop = () => {
      const now = performance.now();
      for (const e of useGameStore.getState().combat) if (e.seq > last) { last = e.seq; if (e.on === 'monster') f.hit(e.kind === 'crit' ? 'crit' : e.kind === 'skill' ? 'skill' : 'hit'); }
      f.update(Math.min(.2, (now - t) / 1000)); t = now;
      setV(p => Math.abs(p.value - f.value) > .5 || p.heat !== f.heat ? { value: f.value, heat: f.heat } : p); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  return v;
}
export function ForgeGauge({ mini = false }: { mini?: boolean }) {
  const f = useForgeFire();
  return <div className={`sf-forge ${mini ? 'mini' : ''}`} data-heat={f.heat} title={FORGE_TIP} role="meter" aria-label="ไฟเตาหลอม" aria-valuenow={Math.round(f.value)} aria-valuemax={100}>
    <i style={{ transform: `scaleX(${f.value / 100})` }} />{!mini && <span>🔥 ไฟเตาหลอม</span>}</div>;
}
