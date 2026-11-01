'use client';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';

const LABEL: Record<string, string> = { atkPct: 'ATK', defPct: 'DEF', expPct: 'EXP', hpRegen: 'HP/s', moveSpeed: 'SPD', critRate: 'CRIT' };
/** Active buffs under the character frame, with time left. */
export default function BuffStrip() {
  const buffs = useGameStore(s => s.buffs);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const live = buffs.filter(b => b.until > now);
  if (!live.length) return null;
  const left = (ms: number) => ms > 60000 ? `${Math.ceil(ms / 60000)}m` : `${Math.ceil(ms / 1000)}s`;
  return <div className="buff-strip" aria-label="บัฟที่ทำงานอยู่">{live.map(b => <span key={b.id} className="buff-chip" title={b.source}>
    {b.source.replace(/ Inscription| Blessing/, '')} <b>{Object.entries(b).filter(([k, v]) => LABEL[k] && typeof v === 'number' && v).map(([k, v]) => `${LABEL[k]}+${v}${k === 'hpRegen' ? '' : '%'}`).join(' ')}</b> {left(b.until - now)}</span>)}</div>;
}
