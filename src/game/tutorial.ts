// One-time tutorial tips. Each tip fires on its trigger the first time only; the "seen" list is saved with the
// character (game snapshot) so a tip is never shown twice — on any device.
export type TipTrigger = 'start' | 'npc-near' | 'quest-offer' | 'quest-accepted' | 'quest-progress' | 'quest-ready' | 'quest-done' | 'combat' | 'loot'
  | 'bag-full' | 'equip' | 'craft-open' | 'craft-fail' | 'crystal-3' | 'enhance-open' | 'low-hp' | 'auto-open' | 'level-up' | 'skill-point' | 'boss' | 'ruins' | 'market' | 'party' | 'costume';
export type Tip = { id: string; trigger: TipTrigger; title: string; body: string; keys?: string };
export const TIPS: Tip[] = [
  { id: 't-move', trigger: 'start', title: 'เริ่มการผจญภัย', body: 'WASD หรือคลิกพื้นเพื่อวิ่ง · ลากเมาส์ขวาหมุนกล้อง · ล้อเมาส์ซูม · ผู้เฒ่าคอร์วินที่ลานเมืองมีเควสแรกรออยู่ (เครื่องหมาย ! สีทอง)', keys: 'WASD' },
  { id: 't-npc', trigger: 'npc-near', title: 'คุยกับ NPC', body: 'เมื่อเข้าใกล้ NPC จะมีปุ่ม F ขึ้นมา กด F หรือคลิกที่ตัว NPC เพื่อเปิดบทสนทนา ร้านค้า และเควส', keys: 'F' },
  { id: 't-quest-offer', trigger: 'quest-offer', title: 'รับเควส', body: '“!” สีทองเหนือหัว NPC = มีเควสให้รับ เปิดบทสนทนาแล้วกด “รับเควส” · เควสที่รับแล้วแสดงอยู่ใต้กรอบตัวละคร (J เปิดสมุดเควส)', keys: 'J' },
  { id: 't-quest-accepted', trigger: 'quest-accepted', title: 'ทำเควส', body: 'เป้าหมายของเควสแสดงที่ตัวติดตามด้านซ้าย ความคืบหน้าขึ้นเองเมื่อปราบมอนสเตอร์ คุยกับ NPC ซื้อของ หรือคราฟ ตามที่เควสกำหนด' },
  { id: 't-quest-ready', trigger: 'quest-ready', title: 'ส่งเควส', body: '“?” สีทองเหนือหัว NPC = ส่งเควสได้แล้ว กลับไปคุยแล้วกด “ส่งเควส” เพื่อรับ EXP, SoulGod และไอเทม' },
  { id: 't-combat', trigger: 'combat', title: 'การต่อสู้', body: 'คลิกมอนสเตอร์เพื่อไล่ตีอัตโนมัติ · ปุ่มวงกลมใหญ่มุมขวาล่าง = โจมตีธรรมดา (คอมโบ 3 จังหวะ) · 6 ปุ่มรอบ ๆ = สกิล (Space Q E R T X)' },
  { id: 't-loot', trigger: 'loot', title: 'เก็บของ', body: 'ของที่ดรอปมีลำแสงสีตามระดับ เดินผ่านเพื่อเก็บ · ไอเทมเข้า “กระเป๋า” (I) ลากไปวางช่องสวมใส่ได้เลย', keys: 'I' },
  { id: 't-equip', trigger: 'equip', title: 'สวมอุปกรณ์', body: 'อุปกรณ์ล็อกตามอาชีพ · ลากจากกระเป๋าไปวางในช่อง หรือดับเบิลคลิก · ชุดแฟชั่น (ช่องชุด) เปลี่ยนรูปลักษณ์โดยไม่เปลี่ยนสเตตัส' },
  { id: 't-craft', trigger: 'craft-open', title: 'การคราฟ', body: 'เลือกระดับ อาชีพ และประเภทไอเทม ใช้ SoulGod + วัตถุดิบ (มากขึ้นตามระดับ) · Legendary 75% · God 70% · Pre-arch 60% · Arch 45% · พลาดแล้วได้คริสตัล 1 เม็ด' },
  { id: 't-crystal', trigger: 'craft-fail', title: 'คริสตัลชดเชย', body: 'คราฟพลาดได้คริสตัลสีตามระดับ สะสม 3 เม็ดระดับเดียวกัน แล้วกด “คราฟด้วยคริสตัล” = สำเร็จ 100% เลือกประเภท/อาวุธได้' },
  { id: 't-enhance', trigger: 'enhance-open', title: 'การตีบวก', body: '+1 ถึง +6 ไม่ลดขั้น · ตั้งแต่ +7 พลาดลด 1 ขั้น ใช้คัมภีร์ป้องกันได้ · ค่าตีบวกถูกเผาออกจากระบบ' },
  { id: 't-lowhp', trigger: 'low-hp', title: 'เลือดใกล้หมด!', body: 'กด 7 ดื่มยาเลือด · 8 ยามานา · 9 อาหารบัฟ · หรือตั้งให้ AUTO ดื่มเองเมื่อเลือดต่ำกว่าที่กำหนด', keys: '7 8 9' },
  { id: 't-auto', trigger: 'auto-open', title: 'โหมดล่าอัตโนมัติ', body: 'ตั้ง % เลือด/มานาที่จะดื่มยา เปิด/ปิดสกิลแต่ละช่อง — AUTO จะรอ Rage ให้พอก่อนใช้สกิล' },
  { id: 't-level', trigger: 'level-up', title: 'เลเวลอัป!', body: 'ได้แต้มสกิล 1 แต้ม กด K เปิดต้นไม้สกิล · สเตตัสหลักตายตัวตามอาชีพ เพิ่มได้จากอุปกรณ์', keys: 'K' },
  { id: 't-ruins', trigger: 'ruins', title: 'ดินแดนแห่งความโศกเศร้า', body: 'เขตซากปรักหักพังมีมอนสเตอร์หนาแน่นและ Elite (ป้ายชื่อทอง) ที่มีสกิลพิเศษ — ดรอปดีกว่าทุ่งปกติ' },
  { id: 't-boss', trigger: 'boss', title: 'บอส', body: 'บอสใช้เวลา 15–30 นาทีและออกแบบให้หลายคนรุม · หลบวงเตือนสีส้ม · จบแล้วดูอันดับดาเมจ 10 อันดับ อันดับ 1 มีโอกาส 50% ได้ไอเทมระดับสูง' },
  { id: 't-market', trigger: 'market', title: 'ตลาด SoulGod', body: 'ตั้งราคาขายได้ไม่ต่ำกว่าราคาขั้นต่ำของระดับนั้น ค่าธรรมเนียมและภาษีถูกเผาออกจากระบบ' },
  { id: 't-party', trigger: 'party', title: 'ปาร์ตี้', body: 'เชิญผู้เล่นเข้าปาร์ตี้ได้สูงสุด 6 คน หลุดการเชื่อมต่อยังจองที่ไว้ 120 วินาที', keys: 'P' },
  { id: 't-costume', trigger: 'costume', title: 'ชุดแฟชั่น', body: 'ชุดแฟชั่นเปลี่ยนรูปลักษณ์ของตัวละครทั้งในเมืองและตอนต่อสู้ ถอดได้ทุกเมื่อจากช่องชุดในหน้าต่างอุปกรณ์' },
];
/** the tip to show for this trigger, or null if every tip for it was already seen */
export function tipFor(trigger: TipTrigger, seen: readonly string[]): Tip | null { return TIPS.find(t => t.trigger === trigger && !seen.includes(t.id)) ?? null; }
export const markSeen = (seen: readonly string[], id: string) => seen.includes(id) ? [...seen] : [...seen, id];
