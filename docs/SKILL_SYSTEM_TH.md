# SoulForge — ระบบสกิลและ Skill Tree

## โครงสร้าง
- สกิล 1 อัน = รายการ **เอฟเฟกต์** ที่ประกอบกันได้ (`src/game/skills/engine.ts`): `damage` · `heal` · `buff` · `shield` · `guard` · `dot` · `debuff` · `dash` · `knockback`
- damage มีรูปแบบ `single` (เป้าเดียว) · `circle` (รอบเป้า) · `cone` (รูปพัดหน้าตัว 120°) · `line` (เป็นแนว) · `self-circle` (รอบตัว) และ 8 ธาตุ
- แต่ละเอฟเฟกต์มีค่าเริ่ม + ค่าต่อเลเวล (`perLevel`) · สกิลมี MP, คูลดาวน์, เวลาร่าย, ระยะ, ท่าทางตัวละคร และเอฟเฟกต์ภาพ (เลือกจาก 20 แบบใน `src/game/fx/skillFx.ts`)
- สกิลติดตัว (passive) ให้ % สเตตัสพิเศษต่อเลเวล ใช้ช่องเดียวกับออปชันอุปกรณ์
- ต้นไม้ 5 แถวต่ออาชีพ ปลดล็อกที่เลเวล 1 / 5 / 12 / 25 / 40 · บางโหนดต้องอัปสกิลก่อนหน้าก่อน · อัปเลเวลสกิลถัดไปต้องมีเลเวลตัวละคร ≥ เลเวลปลดล็อก + 2 × เลเวลสกิลปัจจุบัน
- แต้มสกิล: 1 แต้มต่อเลเวล (เริ่มเลเวล 2) + โบนัส 1 แต้มทุก 10 เลเวล · สกิลแถวแรกที่กดใช้ได้ฟรี Lv.1
- ตั้งสกิลกดใช้ที่เรียนแล้วลงปุ่ม **Space / Q / E** ได้อิสระ (หน้าต่าง Skill Tree ปุ่ม K) · รีเซ็ตแต้มที่ Master Ysolde (เสียเงิน = เบิร์น)

## Skill Forge (แอดมินสร้างสกิลใหม่เอง)
หน้า **/admin → Skill Forge**
1. เลือกอาชีพ → กด “+ เพิ่มสกิล” ในช่องว่างของต้นไม้
2. ตั้งชื่อ ไอดี ประเภท (กดใช้/ติดตัว) MP คูลดาวน์ เวลาร่าย ระยะ ท่าทาง และเอฟเฟกต์ภาพ
3. ต่อเอฟเฟกต์ได้สูงสุด 6 อย่าง เช่น ดาเมจรูปพัด + ดีบัฟลด DEF + พุ่งตัว
4. กำหนดตำแหน่ง แถว/คอลัมน์ เลเวลปลดล็อก และสกิลที่ต้องเรียนก่อน
5. ดูตารางทดลองดาเมจกับมอนสเตอร์ Lv30 × 5 ตัว แล้วกด “เผยแพร่สกิลทั้งหมด” (บันทึก `game_config` key `skills` เฉพาะส่วนที่ต่างจากค่าเริ่มต้น)

ขีดจำกัดกันสกิลพัง: ตัวคูณ ≤ 12 · คูลดาวน์ 0.5–600 วิ · ร่าย ≤ 4000 ms · ระยะ ≤ 20 ม. · รัศมี ≤ 14 ม. · บัฟ ≤ 60% · ตีซ้ำ ≤ 8 ครั้ง · เลเวลสกิล ≤ 10 · ต้นไม้ห้ามมีวงวน (เงื่อนไขต้องอยู่แถวก่อนหน้า)

## ต้นไม้เริ่มต้น

### Warrior
ปุ่มเริ่มต้น: Space = Crescent Cleave · Q = Iron Vow · E = Bastion

