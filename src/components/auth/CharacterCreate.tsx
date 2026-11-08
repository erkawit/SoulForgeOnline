'use client';
// Character creation (round 13: one class): the Berserker stands on a rune pedestal as living 2.5D sprites (the same painted
// art and motion as in the world). Pick a class and male / female look, read its fixed stats and kit, name it, create.
import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Gender } from '@/game/sprites/catalog';
import AnimatedCharacter from '../AnimatedCharacter';
import { useConfigStore } from '@/store/useConfigStore';
import { useGameStore } from '@/store/useGameStore';
import { ATTRIBUTES, ATTRIBUTE_LABEL } from '@/game/balance/config';
import { CLASS_IDS, CLASS_NAME, type ClassId } from '@/game/content';
import { ATTRIBUTE_HELP } from '@/game/balance/stats';
import { DEFAULT_HOTBAR, DEFAULT_SKILLS } from '@/game/skills/defaults';
import type { CharacterClip } from '@/game/characterModels';
import { audio, VOICE_LINES } from '@/game/audio/engine';

const UI: Record<ClassId, { th: string; color: string; role: string; lore: string; basic: string; diff: number }> = {
  Paladin: { th: 'พาลาดิน', color: '#ffe08a', role: 'แทงก์แนวหน้า · ดาบมือเดียว + โล่', lore: 'อัศวินผู้ถือคำสัตย์ ยืนรับแรงปะทะแทนเพื่อน ป้องกันแน่นหนาที่สุด และมีแสงศักดิ์สิทธิ์ทั้งโจมตีและรักษา', basic: 'ฟันดาบ 3 จังหวะ · ตัวทนที่สุด', diff: 1 },
  Hawkeye: { th: 'ฮอว์คอาย', color: '#8bdb9a', role: 'ยิงไกล · ธนูยาว', lore: 'พรานผู้แม่นยำ ยิงจากระยะไกลที่สุดในเกม คริติคอลสูง ความเร็วโจมตีไว ต้องรักษาระยะห่างจากศัตรู', basic: 'ยิงศร ระยะ 9 ม.', diff: 2 },
  RuneMaster: { th: 'รูนมาสเตอร์', color: '#62dfdf', role: 'ดาบเวท · เสาอักขระ', lore: 'นักดาบเวท ฟันแล้วปล่อยคลื่นดาบเวทพุ่งใส่ศัตรู ปักเสาอักขระได้หลายแบบ — เสาโจมตีวงกว้าง เสาตรึงศัตรูเป็นกลุ่ม เสาฟื้นฟูเลือดหมู่ เสาบัฟ ATK/DEF ให้ตัวเองและปาร์ตี้ เสาสาปลด ATK/DEF ศัตรู (ใช้กับบอสได้) และระเบิดพิษหมู่', basic: 'ฟันดาบ + คลื่นดาบเวท ระยะ 5 ม.', diff: 3 },
  Elementalist: { th: 'อีลีเมนทัลลิสต์', color: '#b685ff', role: 'เวทธาตุ · คทาสองมือ', lore: 'ผู้บัญชาไฟ น้ำแข็ง และสายฟ้า ดาเมจพื้นที่สูงที่สุด แต่ตัวบางที่สุด สกิลแรงบางท่าต้องร่าย', basic: 'ยิงลูกเวท ระยะ 8.5 ม.', diff: 2 },
  Assassin: { th: 'แอสแซสซิน', color: '#c97bff', role: 'ประชิดเร็ว · มีดคู่', lore: 'นักฆ่าในเงา ตีเร็ว คริแรง พุ่งเข้าประชิดแล้วปิดฉากเป้าที่ใกล้ตาย แลกกับพลังชีวิตน้อย', basic: 'แทงมีดคู่ 3 จังหวะ · เร็วที่สุด', diff: 3 },
  HighPriest: { th: 'ไฮพรีสต์', color: '#ffdb86', role: 'รักษา · บัฟปาร์ตี้', lore: 'นักบวชชั้นสูง รักษาและอวยพรเพื่อนร่วมทีม เกราะพลังให้ทั้งปาร์ตี้ และยังเผาศัตรูด้วยแสงได้', basic: 'ยิงแสง ระยะ 7 ม.', diff: 1 },
  Inquisitor: { th: 'อินควิซิเตอร์', color: '#8fd3ff', role: 'เวทสายฟ้า · ค้อน + โล่', lore: 'ผู้พิพากษาแห่งพายุ ถือค้อนและโล่ เชี่ยวชาญเวทสายฟ้า ร่ายเมฆครึ้มให้ฟ้าผ่าศัตรูทั้งกลุ่ม ปักเสาช็อตและเสาระเบิดสายฟ้า และเรียกค้อนเทพธอร์เหวี่ยงลงมาจากฟ้า', basic: 'ทุบค้อน 3 จังหวะ · ดาเมจเวท', diff: 2 },
  Berserker: { th: 'เบอร์เซิร์กเกอร์', color: '#ff4a3a', role: 'ดาเมจประชิด · อาวุธสองมือ', lore: 'นักรบผู้ปล่อยให้ความโกรธเป็นอาวุธ แบกดาบใหญ่ ขวานใหญ่ หรือค้อนใหญ่ สะสม Rage จากทุกการฟันและทุกบาดแผล แล้วระเบิดออกเป็นสกิลที่รุนแรงที่สุดในสนาม ยิ่งเลือดน้อยยิ่งอันตราย — ถึง Lv60 เลื่อนขั้นเป็น Reaver ผู้เก็บเกี่ยววิญญาณ', basic: 'ฟันคอมโบ 3 จังหวะ · ทุกการโดนได้ Rage', diff: 2 },
};
const SPOTS = CLASS_IDS.map((_, i) => { const a = (i - (CLASS_IDS.length - 1) / 2) * 0.3; return new Vector3(Math.sin(a) * 6, 0, -Math.cos(a) * 6 + 4.8); });

