// Wiki content built from the live game data (bestiary, balance formulas, zones, quests, crafting) — the website,
// the in-game Codex and the preview all render from here, so numbers never drift from the game.
import { BESTIARY } from '../bestiary';
import { monsterStats } from '../balance/stats';
import { DEFAULT_CONFIG, RARITY_KEYS } from '../balance/config';
import { craftCost, craftChance, expectedCraft, CRAFT_SLOT_TH, MATERIAL_TH } from '../balance/craft';
import { raidBossHp, expectedPlayerDps } from '../balance/raid';
import { RANK_REWARDS, HIGH_TIERS } from '../balance/bossRewards';
import { ZONES } from '../world/zones';
import { CITIES } from '../content';
import {spawnPoints} from '../spawns';

export const MONSTER_TH: Record<string, { kind: string; look: string; motion: string }> = {
  'Grave Crawler': { kind: 'สัตว์ป่า', look: 'แบดเจอร์เทาขาว ตัวเตี้ยหนา กรงเล็บขุด', motion: 'เดินสี่ขา หัวต่ำ ไหล่นำ' },
  'Ash Hound': { kind: 'สัตว์ป่า', look: 'สุนัขป่าสีเถ้า กล้ามกระชับ', motion: 'วิ่งสี่ขา ขาหลังส่งแรง' },
  'Bone Sentinel': { kind: 'สัตว์ป่า', look: 'หมูป่าดำ เขี้ยวงาช้าง', motion: 'ก้มหน้าพุ่ง หลังแข็งและขาสั้น' },
  'Briar Wolf': { kind: 'สัตว์ป่า', look: 'หมาป่าขนน้ำตาลมอส หยาบเป็นกลุ่ม', motion: 'ย่องต่ำ หางถ่วงสมดุล' },
  'Thorn Spider': { kind: 'สัตว์ป่า', look: 'ทารันทูลาแปดขา น้ำตาลดำ', motion: 'ขาสลับจังหวะ' },
  'Bark Guardian': { kind: 'สัตว์ป่า', look: 'หมีน้ำตาลหนา', motion: 'อกและไหล่หนัก ตะปบแล้วคืนฐาน' },
  'Reed Stalker': { kind: 'สัตว์ป่า', look: 'จระเข้เขียวมะกอก หางยาว', motion: 'ลำตัวต่ำ หางเหวี่ยงตามการเลี้ยว' },
  'Tide Crab': { kind: 'สัตว์ป่า', look: 'ปูสนิมมีเพรียง สองก้าม', motion: 'เดินด้านข้าง' },
  'Fen Maw Otter': { kind: 'สัตว์ป่า', look: 'นากสีเข้ม ขนเปียก คอหนา', motion: 'ลำตัวยืดหยุ่น หางตามจังหวะ' },
  'Cinder Beetle': { kind: 'สัตว์ป่า', look: 'ด้วงกว่างดำ หกขา หนึ่งเขา', motion: 'ยกหัวก่อนชน' },
  'Ironhide Rhino': { kind: 'สัตว์ป่า', look: 'แรดหนังเทาพับ', motion: 'เตรียมพุ่งจากขาหลัง' },
  'Slag Hound': { kind: 'สัตว์ป่า', look: 'ไฮยีน่าลายจุด กรามใหญ่', motion: 'ไหล่สูง สะโพกต่ำ' },
  'Crypt Crawler': { kind: 'Elite', look: 'วูล์ฟเวอรีนเข้ม แถบไหล่สีอ่อน', motion: 'ตัวหนากว่าปกติ แผลบอกระดับ' },
  'Oathscar Aurochs': { kind: 'Elite', look: 'วัวป่าเขาพุ่งหน้า', motion: 'ก้มเขาก่อนพุ่ง มวลหนัก' },
  'Moon Moth': { kind: 'อสูร', look: 'ผีเสื้อกลางคืนม่วง สี่ปีก', motion: 'กระพือช้า' },
  'Root Weaver': { kind: 'อสูร', look: 'แมงรากไม้แปดขา น้ำเลี้ยงอำพัน', motion: 'ยกตัวก่อนโจมตี' },
  'Ancient Treant': { kind: 'อสูร', look: 'ต้นไม้บิด หน้าโพรงอำพัน', motion: 'ก้าวหนัก แขนตามแรงช้า' },
  'Frost Wraith': { kind: 'อสูร', look: 'วิญญาณน้ำแข็งฟ้า ชายผ้าพลิ้ว', motion: 'ลอยขึ้นลง' },
  'Crystal Golem': { kind: 'อสูร', look: 'ผลึกดำฟ้า แขนใหญ่', motion: 'ง้างช้า กระแทกหนัก' },
  'Rime Serpent': { kind: 'อสูร', look: 'งูน้ำแข็งขด มีเขา', motion: 'เลื้อยเป็นคลื่น' },
  'Anvil Guard': { kind: 'อสูร', look: 'เกราะเหล็กสิงสู่ ค้อนและโล่', motion: 'เดินสั้นหนัก' },
  'Furnace Golem': { kind: 'อสูร', look: 'เตาเดินได้ ท้องเตาไฟ', motion: 'ยุบขาก่อนทุบ' },
  'Ember Drake': { kind: 'อสูร', look: 'มังกรหินดำ คอถ่านไฟ', motion: 'อกนำ หางรับแรง' },
  'Venom Spider': { kind: 'อสูร', look: 'แมงมุมท้องพิษเขียว', motion: 'ท้องเต้นเบา' },
  'Spore Beast': { kind: 'อสูร', look: 'หลังเห็ด ถุงสปอร์', motion: 'ไหล่หนัก' },
  'Thorn Hydra': { kind: 'อสูร', look: 'สัตว์เลื้อยคลานสามหัว', motion: 'คอแต่ละหัวเหลื่อมจังหวะ' },
  'Astral Wraith': { kind: 'อสูร', look: 'ผ้าคลุมดำดวงดาว แกนม่วง', motion: 'ผ้าลอยต่อเนื่อง' },
  'Prism Sentinel': { kind: 'อสูร', look: 'ผลึกดำลอย แกนเขียว', motion: 'ชิ้นผลึกลอยสัมพันธ์กัน' },
  'Halo Seraph': { kind: 'อสูร', look: 'เกราะดำไร้หน้า หกปีก ฮาโลหมอง', motion: 'ปีกเรียงสามคู่' },
  'Void Reaper': { kind: 'อสูร', look: 'ร่างผ้าคลุมดำ เคียวติดแขน', motion: 'ง้างแขนเคียว' },
  'Eclipse Drake': { kind: 'อสูร', look: 'มังกรเงา เขาจันทร์เสี้ยว', motion: 'หางรับแรงพ่น' },
  'Crown Colossus': { kind: 'อสูร', look: 'ยักษ์หิน หอพังบนไหล่', motion: 'ก้าวช้า ฝุ่นแยกจากร่าง' },
  'Tide Wraith': { kind: 'Elite', look: 'ผีจมน้ำ ผ้าสาหร่าย เขาปะการัง', motion: 'ชายผ้าไหลต่อเนื่อง' },
  'Root Reaper': { kind: 'Elite', look: 'นักล่ารากดำ หกขา แขนเคียวหนาม', motion: 'ลำตัวต่ำ' },
};
/** every Elite has exactly one skill */
export const ELITE_SKILLS: Record<string, { name: string; th: string; desc: string; windup: number }> = {
  'Crypt Crawler': { name: 'Burrow Ambush', th: 'มุดดินซุ่มโจมตี', desc: 'มุดลงดินแล้วโผล่ใต้เป้าหมาย ดาเมจ ×2.2 วงรัศมี 2.5 ม. — วงเตือน 1.2 วินาที', windup: 1.2 },
  'Oathscar Aurochs': { name: 'Oathbreaker Charge', th: 'พุ่งชนสาบานแตก', desc: 'ก้มเขาพุ่งเป็นแนวตรง 10 ม. ดาเมจ ×2.5 และล้มลง 1 วินาที — หลบด้านข้างได้', windup: 1.4 },
  'Tide Wraith': { name: 'Drowning Tide', th: 'กระแสน้ำจมดิ่ง', desc: 'คลื่นวงกว้าง 5 ม. ดาเมจ ×1.8 และลดความเร็ว 30% 4 วินาที', windup: 1.5 },
  'Root Reaper': { name: 'Thorn Harvest', th: 'เก็บเกี่ยวหนาม', desc: 'กวาดเคียวหนาม 200° ระยะ 4 ม. ดาเมจ ×2.0 + เลือดไหล 6 วินาที', windup: 1.1 },
};
export type BossLore = { name: string; th: string; title: string; level: number; kind: 'dungeon' | 'world'; home: string; origin: string; story: string; skills: { name: string; desc: string }[]; phases: string[] };
export const BOSSES: BossLore[] = [
  { name: 'Grave Marshal', th: 'จอมพลแห่งหลุมศพ', title: 'บอสดันเจี้ยน', level: 40, kind: 'dungeon', home: 'มหาวิหารแห่งเสียงร่ำไห้',
    origin: 'อดีตแม่ทัพผู้พิทักษ์มหาวิหาร ที่สาบานว่าจะไม่ปล่อยให้ศัตรูผ่านประตูแม้ตัวตาย — สุริยคราสบิดคำสาบานนั้นให้เขากลายเป็นอสูรกระทิง',
    story: 'ทุกคืนเที่ยง ระฆังของมหาวิหารดังเองสามครั้ง แล้วเสียงขวานลากพื้นก็ดังตามมา จอมพลยังเดินตรวจหลุมศพของอัศวินที่เคยเป็นลูกน้อง และฆ่าทุกคนที่เหยียบลานศักดิ์สิทธิ์โดยไม่สาบานตน',
    skills: [{ name: 'Axe Sweep — กวาดขวาน', desc: 'กวาด 180° ระยะ 6 ม. เตือน 1.2 วินาที' }, { name: 'Earthbreaker — ทุบพื้น', desc: 'วงรัศมี 5 ม. เตือน 1.6 วินาที ทำให้มึน' }, { name: 'Horn Rush — พุ่งเขา', desc: 'พุ่งตรง 12 ม. หลบด้านข้างได้' }, { name: 'Oath Roar — คำรามคำสาบาน', desc: 'HP ต่ำกว่า 30%: บัฟพลังโจมตีตัวเอง +30% และเรียกวิญญาณอัศวิน 3 ตน' }],
    phases: ['100–30%: สลับกวาดขวาน/ทุบพื้น', 'ต่ำกว่า 30%: คลั่ง คำราม เรียกอัศวิน พุ่งบ่อยขึ้น'] },
  { name: 'Drowned Hierophant', th: 'มหาปุโรหิตผู้จมน้ำ', title: 'บอสดันเจี้ยน', level: 85, kind: 'dungeon', home: 'อารามจมน้ำแห่ง Dawnveil',
    origin: 'มหาปุโรหิตที่พยายามกักวิญญาณผู้จมน้ำไว้ในตะเกียง เพื่อต่อชีวิตตนเอง จนตัวเองกลายเป็นวิญญาณที่ถูกตะเกียงจองจำ',
    story: 'โซ่ของเขาร้อยวิญญาณนับร้อยไว้ด้วยกัน ทุกครั้งที่ยกตะเกียง วิญญาณหนึ่งดวงจะกรีดร้องและกลายเป็นลำแสงมรกต',
    skills: [{ name: 'Soul Lance', desc: 'ลำแสงตรง 18 ม. กว้าง 2 ม. เตือน 1.3 วินาที' }, { name: 'Chain Reap', desc: 'โซ่ตรง 14 ม. ดึงผู้เล่นเข้าหา + Soul Bind' }, { name: 'Soul Vortex', desc: 'ร่าย 4 วินาที วังวนดูดทุกคนเข้ากลาง — ต้องขัดจังหวะด้วยดาเมจรวม' }],
    phases: ['100–50%: Soul Lance / Chain Reap', '50–30%: เพิ่ม Soul Vortex', 'ต่ำกว่า 30%: ตะเกียงแตก วิญญาณหลุดไล่ผู้เล่น'] },
  { name: 'Worldroot Devourer', th: 'ผู้กลืนกินรากโลก', title: 'บอสดันเจี้ยน', level: 100, kind: 'dungeon', home: 'ดินแดนรกร้างใจกลาง Sorrowlands',
    origin: 'ราชามังกรดำผู้กัดกินรากของต้นไม้โลก เกล็ดออบซิเดียนของมันคือรากที่กลายเป็นหิน',
    story: 'ตำนานว่าความโศกเศร้าทั้งหมดในดินแดนนี้ไหลลงไปเลี้ยงมัน ยิ่งผู้คนสิ้นหวัง เพลิงมืดในอกของมันก็ยิ่งร้อน',
    skills: [{ name: 'Claw Sweep', desc: 'กวาดกรงเล็บ 200° ระยะ 8 ม. เตือน 1.2 วินาที' }, { name: 'Darkfire Breath', desc: 'พ่นเพลิงมืดเป็นกรวย 60° ระยะ 16 ม. เตือน 1.8 วินาที' }, { name: 'Terror Roar', desc: 'คลั่งขั้น 2: วงรัศมี 12 ม. Fear 3 วินาที คูลดาวน์ 20 วินาที' }],
    phases: ['100–50%: กวาดกรงเล็บ/พ่นไฟ', '50–30%: บินขึ้นพ่นไฟเป็นแนว', 'ต่ำกว่า 30%: Terror Roar'] },
  { name: 'Abyssal Forge Titan', th: 'ไททันเตาหลอมนรก', title: 'World Boss ออนไลน์', level: 50, kind: 'world', home: 'ถนนสู่วิหารทางเหนือของลานเข็มทิศ Hollow Reach (ออนไลน์)',
    origin: 'เตาหลอมดวงแรกของ SoulForge ที่ถูกป้อนวิญญาณมากเกินไปจนลุกขึ้นเดินเองได้ แกนชมพูกลางอกคือวิญญาณนับพันที่ยังไม่ถูกหลอม',
    story: 'ทุกครั้งที่มันตื่น ผู้เล่นทั้งเซิร์ฟเวอร์ต้องรวมพลกัน — มันแข็งแรงขึ้นตามจำนวนผู้ท้าชิง และปล่อยของรางวัลให้ผู้ทำดาเมจสูงสุด 10 อันดับ',
    skills: [{ name: 'Forge Slam', desc: 'ทุบพื้นวงรัศมี 7 ม. เตือน 1.8 วินาที' }, { name: 'Molten Chain', desc: 'เหวี่ยงโซ่ลาวารอบตัว 360° ระยะ 5 ม.' }, { name: 'Core Overload', desc: 'HP ต่ำกว่า 30%: แกนอกระเบิดทุก 25 วินาที ทุกคนในระยะ 20 ม. — ยืนในวงซิสเตอร์/โล่ Enchanter เพื่อรอด' }],
    phases: ['100–60%: Forge Slam', '60–30%: เพิ่ม Molten Chain', 'ต่ำกว่า 30%: Core Overload'] },
];
/** where a species lives: the Sorrowlands farm grounds (with map coordinates) and every field / dungeon that lists it */
export function spawnsOf(species: string) {
  const out: { where: string; levels: string; pos?: [number, number] }[] = [];
  for (const c of Object.values(CITIES)) {const matches=spawnPoints(c.id).filter(s=>s.name===species);if(matches.length)out.push({where:c.name,levels:`${Math.min(...matches.map(s=>s.level))}–${Math.max(...matches.map(s=>s.level))}`,pos:[...matches[0].position]});}
  return out;
}
export function monsterEntries() {
  return BESTIARY.map(b => {
    const elite = /ELITE/.test(b.levels) || MONSTER_TH[b.name]?.kind === 'Elite';
    const nums = (b.levels.match(/\d+/g) ?? ['1']).map(Number); const lv = Math.round((nums[0] + (nums[1] ?? nums[0])) / 2);
    const st = monsterStats(lv, { elite });
    return { id: b.id, name: b.name, levels: b.levels.replace(' ELITE', ''), level: lv, elite, th: MONSTER_TH[b.name], image: `/art/sprites/${b.id}.webp`,
      hp: st.maxHp, attack: Math.round(st.damage), defense: st.defense, mp: elite ? 80 + lv * 8 : 20 + lv * 4, skill: elite ? ELITE_SKILLS[b.name] ?? null : null, spawns: spawnsOf(b.name) };
  });
}
/** boss pools are raid-sized (no fixed numbers are published; this is the target fight length) */
export function bossRaidInfo(b: BossLore) {
  const hp8 = raidBossHp(b.level, 8), hp40 = raidBossHp(b.level, 40);
  return { minutes: [DEFAULT_CONFIG.raid.minMinutes, DEFAULT_CONFIG.raid.maxMinutes], scalesFrom: hp8, at40: hp40, dps: expectedPlayerDps(b.level) };
}
export function zoneEntries() { const points=spawnPoints('wild0');return ZONES.map(z => {const elite=z.spawns.find(s=>s.elite),actual=points.find(p=>p.name===elite?.species&&p.elite);return {...z,x:actual?.position[0]??z.x,z:actual?.position[1]??z.z,story:z.story+' · ตำแหน่งปัจจุบันอ้างอิงจุดล่า Round 23',monsters: [...new Set(z.spawns.map(s => s.species))]};}); }
export function cityEntries() { return Object.values(CITIES).filter(c => !c.parent).map(c => ({ id: c.id, name: c.name, subtitle: c.subtitle, description: c.description })); }
export function craftTable() {
  return RARITY_KEYS.map(r => ({ rarity: r, chance: craftChance(r), weapon: craftCost(r, 'weapon'), armor: craftCost(r, 'armor'), other: craftCost(r, 'helmet'), expected: expectedCraft(r, 'weapon') }));
}
export const WIKI_REWARDS = { ranks: RANK_REWARDS, highTiers: HIGH_TIERS };
export { CRAFT_SLOT_TH, MATERIAL_TH };
