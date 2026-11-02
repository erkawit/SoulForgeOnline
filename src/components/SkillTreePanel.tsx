'use client';
// In-game skill tree (K). Learn with skill points, bind any learned active to Space / Q / E.
import '@/styles/soulforge-beta.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { layoutConstellation, attachPanZoom } from '@/game/ui/constellation';
import { useGameStore } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';
import { availablePoints, canLearn } from '@/game/skills/engine';
import { skillIconStyle } from '@/game/skills/icons';
import { describeSkill } from '@/game/skills/describe';

const SLOT_LABEL = { skill: 'Space', buff: 'Q', special: 'E' } as const;
/** Soul Constellation: the same tree as a star map — drag to pan, wheel / pinch / buttons to zoom, click a star */
function Constellation({ tree, sel, onSel, levels, bound }: { tree: { skillId: string; tier: number; col: number; requires: { skillId: string; level: number }[] }[]; sel: string | null; onSel: (id: string) => void; levels: Record<string, number>; bound: string[] }) {
  const lib = useConfigStore(s => s.skills); const svg = useRef<SVGSVGElement>(null), g = useRef<SVGGElement>(null), pz = useRef<ReturnType<typeof attachPanZoom> | null>(null);
  const map = useMemo(() => layoutConstellation(tree), [tree]); const at = new Map(map.nodes.map(n => [n.id, n])); const [bx, by, bw, bh] = map.box;
  useEffect(() => { if (!svg.current || !g.current) return; const p = attachPanZoom(svg.current, g.current); pz.current = p; return () => p.dispose(); }, []);
  const pos = (id: string) => id === 'core' ? map.core : at.get(id)!;
  return <div className="st-sky">
    <svg ref={svg} viewBox={`${bx} ${by} ${bw} ${bh}`} preserveAspectRatio="xMidYMid meet"><g ref={g}>
      {map.links.map(([a, b], i) => { const p = pos(a), q = pos(b); return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={(levels[b] ?? 0) > 0 || a === 'core' ? 'lit' : ''} />; })}
      <g className="corestar"><circle r={30} /><text y={9}>✦</text></g>
      {map.nodes.map(n => { const d = lib.defs.find(x => x.id === n.id); if (!d) return null; const l = levels[n.id] ?? 0, r = d.kind === 'passive' ? 14 : 19;
        return <g key={n.id} tabIndex={0} role="button" aria-label={`${d.name} ${l}/${d.maxLevel}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSel(n.id);}}} className={`star ${d.kind} ${l ? 'on' : ''} ${bound.includes(n.id) ? 'bound' : ''} ${sel === n.id ? 'sel' : ''}`} transform={`translate(${n.x} ${n.y})`} onClick={() => { if (!pz.current?.dragged()) onSel(n.id); }}>
          <circle className="halo" r={r + 9} /><circle className="core" r={r} /><foreignObject x={-r} y={-r} width={r*2} height={r*2}><div className="forge-skill-icon" style={skillIconStyle(n.id)}/></foreignObject><text className="nm" y={r + 17}>{d.name}</text><text className="lv" y={-r - 7}>{l}/{d.maxLevel}</text></g>; })}
    </g></svg>
    <div className="zoom"><button onClick={() => pz.current?.zoom(1.2)} aria-label="ซูมเข้า">＋</button><button onClick={() => pz.current?.zoom(.83)} aria-label="ซูมออก">－</button><button onClick={() => pz.current?.reset()} aria-label="กลับจุดเริ่ม">⟲</button></div>
    <small className="hint">ลากเพื่อเลื่อน · ล้อเมาส์ / สองนิ้วเพื่อซูม · คลิกดาวเพื่อดูสกิล</small>
  </div>;
}
export default function SkillTreePanel() {
  const lib = useConfigStore(s => s.skills);
  const cls = useGameStore(s => s.player.classId ?? 'Berserker'), level = useGameStore(s => s.player.level);
  const levels = useGameStore(s => s.skillLevels), hotbar = useGameStore(s => s.hotbar);
  const [browseClass, setBrowseClass] = useState<string>(cls);
  const promoted = useGameStore(s => s.player.promotionId === 'Reaver');
  const tree = (lib.trees[cls] ?? []).filter(n => browseClass === 'Reaver' ? !!n.promotion : !n.promotion);
  const [sel, setSel] = useState<string | null>(tree[0]?.skillId ?? null);
  const [msg, setMsg] = useState(''); const [view, setView] = useState<'star' | 'list'>('star');
  const points = availablePoints(lib, cls, levels, level);
  const def = lib.defs.find(d => d.id === sel), node = tree.find(n => n.skillId === sel), cur = sel ? levels[sel] ?? 0 : 0;
  const check = useMemo(() => (sel ? canLearn(lib, cls, sel, levels, level, promoted) : { ok: false }), [lib, cls, sel, levels, level, promoted]);
  return <div className="st-panel">
    <nav className="forge-tabs forge-class-tabs" aria-label="อาชีพสกิล">{(cls==='Berserker'?['Berserker','Reaver']:[cls]).map(c=><button key={c} aria-pressed={browseClass===c} onClick={()=>{setBrowseClass(c);setSel(lib.trees[cls]?.find(n => c === 'Reaver' ? !!n.promotion : !n.promotion)?.skillId??null);setMsg('');}}>{c}{cls===c?' · อาชีพปัจจุบัน':''}</button>)}</nav>
    <div className="st-points"><span>แต้มสกิลคงเหลือ <b>{points}</b></span><span>เลเวล {level}</span></div>
    <div className="h2-tabs"><button className={view === 'star' ? 'on' : ''} onClick={() => setView('star')}>✦ กลุ่มดาววิญญาณ</button><button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>☰ รายการ</button></div>
    {view === 'star' && <Constellation tree={tree} sel={sel} onSel={id => { setSel(id); setMsg(''); }} levels={levels} bound={Object.values(hotbar).filter((v): v is string => !!v)} />}
    {view === 'list' && [1, 2, 3, 4, 5, 6].map(t => <div key={t} className="st-tier"><span className="st-tier-label">แถว {t} · LV {tree.find(n => n.tier === t)?.unlockLevel ?? '—'}+</span>
      {[0, 1, 2, 3].map(c => { const n = tree.find(x => x.tier === t && x.col === c), d = n && lib.defs.find(x => x.id === n.skillId); if (!n || !d) return <span key={c} />;
        const l = levels[d.id] ?? 0, open = canLearn(lib, cls, d.id, levels, level, promoted).ok || l > 0;
        return <button key={c} className={`st-node ${d.kind} ${l ? 'learned' : ''} ${open ? '' : 'locked'}`} onClick={() => { setSel(d.id); setMsg(''); }} aria-pressed={sel === d.id}>
          <span className="forge-skill-icon" style={skillIconStyle(d.id)}/><b>{d.name}</b><small>{d.th}</small><span className="st-lv">{l}/{d.maxLevel}{Object.entries(hotbar).find(([, v]) => v === d.id) ? ` · ${SLOT_LABEL[Object.entries(hotbar).find(([, v]) => v === d.id)![0] as keyof typeof SLOT_LABEL]}` : ''}</span></button>; })}
    </div>)}
    {def && node && <div className="st-detail">
      <span className="forge-skill-icon selected" style={skillIconStyle(def.id)}/><b>{def.name} · {def.th} <small>({def.kind === 'passive' ? 'ติดตัว' : `MP ${def.mpCost} · CD ${def.cooldownSec}s${def.castMs ? ` · ร่าย ${def.castMs / 1000}s` : ''}`})</small></b>
      <span>{def.description}</span>
      <span className="npc-note">Lv.{Math.max(1, cur)}: {describeSkill(def, Math.max(1, cur))}{cur < def.maxLevel ? ` → Lv.${cur + 1}: ${describeSkill(def, cur + 1)}` : ''}</span>
      {node.requires.length > 0 && <span className="npc-note">ต้องการ: {node.requires.map(r => `${lib.defs.find(x => x.id === r.skillId)?.name} Lv.${r.level}`).join(', ')}</span>}
      <div className="st-slots">
        <button className="action-button" disabled={!check.ok} onClick={() => setMsg(useGameStore.getState().learnSkill(def.id) ?? 'เรียนสำเร็จ')}>{cur ? 'อัปเลเวล' : 'เรียนสกิล'} (1 แต้ม)</button>
        {def.kind === 'active' && cur > 0 && (['skill', 'buff', 'special'] as const).map(k => <button key={k} className="action-button ghost" disabled={hotbar[k] === def.id} onClick={() => useGameStore.getState().setHotbar(k, def.id)}>ตั้งที่ {SLOT_LABEL[k]}</button>)}
      </div>
      {!check.ok && 'reason' in check && check.reason && cur < def.maxLevel && <span className="npc-note">{check.reason}</span>}
      {msg && <span className="npc-note">{msg}</span>}
    </div>}
    <div className="forge-hotbar" aria-label="สกิลที่ติดตั้ง">{(['skill','buff','special'] as const).map(k=><button key={k} onClick={()=>{const id=hotbar[k];if(id){setBrowseClass(lib.defs.find(d=>d.id===id)?.promotion?'Reaver':cls);setSel(id);}}}><small>{SLOT_LABEL[k]}</small>{hotbar[k]?<span className="forge-skill-icon" style={skillIconStyle(hotbar[k]!)}/>:<span>ว่าง</span>}</button>)}</div>
    <p className="npc-note">{browseClass!==cls?'แสดงตัวอย่างอาชีพ · เรียนได้ตามเงื่อนไขอาชีพปัจจุบันเท่านั้น · ':''}รีเซ็ตแต้มสกิลได้ที่ Master Ysolde ในลานเมือง (มีค่าใช้จ่าย SoulGod)</p>
  </div>;
}