| แถว (Lv) | สกิล | ประเภท | MP / CD | Lv1 → Lv5 | ต้องการ |
| --- | --- | --- | --- | --- | --- |
| 1 (1) | **Crescent Cleave** ฟันจันทร์เสี้ยว | กดใช้ | 20 / 4s | ดาเมจ 190% ATK (รูปพัด) → ดาเมจ 250% ATK (รูปพัด) | — |
| 1 (1) | **Sword Training** ชำนาญดาบ | ติดตัว | — | atkPct +2% → atkPct +10% | — |
| 1 (1) | **Iron Vow** คำสาบานเหล็ก | กดใช้ | 15 / 25s | atkPct +15% 20 วิ · defPct +10% 20 วิ → atkPct +23% 20 วิ · defPct +18% 20 วิ | — |
| 2 (5) | **Shield Bash** กระแทกโล่ | กดใช้ | 14 / 8s | ดาเมจ 140% ATK (เป้าเดียว) · ผลัก 2 ม. · ศัตรู ช้าลง30% → ดาเมจ 188% ATK (เป้าเดียว) · ผลัก 2 ม. · ศัตรู ช้าลง46% | Crescent Cleave 2 |
| 2 (5) | **Plate Discipline** วินัยเกราะหนัก | ติดตัว | — | defPct +2% · hpPct +2% → defPct +10% · hpPct +10% | Sword Training 2 |
| 2 (5) | **Challenging Roar** คำรามท้ารบ | กดใช้ | 18 / 20s | ศัตรู ATK −10% · ดาเมจ 40% ATK (รัศมี 5 ม.) → ศัตรู ATK −18% · ดาเมจ 60% ATK (รัศมี 5 ม.) | Iron Vow 1 |
| 3 (12) | **Earth Splitter** ผ่าแผ่นดิน | กดใช้ | 28 / 12s | ดาเมจ 260% ATK (เป็นแนว) → ดาเมจ 360% ATK (เป็นแนว) | Crescent Cleave 3, Shield Bash 1 |
| 3 (12) | **Bastion** ป้อมปราการ | กดใช้ | 30 / 18s | ลดดาเมจที่ได้รับ 70% 4 วิ → ลดดาเมจที่ได้รับ 82% 4 วิ | Plate Discipline 2 |
| 3 (12) | **Endurance** ทรหด | ติดตัว | — | hpPct +3% · dmgReduce +1% → hpPct +15% · dmgReduce +5% | Plate Discipline 3 |
| 4 (25) | **Whirlwind** พายุดาบ | กดใช้ | 34 / 16s | ดาเมจ 90% ATK × 4 ครั้ง (รัศมี 3.5 ม.) → ดาเมจ 122% ATK × 4 ครั้ง (รัศมี 3.5 ม.) | Earth Splitter 2 |
| 4 (25) | **Battle Hunger** กระหายศึก | ติดตัว | — | lifesteal +0.6% · critDmg +3% → lifesteal +3% · critDmg +15% | Sword Training 4 |
| 5 (40) | **Oathbreaker** ฟันทำลายคำสาบาน | กดใช้ | 60 / 45s · ร่าย 0.6s | ดาเมจ 600% ATK (เป้าเดียว) → ดาเมจ 840% ATK (เป้าเดียว) | Whirlwind 3, Bastion 2 |

### Mage
ปุ่มเริ่มต้น: Space = Astral Lance · Q = Arcane Attunement · E = Eclipse Nova

