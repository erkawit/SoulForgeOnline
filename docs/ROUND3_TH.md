# SoulForge Online — รอบ 3: UX/UI ตามสเปก · Sprite แบบเฟรม · เตรียมขึ้น Railway

## 1. UX/UI ตามสเปก (PC / Mobile แยกชุดกัน)

**ตัวเช็กขนาดจอ** — `src/game/ui/layout.ts → layoutFor()`
- กว้าง < 768 px → ชุด Mobile (`MobileHUDLayout` · `MobileInventoryDrawer` · `MobileStatusPanel`)
- ≥ 768 px → ชุด PC (`PCHUDLayout` · `PCInventoryPanel` · `PCStatusPanel`)
- เพิ่ม: มือถือแนวนอน (จอสัมผัส + สูง < 500 px) ใช้ชุด Mobile ด้วย เพราะกว้างเกิน 768 แต่ใช้นิ้วเล่น
- สลับชุดอัตโนมัติเมื่อหมุนจอ / ย่อหน้าต่าง (hook `useScreenScale` ใน `src/components/hud/common.tsx`)

**ชุดสีตามสเปก** — พื้นหลัง `#121316` · เหล็กสนิม `#2A2725` · ทองเก่า `#C89B3C` · ลูกแก้ว HP `#990000` + แสงส้มด้านใน · MP `#1A237E → #4A148C`
สี Tier T1–T8 = `#FFFFFF #4CAF50 #2196F3 #9C27B0 #F44336 #FFD700 #FF9800 #E040FB` จับคู่กับ Common … Arch ตามลำดับ (T8 แสดงไล่สีม่วง→ทอง)
`RARITY_COLOR` ทั้งเกมเปลี่ยนเป็นสี Tier แล้ว และไอเทมทุกชิ้นมีป้าย T1–T8 ที่มุมไอคอน

**PC HUD**
- ลูกแก้ว HP ซ้าย / MP ขวา กรอบเหล็กสนิมมีหัวกะโหลก (SVG) + ตัวเลข
- กลาง: ปุ่มโจมตี + สกิล 1–6 (ป้ายเลข 1–6 + ปุ่มลัด Space Q E R T X เดิม) + ช่องยา HP / MP / อาหาร (7 8 9) และแถบ EXP สีทองบาง ๆ ด้านล่าง
- AUTO + ⚙ อยู่ข้างลูกแก้ว MP · กรอบตัวละครมุมซ้ายบนแสดง ฉายา ตามเลเวล

**Mobile HUD**
- ซ้ายบน: แถบ HP/MP ขนาดเล็ก + ป้ายเลเวลทอง (แตะ = เปิดสเตตัส) · แถบ EXP บาง ๆ ขอบล่างจอ
- ซ้ายล่าง: จอยสติ๊ก · ขวาล่าง: ปุ่มโจมตีใหญ่ + สกิล 4 ปุ่มรอบวง + ปุ่มสลับหน้า (1–4 ↔ 5–6)
- ปุ่มย่อ: ยา HP · AUTO · ☰ (เปิดเมนูทั้งหมด) — บนจอแคบ (< 560 px) ปุ่มย้ายไปเหนือจอยสติ๊ก

**กระเป๋า (I) — PC**
- ช่องอุปกรณ์ 12 ช่องตามสเปก (Head, Necklace, Chest, Shoulder, Gloves, Belt, Pants, Boots, Ring1, Ring2, MainHand, OffHand) + ช่องชุดแฟชั่น รอบภาพตัวละครกรอบหิน
- ช่องที่เกมยังไม่มีไอเทม (สร้อยคอ บ่า เข็มขัด กางเกง แหวน 2 มือรอง) แสดงเป็น 🔒 — มือรองถูกรวมในอาวุธทุกชุดอยู่แล้ว (โล่ / คัมภีร์ / ซองธนู)
- ตาราง 10×10 ไอเทมมีขนาดจริง: อาวุธ 1×3 · เกราะ/หมวก/ถุงมือ/รองเท้า/ชุด 2×2 · ของรางวัล 2×1 · แหวน ยา วัตถุดิบ 1×1
- ลากวางพร้อมไฮไลต์เขียว/แดง · ลากไปช่องอุปกรณ์ = สวม · ลากของที่สวมลงตาราง = ถอด · ดับเบิลคลิก / คลิกขวา = สวม/ใช้
- ตำแหน่งในตารางถูกบันทึกลงเซฟ (`bagPos` ใน snapshot) · ไอเทมใหม่ลงช่องว่างแรกอัตโนมัติ · ถ้าไม่พอแสดงแถบ "ล้นตาราง"
- ตรรกะตาราง (ชน/วาง/ย้าย) แยกเป็นโมดูลบริสุทธิ์ `src/game/ui/bagGrid.ts` มีเทสต์

**กระเป๋า + สเตตัส — Mobile**: Bottom sheet เดียว 2 แท็บ [อุปกรณ์ & กระเป๋า] [สเตตัส]
- แถบช่องอุปกรณ์เลื่อนแนวนอน + รายการ 5 คอลัมน์ ปุ่มทุกปุ่ม ≥ 48 px · แตะ = เลือก (แถบคำสั่งด้านล่าง) · แตะสองครั้ง = สวม/ใช้

