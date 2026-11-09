# SoulForge — prompt ทีละขั้นของ 8 อาชีพ (v4.1.0)

## ลำดับการทำ
ทำทีละอาชีพตามเลขไฟล์ `01` → `08` แต่ละอาชีพใช้ **1 แชทใหม่** (ChatGPT หรือ Gemini)
1. **ขั้น 0** วางข้อความแรก (ไม่ต้องแนบไฟล์) รอ AI ตอบยืนยัน
   **ขั้น 1** ให้ AI สร้างภาพต้นแบบใหม่จากข้อความ เลือกจนพอใจ บันทึกไฟล์ และส่งให้ผมดู
2. ไล่ **ขั้น 2 → 8** ในแชทเดียวกัน คัดลอกทีละกล่อง 1 กล่อง = 1 ภาพ = 1 ท่า × 1 ทิศ
3. บันทึกภาพตามชื่อที่เขียนไว้เหนือแต่ละกล่อง ลงโฟลเดอร์ `output\sprites-v4\<อาชีพ>\`
4. ครบแต่ละท่า (8 ภาพ) บอกผมได้เลย ผมจะต่อเข้าเกมและส่งภาพให้ดูก่อน

## กฎทิศของอาวุธ (แก้แล้วในทุกกล่อง)
อาวุธต้องหมุนตามตัวละคร ไม่ว่าจะถือมือซ้ายหรือมือขวา ปลายอาวุธต้องชี้ไปทางเดียวกับที่ตัวละครหัน
ทุกกล่องจึงบอก AI ชัดๆ 3 อย่าง: มือขวาอยู่ฝั่งไหนของภาพในทิศนั้น มือซ้ายอยู่ฝั่งไหน และ "ข้างหน้า" คือทางไหน
| ทิศ | มือขวาอยู่ | มือซ้ายอยู่ | ปลายอาวุธชี้ |
|---|---|---|---|
| S | ซ้ายภาพ | ขวาภาพ | เข้าหากล้อง (ลง) |
| SE | ซ้ายภาพ ด้านหน้า | ขวาภาพ หลังลำตัว | ขวาล่าง |
| E | ด้านหน้าลำตัว | หลังลำตัว | ขวา |
| NE | ขวาภาพ ด้านหน้า | ซ้ายภาพ หลังลำตัว | ขวาบน |
| N | ขวาภาพ | ซ้ายภาพ | ขึ้น (ออกห่างกล้อง) |
| NW | ขวาภาพ หลังลำตัว | ซ้ายภาพ ด้านหน้า | ซ้ายบน |
| W | หลังลำตัว | ด้านหน้าลำตัว | ซ้าย |
| SW | ซ้ายภาพ หลังลำตัว | ขวาภาพ ด้านหน้า | ซ้ายล่าง |

ทิศหันหลัง (N, NE, NW) อาวุธจะถูกลำตัวบังบางส่วน **ถูกต้องแล้ว** ถ้า AI เอาดาบเหวี่ยงออกด้านข้างให้เห็นชัด ให้ตอบ:
`Wrong weapon direction. The weapon must point the same way the character faces (<ทิศ>), partly hidden by the body is fine. Redo.`
ข้อยกเว้นเดียว: Berserker พาดดาบบนบ่า ใบดาบชี้ไปด้านหลัง ด้ามอยู่ด้านหน้า

## กฎรูปทรงอาวุธ (ทุกอาชีพ ทุกกล่อง)
อาวุธ โล่ และของที่ถือ (ดาบ ธนู ไม้เท้า มีด ค้อน คทา หินรูน ลูกแสง) **ต้องเหมือนภาพต้นแบบ 100%** ทุกเฟรมทุกทิศ
ทั้งรูปทรง ความยาว ความกว้าง ความหนา สัดส่วน ความโค้ง ลวดลาย และสี **ห้ามบิด งอ ยืด หด ละลาย หรือเปลี่ยนแบบ**
เปลี่ยนได้อย่างเดียวคือมุมมองตอนหมุน (ดูสั้นลงเมื่อชี้เข้า/ออกจากกล้อง) ดาบตรงต้องตรงเสมอ
ถ้าอาวุธงอหรือเปลี่ยนแบบ ให้ตอบ:
`Weapon shape is wrong. It must be identical to the master reference - rigid and straight, same length and design. Redo.`

ลำดับท่าเรียงตามความสำคัญ: เดิน → ตาย → โดนตี → ยืน → โจมตี → สกิล → บัฟ
ถ้าเวลาน้อย ทำแค่ **ขั้น 1 (ต้นแบบ) + ขั้น 2 (เดิน)** ของทุกอาชีพก่อน จะแก้อาการเดินกระตุกได้ทั้งเกม

## ตั้งค่าขนาดภาพ
- ChatGPT: กล่องที่เขียน `1536x1024 landscape` เลือก **Landscape**; `1024x1024 square` เลือก **Square**
- Gemini: ใช้ข้อความในกล่องได้เลย ถ้าได้อัตราส่วนผิด ให้ตอบว่า "regenerate at exactly 1536x1024"

## ถ้าภาพออกมาสว่าง/น่ารัก/เหมือนอนิเมะเกินไป (ไม่ดาร์ค)
ตอบในแชทเดิมด้วยข้อความนี้ (ใช้ได้ทุกอาชีพ):
```text
Too bright and too cute. Redo the same design in a much darker grimdark style:
- low-key lighting, most of the body in deep shadow, only top-left edges lit
- desaturate all colors by about 40%; tarnished antique gold instead of bright gold; dull scratched gunmetal instead of shiny silver; darker, dirtier cloth
- add wear: scratches, dents, soot, mud on boots and hem, frayed cloth edges
- grim battle-hardened face: narrower eyes, heavy brows, no sparkle, no cute expression
- heavy painterly brushwork, strong light-dark contrast, like Diablo / Darkest Dungeon art
Keep the same design, outfit, headwear, cloak, weapon and shield shapes, and the same 3-view layout.
```
ถ้ายังสว่างอยู่ ส่งซ้ำพร้อมเพิ่มบรรทัด `Even darker. Overall image value should be mostly dark midtones.`

## ถ้าภาพผิด ให้ตอบกลับด้วยประโยคเหล่านี้ (เจนใหม่ อย่าแก้ด้วยการกลับภาพ)
- มือสลับ: `Wrong hands. Redo: the weapon must be in the character's RIGHT hand as in the master reference.`
- ทิศผิด: `Wrong direction. Redo facing <ทิศตามกล่อง>.`
- หน้าตาเพี้ยน: แนบไฟล์ต้นแบบที่บันทึกไว้ + `Match this master reference exactly. Redo.`
- มีพื้น/เงา/ตัวหนังสือ: `Remove the ground, shadow and any text. Flat background only. Redo.`
- อาวุธชี้ผิดทาง/เหวี่ยงออกข้าง: `Wrong weapon direction. The weapon must point the same way the character faces, partly hidden by the body is fine. Redo.`
- อาวุธงอ/บิด/เปลี่ยนแบบ: `Weapon shape is wrong. It must be identical to the master reference - rigid and straight, same length and design. Redo.`
- จำนวนช่องผิด: `Wrong grid. Redo with exactly <จำนวน> equal cells.`