| แถว (Lv) | สกิล | ประเภท | MP / CD | Lv1 → Lv5 | ต้องการ |
| --- | --- | --- | --- | --- | --- |
| 1 (1) | **Astral Lance** หอกดารา | กดใช้ | 20 / 4s | ดาเมจ 220% ATK (เป็นแนว) → ดาเมจ 292% ATK (เป็นแนว) | — |
| 1 (1) | **Arcane Mind** จิตอาคม | ติดตัว | — | mpPct +3% · skillDmg +1.5% → mpPct +15% · skillDmg +7.5% | — |
| 1 (1) | **Arcane Attunement** ประสานอาคม | กดใช้ | 15 / 30s | critRate +6% 20 วิ · atkPct +8% 20 วิ → critRate +10% 20 วิ · atkPct +16% 20 วิ | — |
| 2 (5) | **Fire Burst** เพลิงระเบิด | กดใช้ | 18 / 6s | ดาเมจ 160% ATK (รัศมี 2.5 ม.) · ต่อเนื่อง 25% × 4 → ดาเมจ 216% ATK (รัศมี 2.5 ม.) · ต่อเนื่อง 37% × 4 | Astral Lance 2 |
| 2 (5) | **Mana Reservoir** บ่อมานา | ติดตัว | — | mpPct +4% · cdr +1% → mpPct +20% · cdr +5% | Arcane Mind 2 |
| 2 (5) | **Frost Ring** วงแหวนน้ำแข็ง | กดใช้ | 22 / 12s | ดาเมจ 120% ATK (รัศมี 4 ม.) · ศัตรู ช้าลง35% → ดาเมจ 160% ATK (รัศมี 4 ม.) · ศัตรู ช้าลง47% | Arcane Attunement 1 |
| 3 (12) | **Storm Spiral** เกลียวพายุ | กดใช้ | 30 / 14s | ดาเมจ 70% ATK × 5 ครั้ง (รัศมี 3 ม.) → ดาเมจ 94% ATK × 5 ครั้ง (รัศมี 3 ม.) | Fire Burst 2 |
| 3 (12) | **Eclipse Nova** สุริยุปราคาระเบิด | กดใช้ | 30 / 10s · ร่าย 1.6s | ดาเมจ 340% ATK (รัศมี 4 ม.) → ดาเมจ 460% ATK (รัศมี 4 ม.) | Astral Lance 3, Mana Reservoir 1 |
| 3 (12) | **Elemental Focus** สมาธิธาตุ | ติดตัว | — | critDmg +4% · skillDmg +2% → critDmg +20% · skillDmg +10% | Arcane Mind 3 |
| 4 (25) | **Lightning Field** ทุ่งอสุนี | กดใช้ | 36 / 20s | ต่อเนื่อง 50% × 6 → ต่อเนื่อง 70% × 6 | Storm Spiral 2 |
| 4 (25) | **Wide Reach** อาณาเขตกว้าง | ติดตัว | — | cdr +1.5% · bossDmg +1.5% → cdr +7.5% · bossDmg +7.5% | Elemental Focus 2 |
| 5 (40) | **Meteor Choir** บทเพลงอุกกาบาต | กดใช้ | 80 / 60s · ร่าย 2.2s | ดาเมจ 700% ATK (รัศมี 5 ม.) → ดาเมจ 980% ATK (รัศมี 5 ม.) | Eclipse Nova 3, Lightning Field 2 |

### Priest
ปุ่มเริ่มต้น: Space = Dawn Smite · Q = Covenant · E = Renewal

| แถว (Lv) | สกิล | ประเภท | MP / CD | Lv1 → Lv5 | ต้องการ |
| --- | --- | --- | --- | --- | --- |
| 1 (1) | **Dawn Smite** อรุณพิพากษา | กดใช้ | 20 / 4s | ดาเมจ 200% ATK (รัศมี 1.5 ม.) → ดาเมจ 264% ATK (รัศมี 1.5 ม.) | — |
| 1 (1) | **Faith** ศรัทธา | ติดตัว | — | healPower +3% → healPower +15% | — |
| 1 (1) | **Covenant** พันธสัญญา | กดใช้ | 16 / 30s | defPct +10% 30 วิ · hpRegen +2% 30 วิ → defPct +18% 30 วิ · hpRegen +4% 30 วิ | — |
| 2 (5) | **Purifying Light** แสงชำระล้าง | กดใช้ | 24 / 12s | ดาเมจ 130% ATK (รัศมี 3.5 ม.) · รักษา 40% ATK → ดาเมจ 178% ATK (รัศมี 3.5 ม.) · รักษา 60% ATK | Dawn Smite 2 |
| 2 (5) | **Mend** สมานแผล | กดใช้ | 18 / 6s | รักษา 120% ATK 10% HP → รักษา 168% ATK 10% HP | Faith 1 |
| 2 (5) | **Spirit Reserve** พลังวิญญาณสำรอง | ติดตัว | — | mpPct +4% → mpPct +20% | Covenant 1 |
| 3 (12) | **Holy Lance** หอกศักดิ์สิทธิ์ | กดใช้ | 30 / 10s | ดาเมจ 300% ATK (เป็นแนว) → ดาเมจ 412% ATK (เป็นแนว) | Purifying Light 2 |
| 3 (12) | **Renewal** การเกิดใหม่ | กดใช้ | 30 / 14s · ร่าย 1.3s | รักษา  40% HP → รักษา  40% HP | Mend 2 |
| 3 (12) | **Radiant Focus** สมาธิรัศมี | ติดตัว | — | skillDmg +2% · cdr +1% → skillDmg +10% · cdr +5% | Faith 3 |
| 4 (25) | **Healing Circle** วงเวทรักษา | กดใช้ | 32 / 20s | รักษา  20% HP · hpRegen +4% 15 วิ → รักษา  20% HP · hpRegen +8% 15 วิ | Renewal 2 |
| 4 (25) | **Merciful Hands** หัตถ์เมตตา | ติดตัว | — | healPower +4% · dmgReduce +1% → healPower +20% · dmgReduce +5% | Radiant Focus 2 |
| 5 (40) | **Miracle of Dawn** ปาฏิหาริย์รุ่งอรุณ | กดใช้ | 90 / 90s · ร่าย 1.5s | รักษา  100% HP · โล่ 30% HP · defPct +20% 15 วิ → รักษา  100% HP · โล่ 46% HP · defPct +28% 15 วิ | Healing Circle 3, Holy Lance 1 |