**สเตตัส (C)**: ภาพกรอบหิน · ชื่อ · ฉายา · อาชีพ · รายการเลื่อนได้ 6 หมวด (ค่าพื้นฐาน / โจมตี / ป้องกัน / ความเร็ว / ฟื้นฟู / สนับสนุน)
สเปกข้อ 4 (Status JSON) ว่าง จึงใช้ schema ของเกมเอง: `src/game/ui/statusSchema.ts` (`StatusCategory { id, label, icon, rows: { key, label, value, format, bonus } }`)

**ค่าเริ่มต้นที่เลือกเอง (แก้ได้)**: ปุ่มลัดสกิลคงเดิม (Space Q E R T X) เพื่อไม่ชนยา 7–9 · I = กระเป๋า (E ยังเป็นสกิล) · ฉายาตามเลเวล (Lv1 ผู้มาเยือนแดนโศก … Lv50 ตำนานแห่ง SoulForge) · `icon_src` จากสเปกยังใช้ไอคอนเดิมของเกม

## 2. Sprite แบบเฟรม (free-texture)

- สคริปต์ `blender/sprites/cut_flipbooks.py` ตัดชีต free-tex-packer (ทั้งภาพเป็น 1 เฟรม) เป็นเฟรมจริง: หาแถวจาก alpha → หาระยะห่างเฟรมด้วย autocorrelation ของ "ลำตัวทึบ" (เอฟเฟกต์/คลื่น/ลำแสงไม่ทำให้เฟรมแตก) → ยึดจุดกลางลำตัว + ฐานเท้าร่วม → อัดเป็น atlas ช่องเท่ากัน `public/art/anim/<id>.webp` (≤ 4096 px)
- ทำแล้ว 29 ตัว: Elite 16 + Normal 12 + Abyssal Forge Titan · ข้อมูลคลิป `src/game/sprites/anims.ts` (idle / walk / run / attack, Titan มี skill / special / ultimate)
- จับคู่มอนสเตอร์ปกติ: baison→Oathscar Aurochs · beater→Cinder Beetle · crocodile→Reed Stalker · hyina→Slag Hound · iron-wolf→Ash Hound · oauter→Fen Maw Otter · raino→Ironhide Rhino · skung→Grave Crawler (+ Crypt Crawler) · spider→Thorn Spider · wild-bear→Bark Guardian · wild-boar→Bone Sentinel · wood-wolf→Briar Wolf
- `SpriteActor` มีโหมด flipbook: เดิน/วิ่ง/โจมตี/สกิลเล่นเฟรมจริง ลด shader deform ลงเหลือเล็กน้อย · ตัวที่ไม่มีชีตยังใช้ key-pose เดิม
- รันใหม่: วางชีตไว้ตามโครง `src/{elite,normal,boss}/` แล้ว `sh blender/sprites/cut_flipbooks.sh` → `python3 blender/sprites/gen_anims_ts.py src/game/sprites/anims.ts`

**ยังขาด / ยังไม่ทำ**
- ฮีโร่หญิง 5 อาชีพ: มีแค่ภาพเดี่ยวไม่มีพื้นหลัง → ยังใช้ key-pose + rig เดิม
- บอส 3 ตัว (Grave Marshal, Drowned Hierophant, Worldroot Devourer): มีแค่ concept 2 ท่า → ยังใช้ key-pose เดิม
- ชีตฮีโร่ชาย 5 อาชีพ: Priest/Archer/Enchanter มีพื้นหลังตารางหมากรุก/ขาว "ฝังในภาพ" และ Mage มีป้ายข้อความ — ตัดอัตโนมัติจะกินชุดสีขาว จึงยังไม่ใช้ ต้อง export ใหม่แบบโปร่งใสจริง (PNG alpha) แล้วรันสคริปต์เดิมได้เลย
- ชีตจระเข้แถวโจมตีกว้างไม่เท่ากัน เฟรมท้ายถูกครอปบางส่วน

## 3. Railway
ดู `docs/RAILWAY_DEPLOY_TH.md` — 2 service (web `/` + realm `apps/game-server`), health check, wss, ตัวแปรทั้งหมดใน `.env.example`

## การทดสอบที่ทำแล้ว
- Unit test 54 ผ่าน (เพิ่ม `tests/ui.test.ts`, `tests/anims.test.ts`) · typecheck ผ่าน
- Realm: คอมไพล์ `tsc` ผ่าน, `/health` ตอบ JSON, WebSocket upgrade บนพอร์ตเดียวกันทำงาน
- Preview (artifact): PC 1280×720 ลากย้ายในตาราง + ลากไปสวมทำงาน · Mobile 390×844 และ 844×390 drawer/สเตตัส/เมนูทำงาน ไม่มีสกรอลล์แนวนอน
- คอมโพเนนต์ React ชุดใหม่ render ใน Chromium ผ่าน harness: ลากย้าย/ลากสวม (PC) และแตะสองครั้งสวม (Mobile) ทำงาน
- ยังไม่ได้ทดสอบ: `next build` / `docker build` จริง และการ deploy บน Railway
