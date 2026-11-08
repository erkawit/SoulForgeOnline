'use client';
// The one settings window (เสียง / กราฟิก / การแสดงผล / ปุ่ม), shared by the game HUD (⚙ button, O) and the login page.
// Audio goes to the WebAudio engine and localStorage 'sf-audio'; everything else is useSettingsStore (per device).
import { useState } from 'react';
import { audio, type AudioSettings } from '@/game/audio/engine';
import { useSettingsStore, type FpsCap, type Quality } from '@/store/useSettingsStore';

type Tab = 'audio' | 'graphics' | 'display' | 'keys';
const TABS: [Tab, string][] = [['audio', 'เสียง'], ['graphics', 'กราฟิก'], ['display', 'การแสดงผล'], ['keys', 'ปุ่ม']];
export function saveAudio(p: Partial<AudioSettings>) { audio.configure(p); try { localStorage.setItem('sf-audio', JSON.stringify(audio.settings)); } catch { /* private mode */ } }
/** low = for older phones / laptops on battery: everything that costs GPU time turned down at once */
const PRESET: Record<Quality, { renderScale: number; fpsCap: FpsCap; shadows: boolean }> = {
  low: { renderScale: 0.6, fpsCap: 30, shadows: false }, medium: { renderScale: 0.85, fpsCap: 60, shadows: true }, high: { renderScale: 1, fpsCap: 0, shadows: true },
};

function Sw({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`h2-switch ${on ? 'on' : ''}`} onClick={onClick} />;
}
function Seg<T extends string | number>({ value, options, onPick, label }: { value: T; options: [T, string][]; onPick: (v: T) => void; label: string }) {
  return <span className="h2-seg" role="group" aria-label={label}>{options.map(([v, t]) => <button type="button" key={String(v)} className={value === v ? 'on' : ''} aria-pressed={value === v} onClick={() => onPick(v)}>{t}</button>)}</span>;
}
function Range({ value, min, max, step, onChange, label, show }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; label: string; show: string }) {
  return <span className="h2-range"><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} /><b>{show}</b></span>;
}

export default function SettingsPanel({ inGame = true }: { inGame?: boolean }) {
  const st = useSettingsStore(); const [tab, setTab] = useState<Tab>('audio');
  const [au, setAu] = useState<AudioSettings>({ ...audio.settings });
  const put = (p: Partial<AudioSettings>) => { saveAudio(p); setAu({ ...audio.settings }); };
  const vol = (k: keyof Omit<AudioSettings, 'muted'>, t: string, note?: string) => <div className="h2-row"><span>{t}{note && <small>{note}</small>}</span>
    <Range label={t} value={au[k]} min={0} max={1} step={0.05} onChange={v => put({ [k]: v })} show={String(Math.round(au[k] * 100))} /></div>;
  return <div className="sf-settings">
    <div className="npc-chips" role="tablist">{TABS.map(([t, th]) => <button type="button" key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{th}</button>)}</div>
    {tab === 'audio' && <>
      {vol('master', 'เสียงรวม')}{vol('music', 'ดนตรี')}{vol('sfx', 'เอฟเฟกต์', 'โจมตี สกิล มอนสเตอร์ ปุ่ม')}{vol('voice', 'เสียงพูดตัวละคร')}
      <div className="h2-row"><span>ปิดเสียงทั้งหมด</span><Sw label="ปิดเสียงทั้งหมด" on={au.muted} onClick={() => put({ muted: !au.muted })} /></div>
    </>}
    {tab === 'graphics' && <>
      <div className="h2-row"><span>ชุดค่าสำเร็จรูป<small>ตั้งทุกข้อด้านล่างพร้อมกัน</small></span>
        <Seg label="ชุดค่าสำเร็จรูป" value={st.quality} options={[['low', 'ประหยัด'], ['medium', 'สมดุล'], ['high', 'สวยสุด']]} onPick={q => st.set({ quality: q, ...PRESET[q] })} /></div>
      <div className="h2-row"><span>ความละเอียดภาพ 3D<small>ต่ำลง = เครื่องเย็นและลื่นขึ้น</small></span>
        <Range label="ความละเอียดภาพ 3D" value={st.renderScale} min={0.5} max={1} step={0.05} onChange={v => st.set({ renderScale: v })} show={`${Math.round(st.renderScale * 100)}%`} /></div>
      <div className="h2-row"><span>จำกัดเฟรมเรต<small>30 = ประหยัดแบตเตอรี่</small></span>
        <Seg label="จำกัดเฟรมเรต" value={st.fpsCap} options={[[30, '30'], [60, '60'], [0, 'ไม่จำกัด']]} onPick={v => st.set({ fpsCap: v })} /></div>
      <div className="h2-row"><span>หญ้า ใบไม้ รายละเอียดฉาก</span>
        <Seg label="รายละเอียดฉาก" value={st.quality} options={[['low', 'น้อย'], ['medium', 'กลาง'], ['high', 'มาก']]} onPick={q => st.set({ quality: q })} /></div>
      <div className="h2-row"><span>เงาแบบเรียลไทม์</span><Sw label="เงา" on={st.shadows} onClick={() => st.set({ shadows: !st.shadows })} /></div>
    </>}
    {tab === 'display' && <>
      <div className="h2-row"><span>ปุ่มควบคุม</span>
        <Seg label="ปุ่มควบคุม" value={st.controls} options={[['auto', 'อัตโนมัติ'], ['touch', 'จอสัมผัส'], ['pc', 'คีย์บอร์ด·เมาส์']]} onPick={v => st.set({ controls: v })} /></div>
      <div className="h2-row"><span>ขนาดหน้าต่างและตัวอักษร</span>
        <Range label="ขนาด UI" value={st.uiScale} min={0.8} max={1.2} step={0.05} onChange={v => st.set({ uiScale: v })} show={`${Math.round(st.uiScale * 100)}%`} /></div>
      <div className="h2-row"><span>ตัวเลขดาเมจ</span><Sw label="ตัวเลขดาเมจ" on={st.damageNumbers} onClick={() => st.set({ damageNumbers: !st.damageNumbers })} /></div>
      <div className="h2-row"><span>แรงลม<small>ต้นไม้และหญ้าไหวตามลม</small></span>
        <Range label="แรงลม" value={st.wind} min={0} max={1.2} step={0.05} onChange={v => st.set({ wind: v })} show={String(Math.round(st.wind * 100))} /></div>
      <div className="h2-row"><span>ทิศลม</span><Range label="ทิศลม" value={st.windDir} min={0} max={360} step={5} onChange={v => st.set({ windDir: v })} show={`${st.windDir}°`} /></div>
    </>}
    {tab === 'keys' && <p className="h2-note">WASD วิ่ง · 1 โจมตี · Space Q E R T X สกิล · 7 8 ยา · 9 อาหาร · Z AUTO · I กระเป๋า · C ตัวละคร · K สกิล · J เควส · L สมุดสะสม · U ตู้เสื้อผ้า · N มอนสเตอร์ · M แผนที่ · P ปาร์ตี้ · O ตั้งค่า · Esc ปิดหน้าต่าง</p>}
    <div className="sf-settings-foot"><button type="button" className="action-button ghost" onClick={() => { st.reset(); put({ master: 0.8, music: 0.55, sfx: 0.8, voice: 1, muted: false }); }}>คืนค่าเริ่มต้น</button>
      {!inGame && <small>การตั้งค่าจะใช้ต่อในเกมบนเครื่องนี้</small>}</div>
  </div>;
}
