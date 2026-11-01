// Round 12: game version + patch notes. The website (#patch), the login screen and the settings window read this list;
// the back office publishes newer notes into game_config key 'patches' (same shape) and can roll the live client back to
// an earlier build (Netlify keeps every deploy: "Publish deploy" on an older one), see docs/ROUND12_TH.md.
export type Patch = { version: string; date: string; title: string; notes: string[]; compat?: { minClient: string; db: string } };
export const PATCHES: Patch[] = [
  { version: '0.12.0', date: '2026-10-26', title: 'อาชีพขั้นสูง · ตู้เสื้อผ้า · ปาร์ตี้แบบเชิญ', compat: { minClient: '0.12.0', db: '202610260010' }, notes: [
    'ภาพตัวละครชุดใหม่: นักรบ 10 ท่าทาง (ชาย/หญิง), จอมเวทเดินและหัน 8 ทิศ, ภาพลักษณ์อาชีพขั้น 2–3 ครบ 20 สาย',
    'เพิ่มช่องมือรอง (โล่ ลูกแก้ว คัมภีร์ กระบอกศร) และไอคอนอาวุธ 8 ระดับชุดใหม่ ไอคอนยาและวัตถุดิบใหม่ ไอคอนเมนูใหม่',
    'ตัวเลขคริติคอลแบบภาพวาดสีทอง',
    'เควสนำทาง: สกิลใหม่ได้จากภารกิจ NPC · เควสทดสอบเลื่อนอาชีพขั้น 2 และขั้น 3 ที่ Master Ysolde',
    'ปาร์ตี้: ไม่มีการจัดให้อัตโนมัติ ส่งคำเชิญเอง สูงสุด 5 คน · โบนัส EXP 2/3/4/5 คน = +25/50/75/100% นับเฉพาะคนในแผนที่เดียวกันและอยู่ในระยะ',
    'ตู้เสื้อผ้า: ชุด อาวุธแฟชั่น ปีก ผ้าคลุม ศีรษะ และอื่นๆ · Cash Shop (ชุดไทยขาวทอง 349 บาท)',
    'บอสล่าคนเดียวไม่ได้: ความแข็งแกร่งของบอสขึ้นกับจำนวนผู้ร่วมรบ และต้องมีผู้รักษา/แทงก์',
    'เว็บไซต์มีปุ่มเปิด/ปิดเสียง · หน้าแพตช์โน้ต',
  ] },
  { version: '0.11.0', date: '2026-10-25', title: 'สมุดสะสมอสูร', notes: ['ของดรอปจากมอนสเตอร์ทุกชนิด 24 รายการ ลงสมุดรับค่าสถานะถาวรแบบมีเพดาน · ตราสมุดสะสมจาก Elite/บอส · ขายของส่วนเกินที่ยายเจสซ่า'] },
  { version: '0.10.0', date: '2026-10-25', title: 'เศรษฐกิจบนเซิร์ฟเวอร์', notes: ['ตลาดผู้เล่นและจดหมายทำงานบนเซิร์ฟเวอร์ทั้งหมด · ภาษีตลาดปรับตามเงินเฟ้อ · ค่าลงขายถูกเผา'] },
  { version: '0.9.0', date: '2026-10-25', title: 'ตัวละครเก็บที่เซิร์ฟเวอร์', notes: ['เงิน ไอเทม เลเวล เควส อยู่ที่เซิร์ฟเวอร์ · ตรวจการเดินและการฆ่ามอนสเตอร์'] },
];
export const GAME_VERSION = PATCHES[0].version;
/** newer-or-equal compare for dotted versions ('0.12.0' ≥ '0.11.3') */
export const versionAtLeast = (v: string, min: string) => { const a = v.split('.').map(Number), b = min.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0); } return true; };