## ชุดบังคับของแต่ละอาชีพ (ปรับรอบนี้)
| อาชีพ | ผ้าคลุม | หมวก/ของสวมหัว | เปลี่ยนจากแบบเดิม |
|---|---|---|---|
| Paladin | ผ้าคลุมยาวสีน้ำเงิน ลายพระอาทิตย์ทอง | หมวกเหล็กเปิดหน้า มีปีกนกสองข้าง | **ใช่** (โล่มีปีกสยายด้านบน ดาบมีปีกที่โกร่ง) |
| Berserker | ผ้าคลุมหนังขนหมาป่าสีน้ำตาลเข้ม | หมวกเหล็กดำมีเขาโค้ง | **ใช่** |
| Assassin | ผ้าคลุมสั้นสีดำซับม่วง ชายขาด | ฮู้ด + ผ้าปิดหน้า (ของเดิม) | **ใช่** |
| Hawkeye | ผ้าคลุมเขียว (ของเดิม) | ฮู้ด (ของเดิม) | ไม่เปลี่ยน |
| HighPriest | — | หมวกไมเตอร์ (หมวกบิชอป) ขาว-ทอง | **ใช่** |
| Inquisitor | — | หมวกปีกกว้าง (ของเดิม) | ไม่เปลี่ยน |
| Elementalist | — | ไม่มี (ตามที่กำหนด) | ไม่เปลี่ยน |
| RuneMaster | — | ไม่มี (ตามที่กำหนด) | ไม่เปลี่ยน |

ทุกอาชีพสร้างต้นแบบใหม่จากข้อความในขั้น 1 **ไม่ต้องแนบไฟล์ต้นแบบเดิม** (ไฟล์ใน `master-refs` ที่ไม่มี `_v2` เป็นของเก่า ไม่ต้องใช้แล้ว)
ชีตเก่าในเกมจะถูกแทนด้วยชุดใหม่ทั้งหมด จึงต้องเจนครบทุกท่าของทุกอาชีพ

คำอธิบายหน้าตายังตามภาพในเกมเป็นหลัก: HighPriest ถือลูกแสง (ไม่ใช่คัมภีร์) และ Berserker เปลือยท่อนบน


---

# 1. Paladin — พาลาดิน · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#FF00FF**

บันทึกไฟล์ที่: `output\sprites-v4\paladin\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\Paladin_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.

CHARACTER FOR THIS CHAT: Paladin (male), player class.
LOOK: Grim semi-chibi holy knight with short brown hair and blue eyes. Open-face dark steel helmet with a pair of ash-grey and dull silver bird wings spreading from BOTH sides of the helmet. Worn dark steel plate armor with gold trim and small gold wing engravings on the pauldrons, dark midnight-navy tabard with a golden sun emblem, brown leather belt. Long dark midnight-navy cape with gold trim and a golden sun on the back, from the shoulders to the ankles. Kite shield in dark midnight-navy with a golden sun and gold rim, with a pair of spread silver-and-gold wings rising from the TOP edge of the shield. Longsword with a WINGED CROSSGUARD: two small metal wings spread sideways between the blade and the grip.
DARK PALETTE: dull scratched gunmetal steel, dark midnight-navy cloth, tarnished antique gold, ash-grey helmet and shield wings, dark brown leather; only the sun emblem has a faint warm glow.
HAND RULE: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction.
DEFAULT POSE: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of Paladin (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #FF00FF background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\Paladin_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `paladin_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.2 ทิศ SE** → บันทึกเป็น `paladin_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.3 ทิศ E** → บันทึกเป็น `paladin_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.4 ทิศ NE** → บันทึกเป็น `paladin_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.5 ทิศ N** → บันทึกเป็น `paladin_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.6 ทิศ NW** → บันทึกเป็น `paladin_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.7 ทิศ W** → บันทึกเป็น `paladin_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**2.8 ทิศ SW** → บันทึกเป็น `paladin_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `paladin_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `paladin_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `paladin_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `paladin_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `paladin_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `paladin_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `paladin_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `paladin_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `paladin_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `paladin_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `paladin_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `paladin_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `paladin_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `paladin_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `paladin_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `paladin_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `paladin_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.2 ทิศ SE** → บันทึกเป็น `paladin_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.3 ทิศ E** → บันทึกเป็น `paladin_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.4 ทิศ NE** → บันทึกเป็น `paladin_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.5 ทิศ N** → บันทึกเป็น `paladin_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.6 ทิศ NW** → บันทึกเป็น `paladin_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.7 ทิศ W** → บันทึกเป็น `paladin_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

**5.8 ทิศ SW** → บันทึกเป็น `paladin_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield held upright at the left side (face of the shield vertical, never flat), sword lowered forward-down at the right side.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `paladin_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.2 ทิศ SE** → บันทึกเป็น `paladin_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.3 ทิศ E** → บันทึกเป็น `paladin_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.4 ทิศ NE** → บันทึกเป็น `paladin_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.5 ทิศ N** → บันทึกเป็น `paladin_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.6 ทิศ NW** → บันทึกเป็น `paladin_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.7 ทิศ W** → บันทึกเป็น `paladin_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

**6.8 ทิศ SW** → บันทึกเป็น `paladin_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the sword back over the right shoulder while the shield comes up to a vertical guard in front, 3-5 a strong diagonal downward slash, 6-8 recover to idle.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `paladin_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `paladin_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.3 ทิศ E** → บันทึกเป็น `paladin_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `paladin_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.5 ทิศ N** → บันทึกเป็น `paladin_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `paladin_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.7 ทิศ W** → บันทึกเป็น `paladin_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `paladin_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Judgement Blade": frames 1-3 raise the sword high with both arms over the head, the shield still on the left arm, 4-7 two powerful downward holy strikes into the ground in front, 8-10 recover. Draw no light effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `paladin_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), lowered forward-down; the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `paladin_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, lowered forward-down; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `paladin_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `paladin_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `paladin_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), lowered forward-down; the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `paladin_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, lowered forward-down; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `paladin_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, lowered forward-down; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `paladin_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Paladin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: longsword with the winged crossguard in the character's RIGHT hand; winged kite shield on the character's LEFT arm. Never swap them in any direction. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, lowered forward-down; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Sacred Vow": frames 1-4 plant the sword point-down in front and lift the shield, head bowed, 5-8 look up and stand tall in a confident guard. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "Paladin เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 2. Hawkeye — ฮอว์คอาย (ARCHER) · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#FF00FF**

บันทึกไฟล์ที่: `output\sprites-v4\hawkeye\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\Hawkeye_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.

