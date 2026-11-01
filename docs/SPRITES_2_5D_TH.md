# ตัวละคร 2.5D isometric (compact-cast-v2)

ตัวละคร มอนสเตอร์ และ NPC ทุกตัวในเกมใช้ภาพวาดจาก `reference/compact-cast-v2` และ `reference/compact-female-v3` โดยตรง
(ตัดพื้นหลังออก ไม่ใช่โมเดล 3D แล้ว) และเคลื่อนไหวได้ตลอดเวลา ไม่แข็งทื่อ

## ภาพที่ใช้
| ชุด | ที่มา | จำนวนเฟรม |
|---|---|---|
| อาชีพหลัก 5 อาชีพ ชาย / หญิง | `01-five-classes.png`, `compact-female-v3/01-five-female-classes.png` | 10 ท่ายืน |
| ท่าโจมตี/ร่ายจากภาพวาด | Warrior: ANTICIPATE→PUSH→IMPACT→RECOVER และ ANTICIPATION→IMPACT→SETTLE · Mage: IDLE/RUN/TURN/STOP · Priest: PREPARE→BLESS→HEAL→SETTLE · Archer: DRAW→RELEASE→SIDESTEP→RECOVER · Enchanter: GATHER→RELEASE→FOLLOW THROUGH→SETTLE | 27 |
| NPC ในเมือง 9 คน + ท่า Mira (ทักทาย/ยื่นยา) | `03-town-npcs.png`, `10-priest-archer-npc-motion.png` | 13 |
| มอนสเตอร์ 34 ชนิด + บอส 4 ตัว (+ ท่ากระแทก/ร่าย/พ่นไฟ) | `04`–`07`, `09` | 43 |

ทั้งหมด 93 ไฟล์ `.webp` (~2.7 MB) ใน `public/art/sprites/` ขนาด/จุดยืนเท้าของแต่ละเฟรมอยู่ใน `src/game/sprites/frames.ts`
รูปหน้า/รูปเต็มสำหรับกรอบปาร์ตี้และหน้าต่าง NPC สร้างจากภาพชุดเดียวกัน: `public/art/portraits/*` (มีแบบหญิง `f-*`)

## วิธีทำให้ภาพเคลื่อนไหว (`src/game/sprites/spriteActor.ts`)
- ภาพแต่ละเฟรมอยู่บนแผ่นตาข่าย 10×14 ช่องที่หันเข้ากล้องเสมอ ความลึกเท่ากับเท้า → เรียงหน้า–หลังกับฉาก 3D ถูกต้องแบบเกม isometric
- Vertex shader ดัดภาพทุกเฟรม: หายใจ (อกขยาย ไหล่ขึ้น) · วิ่ง (เด้ง ยืด-หด เอนตัว เข่า/ชายผ้าสลับ เท้าติดพื้น) · ผ้าคลุม/ชายเสื้อ/ผมเป็นสปริงที่ตามความเร็วจริง ตอนหยุดจะเหวี่ยงต่อแล้วค่อยนิ่ง · แขนถืออาวุธหมุนรอบไหล่ · โดนตีสะดุ้งถอย · ตายล้มแล้วจาง
- ท่าจากภาพวาดสลับกันแบบตัดเร็ว (~45 ms) พร้อมจังหวะยืด-หดเล็กน้อยตอนท่าใหม่ลง จึงอ่านเป็นการเคลื่อนไหวไม่ใช่ภาพนิ่งสลับกัน
- หันซ้าย/ขวาด้วยการ “บีบผ่านขอบ” แทนการพลิกทันที
- ชื่อท่าเหมือนเดิม (Idle/Run/Attack/Attack2/Channel/Guard/Skill/Buff/Special/Hit/Death) ระบบคอมโบ หลอดร่าย เกจง้างธนู ยกโล่ ใช้ได้โดยไม่ต้องแก้

## กล้อง
Orthographic isometric จริง: หมุน 45° มองลง 35.26° (ล็อกมุมก้ม เพราะภาพวาดถูกวาดจากมุมนี้) หมุนรอบแกนตั้งและซูมได้

## ข้อจำกัดตอนนี้ / งานถัดไปสำหรับฝ่ายภาพ
- ภาพต้นฉบับมีมุมเดียว (3/4 หันขวา) หันซ้ายใช้การกลับภาพ — ตาม `catalog-data.json` (guide “8 ทิศ”) ควรวาด 8 ทิศแยก โดยเฉพาะดาบ/โล่/ธนูที่สลับข้างเมื่อกลับภาพ
- อาชีพหญิงมีภาพท่าเฉพาะ Warrior; อาชีพหญิงอื่นใช้การดัดภาพ (แขน/ผ้า/ลำตัว) แทนท่าวาด
- อาชีพขั้น II/III (ภาพ `02-advanced-classes-final.png`) ยังใช้ตัวเก่า — ตัดภาพแบบเดียวกันได้ด้วย `blender/sprites/jobs.py`
- สร้างภาพใหม่: `python3 blender/sprites/jobs.py && python3 blender/sprites/jobs2.py && python3 blender/sprites/export.py && python3 blender/sprites/portraits.py`

## แอดมินและการสมัคร
- สร้างบัญชีแอดมิน: `npm run admin:create -- admin "รหัสผ่านอย่างน้อย 12 ตัว"` (ต้องมี `SUPABASE_SECRET_KEY` และรัน migration 0007 ก่อน)
  ล็อกอินด้วยชื่อผู้ใช้ `admin` (= `admin@soulforge.local`) ที่หน้าเกมหรือ `/admin` แล้วเปลี่ยนรหัสผ่านได้ที่ปุ่ม “เปลี่ยนรหัสผ่าน”
- สมัครผู้เล่น: ขั้น 1 กรอกโค้ดเชิญ → `/api/auth/check-invite` (SQL `peek_invite` ตรวจโดยไม่ใช้โค้ด, จำกัด 12 ครั้ง/10 นาที/IP) → ขั้น 2 จึงแสดงฟอร์มอีเมล/รหัสผ่าน → `/api/auth/register` ใช้โค้ดจริงแบบ atomic
