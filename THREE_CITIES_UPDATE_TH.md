# SOULFORGE — Five Classes / Three Cities
วันที่ 20 ตุลาคม 2026

## สิ่งที่เพิ่ม
- 5 อาชีพ Warrior, Mage, Priest, Archer, Enchanter เลือกได้ผ่าน J → Classes โดยคงเลเวลและสิ่งของ
- โมเดล 3D แบบ procedural มีข้อต่อ แขน ขา อาวุธประจำอาชีพ และการเคลื่อนไหวเดิน โจมตี ตาย สกิล บัฟ และสกิลพิเศษ
- ภาพคอนเซ็ปต์ตัวละคร 5 ภาพ อาวุธ 5 แผ่น (8 Tier ต่ออาชีพ) ท่วงท่า 5 แผ่น (6 กิจกรรมต่ออาชีพ) และภาพแนวทางเมือง 1 แผ่น ใน public/art
- เมือง Hollow Reach: ป้อมกอธิกและโรงหลอม, Dawnveil: วิหารริมคลองและสะพาน, Thornwatch: เมืองชายป่าพร้อมหอเฝ้าระวัง
- ทุกเมืองมีเขตปลอดภัย จุดล่า และแผนที่ย่อ อาคารและคลองตรวจการชน การย้ายเมืองทิ้งของบนพื้นเมืองเดิม
- ไอเทม 8 ระดับสี ขาว เขียว ฟ้า ม่วง แดง ทอง ส้ม ม่วงอมทอง โมเดลอาวุธเปลี่ยนสี/รายละเอียดตาม Tier ที่สวมใส่
- เมนู Journal ดูงานออกแบบและทดลองท่า พร้อม HP/MP orb, hotbar, inventory และ forge เดิม

## สกิล Local
Space ใช้สกิลโจมตี; Q บัฟเพิ่มความเสียหาย 20% นาน 8 วินาที; E สกิลพิเศษ
| อาชีพ | Space | Q | E |
|---|---|---|---|
| Warrior | Crescent Cleave | Iron Vow | Bastion ลดความเสียหาย 70% นาน 4 วินาที |
| Mage | Astral Lance | Arcane Attunement | Eclipse Nova ร่าย 1.6 วินาทีแล้วโจมตีรอบตัว |
| Priest | Dawn Smite | Covenant | Renewal ร่าย 1.3 วินาที ฟื้น HP ตัวเอง 40% |
| Archer | Piercing Thread | Hunters Focus | Charged Shot ชาร์จ 1.5 วินาทีโจมตีเป้าหมาย |
| Enchanter | Rune Fracture | Inscription | Concord Field ร่าย 1.4 วินาที ป้องกันตัวเอง 5 วินาที |

Q ใช้ 15 MP, E ใช้ 30 MP, Space ใช้ 20 MP; มี cooldown และตรวจเป้าหมาย/ระยะ
Enchanter ยังไม่มีบัฟสมาชิกปาร์ตี้ และ Priest ยังไม่มีการเลือกเพื่อนเพื่อฮีล

## วิธีเปิด
ต้องใช้ Node.js 20.9 ขึ้นไป
```
npm ci
npm run dev
```
ทดสอบ/สร้าง production:
```
npm test
npm run build
npm start
```
เซิร์ฟเวอร์ออนไลน์เดิม:
```
cd apps/game-server
npm ci
npm run build
npm test
npm run dev
```
กำหนดค่าจาก .env.example ตามคู่มือเดิม ไม่มีคีย์ส่วนตัวบรรจุใน ZIP

## ฐานข้อมูลและความเข้ากันได้
คงเส้นทาง API, Supabase integration และระบบ WebSocket เดิม ไม่มี migration ใหม่ในรอบนี้
เพิ่ม classId/cityId แบบ optional ใน snapshot และรองรับเซฟ version 1 เดิม
SQL เดิมอยู่ใน supabase/ ห้ามรันไฟล์ import-all ซ้ำกับฐานข้อมูลที่ติดตั้งแล้ว
ออนไลน์ใช้กติกาเซิร์ฟเวอร์เดิม ปิดการเปลี่ยนอาชีพ ย้ายเมือง และสกิลใหม่ระหว่างออนไลน์ เก็บและคืน local snapshot เมื่อออกจากออนไลน์

## ขอบเขตภาพและระบบ
ภาพ PNG เป็นคอนเซ็ปต์ต้นฉบับที่สร้างขึ้นใหม่ ไม่ใช่ไฟล์โมเดล GLB/FBX และไม่ใช่แอนิเมชัน rig พร้อมผลิต โมเดลเล่นจริงเป็นรูปทรงเรียบง่าย ขยับด้วยโปรแกรม รายละเอียดไม่เท่าภาพคอนเซ็ปต์
ภาพท่วงท่าเป็น key-pose study ไม่ใช่ sprite sheet ที่ตัดเฟรมใช้งานได้ทันที
ระบบใหม่ 5 อาชีพ / 3 เมือง / สกิลทำงานใน Local; ยังไม่ได้เชื่อมกติกาใหม่เข้ากับเซิร์ฟเวอร์ authoritative หรือปาร์ตี้ออนไลน์
เอกสาร weapon-stats-design.json เป็นเป้าหมายการออกแบบ ค่าพลัง/affix ทั้งชุดยังไม่ถูกเปิดใช้จริง เกมใช้สูตร rollItem ปัจจุบัน
เมืองเป็นพื้นที่ต้นแบบ ยังไม่มี NPC quest, navmesh/pathfinding หรือดันเจี้ยนเต็มรูปแบบ

## ผลตรวจสอบ
- npm test ผ่าน 8 กรณี: collision, travel, legacy save, mana/cooldown, delayed healing, charged shot/loot, death/revive, online isolation
- npm run build ผ่าน Next.js production build + TypeScript
- ฝั่ง game-server build ผ่าน และ tests ผ่าน 2 กรณี
- เบราว์เซอร์: เลือก Mage, ใช้ Q (MP ลด 95 → 80), เดินทางไป Dawnveil และแสดงแผนที่/ฉากถูกต้อง ไม่พบ console error ในการตรวจครั้งนี้
- ยังไม่ทดสอบ Supabase จริงหรือ multiplayer หลายผู้เล่น เนื่องจากไม่ได้เชื่อมบัญชีทดสอบ

## ตำแหน่งที่แก้ต่อ
src/game/content.ts — อาชีพ เมือง สี Tier และ collision
src/components/ClassActor.tsx — รูปร่าง/อาวุธ/ท่าทาง
src/components/StarterCity.tsx — ฉากเมือง
src/components/FieldJournal.tsx — เมนูเลือกอาชีพ/เมือง/ภาพ
src/store/useGameStore.ts — สกิล การย้ายเมือง และการตาย
public/art/ — ภาพต้นฉบับ; docs/ — เอกสารออกแบบและ prompts