### Archer
ปุ่มเริ่มต้น: Space = Piercing Thread · Q = Hunters Focus · E = Charged Shot

| แถว (Lv) | สกิล | ประเภท | MP / CD | Lv1 → Lv5 | ต้องการ |
| --- | --- | --- | --- | --- | --- |
| 1 (1) | **Piercing Thread** ศรทะลวง | กดใช้ | 20 / 4s | ดาเมจ 210% ATK (เป็นแนว) → ดาเมจ 278% ATK (เป็นแนว) | — |
| 1 (1) | **Bow Training** ชำนาญธนู | ติดตัว | — | atkPct +2% · critRate +0.6% → atkPct +10% · critRate +3% | — |
| 1 (1) | **Hunters Focus** สมาธินายพราน | กดใช้ | 15 / 28s | critRate +8% 20 วิ · atkPct +6% 20 วิ → critRate +14% 20 วิ · atkPct +12% 20 วิ | — |
| 2 (5) | **Poison Arrow** ศรพิษ | กดใช้ | 14 / 6s | ดาเมจ 120% ATK (เป้าเดียว) · ต่อเนื่อง 30% × 5 → ดาเมจ 160% ATK (เป้าเดียว) · ต่อเนื่อง 46% × 5 | Piercing Thread 2 |
| 2 (5) | **Fleet Foot** ฝีเท้าเบา | ติดตัว | — | moveSpeed +1.5% → moveSpeed +7.5% | Bow Training 2 |
| 2 (5) | **Snare Trap** กับดักบ่วง | กดใช้ | 16 / 10s | ดาเมจ 80% ATK (รัศมี 2 ม.) · ศัตรู ช้าลง40% → ดาเมจ 112% ATK (รัศมี 2 ม.) · ศัตรู ช้าลง56% | Hunters Focus 1 |
| 3 (12) | **Fan Shot** ศรพัด | กดใช้ | 22 / 9s | ดาเมจ 130% ATK (รูปพัด) → ดาเมจ 178% ATK (รูปพัด) | Poison Arrow 2 |
| 3 (12) | **Charged Shot** ศรชาร์จพลัง | กดใช้ | 30 / 10s · ร่าย 1.5s | ดาเมจ 420% ATK (เป้าเดียว) → ดาเมจ 572% ATK (เป้าเดียว) | Piercing Thread 3 |
| 3 (12) | **Eagle Eye** ตาเหยี่ยว | ติดตัว | — | critDmg +4% · bossDmg +1.5% → critDmg +20% · bossDmg +7.5% | Bow Training 3 |
| 4 (25) | **Arrow Rain** ฝนลูกศร | กดใช้ | 34 / 16s | ดาเมจ 60% ATK × 6 ครั้ง (รัศมี 3.5 ม.) → ดาเมจ 80% ATK × 6 ครั้ง (รัศมี 3.5 ม.) | Fan Shot 2 |
| 4 (25) | **Venom Lore** ตำราพิษ | ติดตัว | — | skillDmg +2% → skillDmg +10% | Eagle Eye 2 |
| 5 (40) | **Starfall Barrage** ห่าศรดาวตก | กดใช้ | 80 / 50s · ร่าย 1.2s | ดาเมจ 140% ATK × 6 ครั้ง (รัศมี 4.5 ม.) → ดาเมจ 196% ATK × 6 ครั้ง (รัศมี 4.5 ม.) | Charged Shot 3, Arrow Rain 2 |

