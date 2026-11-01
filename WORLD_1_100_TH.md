# SOULFORGE — World 1–100
อัปเดต 21 ตุลาคม 2026

เปิดเกม กด J → THREE CITIES → เลือกพื้นที่ล่า ส่วนเมืองหลักอยู่ด้านล่าง
เข้าพื้นที่ทุกช่วงเลเวลได้ทันที มีข้อความ DANGEROUS เมื่อเลเวลต่ำกว่าพื้นที่ ไม่มีการเพิ่มเลเวลผู้เล่นอัตโนมัติ

| เลเวล | พื้นที่ | เมืองหลัก | มอนสเตอร์ 3 ชนิด |
|---|---|---|---|
| 1–10 | Ashen Outskirts — สุสานนอกกำแพง | Hollow Reach | Grave Crawler / Ash Hound / Bone Sentinel |
| 11–20 | Briarwood Trail — ป่าหนาม | Thornwatch | Briar Wolf / Thorn Spider / Bark Guardian |
| 21–30 | Drowned Cloister — อารามริมคลอง | Dawnveil | Reed Stalker / Tide Crab / Drowned Acolyte |
| 31–40 | Cinder Quarry — เหมืองเถ้าถ่าน | Hollow Reach | Cinder Beetle / Iron Golem / Slag Hound |
| 41–50 | Moonroot Grove — ป่าแสงจันทร์ | Thornwatch | Moon Moth / Root Weaver / Ancient Treant |
| 51–60 | Frostglass Abbey — วิหารน้ำแข็ง | Dawnveil | Frost Wraith / Crystal Golem / Rime Serpent |
| 61–70 | Black Anvil Bastion — ป้อมเหล็กดำ | Hollow Reach | Anvil Guard / Furnace Golem / Ember Drake |
| 71–80 | Venomheart Wilds — ป่าพิษ | Thornwatch | Venom Spider / Spore Beast / Thorn Hydra |
| 81–90 | Astral Basilica — มหาวิหารดวงดาว | Dawnveil | Astral Wraith / Prism Sentinel / Halo Seraph |
| 91–100 | Eclipse Crucible — หลอมสุริยุปราคา | Hollow Reach | Void Reaper / Eclipse Drake / Crown Colossus |

แต่ละพื้นที่มีมอนสเตอร์ 10 ตัว เลเวลเรียงครบช่วง ตัวสุดท้ายเป็น Elite มี HP 1.7 เท่าจากสูตรพื้นฐาน 65 + level × 18 ส่วนรางวัลและอุปกรณ์เพิ่มตามเลเวลมอนสเตอร์
โมเดลมอนสเตอร์ใช้โครงรูปร่าง 6 กลุ่ม: แมงมุม, สัตว์สี่ขา, เดรค, โกเลม, วิญญาณ และสัตว์ปีก ชื่อ 30 ชนิดไม่ได้หมายถึงโมเดลเฉพาะที่ปั้นต่างกันทั้งหมด

ฉากแต่ละพื้นที่ปรับสีพื้น ท้องฟ้า สิ่งปลูกสร้าง และวัตถุประกอบ: ป้ายสุสาน ต้นไม้ เห็ด ผลึก เสาหิน ร่องน้ำ และวงแหวนสุริยุปราคา พื้นที่ยังเป็นฉากขนาดต้นแบบ 46×46 หน่วย มีทางแยกกลางและจุดกลับเมืองผ่าน Journal การเดินทางโหลดฉากใหม่ ไม่ใช่โลกต่อเนื่อง
อาคาร/คลองมีการชน วัตถุตกแต่งขนาดเล็กไม่บล็อกการเดิน

## ตัวละคร
นำจุดเด่นจากภาพอ้างอิงมาปรับโมเดลจริง: Warrior เกราะซ้อนและสันหมวก, Mage เสื้อคลุมยาวและคทาจันทร์เสี้ยว, Priest ชุดงาช้าง/แดงและตราตะวัน, Archer ผมถัก/ชุดเขียวและธนู, Enchanter เสื้อคลุมเขียวอมฟ้าและขวดรูน
โมเดลเป็น procedural mesh พร้อมข้อต่อจากรุ่นเดิม ไม่ใช่การแปลงภาพเป็น GLB/FBX และยังไม่มีพื้นผิวละเอียดเท่าภาพต้นฉบับ

## ระบบเดิมและข้อจำกัด
คง Next.js/R3F, inventory, forge, loot, save และ Supabase integration เดิม ไม่ต้องเพิ่ม SQL รอบนี้
พื้นที่/สกิลใหม่ทำงานใน Local; ออนไลน์ยังใช้เซิร์ฟเวอร์และกติกาเดิม
รองรับเซฟเมืองเก่าและพื้นที่ใหม่ เลเวลผู้เล่นสูงสุด 100
เพิ่มพฤติกรรมโจมตีตามกลุ่มรูปร่างแล้ว ดู COMBAT_UPDATE_TH.md; ยังไม่ปรับสมดุลการฟาร์มระยะยาวจนถึง 100

## การตรวจสอบ
- npm test ผ่าน 11 กรณี รวมระดับ 1–100 ครบทุกค่า จุดเกิด/การชน การเดินทางทุกพื้นที่ โหลดเซฟ และเพดานเลเวล
- npm run build ผ่านพร้อม TypeScript
- รอบนี้ไม่ได้ตรวจภาพในเบราว์เซอร์ เนื่องจากเครื่องมือควบคุมเบราว์เซอร์ไม่พร้อมใช้งาน
- ไม่ได้ทดสอบกับ Supabase จริงหรือผู้เล่นออนไลน์หลายคน

ติดตั้ง: npm ci จากนั้น npm run dev
ไฟล์หลัก: src/game/content.ts, src/components/ClassActor.tsx, ClassRegalia.tsx, MonsterBody.tsx, WildTerrain.tsx และ src/store/useGameStore.ts