CHARACTER FOR THIS CHAT: Hawkeye (male), player class.
LOOK: Grim semi-chibi ranger with a dark forest-green hood pulled over brown hair, long ragged green cloak, brown leather tunic with straps and belt, leather bracers, tall brown boots, a quiver full of arrows on the back.
DARK PALETTE: dark moss green and near-black olive cloth, dark worn brown leather, dull bronze buckles, mud on boots and cloak hem.
HAND RULE: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap.
DEFAULT POSE: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of Hawkeye (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #FF00FF background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\Hawkeye_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `hawkeye_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.3 ทิศ E** → บันทึกเป็น `hawkeye_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.5 ทิศ N** → บันทึกเป็น `hawkeye_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.7 ทิศ W** → บันทึกเป็น `hawkeye_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**2.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `hawkeye_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `hawkeye_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `hawkeye_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `hawkeye_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `hawkeye_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `hawkeye_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `hawkeye_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `hawkeye_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `hawkeye_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.3 ทิศ E** → บันทึกเป็น `hawkeye_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.5 ทิศ N** → บันทึกเป็น `hawkeye_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.7 ทิศ W** → บันทึกเป็น `hawkeye_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

**5.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: bow held low in the left hand tilted about 45 degrees downward toward the front, right hand relaxed near the hip.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `hawkeye_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.3 ทิศ E** → บันทึกเป็น `hawkeye_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.5 ทิศ N** → บันทึกเป็น `hawkeye_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.7 ทิศ W** → บันทึกเป็น `hawkeye_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

**6.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 right hand pulls an arrow from the back quiver and nocks it, 3-4 raise the bow and draw the string to the cheek, 5 release (string snaps forward, arrow gone), 6-8 lower the bow back to idle. Bow, string, arrow and hands line up correctly.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `hawkeye_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.3 ทิศ E** → บันทึกเป็น `hawkeye_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.5 ทิศ N** → บันทึกเป็น `hawkeye_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.7 ทิศ W** → บันทึกเป็น `hawkeye_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Arrow Rain": frames 1-3 nock and aim the bow steeply up toward the sky, 4-7 draw fully and release, then quickly nock and release again, 8-10 lower the bow. Draw no arrows in the sky and no effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `hawkeye_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled toward the camera (down in the image); when an arrow is drawn it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `hawkeye_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-right in the image; when an arrow is drawn it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `hawkeye_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the RIGHT edge of the image; when an arrow is drawn it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `hawkeye_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-right in the image, away from the camera; when an arrow is drawn it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `hawkeye_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the LEFT hand holds the bow out in front, angled straight away from the camera (up in the image); when an arrow is drawn it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `hawkeye_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the LEFT hand holds the bow out in front, angled up-left in the image, away from the camera; when an arrow is drawn it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `hawkeye_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the LEFT hand holds the bow out in front, angled to the LEFT edge of the image; when an arrow is drawn it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `hawkeye_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Hawkeye (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: wooden longbow always in the character's LEFT hand; the RIGHT hand draws arrows from the quiver and pulls the string. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the LEFT hand holds the bow out in front, angled down-left in the image; when an arrow is drawn it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Eagle Eye": frames 1-4 lift the bow to eye level and squint along it, right hand touching the hood, 5-8 lower into a sharp ready stance. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "Hawkeye เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 3. RuneMaster — รูนมาสเตอร์ · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#FF00FF**

บันทึกไฟล์ที่: `output\sprites-v4\runemaster\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\RuneMaster_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.

CHARACTER FOR THIS CHAT: RuneMaster (male), player class.
LOOK: Grim semi-chibi rune swordsman with dark swept-back hair, a long dark-teal and navy coat with high collar and golden rune embroidery down the front, crossed leather straps, brown boots.
DARK PALETTE: black-navy and dark slate-teal coat, tarnished gold rune embroidery, dark leather; only the runes, blade edge and rune stone glow soft teal.
HAND RULE: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap.
DEFAULT POSE: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of RuneMaster (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #FF00FF background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\RuneMaster_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `runemaster_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.2 ทิศ SE** → บันทึกเป็น `runemaster_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.3 ทิศ E** → บันทึกเป็น `runemaster_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.4 ทิศ NE** → บันทึกเป็น `runemaster_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.5 ทิศ N** → บันทึกเป็น `runemaster_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.6 ทิศ NW** → บันทึกเป็น `runemaster_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.7 ทิศ W** → บันทึกเป็น `runemaster_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**2.8 ทิศ SW** → บันทึกเป็น `runemaster_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `runemaster_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `runemaster_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `runemaster_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `runemaster_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `runemaster_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `runemaster_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `runemaster_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `runemaster_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `runemaster_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `runemaster_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `runemaster_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `runemaster_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `runemaster_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `runemaster_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `runemaster_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `runemaster_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `runemaster_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.2 ทิศ SE** → บันทึกเป็น `runemaster_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.3 ทิศ E** → บันทึกเป็น `runemaster_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.4 ทิศ NE** → บันทึกเป็น `runemaster_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.5 ทิศ N** → บันทึกเป็น `runemaster_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.6 ทิศ NW** → บันทึกเป็น `runemaster_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.7 ทิศ W** → บันทึกเป็น `runemaster_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

**5.8 ทิศ SW** → บันทึกเป็น `runemaster_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sword pointing down-forward at the right side, left hand raised at waist-to-chest height with the rune stone hovering above the palm.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `runemaster_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.2 ทิศ SE** → บันทึกเป็น `runemaster_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.3 ทิศ E** → บันทึกเป็น `runemaster_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.4 ทิศ NE** → บันทึกเป็น `runemaster_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.5 ทิศ N** → บันทึกเป็น `runemaster_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.6 ทิศ NW** → บันทึกเป็น `runemaster_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.7 ทิศ W** → บันทึกเป็น `runemaster_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

**6.8 ทิศ SW** → บันทึกเป็น `runemaster_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the sword back, 3-5 a quick horizontal slash forward, the rune stone stays above the left palm, 6-8 recover to idle.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `runemaster_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `runemaster_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.3 ทิศ E** → บันทึกเป็น `runemaster_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `runemaster_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.5 ทิศ N** → บันทึกเป็น `runemaster_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `runemaster_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.7 ทิศ W** → บันทึกเป็น `runemaster_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `runemaster_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Rune Pillar": frames 1-3 lift the rune stone high in the left hand, 4-7 stab the sword point down into the ground in front with the right hand and push the stone downward, 8-10 pull the sword out and recover. Draw no pillars or effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `runemaster_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled toward the camera (down in the image), down-forward; the rune stone above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `runemaster_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-right in the image, down-forward; the rune stone above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `runemaster_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the RIGHT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `runemaster_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-right in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `runemaster_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sword with its tip angled straight away from the camera (up in the image), down-forward; the rune stone above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `runemaster_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sword with its tip angled up-left in the image, away from the camera, down-forward; the rune stone above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `runemaster_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled to the LEFT edge of the image, down-forward; the rune stone above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `runemaster_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of RuneMaster (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: rune sword with a glowing teal blade in the character's RIGHT hand; a glowing teal rune stone floating just above the open LEFT palm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sword with its tip angled down-left in the image, down-forward; the rune stone above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Pillar of Valor": frames 1-4 bring the rune stone to the chest with both hands, sword hanging from the right hand, 5-8 raise the stone overhead in triumph. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "RuneMaster เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 4. Elementalist — เอเลเมนทัลลิสต์ · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#00FF00**

บันทึกไฟล์ที่: `output\sprites-v4\elementalist\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\Elementalist_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.
This character uses purple, so in THIS chat the background is always a flat solid #00FF00 green instead of magenta.

CHARACTER FOR THIS CHAT: Elementalist (male), player class.
LOOK: Grim semi-chibi young mage with messy dark-purple hair and violet eyes, layered dark-purple tattered cloak with high collar and gold trim, dark clothes underneath, black boots. Long ornate staff topped with a large blue crystal wreathed in small orange-and-blue magic flames.
DARK PALETTE: deep plum-black and dark violet robes, tarnished gold trim, black boots; only the staff crystal glows (blue and ember orange).
HAND RULE: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap.
DEFAULT POSE: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of Elementalist (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #00FF00 background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\Elementalist_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `elementalist_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.2 ทิศ SE** → บันทึกเป็น `elementalist_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.3 ทิศ E** → บันทึกเป็น `elementalist_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.4 ทิศ NE** → บันทึกเป็น `elementalist_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.5 ทิศ N** → บันทึกเป็น `elementalist_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.6 ทิศ NW** → บันทึกเป็น `elementalist_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.7 ทิศ W** → บันทึกเป็น `elementalist_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**2.8 ทิศ SW** → บันทึกเป็น `elementalist_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `elementalist_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `elementalist_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `elementalist_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `elementalist_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `elementalist_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `elementalist_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `elementalist_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `elementalist_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `elementalist_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `elementalist_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `elementalist_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `elementalist_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `elementalist_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `elementalist_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `elementalist_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `elementalist_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `elementalist_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.2 ทิศ SE** → บันทึกเป็น `elementalist_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.3 ทิศ E** → บันทึกเป็น `elementalist_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.4 ทิศ NE** → บันทึกเป็น `elementalist_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.5 ทิศ N** → บันทึกเป็น `elementalist_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.6 ทิศ NW** → บันทึกเป็น `elementalist_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.7 ทิศ W** → บันทึกเป็น `elementalist_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

**5.8 ทิศ SW** → บันทึกเป็น `elementalist_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: idle: staff perfectly vertical in the right hand, crystal pointing up, bottom tip on the ground. Walk: staff held across the body with both hands, tilted 45 degrees; the robe hem swings so the boot tips show on each step.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `elementalist_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.2 ทิศ SE** → บันทึกเป็น `elementalist_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.3 ทิศ E** → บันทึกเป็น `elementalist_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.4 ทิศ NE** → บันทึกเป็น `elementalist_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.5 ทิศ N** → บันทึกเป็น `elementalist_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.6 ทิศ NW** → บันทึกเป็น `elementalist_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.7 ทิศ W** → บันทึกเป็น `elementalist_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

**6.8 ทิศ SW** → บันทึกเป็น `elementalist_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 pull the staff back with both hands, 3-5 thrust the crystal head forward to cast, 6-8 return to idle.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `elementalist_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `elementalist_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.3 ทิศ E** → บันทึกเป็น `elementalist_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `elementalist_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.5 ทิศ N** → บันทึกเป็น `elementalist_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `elementalist_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.7 ทิศ W** → บันทึกเป็น `elementalist_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `elementalist_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Meteor": frames 1-3 raise the staff high above the head with both hands, 4-7 hold it up then swing it down to point at the ground in front, 8-10 recover. Draw no meteor or effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `elementalist_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly toward the camera (down in the image); when casting it points toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `elementalist_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-right in the image; when casting it points down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `elementalist_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the RIGHT edge of the image; when casting it points to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `elementalist_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-right in the image, away from the camera; when casting it points up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `elementalist_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly straight away from the camera (up in the image); when casting it points straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `elementalist_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly up-left in the image, away from the camera; when casting it points up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `elementalist_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly to the LEFT edge of the image; when casting it points to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `elementalist_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Elementalist (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: the staff is held in the character's RIGHT hand when standing; when walking both hands hold it (LEFT hand higher, RIGHT hand lower). Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the staff stays in the RIGHT hand (both hands when walking) and its crystal head leans slightly down-left in the image; when casting it points down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Elemental Attunement": frames 1-4 hold the staff vertical in front with both hands, eyes closed, cloak lifting, 5-8 open the eyes and step into a ready stance. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "Elementalist เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 5. Assassin — แอสแซสซิน · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#00FF00**

บันทึกไฟล์ที่: `output\sprites-v4\assassin\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\Assassin_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.
This character uses purple, so in THIS chat the background is always a flat solid #00FF00 green instead of magenta.

CHARACTER FOR THIS CHAT: Assassin (male), player class.
LOOK: Grim semi-chibi assassin in a black hood with dark purple lining, black cloth mask over the lower face with only violet eyes visible. Short ragged black cloak with dark purple lining attached to the hood, from the shoulders to mid-thigh, torn and split at the hem. Black leather and dark-metal light armor with many straps and buckles, purple sash at the waist, black boots.
DARK PALETTE: black and charcoal, very dark violet lining, blackened dull steel daggers and buckles, faded purple sash.
HAND RULE: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present.
DEFAULT POSE: crouched ready stance, knees bent, both daggers held low at the sides.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of Assassin (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (crouched ready stance, knees bent, both daggers held low at the sides):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #00FF00 background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\Assassin_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `assassin_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.2 ทิศ SE** → บันทึกเป็น `assassin_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.3 ทิศ E** → บันทึกเป็น `assassin_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.4 ทิศ NE** → บันทึกเป็น `assassin_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.5 ทิศ N** → บันทึกเป็น `assassin_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.6 ทิศ NW** → บันทึกเป็น `assassin_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.7 ทิศ W** → บันทึกเป็น `assassin_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**2.8 ทิศ SW** → บันทึกเป็น `assassin_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `assassin_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `assassin_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `assassin_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `assassin_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `assassin_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `assassin_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `assassin_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `assassin_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `assassin_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `assassin_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `assassin_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `assassin_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `assassin_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `assassin_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `assassin_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `assassin_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `assassin_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.2 ทิศ SE** → บันทึกเป็น `assassin_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.3 ทิศ E** → บันทึกเป็น `assassin_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.4 ทิศ NE** → บันทึกเป็น `assassin_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.5 ทิศ N** → บันทึกเป็น `assassin_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.6 ทิศ NW** → บันทึกเป็น `assassin_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.7 ทิศ W** → บันทึกเป็น `assassin_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

**5.8 ทิศ SW** → บันทึกเป็น `assassin_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: crouched ready stance, knees bent, both daggers held low at the sides.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `assassin_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.2 ทิศ SE** → บันทึกเป็น `assassin_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.3 ทิศ E** → บันทึกเป็น `assassin_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.4 ทิศ NE** → บันทึกเป็น `assassin_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.5 ทิศ N** → บันทึกเป็น `assassin_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.6 ทิศ NW** → บันทึกเป็น `assassin_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.7 ทิศ W** → บันทึกเป็น `assassin_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

**6.8 ทิศ SW** → บันทึกเป็น `assassin_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 crouch lower, 3-5 two quick crossing slashes (right then left), 6-8 return to the crouched stance.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `assassin_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `assassin_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.3 ทิศ E** → บันทึกเป็น `assassin_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `assassin_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.5 ทิศ N** → บันทึกเป็น `assassin_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `assassin_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.7 ทิศ W** → บันทึกเป็น `assassin_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `assassin_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Fan of Blades": frames 1-3 crouch and coil, 4-7 a full 360-degree spinning slash with both daggers, 8-10 land back in the crouch. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `assassin_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `assassin_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `assassin_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `assassin_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `assassin_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: both daggers are held low with the blades angled down and slightly straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `assassin_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: both daggers are held low with the blades angled down and slightly up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `assassin_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: both daggers are held low with the blades angled down and slightly to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `assassin_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Assassin (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #00FF00 background, nothing else.
Hands: one curved dagger in EACH hand, held in reverse grip, blades pointing down. Both daggers always present. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: both daggers are held low with the blades angled down and slightly down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Shadow Veil": frames 1-4 pull the hood lower and cross both daggers in front of the chest, 5-8 sink into a low stealth crouch. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "Assassin เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 6. HighPriest — ไฮพรีสต์ (PRIEST) · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#FF00FF**

บันทึกไฟล์ที่: `output\sprites-v4\highpriest\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\HighPriest_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.

CHARACTER FOR THIS CHAT: HighPriest (male), player class.
LOOK: Grim semi-chibi young priest with soft blond hair and grey eyes. Tall aged ivory and gold mitre (bishop hat) with a gold cross emblem on the front and two short ribbons at the back. Long aged ivory and gold robes with heavy gold embroidery and wide sleeves, dark trousers and brown boots.
DARK PALETTE: aged ivory and bone-white robes with grey grime at the hem, tarnished antique gold embroidery, dark leather; only the light orb glows warm gold.
HAND RULE: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap.
DEFAULT POSE: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of HighPriest (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #FF00FF background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\HighPriest_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `highpriest_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.2 ทิศ SE** → บันทึกเป็น `highpriest_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.3 ทิศ E** → บันทึกเป็น `highpriest_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.4 ทิศ NE** → บันทึกเป็น `highpriest_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.5 ทิศ N** → บันทึกเป็น `highpriest_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.6 ทิศ NW** → บันทึกเป็น `highpriest_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.7 ทิศ W** → บันทึกเป็น `highpriest_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**2.8 ทิศ SW** → บันทึกเป็น `highpriest_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `highpriest_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `highpriest_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `highpriest_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `highpriest_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `highpriest_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `highpriest_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `highpriest_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `highpriest_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `highpriest_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `highpriest_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `highpriest_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `highpriest_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `highpriest_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `highpriest_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `highpriest_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `highpriest_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `highpriest_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.2 ทิศ SE** → บันทึกเป็น `highpriest_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.3 ทิศ E** → บันทึกเป็น `highpriest_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.4 ทิศ NE** → บันทึกเป็น `highpriest_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.5 ทิศ N** → บันทึกเป็น `highpriest_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.6 ทิศ NW** → บันทึกเป็น `highpriest_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.7 ทิศ W** → บันทึกเป็น `highpriest_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

**5.8 ทิศ SW** → บันทึกเป็น `highpriest_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: sceptre held upright at the right side, left hand raised at waist height with the light orb above the palm.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `highpriest_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.2 ทิศ SE** → บันทึกเป็น `highpriest_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.3 ทิศ E** → บันทึกเป็น `highpriest_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.4 ทิศ NE** → บันทึกเป็น `highpriest_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.5 ทิศ N** → บันทึกเป็น `highpriest_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.6 ทิศ NW** → บันทึกเป็น `highpriest_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.7 ทิศ W** → บันทึกเป็น `highpriest_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

**6.8 ทิศ SW** → บันทึกเป็น `highpriest_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 draw the left hand back with the orb, 3-5 thrust the left palm forward to send light (the orb stays in the hand), 6-8 return to idle.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `highpriest_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `highpriest_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.3 ทิศ E** → บันทึกเป็น `highpriest_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `highpriest_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.5 ทิศ N** → บันทึกเป็น `highpriest_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `highpriest_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.7 ทิศ W** → บันทึกเป็น `highpriest_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `highpriest_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Sanctuary": frames 1-3 raise the sceptre and the orb above the head, 4-7 bring both down and spread the arms wide, 8-10 return to idle. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `highpriest_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly toward the camera (down in the image); the light orb above the LEFT palm is held out toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `highpriest_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-right in the image; the light orb above the LEFT palm is held out down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `highpriest_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the RIGHT edge of the image; the light orb above the LEFT palm is held out to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `highpriest_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-right in the image, away from the camera; the light orb above the LEFT palm is held out up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `highpriest_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly straight away from the camera (up in the image); the light orb above the LEFT palm is held out straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `highpriest_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly up-left in the image, away from the camera; the light orb above the LEFT palm is held out up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `highpriest_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly to the LEFT edge of the image; the light orb above the LEFT palm is held out to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `highpriest_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of HighPriest (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating just above the open LEFT palm. Both always present. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the sceptre upright, tilted slightly down-left in the image; the light orb above the LEFT palm is held out down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blessing": frames 1-4 hold the sceptre in front with the head bowed in prayer, orb above the left hand, 5-8 lift the head and raise the sceptre. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "HighPriest เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 7. Inquisitor — อินควิซิเตอร์ · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#FF00FF**

บันทึกไฟล์ที่: `output\sprites-v4\inquisitor\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\Inquisitor_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.

CHARACTER FOR THIS CHAT: Inquisitor (male), player class.
LOOK: Grim semi-chibi inquisitor with a short dark beard, wide-brimmed black hat with a red band and small gold cross, long red coat with ragged hem, silver shoulder plates and bracers, gold cross on the chest, belts with pouches, black boots.
DARK PALETTE: dark oxblood-red coat, black leather, dull dark iron hammer and plates, tarnished gold cross, black hat.
HAND RULE: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap.
DEFAULT POSE: shield upright at the left side, hammer lowered at the right side.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of Inquisitor (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (shield upright at the left side, hammer lowered at the right side):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #FF00FF background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\Inquisitor_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `inquisitor_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.3 ทิศ E** → บันทึกเป็น `inquisitor_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.5 ทิศ N** → บันทึกเป็น `inquisitor_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.7 ทิศ W** → บันทึกเป็น `inquisitor_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**2.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `inquisitor_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `inquisitor_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `inquisitor_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `inquisitor_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `inquisitor_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `inquisitor_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `inquisitor_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `inquisitor_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `inquisitor_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.3 ทิศ E** → บันทึกเป็น `inquisitor_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.5 ทิศ N** → บันทึกเป็น `inquisitor_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.7 ทิศ W** → บันทึกเป็น `inquisitor_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

**5.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: shield upright at the left side, hammer lowered at the right side.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `inquisitor_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.3 ทิศ E** → บันทึกเป็น `inquisitor_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.5 ทิศ N** → บันทึกเป็น `inquisitor_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.7 ทิศ W** → บันทึกเป็น `inquisitor_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

**6.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 raise the hammer high over the right shoulder, shield in front, 3-5 slam it down hard in front, 6-8 recover to idle.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `inquisitor_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.3 ทิศ E** → บันทึกเป็น `inquisitor_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.5 ทิศ N** → บันทึกเป็น `inquisitor_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.7 ทิศ W** → บันทึกเป็น `inquisitor_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

**7.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Hammer of Thor": frames 1-3 raise the hammer straight up to the sky, 4-7 leap slightly and smash the hammer into the ground with full force, 8-10 rise back to idle. Draw no lightning.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `inquisitor_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled toward the camera (down in the image); the shield on the LEFT arm faces toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `inquisitor_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-right in the image; the shield on the LEFT arm faces down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `inquisitor_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the RIGHT edge of the image; the shield on the LEFT arm faces to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `inquisitor_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-right in the image, away from the camera; the shield on the LEFT arm faces up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `inquisitor_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled straight away from the camera (up in the image); the shield on the LEFT arm faces straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `inquisitor_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled up-left in the image, away from the camera; the shield on the LEFT arm faces up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `inquisitor_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled to the LEFT edge of the image; the shield on the LEFT arm faces to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `inquisitor_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Inquisitor (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: one-handed iron war hammer in the character's RIGHT hand; red heater shield with a gold cross and silver rim on the character's LEFT arm. Never swap. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the RIGHT hand holds the hammer with its head lowered and angled down-left in the image; the shield on the LEFT arm faces down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff: frames 1-4 hold the hammer upright in front of the face like a vow, 5-8 bang the hammer against the shield and stand ready. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "Inquisitor เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า


---

# 8. Berserker — เบอร์เซิร์กเกอร์ · prompt ทีละขั้น (ชาย)

ต้นแบบ: สร้างใหม่จากข้อความใน**ขั้น 1** (ไม่ต้องแนบไฟล์) · พื้นหลัง **#FF00FF**

บันทึกไฟล์ที่: `output\sprites-v4\berserker\` · ต้นแบบบันทึกที่ `output\sprites-v4\master-refs\Berserker_male_master_ref_v2.png`

> **ไม่ต้องแนบไฟล์ใด ๆ** ทำทุกขั้นใน **แชทเดียวกัน** ต้นแบบที่ AI สร้างในขั้น 1 จะอยู่ในแชทนั้น ทุกกล่องหลังจากนั้นอ้างถึงภาพนี้เอง

## ขั้น 0 — เปิดแชทใหม่ แล้ววางข้อความนี้

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK & HAUNTED TONE (mandatory for EVERY image in this game - characters, monsters, bosses, NPCs, items, maps):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
  - HAUNTED, eerie undertone: a cold, sickly pale-teal or ghostly-green rim light on the shadow side; pale, slightly ashen skin; shadowed hollow eye areas; a quiet sense of dread.
  - Small macabre details that fit the class or creature: bone charms, skull motifs, chains, wax seals and dripping candle wax, stitched scars, cracked runes, torn prayer cloth, faint ghostly wisps clinging to cloth edges (on the figure only, never on the background).
  - Heroes are grim survivors in a cursed world - dark and haunted, but still heroic and readable, never gory.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the master reference you create in this chat is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
HANDS: left/right always means the CHARACTER'S own left/right, not the image's. Never swap the hands of the weapon/shield/focus in any direction.
DIRECTIONS (image left/right):
  S = facing the camera, front view
  SE = three-quarter front, body turned toward the RIGHT side of the image
  E = full side profile facing the RIGHT edge of the image
  NE = three-quarter back view, facing away toward the upper RIGHT
  N = back view, facing away from the camera
  NW = three-quarter back view, facing away toward the upper LEFT
  W = full side profile facing the LEFT edge of the image
  SW = three-quarter front, body turned toward the LEFT side of the image
Back views (N, NE, NW) must show the real back: cape, back of helmet/hood, weapon seen from behind.
WEAPON FOLLOWS THE BODY: weapons, shields and focus items turn together with the character. Whatever the direction, the weapon stays in the same hand and its tip/head points the same way the character is facing (unless the class rule says otherwise).
  In back views (N, NE, NW) the weapon in front of the body may be partly hidden by the body or seen from behind - that is correct. Never swing it out sideways or flip it to the other side just to make it visible.
WEAPON SHAPE IS FIXED: every weapon, shield and focus item is a rigid object that must match the master reference 100% in every frame and every direction - same shape, length, width, thickness, proportions, curve, details and colors. Blades, staffs, bows, hammers and shields NEVER bend, warp, wobble, melt, stretch, shrink, thicken, split or change design. Only perspective may change as the object turns (foreshortening), never its real shape. A straight blade stays perfectly straight.

CHARACTER FOR THIS CHAT: Berserker (male), player class.
LOOK: Grim semi-chibi barbarian with long wild red hair and a full red beard. Black iron horned helmet with two thick curved horns and a brow guard, open face, the red hair flowing out at the back. Bare muscular chest with scars, black spiked iron pauldron and arm guards, black leather straps across the chest. Heavy cloak made of a dark-brown wolf-fur pelt over the shoulders, ragged hem down to the knees, fastened with an iron clasp. Grey-white fur loincloth over dark trousers, heavy black boots. Huge dark-steel greatsword with a long grip.
DARK PALETTE: dark rust-red hair and beard, weathered tanned skin with scars and grime, blackened iron armor and horned helmet, dark brown matted fur cloak.
HAND RULE: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt.
DEFAULT POSE: greatsword resting on the right shoulder, blade pointing up and back behind the head.
Do not draw anything yet. Reply only with a short confirmation that you understand the character and the rules.
```

> รอให้ AI ตอบยืนยันก่อน แล้วไปขั้น 1

## ขั้น 1 — สร้างภาพต้นแบบ (Master Reference) · 1 ภาพ

```text
Create the MASTER REFERENCE of Berserker (male) now, exactly as described in LOOK, DARK PALETTE and HAND RULE. Design it from scratch.
Follow the DARK TONE rules strictly: low-key lighting with deep shadows, muted dirty colors, tarnished gold, worn scratched metal, grime, a grim serious face with narrow eyes. It must look like grimdark dark-fantasy game art, not a bright cute anime or gacha character.
Weapons, shields and headwear are rigid objects with clean, well-defined shapes; this design will be copied 100% in every later image.
ONE image 1536x1024 landscape: three views of the same character side by side, full body, same size, feet on the same horizontal line, standing in the idle pose (greatsword resting on the right shoulder, blade pointing up and back behind the head):
left = S (facing the camera), middle = SW (three-quarter front, body turned toward the LEFT side of the image), right = N (back view, cloak/cape and the back of the headwear clearly visible).
Flat solid #FF00FF background, no floor, no shadow, no text, no labels, no frames.
```

1. ถ้าไม่ชอบ ตอบ `Redo` หรือบอกจุดที่ต้องแก้ (เช่น `Make the wings on the helmet bigger. Keep everything else.`) จนพอใจ
2. พอใจแล้วตอบในแชทว่า:
```text
This is the approved MASTER REFERENCE. From now on, every sprite sheet in this chat must match this image 100%: same face, hair, outfit, headwear, cloak, colors, and the exact same weapon and shield shapes.
```
3. ดาวน์โหลดภาพเก็บไว้เป็น `output\sprites-v4\master-refs\Berserker_male_master_ref_v2.png` และ**ส่งให้ผมดู** (แนะนำให้รอผมตอบก่อนเจนต่อ จะได้ไม่เสียแรงถ้าแบบต้องแก้)
4. ถ้าเจนไปหลายภาพแล้วตัวละครเริ่มเพี้ยน ให้แนบไฟล์ต้นแบบนี้กลับเข้าแชท แล้วพิมพ์ `Match this master reference exactly.`

- [ ] ได้ต้นแบบที่พอใจ บันทึกไฟล์แล้ว

## ขั้น 2 — เดิน (`walk`) · 8 เฟรม · 8 ภาพ

**2.1 ทิศ S** → บันทึกเป็น `berserker_male_walk_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.2 ทิศ SE** → บันทึกเป็น `berserker_male_walk_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.3 ทิศ E** → บันทึกเป็น `berserker_male_walk_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.4 ทิศ NE** → บันทึกเป็น `berserker_male_walk_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.5 ทิศ N** → บันทึกเป็น `berserker_male_walk_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.6 ทิศ NW** → บันทึกเป็น `berserker_male_walk_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.7 ทิศ W** → บันทึกเป็น `berserker_male_walk_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**2.8 ทิศ SW** → บันทึกเป็น `berserker_male_walk_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the WALK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: walking loop in place (the character does not travel across the cell): frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up. Legs clearly alternate, arms and cape counter-swing, small up-down body bob. Frame 8 must flow smoothly back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

- [ ] ครบ 8 ทิศของท่าเดิน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 3 — ตาย (`death`) · 8 เฟรม · 8 ภาพ

**3.1 ทิศ S** → บันทึกเป็น `berserker_male_death_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.2 ทิศ SE** → บันทึกเป็น `berserker_male_death_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.3 ทิศ E** → บันทึกเป็น `berserker_male_death_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.4 ทิศ NE** → บันทึกเป็น `berserker_male_death_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.5 ทิศ N** → บันทึกเป็น `berserker_male_death_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.6 ทิศ NW** → บันทึกเป็น `berserker_male_death_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.7 ทิศ W** → บันทึกเป็น `berserker_male_death_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

**3.8 ทิศ SW** → บันทึกเป็น `berserker_male_death_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the DEATH animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: death: frames 1-2 stagger back from a fatal blow, 3-4 knees buckle, 5-6 fall to the ground, 7-8 lying still on the ground. The weapon falls beside the body and never disappears.
```

- [ ] ครบ 8 ทิศของท่าตาย · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 4 — โดนตี (`hit`) · 4 เฟรม · 8 ภาพ

**4.1 ทิศ S** → บันทึกเป็น `berserker_male_hit_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction S (facing the camera, front view).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.2 ทิศ SE** → บันทึกเป็น `berserker_male_hit_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.3 ทิศ E** → บันทึกเป็น `berserker_male_hit_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.4 ทิศ NE** → บันทึกเป็น `berserker_male_hit_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.5 ทิศ N** → บันทึกเป็น `berserker_male_hit_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction N (back view, facing away from the camera).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.6 ทิศ NW** → บันทึกเป็น `berserker_male_hit_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.7 ทิศ W** → บันทึกเป็น `berserker_male_hit_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

**4.8 ทิศ SW** → บันทึกเป็น `berserker_male_hit_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the HIT animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 2 columns x 2 rows = 4 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1024x1024 square.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: hit reaction: frame 1 normal, 2 flinch backward from a blow (head and torso snap back), 3 still recoiling, 4 recovering toward idle. Feet stay planted.
```

- [ ] ครบ 8 ทิศของท่าโดนตี · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 5 — ยืน (`idle`) · 6 เฟรม · 8 ภาพ

**5.1 ทิศ S** → บันทึกเป็น `berserker_male_idle_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction S (facing the camera, front view).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.2 ทิศ SE** → บันทึกเป็น `berserker_male_idle_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.3 ทิศ E** → บันทึกเป็น `berserker_male_idle_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.4 ทิศ NE** → บันทึกเป็น `berserker_male_idle_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.5 ทิศ N** → บันทึกเป็น `berserker_male_idle_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction N (back view, facing away from the camera).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.6 ทิศ NW** → บันทึกเป็น `berserker_male_idle_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.7 ทิศ W** → บันทึกเป็น `berserker_male_idle_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

**5.8 ทิศ SW** → บันทึกเป็น `berserker_male_idle_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the IDLE animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 3 columns x 2 rows = 6 frames, equal cells 512x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: subtle breathing loop: chest rises and falls, cape and hair sway slightly, feet do not move. Frame 6 flows back into frame 1. Weapon pose: greatsword resting on the right shoulder, blade pointing up and back behind the head.
```

- [ ] ครบ 8 ทิศของท่ายืน · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 6 — โจมตีปกติ (`normal_attack`) · 8 เฟรม · 8 ภาพ

**6.1 ทิศ S** → บันทึกเป็น `berserker_male_normal_attack_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.2 ทิศ SE** → บันทึกเป็น `berserker_male_normal_attack_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.3 ทิศ E** → บันทึกเป็น `berserker_male_normal_attack_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.4 ทิศ NE** → บันทึกเป็น `berserker_male_normal_attack_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.5 ทิศ N** → บันทึกเป็น `berserker_male_normal_attack_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.6 ทิศ NW** → บันทึกเป็น `berserker_male_normal_attack_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.7 ทิศ W** → บันทึกเป็น `berserker_male_normal_attack_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

**6.8 ทิศ SW** → บันทึกเป็น `berserker_male_normal_attack_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the NORMAL ATTACK animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: basic attack: frames 1-2 lift the greatsword off the shoulder with both hands, 3-5 a huge overhead two-handed slam into the ground in front, 6-8 heave it back onto the shoulder.
```

- [ ] ครบ 8 ทิศของท่าโจมตีปกติ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 7 — สกิล (`skill`) · 10 เฟรม · 8 ภาพ

**7.1 ทิศ S** → บันทึกเป็น `berserker_male_skill_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction S (facing the camera, front view).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.2 ทิศ SE** → บันทึกเป็น `berserker_male_skill_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.3 ทิศ E** → บันทึกเป็น `berserker_male_skill_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.4 ทิศ NE** → บันทึกเป็น `berserker_male_skill_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.5 ทิศ N** → บันทึกเป็น `berserker_male_skill_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction N (back view, facing away from the camera).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.6 ทิศ NW** → บันทึกเป็น `berserker_male_skill_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.7 ทิศ W** → บันทึกเป็น `berserker_male_skill_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

**7.8 ทิศ SW** → บันทึกเป็น `berserker_male_skill_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the SKILL animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 5 columns x 2 rows = 10 frames, equal cells 307x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: skill "Carnage Cyclone": frames 1-3 swing the greatsword out to the side with both hands, 4-7 a full spinning cyclone slash, 8-10 stop and put it back on the shoulder. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าสกิล · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## ขั้น 8 — บัฟ (`buff`) · 8 เฟรม · 8 ภาพ

**8.1 ทิศ S** → บันทึกเป็น `berserker_male_buff_S_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction S (facing the camera, front view).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction S the character's RIGHT hand is on the IMAGE LEFT and the LEFT hand is on the IMAGE RIGHT; forward is toward the camera (down in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (toward the camera (down in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes toward the camera (down in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.2 ทิศ SE** → บันทึกเป็น `berserker_male_buff_SE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SE (three-quarter front, body turned toward the RIGHT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SE the character's RIGHT hand is on the IMAGE LEFT, on the near side toward the viewer and the LEFT hand is on the IMAGE RIGHT, partly behind the body; forward is down-right in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-right in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-right in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.3 ทิศ E** → บันทึกเป็น `berserker_male_buff_E_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction E (full side profile facing the RIGHT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction E the character's RIGHT hand is on the NEAR side, in front of the body toward the viewer and the LEFT hand is on the FAR side, partly hidden behind the body; forward is to the RIGHT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the RIGHT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the RIGHT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.4 ทิศ NE** → บันทึกเป็น `berserker_male_buff_NE_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NE (three-quarter back view, facing away toward the upper RIGHT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NE the character's RIGHT hand is on the IMAGE RIGHT, on the near side and the LEFT hand is on the IMAGE LEFT, partly hidden behind the body; forward is up-right in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-right in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-right in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.5 ทิศ N** → บันทึกเป็น `berserker_male_buff_N_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction N (back view, facing away from the camera).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction N the character's RIGHT hand is on the IMAGE RIGHT and the LEFT hand is on the IMAGE LEFT; forward is straight away from the camera (up in the image).
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (straight away from the camera (up in the image)) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes straight away from the camera (up in the image). The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.6 ทิศ NW** → บันทึกเป็น `berserker_male_buff_NW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction NW (three-quarter back view, facing away toward the upper LEFT).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction NW the character's RIGHT hand is on the IMAGE RIGHT, partly hidden behind the body and the LEFT hand is on the IMAGE LEFT, on the near side; forward is up-left in the image, away from the camera.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (up-left in the image, away from the camera) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes up-left in the image, away from the camera. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.7 ทิศ W** → บันทึกเป็น `berserker_male_buff_W_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction W (full side profile facing the LEFT edge of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction W the character's RIGHT hand is on the FAR side, partly hidden behind the body and the LEFT hand is on the NEAR side, in front of the body toward the viewer; forward is to the LEFT edge of the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (to the LEFT edge of the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes to the LEFT edge of the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

**8.8 ทิศ SW** → บันทึกเป็น `berserker_male_buff_SW_raw_v1.png`

```text
Using the approved MASTER REFERENCE of Berserker (male) from earlier in this chat:
Make a sprite sheet of the BUFF animation, direction SW (three-quarter front, body turned toward the LEFT side of the image).
Grid: 4 columns x 2 rows = 8 frames, equal cells 384x512, read left-to-right then top-to-bottom. Image size 1536x1024 landscape.
Same character size and the same feet position in every frame. Flat #FF00FF background, nothing else.
Hands: the greatsword rests on the RIGHT shoulder, the RIGHT hand holds the grip near the guard and the LEFT hand holds the pommel end; in attacks both hands grip the hilt. Do not mirror.
In direction SW the character's RIGHT hand is on the IMAGE LEFT, partly hidden behind the body and the LEFT hand is on the IMAGE RIGHT, on the near side toward the viewer; forward is down-left in the image.
Weapon direction: the greatsword rests on the RIGHT shoulder with the grip toward the front (down-left in the image) and the blade pointing BACKWARD, away from the facing direction; when attacking, the swing goes down-left in the image. The weapon turns with the body - never point it sideways out of the silhouette or switch sides.
Weapon shape: identical to the master reference 100% - rigid, never bent, warped, stretched or redesigned; a straight blade/shaft stays perfectly straight in every frame.
Motion: self-buff "Blood Howl": frames 1-4 plant the sword point-down, lean back, 5-8 roar to the sky with fists clenched. Draw no effects.
```

- [ ] ครบ 8 ทิศของท่าบัฟ · มือถืออาวุธถูกข้างทุกภาพ (ดูทิศ W / NW / SW เป็นพิเศษ) · พื้นหลังสีเดียวล้วน

## เสร็จแล้ว
ส่งข้อความบอกผมว่า "Berserker เสร็จท่า ... แล้ว" ส่งทีละท่าได้ ไม่ต้องรอครบทุกท่า
