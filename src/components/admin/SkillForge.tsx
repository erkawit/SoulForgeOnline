'use client';
// Skill Forge: build new skills from effect blocks, place them in a class tree, preview the numbers, publish to every client.
import { useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { CLASS_IDS as CLASS_KEYS, type ClassId as ClassKey } from '@/game/content';
import { deriveCharacter, monsterStats } from '@/game/balance/stats';
import { DEFAULT_SKILLS } from '@/game/skills/defaults';
import { mergeLibrary, resolveSkill, validateSkill, validateTree, ELEMENT_COLOR, type Element, type PassiveBonus, type SkillDef, type SkillEffect, type SkillLibrary, type TreeNode } from '@/game/skills/engine';
import { FX_NAMES } from '@/game/fx/skillFx';

const ELEMENTS: Element[] = ['physical', 'fire', 'frost', 'storm', 'holy', 'shadow', 'arcane', 'nature'];
/** round 13: 6 rows (Berserker unlock levels by row; the Reaver half — columns 2–3 — opens at 60) */
const UNLOCK = [1, 3, 5, 8, 12, 15];
const TIERS = [1, 2, 3, 4, 5, 6], COLS = [0, 1, 2, 3];
const BLANK: Record<SkillEffect['type'], SkillEffect> = {
  damage: { type: 'damage', shape: 'single', radius: 0, coefficient: 1.5, perLevel: 0.1, element: 'physical' },
  heal: { type: 'heal', target: 'self', coefficient: 1, perLevel: 0.1, pctMaxHp: 0 },
  buff: { type: 'buff', target: 'self', stat: 'atkPct', value: 10, perLevel: 2, durationSec: 20 },
  shield: { type: 'shield', pctMaxHp: 10, perLevel: 2, durationSec: 8 },
  guard: { type: 'guard', reducePct: 40, perLevel: 5, durationSec: 3 },
  dot: { type: 'dot', coefficient: 0.3, perLevel: 0.03, ticks: 4, intervalMs: 1000, element: 'fire' },
  debuff: { type: 'debuff', stat: 'defPct', value: 10, perLevel: 2, durationSec: 6 },
  dash: { type: 'dash', distance: 4 },
  knockback: { type: 'knockback', distance: 2 },
  rage: { type: 'rage', amount: 20 },
};
const EFFECT_TH: Record<SkillEffect['type'], string> = { damage: 'ดาเมจ', heal: 'รักษา', buff: 'บัฟ', shield: 'โล่', guard: 'ลดดาเมจที่ได้รับ', dot: 'ดาเมจต่อเนื่อง', debuff: 'ดีบัฟศัตรู', dash: 'พุ่งตัว', knockback: 'ผลักกระเด็น', rage: 'เติม Rage' };
/** Which fields each effect type exposes, with a choice list for string fields. */
const FIELDS: Record<SkillEffect['type'], [string, string, string[]?][]> = {
  damage: [['shape', 'รูปแบบ', ['single', 'circle', 'cone', 'line', 'self-circle']], ['element', 'ธาตุ', ELEMENTS], ['coefficient', 'ตัวคูณ ATK'], ['perLevel', '+ต่อเลเวล'], ['radius', 'รัศมี ม.'], ['hits', 'จำนวนครั้ง'], ['hitIntervalMs', 'ms ระหว่างครั้ง'], ['maxTargets', 'เป้าสูงสุด'], ['delayMs', 'หน่วง ms']],
  heal: [['target', 'เป้าหมาย', ['self', 'ally', 'party', 'area']], ['coefficient', 'ตัวคูณ ATK'], ['perLevel', '+ต่อเลเวล'], ['pctMaxHp', '% HP สูงสุด'], ['radius', 'รัศมี ม.']],
  buff: [['target', 'เป้าหมาย', ['self', 'ally', 'party', 'area']], ['stat', 'สเตตัส', ['atkPct', 'defPct', 'moveSpeed', 'critRate', 'expPct', 'hpRegen', 'atkSpeed', 'dmgTaken']], ['value', 'ค่า %'], ['perLevel', '+ต่อเลเวล'], ['durationSec', 'วินาที'], ['radius', 'รัศมี ม.']],
  shield: [['pctMaxHp', '% HP สูงสุด'], ['perLevel', '+ต่อเลเวล'], ['durationSec', 'วินาที']],
  guard: [['reducePct', 'ลด %'], ['perLevel', '+ต่อเลเวล'], ['durationSec', 'วินาที']],
  dot: [['element', 'ธาตุ', ELEMENTS], ['coefficient', 'ตัวคูณต่อครั้ง'], ['perLevel', '+ต่อเลเวล'], ['ticks', 'จำนวนครั้ง'], ['intervalMs', 'ทุก ms'], ['radius', 'รัศมี ม.']],
  debuff: [['stat', 'ลดค่า', ['defPct', 'atkPct', 'slow']], ['value', 'ค่า %'], ['perLevel', '+ต่อเลเวล'], ['durationSec', 'วินาที'], ['radius', 'รัศมี ม.']],
  dash: [['distance', 'ระยะ ม.']],
  knockback: [['distance', 'ระยะ ม.']],
  rage: [['amount', 'Rage ที่ได้']],
};
const PASSIVE_STATS: PassiveBonus['stat'][] = ['atkPct', 'defPct', 'hpPct', 'mpPct', 'critRate', 'critDmg', 'cdr', 'healPower', 'skillDmg', 'moveSpeed', 'lifesteal', 'bossDmg', 'dmgReduce', 'atkSpeed', 'lowHpDmg', 'rageGain', 'slowResist'];

export default function SkillForge({ raw, onSaved, onError }: { raw: unknown; onSaved: (v: unknown) => void; onError: (m: string) => void }) {
  const [lib, setLib] = useState<SkillLibrary>(() => mergeLibrary(DEFAULT_SKILLS, raw as Partial<SkillLibrary>));
  const [cls, setCls] = useState<ClassKey>('Berserker');
  const [sel, setSel] = useState<string | null>(lib.trees.Berserker[0]?.skillId ?? null);
  const def = lib.defs.find(d => d.id === sel) ?? null, node = lib.trees[cls].find(n => n.skillId === sel) ?? null;
  const treeErrors = useMemo(() => validateTree(lib, cls), [lib, cls]);
  const skillErrors = useMemo(() => (def ? validateSkill(def, lib.defs) : []), [def, lib.defs]);

  const putDef = (d: SkillDef, oldId = d.id) => setLib(l => ({ defs: l.defs.map(x => (x.id === oldId ? d : x)), trees: oldId === d.id ? l.trees : { ...l.trees, [cls]: l.trees[cls].map(n => ({ ...n, skillId: n.skillId === oldId ? d.id : n.skillId, requires: n.requires.map(r => ({ ...r, skillId: r.skillId === oldId ? d.id : r.skillId })) })) } }));
  const putNode = (n: TreeNode) => setLib(l => ({ ...l, trees: { ...l.trees, [cls]: l.trees[cls].map(x => (x.skillId === n.skillId ? n : x)) } }));
  function addAt(tier: number, col: number) {
    let i = 1; while (lib.defs.some(d => d.id === `${cls[0].toLowerCase()}-custom-${i}`)) i++;
    const id = `${cls[0].toLowerCase()}-custom-${i}`;
    const d: SkillDef = { id, name: `New Skill ${i}`, th: 'สกิลใหม่', cls, kind: 'active', motion: 'Skill', maxLevel: 5, mpCost: 20, mpPerLevel: 2, cooldownSec: 8, castMs: 0, range: 6, fx: { cls, kind: 'skill' }, effects: [{ ...BLANK.damage }], description: '', custom: true };
    setLib(l => ({ defs: [...l.defs, d], trees: { ...l.trees, [cls]: [...l.trees[cls], { skillId: id, tier, col, unlockLevel: UNLOCK[tier - 1], requires: [] }] } })); setSel(id);
  }
  function remove(id: string) {
    setLib(l => ({ defs: l.defs.filter(d => d.id !== id || !d.custom), trees: { ...l.trees, [cls]: l.trees[cls].filter(n => n.skillId !== id).map(n => ({ ...n, requires: n.requires.filter(r => r.skillId !== id) })) } })); setSel(null);
  }
  async function publish() {
    const errs = CLASS_KEYS.flatMap(c => validateTree(lib, c)).concat(lib.defs.flatMap(d => validateSkill(d, lib.defs).map(e => `${d.name}: ${e}`)));
    if (errs.length) { onError(errs[0]); return; }
    // store only what differs from the shipped library, plus every tree
    const patch = { defs: lib.defs.filter(d => JSON.stringify(d) !== JSON.stringify(DEFAULT_SKILLS.defs.find(x => x.id === d.id))), trees: lib.trees };
    const { error } = await getSupabaseBrowser()!.rpc('admin_set_config', { p_key: 'skills', p_value: patch });
    if (error) onError(error.message); else onSaved(patch);
  }
  return <div className="sk-root">
    <div className="ad-inline">{CLASS_KEYS.map(c => <button key={c} className={`ad-chip ${cls === c ? 'on' : ''}`} onClick={() => { setCls(c); setSel(lib.trees[c][0]?.skillId ?? null); }}>{c}</button>)}
      <span className="grow" /><button className="sf-btn ghost small" onClick={() => setLib(DEFAULT_SKILLS)}>คืนค่าต้นไม้เริ่มต้น</button><button className="sf-btn small" onClick={() => void publish()}>เผยแพร่สกิลทั้งหมด</button></div>
    <div className="sk-layout">
      <div className="sk-tree" aria-label={`ต้นไม้สกิล ${cls}`}>
        {TIERS.map(tier => <div key={tier} className="sk-tier"><span className="sk-tier-label">แถว {tier}<small>Lv {UNLOCK[tier - 1]}+ · Reaver 60</small></span>
          {COLS.map(col => { const n = lib.trees[cls].find(x => x.tier === tier && x.col === col), d = n && lib.defs.find(x => x.id === n.skillId);
            return n && d ? <button key={col} className={`sk-node ${d.kind} ${sel === d.id ? 'on' : ''} ${d.custom ? 'custom' : ''}`} onClick={() => setSel(d.id)}>
              <b>{d.name}</b><small>{d.th} · {d.kind === 'passive' ? 'ติดตัว' : `${d.cooldownSec}s`}</small>
              {n.requires.length > 0 && <i>ต้องการ {n.requires.map(r => `${lib.defs.find(x => x.id === r.skillId)?.name ?? r.skillId} ${r.level}`).join(', ')}</i>}
            </button> : <button key={col} className="sk-node empty" onClick={() => addAt(tier, col)}>+ เพิ่มสกิล</button>; })}
        </div>)}
        {treeErrors.length > 0 && <p className="ad-bad">{treeErrors.join(' · ')}</p>}
      </div>
      {def && node ? <Editor def={def} node={node} lib={lib} cls={cls} errors={skillErrors} onDef={putDef} onNode={putNode} onRemove={() => remove(def.id)} /> : <p className="ad-empty">เลือกสกิลในต้นไม้ หรือกด “+ เพิ่มสกิล” ในช่องว่าง</p>}
    </div>
  </div>;
}

function Editor({ def, node, lib, cls, errors, onDef, onNode, onRemove }: { def: SkillDef; node: TreeNode; lib: SkillLibrary; cls: ClassKey; errors: string[]; onDef: (d: SkillDef, oldId?: string) => void; onNode: (n: TreeNode) => void; onRemove: () => void }) {
  const num = (label: string, value: number, set: (v: number) => void, step = 1) => <label className="ad-num"><span>{label}</span><span className="ad-num-input"><input type="number" step={step} value={value} onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v)) set(v); }} /></span></label>;
  const others = lib.trees[cls].filter(n => n.tier < node.tier);
  const preview = useMemo(() => {
    const caster = deriveCharacter(cls, 30, []), m = monsterStats(30);
    const targets = Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, x: (i - 2) * 1.2, z: 3 + (i % 2), defense: m.defense, hp: m.maxHp }));
    return [1, def.maxLevel].map(l => ({ level: l, out: resolveSkill(def, l, { caster, x: 0, z: 0, yaw: 0, targetId: 't2', targets, maxHp: caster.maxHp, now: 0, rng: () => 0.5 }) }));
  }, [def, cls]);
  return <div className="sk-editor">
    <header><h3>{def.name}</h3>{def.custom ? <button className="ad-link" onClick={onRemove}>ลบสกิลนี้</button> : <span className="ad-pill">สกิลมาตรฐาน (แก้ค่าได้)</span>}</header>
    <div className="ad-wrap">
      <label className="ad-num"><span>ID</span><span className="ad-num-input"><input value={def.id} disabled={!def.custom} onChange={e => onDef({ ...def, id: e.target.value.toLowerCase() }, def.id)} /></span></label>
      <label className="ad-num"><span>ชื่อ</span><span className="ad-num-input"><input value={def.name} onChange={e => onDef({ ...def, name: e.target.value })} /></span></label>
      <label className="ad-num"><span>ชื่อไทย</span><span className="ad-num-input"><input value={def.th} onChange={e => onDef({ ...def, th: e.target.value })} /></span></label>
      <label className="ad-num"><span>ประเภท</span><span className="ad-num-input"><select value={def.kind} onChange={e => onDef({ ...def, kind: e.target.value as SkillDef['kind'], passive: e.target.value === 'passive' ? def.passive ?? [{ stat: 'atkPct', perLevel: 2 }] : def.passive })}><option value="active">กดใช้</option><option value="passive">ติดตัว</option></select></span></label>
    </div>
    {def.kind === 'active' && <>
      <div className="ad-wrap">
        {num('MP', def.mpCost, v => onDef({ ...def, mpCost: v }))}{num('MP +ต่อเลเวล', def.mpPerLevel, v => onDef({ ...def, mpPerLevel: v }))}{num('คูลดาวน์ (วิ)', def.cooldownSec, v => onDef({ ...def, cooldownSec: v }), 0.5)}
        {num('เวลาร่าย (ms)', def.castMs, v => onDef({ ...def, castMs: v }), 100)}{num('ระยะ (ม.)', def.range, v => onDef({ ...def, range: v }), 0.5)}{num('เลเวลสูงสุด', def.maxLevel, v => onDef({ ...def, maxLevel: v }))}
        <label className="ad-num"><span>ท่าทาง</span><span className="ad-num-input"><select value={def.motion} onChange={e => onDef({ ...def, motion: e.target.value as SkillDef['motion'] })}>{['Attack', 'Skill', 'Buff', 'Special'].map(m => <option key={m}>{m}</option>)}</select></span></label>
        <label className="ad-num"><span>เอฟเฟกต์ภาพ</span><span className="ad-num-input"><select value={`${def.fx.cls}:${def.fx.kind}`} onChange={e => { const [c, k] = e.target.value.split(':'); onDef({ ...def, fx: { cls: c as ClassKey, kind: k as SkillDef['fx']['kind'] } }); }}>
          {CLASS_KEYS.flatMap(c => (['attack', 'skill', 'buff', 'special'] as const).map(k => <option key={c + k} value={`${c}:${k}`}>{c} · {FX_NAMES[c as keyof typeof FX_NAMES]?.[k] ?? k}</option>))}</select></span></label>
      </div>
      <h4>เอฟเฟกต์ ({def.effects.length}/6)</h4>
      {def.effects.map((e, i) => <div key={i} className="sk-effect" style={{ borderColor: 'element' in e ? ELEMENT_COLOR[e.element] : undefined }}>
        <b>{EFFECT_TH[e.type]}</b>
        {FIELDS[e.type].map(([k, label, choices]) => { const v = (e as Record<string, unknown>)[k];
          return choices ? <label key={k} className="ad-num"><span>{label}</span><span className="ad-num-input"><select value={String(v ?? choices[0])} onChange={x => onDef({ ...def, effects: def.effects.map((y, j) => (j === i ? ({ ...y, [k]: x.target.value } as SkillEffect) : y)) })}>{choices.map(c => <option key={c}>{c}</option>)}</select></span></label>
            : <label key={k} className="ad-num"><span>{label}</span><span className="ad-num-input"><input type="number" step="0.05" value={Number(v ?? 0)} onChange={x => { const n = Number(x.target.value); if (Number.isFinite(n)) onDef({ ...def, effects: def.effects.map((y, j) => (j === i ? ({ ...y, [k]: n } as SkillEffect) : y)) }); }} /></span></label>; })}
        <button className="ad-link" onClick={() => onDef({ ...def, effects: def.effects.filter((_, j) => j !== i) })}>ลบ</button>
      </div>)}
      <div className="ad-inline">{(Object.keys(BLANK) as SkillEffect['type'][]).map(t => <button key={t} className="ad-chip" disabled={def.effects.length >= 6} onClick={() => onDef({ ...def, effects: [...def.effects, { ...BLANK[t] }] })}>+ {EFFECT_TH[t]}</button>)}</div>
    </>}
    {def.kind === 'passive' && <><h4>โบนัสติดตัว</h4>{(def.passive ?? []).map((p, i) => <div key={i} className="ad-inline">
      <label className="ad-num"><span>สเตตัส</span><span className="ad-num-input"><select value={p.stat} onChange={e => onDef({ ...def, passive: def.passive!.map((x, j) => (j === i ? { ...x, stat: e.target.value as PassiveBonus['stat'] } : x)) })}>{PASSIVE_STATS.map(s => <option key={s}>{s}</option>)}</select></span></label>
      {num('% ต่อเลเวล', p.perLevel, v => onDef({ ...def, passive: def.passive!.map((x, j) => (j === i ? { ...x, perLevel: v } : x)) }), 0.1)}
      <button className="ad-link" onClick={() => onDef({ ...def, passive: def.passive!.filter((_, j) => j !== i) })}>ลบ</button></div>)}
      <button className="ad-chip" onClick={() => onDef({ ...def, passive: [...(def.passive ?? []), { stat: 'defPct', perLevel: 1 }] })}>+ โบนัส</button></>}
    <label className="sf-field"><span>คำอธิบาย (แสดงให้ผู้เล่น)</span><textarea rows={2} value={def.description} onChange={e => onDef({ ...def, description: e.target.value })} /></label>
    <h4>ตำแหน่งในต้นไม้</h4>
    <div className="ad-wrap">
      {num('แถว (1–6)', node.tier, v => onNode({ ...node, tier: Math.max(1, Math.min(6, v)), unlockLevel: node.promotion ? 60 : UNLOCK[Math.max(1, Math.min(6, v)) - 1] }))}
      {num('คอลัมน์ (0–2)', node.col, v => onNode({ ...node, col: Math.max(0, Math.min(2, v)) }))}
      {num('ปลดล็อกที่เลเวล', node.unlockLevel, v => onNode({ ...node, unlockLevel: v }))}
    </div>
    <div className="ad-inline">ต้องการ: {node.requires.map((r, i) => <span key={i} className="ad-chip on">{lib.defs.find(d => d.id === r.skillId)?.name} Lv
      <input className="sk-req" type="number" min={1} max={10} value={r.level} onChange={e => onNode({ ...node, requires: node.requires.map((x, j) => (j === i ? { ...x, level: Number(e.target.value) } : x)) })} />
      <button className="ad-link" onClick={() => onNode({ ...node, requires: node.requires.filter((_, j) => j !== i) })}>×</button></span>)}
      <select value="" onChange={e => e.target.value && onNode({ ...node, requires: [...node.requires, { skillId: e.target.value, level: 1 }] })}><option value="">+ เพิ่มเงื่อนไข</option>{others.filter(o => !node.requires.some(r => r.skillId === o.skillId)).map(o => <option key={o.skillId} value={o.skillId}>{lib.defs.find(d => d.id === o.skillId)?.name}</option>)}</select></div>
    {errors.length > 0 && <p className="ad-bad">{errors.join(' · ')}</p>}
    {def.kind === 'active' && <div className="sk-preview"><h4>ทดลองกับมอนสเตอร์ Lv30 × 5 ตัว (ผู้ร่าย Lv30 ไม่สวมอุปกรณ์)</h4>
      <table className="ad-table"><thead><tr><th>เลเวลสกิล</th><th className="num">โดน (ครั้ง)</th><th className="num">ดาเมจรวม</th><th className="num">รักษา</th><th>บัฟ</th><th className="num">MP</th><th className="num">คูลดาวน์</th></tr></thead>
        <tbody>{preview.map(({ level, out }) => <tr key={level}><td>Lv {level}</td><td className="num">{out.hits.length}</td><td className="num">{(out.hits.reduce((s, h) => s + h.damage, 0) + out.dots.reduce((s, d) => s + d.perTick * d.ticks, 0)).toLocaleString()}</td><td className="num">{out.heal}</td>
          <td>{out.buffs.map(b => Object.entries(b).filter(([k]) => !['id', 'source', 'until'].includes(k)).map(([k, v]) => `${k} +${v}`).join(' ')).join(' · ') || (out.guard ? `ลดดาเมจ ${Math.round(out.guard.reduce * 100)}%` : '—')}</td><td className="num">{out.mpCost}</td><td className="num">{(out.cooldownMs / 1000).toFixed(1)}s</td></tr>)}</tbody></table></div>}
  </div>;
}
