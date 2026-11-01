'use client';
// PCStatusPanel (C): stone portrait, name, ฉายา and class beside a scrollable list grouped by category.
// MobileStatusPanel: the same schema (src/game/ui/statusSchema.ts) as cards inside the drawer.
// Both: sections fold open / closed, and an item picked in the inventory shows ▲/▼ "if you wore it" deltas.
import ItemDetails, { ItemArt } from '../ItemDetails';
import { useMemo } from 'react';
import { useGameStore, derivedOf } from '@/store/useGameStore';
import { useConfigStore } from '@/store/useConfigStore';
import { ATTRIBUTE_HELP } from '@/game/balance/stats';
import { buildStatus, formatStat, diffStatus, formatStatDelta } from '@/game/ui/statusSchema';
import { levelTitle } from '@/game/ui/layout';
import { CLASSES, type ClassId } from '@/game/content';
import { canEquip } from '@/game/items';
import { RARITY_COLOR } from '@/lib/types';
import { CLASS_COLOR, CLASS_TH, portrait } from './common';
import { useSelectedItem, setSelectedItem } from './selection';

function useStatus() {
  const player = useGameStore(s => s.player), equipment = useGameStore(s => s.equipment), buffs = useGameStore(s => s.buffs), skillLevels = useGameStore(s => s.skillLevels), inventory = useGameStore(s => s.inventory);
  const config = useConfigStore(s => s.config); const cls = (player.classId ?? 'Berserker') as ClassId; const selId = useSelectedItem();
  const cats = useMemo(() => buildStatus(derivedOf({ player, equipment, buffs, skillLevels }), config.classes[cls].base), [player, equipment, buffs, skillLevels, config, cls]);
  const it = inventory.find(x => x?.id === selId) ?? null;
  const cmp = useMemo(() => {
    if (!it || !it.slot || it.slot === 'costume' || (it.classLock && it.classLock !== cls) || !canEquip(it, cls)) return null;
    const after = buildStatus(derivedOf({ player, equipment: { ...equipment, [it.slot]: it }, buffs, skillLevels }), config.classes[cls].base);
    return { it, worn: equipment[it.slot], diff: diffStatus(cats, after) };
  }, [it, cats, player, equipment, buffs, skillLevels, config, cls]);
  return { player, cls, cats, cmp };
}
/** remembered folded sections for this session */
const closed = new Set<string>();
function Sections({ cats, cmp, cards = false }: ReturnType<typeof useStatus> & { cards?: boolean }) {
  return <>{cmp ? <div className="stcmp">เทียบถ้าสวม <b style={{ color: RARITY_COLOR[cmp.it.rarity] }}>{cmp.it.name}</b> แทน {cmp.worn ? cmp.worn.name : 'ช่องว่าง'} <button className="sf-btn ghost" onClick={() => setSelectedItem(null)}>ยกเลิกการเทียบ</button></div>
    : <div className="stcmp dim">เลือกไอเทมในกระเป๋า (I) เพื่อดูค่าก่อน–หลังสวม</div>}
    {cats.map(c => <details key={c.id} className={cards ? 'mcard' : 'stc'} open={!closed.has(c.id)} onToggle={e => { if ((e.currentTarget as HTMLDetailsElement).open) closed.delete(c.id); else closed.add(c.id); }}>
      <summary><i>{c.icon}</i>{c.label}<span className="chev">▾</span></summary>
      {c.rows.map(r => { const d = cmp?.diff.get(c.id + ':' + r.key);
        return <div key={r.key} className="str" title={c.id === 'core' ? ATTRIBUTE_HELP[r.key as keyof typeof ATTRIBUTE_HELP] : undefined}><span>{r.label}</span>
          <b>{formatStat(r)}{r.bonus ? <small className="bn"> (+{r.bonus})</small> : null}{d !== undefined && <small className={d > 0 ? 'up' : 'down'}> {formatStatDelta(r, d)}</small>}</b></div>; })}
    </details>)}</>;
}

export function PCStatusPanel() {
  const st = useStatus(); const { player, cls } = st; const equipment = useGameStore(s=>s.equipment);
  return <div className="h3 pcstat" style={{ ['--cc' as string]: CLASS_COLOR[cls] }}>
    <aside className="sthead"><div className="forge-worn">{Object.entries(equipment).filter(([slot])=>slot!=='offhand').map(([slot,item])=><div className="forge-worn-slot" key={slot}>{item?<ItemDetails item={item}><ItemArt item={item}/></ItemDetails>:<span>{slot}</span>}</div>)}</div><div className="stone big"><img src={portrait(cls, player.gender, 'full')} alt="" /><span className="lvtag">Lv.{player.level}</span></div>
      <h2>{player.name}</h2><div className="title">《 {levelTitle(player.level)} 》</div><div className="cls">{CLASS_TH[cls]} · {player.promotionId ?? cls}</div><div className="role">{CLASSES[cls]?.role}</div></aside>
    <div className="stlist"><Sections {...st} />
      <p className="h2-note">กดหัวข้อเพื่อพับ/ขยาย · ค่าพื้นฐาน 6 ค่าตายตัวตามอาชีพ · (+) มาจากออปชันอุปกรณ์ · ค่าอื่นรวมอุปกรณ์และบัฟแล้ว</p></div>
  </div>;
}
export function MobileStatusPanel() {
  const st = useStatus(); const { player, cls } = st;
  return <div className="h3 mstat"><div className="mshead"><div className="stone"><img src={portrait(cls, player.gender)} alt="" /></div><div><b>{player.name}</b><div className="title">《 {levelTitle(player.level)} 》</div><small>{CLASS_TH[cls]} · {cls} · Lv.{player.level}</small></div></div>
    <div className="mcards"><Sections {...st} cards /></div></div>;
}
