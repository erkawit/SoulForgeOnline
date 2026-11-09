# SoulForge — ชุด Prompt สร้างภาพด้วย ChatGPT / Gemini (v4.1.0)

> ใช้คู่กับ `game_character_monster_boss_design_rules_v4.1.0.md` (กฎหลัก) — ไฟล์นี้คือ **ส่วน B (สเปกย่อ)** และ **ส่วน C (prompt รายชิ้น)**
> **อย่าวางกฎหลักทั้งไฟล์ให้ AI** ใช้ไฟล์นี้แทน

## A. วิธีใช้ (อ่านก่อนเจน)

1. **เปิดแชทใหม่ 1 แชทต่อ 1 ตัวละคร/มอนสเตอร์** แล้ววาง **ส่วน B** เป็นข้อความแรก
2. **ทำ Master Reference ก่อน** (C1 หรือ C4.1) → เลือกภาพที่ชอบ → บอกผมว่า `APPROVED` → ใช้ภาพนี้ **แนบทุกครั้ง** ที่เจนชีต
3. **เจนชีตทีละ 1 ท่า × 1 ทิศ ต่อ 1 ภาพ** (C2) — ตัวละคร 1 ตัว ท่า 1 ท่า = 8 ภาพ (8 ทิศ) **ห้ามขอให้กลับภาพ (mirror)**
4. ถ้าภาพผิด (มือสลับ, ทิศผิด, ตัวเล็ก/ใหญ่ไม่เท่าต้นแบบ, มีพื้นหรือเงา) **เจนใหม่ อย่าแก้ด้วยการกลับภาพ**
5. บันทึกเป็น PNG ตั้งชื่อตามข้อ A.1 วางในโฟลเดอร์ `soulforge-transfer\output\sprites-v4\<asset_id>\`
6. บอกผม → ผมรัน pipeline: ตัดพื้นหลัง → ปรับสเกล/จุดเท้า → ตัดเป็นช่อง 520×520 → สร้าง JSON → ตรวจ → ต่อเข้าเกม → ส่งภาพให้ดูก่อน

### A.1 การตั้งชื่อไฟล์ภาพดิบ
`<asset_id>_<gender>_<action>_<DIR>_raw_v1.png` เช่น `paladin_male_walk_SE_raw_v1.png`, `ash-hound_na_death_N_raw_v1.png`
ทิศ: `S SE E NE N NW W SW` · ท่า: `idle walk normal_attack skill_<id> buff_<id> hit death heavy_attack`

### A.2 ขนาดภาพที่สั่ง
- ChatGPT: เลือก **Landscape 1536 × 1024** (ชีต) / **Square 1024 × 1024** (Master, หีบ, ไอคอน)
- Gemini: ระบุ “1536 x 1024 landscape” ในข้อความ ถ้าได้ภาพไม่ตรงอัตราส่วน ให้ขอใหม่

---

## B. ART SPEC (วางเป็นข้อความแรกของทุกแชท — ภาษาอังกฤษ)

```text
You are producing game sprite art for "SoulForge", a 2.5D dark-fantasy MMORPG. Follow these rules in EVERY image of this chat:

STYLE: DARK FANTASY / GRIMDARK painted game art, in the mood of Diablo and Darkest Dungeon - NOT bright, NOT cute, NOT anime gacha, NOT glossy mobile-game style.
DARK TONE (mandatory for every character):
  - Low-key lighting: most of the figure sits in dark midtones and deep, almost black shadows; only the top-left lit edges and a few focal points (face, emblem, magic glow) are bright.
  - Muted, desaturated, dirty colors: tarnished antique gold (never bright yellow gold), dull scratched gunmetal steel (never shiny chrome), dark faded cloth, worn leather.
  - Wear and grime: scratches, dents, chipped edges, soot, mud on boots and hems, frayed and torn cloth edges.
  - Serious, grim, battle-hardened faces: smaller narrow eyes with heavy brows, no big sparkling anime eyes, no blush, no cute smile.
  - Heavy painterly brushwork with strong contrast between light and shadow.
