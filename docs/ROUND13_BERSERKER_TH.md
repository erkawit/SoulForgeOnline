# รอบ 13 · เกมเหลืออาชีพเดียว: Berserker → Reaver (27 ต.ค. 2026)

ทั้งเกม (เว็บ + realm + ฐานข้อมูล) ใช้อาชีพเดียวแล้ว ตรงกับ migration `202610260012_berserker.sql`

## 1. อาชีพ
| | Berserker (เริ่มต้น) | Reaver (เลื่อนขั้น Lv60) |
|---|---|---|
| ค่าพื้นฐาน | STR 20 · INT 2 · DEX 8 · AGI 10 · WIS 4 · VIT 16 | STR 28 · INT 2 · DEX 10 · AGI 12 · WIS 4 · VIT 22 |
| ต่อเลเวล | HP 26 · MP 3 · ATK 2.4 · DEF 1.6 | HP 28 · MP 3 · ATK 2.6 · DEF 1.7 |
| อาวุธเริ่มต้น | ดาบใหญ่ (Ironcleaver Greatsword) | ขวานใหญ่ |

- เลื่อนขั้นครั้งเดียว: Lv60 + ผ่านเควส `q-path` และ `q-ascension` + ยืนที่ลานกลางเมือง
- Reaver เก็บเป็น `promotionId` ในสถานะตัวละคร (ไม่ใช่ `class_id`) — ฐานข้อมูลมี `class_id = 'Berserker'` อย่างเดียว

## 2. Rage (ทรัพยากรใหม่)
- เต็ม 100 · ฟันธรรมดาโดน +8 · ถูกตี +3 (ทุก 0.6 วินาที) · ไม่สู้ 5 วินาทีลด 5/วินาที
- สกิลโจมตีใช้ Rage แทน MP (Blood Howl / Dread Howl ใช้ MP และเติม Rage +20)
- AUTO รอ Rage ให้พอ และไม่กดสกิลซ้อนระหว่าง Whirlwind / Reaping Cyclone

## 3. สกิล 24 ตัว (Berserker 12 + Reaver 12)
ต้นไม้ 6 ขั้น × 4 คอลัมน์ · ซ้าย = Berserker (ปลดตามเลเวล 1–15) · ขวา = Reaver (ปลดหลังเลื่อนขั้น Lv60 อัปทุก 5 เลเวล)

| Berserker | Rage/MP · CD | → Reaver | Rage/MP · CD |
|---|---|---|---|
| Rending Rush กระหน่ำฉีกเกราะ (Space) | 8 Rage · 5s | Savage Rend | 12 · 6s |
| Blood Howl คำรามปลุกคลั่ง (Q) | 12 MP · 25s | Dread Howl | 16 MP · 25s |
| Carnage Cyclone พายุสังหาร | 25 · 12s | Reaping Cyclone | 30 · 14s |
| Bloodquake ทลายปฐพีเดือด (E) | 20 · 14s | Ruinbreaker | 25 · 16s |
| Execution Frenzy คลั่งประหาร | 30 · 18s | Soul Reave | 35 · 20s |
| **Whirlwind** มหาพายุคลั่ง (ultimate, หมุนต่อเนื่อง เดินช้าลง) | 100 · 70s | **Cataclysm Descent** | 90 · 80s |
| พาสซีฟ: Greatweapon Mastery · Blood Tempo · Red Resolve · Blood Harvest · Unbroken Fury · Rage Conduit | | Dreadweapon Mastery · Slaughter Tempo · Deathless Wrath · Soul Harvest · Iron Frenzy · Abyssal Rage | |

- สกิล Reaver **แทน** สกิล Berserker ตัวเดิม (ไม่ซ้อนกัน) ปุ่มลัดเดิมใช้เวอร์ชัน Reaver อัตโนมัติ และเก็บเลเวลสกิลเดิมไว้
- ค่าพิเศษใหม่: ความเร็วโจมตี, ดาเมจตอนเลือดต่ำ, Rage ที่ได้, ต้านการชะลอ

## 4. อาวุธและอุปกรณ์
- อาวุธสองมือ 3 ประเภท × 8 ขั้น: ดาบใหญ่ (สมดุล) · ขวานใหญ่ (ATK ×1.15 ช้าลง) · ค้อนใหญ่ (ATK ×1.3 ช้าที่สุด) — ไม่มีโล่/มือรอง
- เกราะหนักอย่างเดียว · แหวน/ตรา physical หรือ defense
- คราฟปกติ: อาวุธสุ่ม 1 ใน 3 ประเภท · คราฟด้วยคริสตัล: เลือกประเภทอาวุธเองได้ (หน้าช่างตีเหล็ก)