function Hero({ cls, i, selected, onPick, gender, hair, hairColor }: { cls: ClassId; i: number; selected: boolean; onPick: () => void; gender: Gender; hair: string; hairColor: string }) {
  const [clip, setClip] = useState<CharacterClip>('Idle'); const [stamp, setStamp] = useState(0);
  // picking a hero plays its rally / blessing pose once, then it returns to its signature idle
  // picking a hero (or switching its look) shows off its signature move, then it settles back into its idle
  useEffect(() => { if (!selected) return; setClip('Skill'); setStamp(Date.now()); const t = setTimeout(() => setClip('Idle'), 1250); return () => clearTimeout(t); }, [selected, gender, cls]);
  return <group position={SPOTS[i]} onClick={e => { e.stopPropagation(); onPick(); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
    <mesh position={[0, .16, 0]} castShadow receiveShadow><cylinderGeometry args={[.6, .7, .32, 8]} /><meshStandardMaterial color="#1b1820" roughness={.85} flatShading /></mesh>
    <mesh position={[0, .35, 0]} receiveShadow><cylinderGeometry args={[.54, .6, .06, 8]} /><meshStandardMaterial color="#2a2530" roughness={.7} flatShading /></mesh>
    <mesh position={[0, .386, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.38, .52, 48]} /><meshBasicMaterial color={UI[cls].color} transparent opacity={selected ? .95 : .3} depthWrite={false} /></mesh>
    {selected && <pointLight position={[0, 1.4, .6]} color={UI[cls].color} intensity={3} distance={4} decay={2} />}
    <group position={[0, .38, 0]}><AnimatedCharacter job={cls} gender={gender} hair={hair} hairColor={hairColor} clip={clip} replay={stamp} duration={clip === 'Buff' ? 1.1 : undefined} /></group>
  </group>;
}
function Rig({ sel }: { sel: number }) {
  const { camera, size } = useThree(); const look = useRef(new Vector3(0, .85, 0));
  useFrame((_, dt) => { const s = SPOTS[sel], wide = size.width >= 768, bias = wide ? .55 : 0;
    // round 23: on a narrow (portrait) screen the hero sits in the top ~40 % above the info card, at a modest size
    const pos = new Vector3(s.x * .8 + bias, wide ? 2.4 : 2.9, s.z + (wide ? 8.4 : 14)); camera.position.lerp(pos, 1 - Math.exp(-dt * 3));
    look.current.lerp(new Vector3(s.x * .8 + bias, wide ? .85 : -1.05, s.z - .4), 1 - Math.exp(-dt * 3.5)); camera.lookAt(look.current); });
  return null;
}

export default function CharacterCreate({ onCreate, only }: { onCreate: (name: string, cls: ClassId, gender: Gender) => Promise<string | null>; /** the class picked on the entry screen: only that one is shown */ only?: ClassId | null }) {
  const [sel, setSel] = useState(Math.max(0, CLASS_IDS.indexOf(only ?? 'Berserker'))); const gender: Gender = 'm'; /* round 22: female sheets not drawn yet */ const cls = CLASS_IDS[sel]; const config = useConfigStore(s => s.config);
  const hair = 'B04', hairColor = '#7a4a26'; // the layered-rig hair options are off while each class uses its painted sheet
  const [name, setName] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  // each class speaks its line when picked (and again when the male / female look changes)
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } void audio.voice(cls, gender); }, [cls, gender]);
  useEffect(() => () => audio.stopVoice(), []);
  const kit = useMemo(() => { const h = DEFAULT_HOTBAR[cls]; return [h.skill, h.buff, h.special].map(id => DEFAULT_SKILLS.defs.find(d => d.id === id)!).filter(Boolean); }, [cls]);
  async function submit(e: FormEvent) {
    e.preventDefault(); const n = name.trim();
    if (!/^[A-Za-z0-9_฀-๿]{3,16}$/.test(n)) { setMsg('ชื่อ 3–16 ตัว ใช้ไทย อังกฤษ ตัวเลข หรือ _'); return; }
    setBusy(true); setMsg(''); const err = await onCreate(n, cls, gender); setBusy(false); if (err) setMsg(err); else useGameStore.getState().setLook(hair, hairColor);
  }
  return <main className="sf-create" style={{ ['--cc' as string]: UI[cls].color }}>
    <Canvas shadows camera={{ fov: 30, position: [0, 2.4, 11] }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={['#07060a']} /><fogExp2 attach="fog" args={['#07060a', .06]} />
      <hemisphereLight args={['#7f8fb3', '#1c1612', .9]} />
      <directionalLight position={[3, 7, 6]} intensity={2.4} color="#ffe6c8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <directionalLight position={[-6, 4, -5]} intensity={1.1} color="#62d7cb" /><directionalLight position={[6, 3, -4]} intensity={.8} color="#b685ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#120f16" roughness={.92} /></mesh>
      <Suspense fallback={null}>{CLASS_IDS.map((c, i) => (!only || c === only) && <Hero key={c} cls={c} i={i} gender={gender} hair={hair} hairColor={hairColor} selected={i === sel} onPick={() => setSel(i)} />)}</Suspense>
      <Rig sel={sel} />
    </Canvas>
    <header className="sf-create-top"><h1>สร้างตัวละครของคุณ</h1><p>{only ? `${CLASS_NAME[cls]} · ตั้งชื่อ แล้วเริ่มผจญภัย` : 'เลือกอาชีพ ตั้งชื่อ แล้วเริ่มผจญภัย'}</p></header>
    {!only && <nav className="sf-create-rail" aria-label="อาชีพ">{CLASS_IDS.map((c, i) => <button key={c} type="button" aria-pressed={i === sel} style={{ ['--cc' as string]: UI[c].color }} onClick={() => setSel(i)}>
      <b>{CLASS_NAME[c]}</b><span>{UI[c].th} · {UI[c].role}</span></button>)}</nav>}
    <aside className="sf-create-info">
      <div className="role">{UI[cls].role}</div><h2>{CLASS_NAME[cls]}</h2>
      <div className="sub">{UI[cls].th} · ความยาก <span className="diff">{[1, 2, 3].map(d => <i key={d} className={d <= UI[cls].diff ? 'on' : ''} />)}</span></div>
      <p className="quote">“{VOICE_LINES[cls]}” <button type="button" className="voice-btn" aria-label="ฟังเสียงพูด" onClick={() => void audio.voice(cls, gender)}>🔊</button></p>
      <p className="lore">{UI[cls].lore}</p>
      <div className="stats">{ATTRIBUTES.map(a => <div key={a} title={ATTRIBUTE_HELP[a]}><b>{ATTRIBUTE_LABEL[a]}</b><i><em style={{ width: `${config.classes[cls].base[a] / 24 * 100}%` }} /></i><span>{config.classes[cls].base[a]}</span></div>)}</div>
      <p className="note">สเตตัส 6 ค่าตายตัว — เพิ่มได้จากออปชันอุปกรณ์{cls === 'Berserker' ? ' · Reaver (Lv60) ได้ค่าพื้นฐานสูงขึ้นและสกิลทั้งหมดวิวัฒน์' : ' · ภาพตัวละครของอาชีพนี้ยังใช้ภาพชั่วคราว'}</p>
      <div className="kit"><div><b>{UI[cls].basic}</b></div>{kit.map(d => <div key={d.id}><b>{d.name} · {d.th}</b><small>{d.description}{d.castMs ? ` · ร่าย ${(d.castMs / 1000).toFixed(1)}s` : ''}</small></div>)}</div>
    </aside>
    <form className="sf-create-bottom" onSubmit={submit}>
      <input id="create-name" maxLength={16} placeholder="ชื่อตัวละคร (3–16 ตัว)" value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
      <button className="sf-btn" disabled={busy}>{busy ? 'กำลังสร้าง…' : 'สร้างตัวละคร'}</button>
      {msg && <p className="sf-error" role="alert">{msg}</p>}
    </form>
  </main>;
}