### Enchanter
ปุ่มเริ่มต้น: Space = Rune Fracture · Q = Might Inscription · E = Concord Field

| แถว (Lv) | สกิล | ประเภท | MP / CD | Lv1 → Lv5 | ต้องการ |
| --- | --- | --- | --- | --- | --- |
| 1 (1) | **Rune Fracture** รูนแตกสลาย | กดใช้ | 20 / 4s | ดาเมจ 180% ATK (รัศมี 2 ม.) → ดาเมจ 240% ATK (รัศมี 2 ม.) | — |
| 1 (1) | **Rune Literacy** อ่านรูน | ติดตัว | — | cdr +1% · mpPct +2% → cdr +5% · mpPct +10% | — |
| 1 (1) | **Might Inscription** จารึกพละกำลัง | กดใช้ | 18 / 8s | atkPct +10% 30 นาที (ผู้เล่นอื่นได้) → atkPct +18% 30 นาที (ผู้เล่นอื่นได้) | — |
| 2 (5) | **Umbral Bolt** กระสุนเงามืด | กดใช้ | 14 / 5s | ดาเมจ 160% ATK (เป้าเดียว) · ศัตรู DEF −8% → ดาเมจ 216% ATK (เป้าเดียว) · ศัตรู DEF −14% | Rune Fracture 2 |
| 2 (5) | **Ward Inscription** จารึกปราการ | กดใช้ | 18 / 8s | defPct +10% 30 นาที (ผู้เล่นอื่นได้) → defPct +18% 30 นาที (ผู้เล่นอื่นได้) | Might Inscription 1 |
| 2 (5) | **Haste Inscription** จารึกวายุ | กดใช้ | 16 / 8s | moveSpeed +6% 30 นาที (ผู้เล่นอื่นได้) → moveSpeed +10% 30 นาที (ผู้เล่นอื่นได้) | Might Inscription 2 |
| 3 (12) | **Frailty Hex** คำสาปเปราะบาง | กดใช้ | 26 / 14s | ศัตรู ATK −15% · ศัตรู DEF −15% · ดาเมจ 80% ATK (รัศมี 3 ม.) → ศัตรู ATK −23% · ศัตรู DEF −23% · ดาเมจ 112% ATK (รัศมี 3 ม.) | Umbral Bolt 2 |
| 3 (12) | **Concord Field** ทุ่งประสานใจ | กดใช้ | 30 / 20s · ร่าย 1.4s | defPct +15% 12 วิ · โล่ 15% HP → defPct +23% 12 วิ · โล่ 23% HP | Ward Inscription 2 |
| 3 (12) | **Focus Inscription** จารึกสมาธิ | กดใช้ | 18 / 8s | critRate +3% 30 นาที (ผู้เล่นอื่นได้) → critRate +7% 30 นาที (ผู้เล่นอื่นได้) | Haste Inscription 1 |
| 4 (25) | **Shared Resonance** สั่นพ้องร่วม | ติดตัว | — | healPower +2% · skillDmg +1.5% → healPower +10% · skillDmg +7.5% | Concord Field 1 |
| 4 (25) | **Long Blessing** พรยาวนาน | ติดตัว | — | cdr +2% → cdr +10% | Rune Literacy 3 |
| 5 (40) | **Grand Concord** มหาประสาน | กดใช้ | 90 / 120s · ร่าย 1.4s | atkPct +20% 2 นาที · defPct +20% 2 นาที → atkPct +28% 2 นาที · defPct +28% 2 นาที | Shared Resonance 3, Frailty Hex 2 |
