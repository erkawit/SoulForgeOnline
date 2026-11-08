'use client';
// In-game skill window (K) — Round 22: one simple pattern. Left: the skill list (active first, then passive), each row
// icon · name · rank x/max · the level it opens at. Right: everything about the selected skill and its buttons.
import '@/styles/soulforge-beta.css';
import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';
import { availablePoints, canLearn } from '@/game/skills/engine';
import { skillIconStyle } from '@/game/skills/icons';
import { describeSkill } from '@/game/skills/describe';

const MAIN = [['skill', 'Space'], ['buff', 'Q'], ['special', 'E']] as const;
const EXTRA = ['R', 'T', 'X'];

export default function SkillTreePanel() {
  const lib = useConfigStore(s => s.skills);
  const cls = useGameStore(s => s.player.classId ?? 'Berserker'), level = useGameStore(s => s.player.level);
  const levels = useGameStore(s => s.skillLevels), hotbar = useGameStore(s => s.hotbar), extra = useGameStore(s => s.extraHotbar);
  const promoted = useGameStore(s => s.player.promotionId === 'Reaver');
  const [browse, setBrowse] = useState<string>(cls);
  const tree = useMemo(() => (lib.trees[cls] ?? []).filter(n => browse === 'Reaver' ? !!n.promotion : !n.promotion)
    .map(n => ({ n, d: lib.defs.find(d => d.id === n.skillId)! })).filter(x => x.d)
    .sort((a, b) => (a.d.kind === b.d.kind ? 0 : a.d.kind === 'active' ? -1 : 1) || a.n.unlockLevel - b.n.unlockLevel || a.n.tier - b.n.tier), [lib, cls, browse]);
  const [sel, setSel] = useState<string | null>(tree[0]?.d.id ?? null);
  const [msg, setMsg] = useState('');
  const points = availablePoints(lib, cls, levels, level);
  const cur = tree.find(x => x.d.id === sel) ?? tree[0];
  const def = cur?.d, node = cur?.n, rank = def ? levels[def.id] ?? 0 : 0;
  const check = def ? canLearn(lib, cls, def.id, levels, level, promoted) : { ok: false };
  const keyOf = (id: string) => MAIN.find(([k]) => hotbar[k] === id)?.[1] ?? EXTRA[extra.findIndex(x => x === id)];
  const pick = (id: string) => { setSel(id); setMsg(''); };

  return <div className="sk-panel">
    <header className="sk-head">
      {(cls === 'Berserker' ? ['Berserker', 'Reaver'] : [cls]).map(c => <button key={c} aria-pressed={browse === c}
        onClick={() => { setBrowse(c); setSel(null); setMsg(''); }}>{c}</button>)}
      <span className="sk-points">แต้มสกิล <b>{points}</b> · เลเวลตัวละคร <b>{level}</b></span>
    </header>
    <div className="sk-body">
      <ul className="sk-list" aria-label="รายชื่อสกิล">
        {tree.map(({ n, d }, i) => { const l = levels[d.id] ?? 0, open = l > 0 || level >= n.unlockLevel, key = keyOf(d.id);
          const head = i === 0 || tree[i - 1].d.kind !== d.kind;
          return <li key={d.id}>
            {head && <div className="sk-group">{d.kind === 'passive' ? 'สกิลติดตัว' : 'สกิลใช้งาน'}</div>}
            <button className={`sk-row ${def?.id === d.id ? 'on' : ''} ${open ? '' : 'locked'}`} onClick={() => pick(d.id)} aria-pressed={def?.id === d.id}>
              <span className="forge-skill-icon" style={skillIconStyle(d.id)} />
              <span className="sk-name"><b>{d.name}</b><small>{d.th}</small></span>
              <span className="sk-rank">{open ? `${l}/${d.maxLevel}` : `Lv.${n.unlockLevel}`}{key && <em>{key}</em>}</span>
            </button>
          </li>; })}
      </ul>
      {def && node && <section className="sk-info">
        <div className="sk-title"><span className="forge-skill-icon big" style={skillIconStyle(def.id)} />
          <div><h3>{def.name}</h3><small>{def.th} · {def.kind === 'passive' ? 'ติดตัว' : `MP ${def.mpCost} · คูลดาวน์ ${def.cooldownSec} วิ${def.castMs ? ` · ร่าย ${def.castMs / 1000} วิ` : ''}`}</small></div>
          <span className="sk-big-rank">{rank}<small>/{def.maxLevel}</small></span></div>
        <p>{def.description}</p>
        <dl>
          <dt>ขั้นปัจจุบัน</dt><dd>{rank > 0 ? describeSkill(def, rank) : 'ยังไม่ได้เรียน'}</dd>
          {rank < def.maxLevel && <><dt>ขั้นถัดไป ({rank + 1})</dt><dd>{describeSkill(def, rank + 1)}</dd></>}
          <dt>เงื่อนไข</dt><dd>เลเวลตัวละคร {node.unlockLevel + rank * (node.rankStep ?? 2)}{node.requires.length > 0 && ` · ${node.requires.map(r => `${lib.defs.find(x => x.id === r.skillId)?.name} ขั้น ${r.level}`).join(', ')}`}</dd>
        </dl>
        <div className="sk-actions">
          <button className="action-button" disabled={!check.ok} onClick={() => setMsg(useGameStore.getState().learnSkill(def.id) ?? (rank ? 'อัปขั้นสำเร็จ' : 'เรียนสำเร็จ'))}>{rank ? 'อัปขั้น' : 'เรียนสกิล'} (1 แต้ม)</button>
          {def.kind === 'active' && rank > 0 && <div className="sk-keys" aria-label="ตั้งปุ่ม">
            {MAIN.map(([k, label]) => <button key={k} aria-pressed={hotbar[k] === def.id} onClick={() => useGameStore.getState().setHotbar(k, def.id)}>{label}</button>)}
            {!def.promotion && EXTRA.map((label, i) => <button key={label} aria-pressed={extra[i] === def.id} onClick={() => useGameStore.getState().setExtraSlot(i, def.id)}>{label}</button>)}
          </div>}
        </div>
        {!check.ok && 'reason' in check && check.reason && rank < def.maxLevel && <p className="sk-note">{check.reason}</p>}
        {msg && <p className="sk-note">{msg}</p>}
      </section>}
    </div>
    <p className="sk-foot">{browse !== cls ? 'แสดงตัวอย่าง · เรียนได้เมื่อเลื่อนขั้นแล้ว · ' : ''}รีเซ็ตแต้มสกิลได้ที่ Master Ysolde ในลานเมือง</p>
  </div>;
}