## 5. ข้อมูลเดิมของผู้เล่น (แปลงอัตโนมัติ ไม่หาย)
| เดิม | ใหม่ |
|---|---|
| ตัวละครทุกอาชีพ | Berserker เลเวลเดิม (การเลื่อนขั้นเดิม 5 อาชีพถูกล้าง) |
| อาวุธหลัก `weapon-<อาชีพ>-N` | ดาบใหญ่ขั้นเดียวกัน |
| มือรอง `offhand-*-N` | ขวานใหญ่ขั้นเดียวกัน (ที่สวมอยู่ย้ายเข้ากระเป๋า) |
| เกราะ light / robes | เกราะ heavy ช่องเดียวกัน ขั้นเดียวกัน |
| ตรา magic / elemental | physical / defense |
| ออปชัน INT | STR (ค่าเท่าเดิม) |
| สกิลของอาชีพเดิม | ล้าง แล้วได้สกิล Berserker ตามเลเวล |

แปลง 3 ที่ให้ตรงกัน: SQL migration 0012 (ฐานข้อมูล) · realm โหลดตัวละคร (`migrateCharState`) · เบราว์เซอร์โหลดเซฟ (`hydrate`)

## 6. ภาพตัวละคร
- **ตอนนี้:** ใช้ภาพ Berserker / Reaver ท่านิ่งที่มีอยู่ ขยับด้วย rig (ยังไม่ใช่ 8 ทิศจริง)
- **เมื่อ Codex ส่งภาพ chibi 8 ทิศ** (`output/berserker-chibi-codex/`): รัน
  `node scripts/import-codex-hero.mjs <frames.json>` → ตรวจกติกาจับอาวุธทุกเฟรม แล้วเกมใช้ภาพใหม่ทันที
  - เกมประกอบ 4 ชั้นต่อเฟรม: อาวุธหลังตัว → ตัว+ชุด → ผม (ตามจุดหัว) → อาวุธหน้าตัว
  - อาวุธเป็นภาพแข็งชิ้นเดียว หมุน/เลื่อนให้จุดจับทับมือทั้งสอง ไม่ยืด ไม่ mirror (`src/game/sprites/layered.ts`)
  - อาวุธในมือเปลี่ยนตามที่สวม (ประเภท + ขั้น)

## 7. ฐานข้อมูล
- เอาตัวล็อก `soulforge.allow_round15` ออกแล้ว · `database/soulforge-supabase-full-install.sql` รวม 0001–0012
- ทดสอบบน PostgreSQL 16:
  - ฐานเดิม 0001–0011 + ตัวละคร Warrior/Mage + ไอเทมเดิม → รัน 0012 → เป็น Berserker ไอเทมทุกชิ้นมีในแคตตาล็อก
  - `create_character` รับ Berserker ปฏิเสธอาชีพอื่น · `craft_def_id` ได้อาวุธครบ 3 ประเภท ทุก id มีในแคตตาล็อก
  - ติดตั้งใหม่ทั้งไฟล์ รัน 2 รอบผ่าน · `realm_market_check.sql` ผ่าน

## 8. ผลทดสอบ (เครื่องที่แก้ ไม่มี npm จึงใช้ shim แทนไลบรารีกราฟิก)
- เทสต์ทุกไฟล์: ไม่มีข้อที่เคยผ่านแล้วกลับไม่ผ่าน · ข้อที่ยังไม่ผ่านเป็นข้อเดิมก่อนแก้ หรือขาดไฟล์ภาพ `public/` ในเครื่องที่แก้
- DPS ตามจริง 60 วินาที เทียบเพดานกันโกงของ realm: Berserker 0.20–0.34 · Reaver 0.10–0.21 ของเพดาน (ไม่โดนตัดสินผิด)
- typecheck: ไม่มี error ใหม่เมื่อเทียบกับก่อนแก้ (ยกเว้น error ของ type stub ที่เกิดจากเครื่องที่แก้เอง)

**ต้องรันในเครื่องคุณ:**
```sh
cd project && npm ci && npm test && npm run build
cd apps/game-server && npm ci && npm test
```

## 9. ยังไม่ได้ทำ
- ภาพ chibi 8 ทิศ (รอ Codex) · ภาพค้อนใหญ่ยังไม่มีต้นแบบ (ในเกมใช้ไอคอนชั่วคราว)
- ระบบบัฟผู้เล่นต่อผู้เล่น (Enchanter เดิม) ปิดไว้ — เก็บค่าตั้งไว้เผื่อเพิ่มอาชีพซัพพอร์ตภายหลัง
