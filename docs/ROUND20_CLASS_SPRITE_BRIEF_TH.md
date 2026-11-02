# Round 20 — บรีฟภาพตัวละคร 2D 8 ทิศ สำหรับ ChatGPT (8 อาชีพ × ชาย/หญิง)

ใช้คู่กับระบบ 8 อาชีพที่เล่นได้แล้ว (ตอนนี้ทุกอาชีพยังใช้ภาพ Berserker ชั่วคราว) — พอได้ภาพตามบรีฟนี้ ผมตัดเป็น flipbook 8 ทิศแล้วใส่เกมแทนภาพชั่วคราวทีละอาชีพ

## 1. วาด 5 ทิศ เกมกลับด้านอีก 3 ทิศเอง

| แถว | ทิศที่วาด | หันหน้าไปทาง | เกมสร้างให้ (กลับด้าน) |
|---|---|---|---|
| 1 | S | หันหน้าเข้าหากล้องตรง ๆ | — |
| 2 | SW | เฉียงหน้า หันไปทางซ้ายของภาพ | SE |
| 3 | W | ด้านข้าง หันไปทางซ้ายของภาพ | E |
| 4 | NW | เฉียงหลัง หันไปทางซ้ายของภาพ | NE |
| 5 | N | หันหลังให้กล้องตรง ๆ | — |

ข้อควรรู้เรื่องกลับด้าน: อาวุธที่ถือคนละมือจะสลับมือในทิศ SE/E/NE (เช่นดาบขวา-โล่ซ้ายของ Paladin, ธนูของ Hawkeye) — เป็นข้อจำกัดของวิธีนี้ ยอมรับได้สำหรับเกมแนวนี้ ถ้าภายหลังอยากให้ถูกต้องทุกทิศ ค่อยวาดเพิ่มอีก 3 ทิศ

## 2. ท่าที่ต้องมี (ต่อ อาชีพ × เพศ)

| ไฟล์ | ท่า | จำนวนเฟรมต่อทิศ | ใช้ตอน |
|---|---|---|---|
| idle | ยืนหายใจ ถืออาวุธ | 4 | ยืนเฉย |
| walk | เดิน | 6 | เดิน / วิ่ง (เกมเร่งความเร็วเอง) |
| attack | โจมตีปกติ | 6 | ตีธรรมดา (คอมโบจังหวะ 1, 3) |
| skill | ท่าสกิล | 6 | สกิลโจมตี |
| buff | ร่าย / ชูอาวุธ | 4 | บัฟ ฮีล ตั้งโล่ |
| death | ล้ม | 5 | ตาย (เฟรมสุดท้ายนอนนิ่ง) |

รวม 6 ไฟล์ต่ออาชีพต่อเพศ → 8 อาชีพ × 2 เพศ × 6 = 96 ภาพ แนะนำให้ทำทีละอาชีพ (ชายก่อน) ส่งมาให้ผมทดสอบในเกมก่อนค่อยทำต่อ

## 3. รูปแบบไฟล์ (สำคัญ — ผิดแล้วตัดไม่ได้)

- พื้นหลัง **โปร่งใส** (PNG) ไม่มีเงาพื้น ไม่มีกรอบ ไม่มีตัวหนังสือ ไม่มีเส้นตาราง
- **5 แถว = 5 ทิศ** ตามลำดับตารางข้อ 1 (S บนสุด → N ล่างสุด)
- ในแถว เฟรมเรียงซ้าย→ขวา มี **ช่องว่างโปร่งใสคั่น** ระหว่างตัว (ห้ามตัวทับกัน อาวุธห้ามล้นไปชนเฟรมข้าง ๆ)
- ทุกเฟรม **ขนาดตัวเท่ากัน** และ **เท้าอยู่ระดับเดียวกัน** ในแถว
- มุมกล้อง: มองลงเฉียง ~30° แบบเกม isometric (เหมือนภาพ Berserker ปัจจุบัน) สัดส่วน chibi หัวใหญ่ ~1 : 3
- ขนาดภาพ 1536×1024 หรือใหญ่กว่าได้ (ผมย่อเอง)
- ตั้งชื่อ `<อาชีพ>-<m|f>-<ท่า>.png` เช่น `Hawkeye-m-attack.png`, `HighPriest-f-death.png`
- วางรวมในโฟลเดอร์ `Downloads\class_sprites\` แล้วบอกผม

## 4. ข้อความสั่ง ChatGPT (ใช้ซ้ำได้ เปลี่ยนแค่ส่วนในวงเล็บ)

```
Sprite sheet for a dark-fantasy isometric 2D MMORPG. Chibi proportions (head about 1/3 of the body),
painted style, camera looking down at about 30 degrees. Transparent background, no ground shadow,
no text, no grid lines, no frame borders.

Character: [CLASS DESCRIPTION — from the table below] , [male / female].
Action: [ACTION] — [N] frames per row.

Layout: exactly 5 rows, one per facing direction, top to bottom:
row 1 facing the camera (south), row 2 three-quarter front facing screen-left (south-west),
row 3 side view facing screen-left (west), row 4 three-quarter back facing screen-left (north-west),
row 5 back to the camera (north).
Frames go left to right with clear empty space between them; nothing overlaps the next frame.
Same character, same size, same outfit and colors in every frame; feet on the same baseline in each row.
```

แนบภาพตัวอย่างทุกครั้ง: ภาพ idle ทิศ S ของอาชีพนั้นที่ได้รอบแรก (ให้ ChatGPT ยึดหน้าตา/ชุดเดิม)

## 5. คำอธิบายตัวละครแต่ละอาชีพ (ใส่แทน CLASS DESCRIPTION)

| อาชีพ (id ในเกม) | คำอธิบายสำหรับ ChatGPT | สีหลัก |
|---|---|---|
| Paladin | holy knight in polished silver plate with blue tabard, one-handed longsword in the right hand, large kite shield with a golden sun emblem on the left arm | เงิน น้ำเงิน ทอง |
| Berserker | savage warrior in dark red leather and iron plates, huge two-handed greatsword | แดงเข้ม เหล็กดำ |
| Hawkeye | ranger in green hooded leather armor and cloak, longbow, quiver of arrows on the back | เขียว น้ำตาล |
| RuneMaster (Rune Master) | rune scholar in teal robes with gold trim, floating glowing stone rune tablets around one hand, rune book at the hip | เขียวอมฟ้า ทอง |
| Elementalist | mage in deep purple robes, tall two-handed staff topped with a crystal crackling with fire, frost and lightning | ม่วง ส้มไฟ ฟ้าน้ำแข็ง |
| Assassin | rogue in black and dark purple fitted leather, hood and face mask, a dagger in each hand | ดำ ม่วง |
| HighPriest (High Priest) | priest in white and gold vestments, short staff in the right hand, glowing holy orb floating above the left hand | ขาว ทอง |
| Inquisitor | witch hunter in a dark red long coat and wide-brimmed hat, silver armor plates, ornate one-hand crossbow | แดงเข้ม เงิน ส้มทอง |

## 6. หลังส่งภาพ ผมทำอะไรต่อ

1. ตัดแต่ละแถวเป็นเฟรม จัดเท้าให้ตรงกัน ย่อทุกเฟรมให้สูงเท่ากัน
2. สร้างทิศ SE/E/NE โดยกลับด้าน SW/W/NW
3. รวมเป็น atlas `public/art/anim/<m|f>-<Class>.webp` (รูปแบบ 8 ทิศเดียวกับที่เกมใช้อยู่)
4. ทดสอบในเกมทุกท่าทุกทิศ → ส่งคลิป/ภาพให้ดูก่อนขึ้น Netlify