Proportions: stylized semi-chibi, about 3 heads tall (big head, short body), but the mood stays dark and mature; armor, weapon, helmet, cloak and class symbols keep full detail.
CAMERA: fixed 3/4 top-down view, about 30 degrees above the horizon, orthographic (no perspective distortion). Same camera in every image.
LIGHT: key light from the TOP-LEFT of the image, warm; faint cool rim light on the right. NO cast shadow on the ground.
BACKGROUND: a perfectly flat solid #FF00FF magenta background filling the whole image (no gradient, no floor, no shadow, no vignette). 
  (If the character itself uses a lot of magenta/purple, I will ask for flat #00FF00 green instead.)
FORBIDDEN: text, numbers, labels, grid lines, frames, borders, watermarks, UI, scenery, ground plane, more than one character per cell, mirrored copies.
SPRITE SHEETS: exactly the grid I ask for, equal cells, ONE pose per cell, the whole body and weapon fully inside each cell with empty space around it,
  same character size and the same feet position in every cell, feet near the bottom of each cell.
CONSISTENCY: the attached master reference is the law — same face, hair, armor pieces, colors, patterns, weapon shape and size. Never redesign.
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
```

---

## C1. Master Reference — ตัวละครผู้เล่น (1024 × 1024)

```text
Create the MASTER REFERENCE for the player class [CLASS NAME], [male/female], chibi.
One image, three views of the same character side by side, standing in the idle pose: S (front), SE (three-quarter front), N (back).
Each view full body, same size, feet on the same horizontal line, empty space around. Flat #FF00FF background.
[PASTE THE CLASS BLOCK FROM C3]
```

## C2. ชีตท่าตัวละคร — 1 ท่า × 1 ทิศ (1536 × 1024)

```text
Using the attached master reference of [CLASS NAME] ([male/female]):
Make a sprite sheet of the [ACTION] animation, direction [DIR] ([paste the DIR wording from section B]).
Grid: 4 columns x 2 rows = 8 frames, read left-to-right then top-to-bottom, equal cells 384x512. [for 10 frames: 5 columns x 2 rows]
Same character size and same feet position in every frame. Flat #FF00FF background.
Hands: [PASTE THE HAND RULE FROM THE CLASS BLOCK]. Do not mirror.
Motion: [PASTE THE MOTION LINE FROM C2.1]
```

### C2.1 บรรทัด Motion ตามท่า (เลือกหนึ่งบรรทัดวางใน `Motion:`)

| ท่า | เฟรม | Motion |
|---|---:|---|
| `idle` | 6 (ใช้ 3×2) | `subtle breathing loop: chest rises and falls, cape and hair sway slightly, weapon held steady in the class idle pose, feet do not move` |
| `walk` | 8 | `walking loop in place: frame 1 left foot forward contact, 2 down, 3 passing, 4 up, 5 right foot forward contact, 6 down, 7 passing, 8 up; legs clearly alternate, arms/cape counter-swing, small up-down body bob, weapon kept in the class walk pose` |
| `normal_attack` | 8 | `basic attack: frames 1-2 wind-up, 3-5 strike with a clear swing arc/impact pose, 6-8 recover back to idle; weapon stays in the same hand(s)` |
| `skill_<id>` | 10 (5×2) | `skill [SKILL NAME]: frames 1-3 charge-up, 4-7 release [describe the move], 8-10 recover; draw only the character, no spell effects (effects are separate)` |
| `buff_<id>` | 8 | `self-buff: frames 1-4 gather power, raise focus/weapon, 5-8 release with a confident pose; no effects drawn` |
| `hit` | 4 (2×2, 1024×1024) | `hit reaction: flinch backward from a blow, then return; feet stay planted` |
| `death` | 8 | `death: stagger, knees buckle, fall to the ground, last frame lying still; weapon falls beside the body, never disappears` |

> **เอฟเฟกต์สกิล** (ไฟ สายฟ้า แสง) **ไม่วาดในชีตตัวละคร** — สั่งแยกด้วย C6.4

## C3. Class blocks (วางใน C1 และใช้ HAND RULE ใน C2)

> ชุดบังคับ v4.1: ผ้าคลุม = Paladin, Berserker, Assassin, Hawkeye · ของสวมหัว = ทุกอาชีพ ยกเว้น Elementalist และ RuneMaster (Hawkeye/Assassin ใช้ฮู้ด) — ดูกฎหลักข้อ 17.6

**C3.1 Paladin**
```text
CLASS: Paladin (holy knight). Short brown hair, blue eyes. Open-face silver helmet with a pair of white-and-silver bird wings on BOTH sides. Silver plate armor with gold trim and gold wing engravings on the pauldrons, deep blue tabard with a golden sun emblem, long deep-blue cape with a golden sun on the back. Deep blue kite shield with a golden sun and a pair of spread wings rising from its TOP edge. Longsword with a WINGED crossguard (two small metal wings between the blade and the grip). Accent glow #ffe08a.
HAND RULE: one-handed sword in the character's RIGHT hand; kite shield on the character's LEFT arm. Never swap.
IDLE: shield held naturally at the left side, face of the shield upright (not flat to the ground), tip pointing down; sword lowered forward at the right side.
WALK: same as idle with natural arm swing; shield stays upright.
ATTACK: shield raised to a vertical guard in front, sword strikes; shield bash = push with the shield face while still holding the sword.
```
**C3.2 Berserker**
```text
CLASS: Berserker. Long wild red hair and full red beard, black iron horned helmet (two thick curved horns, open face), bare scarred muscular chest, black spiked iron pauldron and arm guards, heavy dark-brown wolf-fur pelt cloak down to the knees, fur loincloth, black boots. Huge dark-steel greatsword. Accent #ff4a3a.
HAND RULE: one two-handed greatsword gripped with BOTH hands.
IDLE/WALK: both hands on the hilt, the blade held horizontal (parallel to the ground) and pointing BEHIND the character; when the character turns, the blade keeps pointing to the character's back.
ATTACK: big two-handed swings and overhead slams.
```
**C3.3 Hawkeye (ARCHER)**
```text
CLASS: Hawkeye (archer). Light agile leather armor, hood over the head, short cape on the back, quiver on the back. Colors: forest green, brown leather. Accent #8bdb9a.
HAND RULE: longbow held in the character's LEFT hand, an arrow nocked and held on the string by the RIGHT hand at all times in idle and walk.
IDLE/WALK: bow tilted 45 degrees downward toward the front, arrow ready.
ATTACK: draw and release; bow, string, arrow and hands line up correctly.
```
**C3.4 HighPriest (PRIEST)**
```text
CLASS: HighPriest (holy priest). Soft blond hair, tall cream-white and gold mitre (bishop hat) with a gold cross, long cream-white and gold robes with heavy gold embroidery and wide sleeves. Accent #ffdb86.
HAND RULE: golden cross-shaped holy sceptre in the character's RIGHT hand; a glowing golden light orb floating above the open LEFT palm. Both always present.
IDLE/WALK: sceptre upright at the right side, book held against the chest/at the waist on the left.
```
**C3.5 Elementalist**
```text
CLASS: Elementalist (mage). Layered mage robes in violet and dark purple with arcane trim, pointed collar. Accent #b685ff. (Use the #00FF00 green background for this class.)
HAND RULE: magic staff.
IDLE: staff held in the RIGHT hand only, perfectly vertical, crystal head pointing up to the sky, bottom tip touching the ground.
WALK: staff held with BOTH hands, tilted 45 degrees from upper-left to lower-right in the character's frame; LEFT hand grips higher, RIGHT hand grips lower.
Robe hem must swing and the boot tips must show so the steps are visible.
```
**C3.6 Inquisitor**
```text
CLASS: Inquisitor. Robes cut like the priest's but RED and black, wide-brimmed hat, leather straps, lightning motifs. Accent #ffb35c.
HAND RULE: one-handed thunder hammer in the character's RIGHT hand; shield on the character's LEFT arm. Never swap.
IDLE/WALK: shield at the left side, face upright; hammer lowered at the right side, faint lightning.
```
**C3.7 Assassin**
```text
CLASS: Assassin. Black hood with dark purple lining, cloth mask over the lower face, short ragged black cloak with purple lining (shoulders to mid-thigh, torn hem), black leather and dark-metal light armor with straps, purple sash. Accent #c97bff. (Use the #00FF00 green background for this class.)
HAND RULE: one dagger in EACH hand (left and right). Both daggers always present.
IDLE/WALK: crouched ready stance, daggers held low, reverse grip allowed.
```
**C3.8 RuneMaster — PROPOSED (รอ APPROVED ก่อนเจนชุดจริง)**
```text
CLASS: RuneMaster (rune swordsman). Long dark-teal and navy coat with golden rune embroidery, sash, light shoulder plates, dark hair. Accent #62dfdf.
HAND RULE: one-handed rune sword in the character's RIGHT hand; glowing rune stone held in the character's LEFT hand.
IDLE/WALK: sword pointing down-forward at the right side; rune stone raised at waist height in the left hand with a soft teal glow.
```

---

## C4. มอนสเตอร์และบอส

### C4.1 Master มอนสเตอร์ (1024 × 1024)
```text
Create the MASTER REFERENCE for the monster [NAME], family [HUMANOID/BEAST/UNDEAD/DEMON/...], rank [normal/elite], size [small/medium/large].
Look: [describe body, limbs, head, tail/wings, material, colors]. Attack uses: [claws/bite/weapon in which hand].
Three views side by side: S, SE, N. Same camera and light as section B. Flat #FF00FF background. Not chibi unless stated.
```
### C4.2 ชีตมอนสเตอร์ (1536 × 1024)
```text
Using the attached master reference of [NAME]: sprite sheet of [idle/walk/normal_attack/heavy_attack/death], direction [DIR].
Grid 4 x 2 = 8 frames (idle: 3 x 2 = 6; heavy_attack: 5 x 2 = 10). Same size and feet position in every frame. Flat #FF00FF background.
Motion: [walk: legs alternate naturally for this body type | attack: wind-up, bite/claw/strike, recover | heavy_attack: bigger wind-up, ground slam with a small impact area, recover | death: collapse and lie still on the last frame].
Body parts (legs, tail, wings, horns) must turn with the direction; do not mirror.
```
### C4.3 บอส (1024 × 1024 ต่อภาพ, 2 × 2 = 4 เฟรมต่อภาพ — ท่า 8 เฟรมใช้ 2 ภาพ)
```text
Using the attached boss master reference [BOSS NAME] (boss type [map_boss/dungeon_boss]): frames [1-4 / 5-8] of [ACTION/SKILL NAME], direction [DIR].
Grid 2 x 2, equal cells 512x512. The boss is large: keep the whole body inside each cell with margin; same size in every frame. Flat #FF00FF background.
Skill motion: [describe anticipation, impact, recovery]. Draw the warning circle / spell effects in a SEPARATE request.
```

---

## C5. แผนที่ (ทุ่งใหม่ 240 × 240 ม.)

### C5.1 ผังรวม — 1536 × 1024
```text
Top-down 3/4 isometric overview map (about 30 degrees, same camera as our characters) of a large open dark-fantasy hunting field for an MMORPG, painted gothic grimdark style.
The playable area is one wide diamond filling the canvas edge to edge, pure black outside the diamond.
Layout: one large open central plaza (about one sixth of the width), 3-4 smaller clearings, wide light dirt roads connecting them, 30 open hunting pockets spread evenly. Keep at least 60% open walkable ground.
Obstacles only in clusters at the edges and between pockets: [THEME].
A clear gate/archway at the [top/right/bottom/left] corner with a small safe plaza.
No characters, no monsters, no text, no UI, no labels, no grid. Even lighting, crisp edges. Landscape 1536x1024.
```
THEME ของแต่ละทุ่งดูได้ใน `ROUND23_FARM_MAPS_TH.md` ข้อ 3

### C5.2 พื้นลายต่อเนื่อง — 1024 × 1024
```text
Seamless tileable ground texture for a dark-fantasy isometric game, seen straight from above, [dead dry grass with dark soil patches | packed light-brown dirt road with pebbles | worn grey flagstone with cracks and moss | grey volcanic ash with cinders | wet dark mud with puddles | rocky ground with small stones].
Painted, muted grimdark palette, medium detail, no large single features, no shadows from outside objects, no text. Must tile perfectly on all four edges. Square 1024x1024.
```

### C5.3 ของประกอบฉาก — 1536 × 1024
```text
Sprite sheet of 12 separate dark-fantasy props, grid 4 x 3 equal cells, each object isolated with empty space, same 30-degree 3/4 camera and top-left light as section B, flat #FF00FF background, no ground plane, no shadows, no text.
Objects: [e.g. dead black tree x3, broken tombstone x3, stone sarcophagus, ruined chapel wall, iron fence segment, ember brazier, bone pile, stone angel statue].
```

---

## C6. หีบ ไอคอน ป้าย NPC และเอฟเฟกต์

### C6.1 หีบดรอป — 1024 × 1024 (หีบ 4 ใบ/ภาพ, 2 × 2)
```text
Four loot chests for a dark-fantasy isometric game, grid 2 x 2 equal cells, same 30-degree 3/4 camera, flat #FF00FF background, no shadows, no text.
All four show the [WEAPON: crossed swords over a shield | ARMOR: chest armor | ACCESSORY: ring] emblem on the front, readable from above.
Rarity per cell (top-left, top-right, bottom-left, bottom-right): [Common white | Uncommon green | Rare light blue | Epic purple] (second image: [Legendary red | God gold | Pre-Arch flame orange | Arch sparkling violet with unique crystal shards]).
Each higher rarity is more ornate: better materials, metal trim, glow; Arch must look clearly different from Epic, not only by color.
```
(3 ประเภท × 2 ภาพ = 6 ภาพ ได้ครบ 24 หีบ)

### C6.2 ไอคอนไอเทม — 1536 × 1024 (8 tier, 4 × 2)
```text
Eight inventory icons of the same item type: [one-handed holy sword for Paladin], tiers 1 to 8 left-to-right, top-to-bottom, each more ornate than the last (tier 1 plain iron ... tier 8 legendary relic).
One object per cell, centered, 3/4 angle, top-left light, flat #FF00FF background, no frame, no rarity border, no text.
```

### C6.3 ป้าย NPC — 1024 × 1024 (4 ป้าย/ภาพ, 2 × 2)
```text
Four floating wooden shop signs shaped like a heater shield, carved dark wood with iron rim, each with a painted service symbol: [basket | crossed swords and anvil | hammer and anvil | chest armor] (other sets: [ring | crafting tools | treasure chest | quest scroll with exclamation mark | warp portal ring]).
Front view, flat #FF00FF background, no text, no shadows.
```

### C6.4 เอฟเฟกต์สกิล — 1536 × 1024 (8 เฟรม 4 × 2)
```text
Spell effect animation only (no character): [describe: e.g. teal rune pillar erupting from the ground, 3 m tall, golden runes orbiting].
Grid 4 x 2 = 8 frames: 1-2 appear, 3-5 peak, 6-8 fade. Same 30-degree camera. Pure flat BLACK background (the game blends it additively). No text.
Main color [class accent].
```

---

## D. เช็กก่อนส่งให้ผม
- [ ] ภาพต้นแบบได้ `APPROVED` แล้ว และแนบต้นแบบทุกครั้งที่เจนชีต
- [ ] 1 ไฟล์ = 1 ท่า × 1 ทิศ ชื่อไฟล์ตามข้อ A.1
- [ ] พื้นหลังเป็นสีเดียวล้วน (#FF00FF หรือ #00FF00; VFX ใช้ดำ) ไม่มีพื้น/เงา/ตัวหนังสือ
- [ ] มือถืออาวุธถูกข้างทุกเฟรม โดยเฉพาะทิศ W / NW / SW
- [ ] อาวุธชี้ไปทางที่ตัวละครหัน และรูปทรงเหมือนต้นแบบ 100% (ไม่บิด ไม่งอ ไม่ยืด ไม่เปลี่ยนแบบ)
- [ ] ครบ 8 ทิศ (ไม่มีการกลับภาพ)
- [ ] ตัวละครไม่ล้นช่องและขนาดดูเท่ากันทุกเฟรม
