# Round 23 — แผนที่ฟาร์มมอนสเตอร์ใหม่ (รองรับ 100 คน/แชแนล) + prompt เจนภาพ

## 0. ทำไมต้องทำใหม่
แผนที่ทุ่งตอนนี้ (เช่น `public/art/world/hollow/field-bottom.webp`) มีปัญหา 3 อย่าง:
1. **เล็ก:** ทุ่งกว้าง 140 × 140 ม. มีจุดล่าแค่ 10 จุด ถ้าคน 100 คนอยู่แชแนลเดียวกัน จะได้พื้นที่คนละราว 14 × 14 ม. ซึ่งแน่นเกินไป
2. **ภาพเบลอ:** ภาพวาดกว้าง 1280 px ถูกยืดให้เต็ม 140 ม. ได้ความละเอียดแค่ราว 9 px ต่อเมตร พอซูมกล้องแล้วภาพจะเบลอ
3. **เป็นภาพย่อส่วน (diorama):** ในภาพอัดบ้าน รั้ว และหลุมศพไว้แน่น ทางเดินจึงแคบ ไม่มีที่โล่งให้คนหลายคนยืนตีมอนพร้อมกัน

## 1. ขนาดที่แนะนำ
| | ตอนนี้ | ใหม่ |
|---|---|---|
| ขนาดทุ่ง | 140 × 140 ม. | **240 × 240 ม.** (≈ 57,600 ตร.ม.) |
| พื้นที่ต่อผู้เล่น (100 คน) | ~196 ตร.ม. | **~576 ตร.ม.** (≈ 24 × 24 ม.) |
| จุดล่า (กลุ่มมอนสเตอร์) | 10 | **28–32 จุด** จุดละ 4–6 ตัว |
| มอนสเตอร์ต่อแชแนล | 10 | **~150 ตัว** (1.5 ตัวต่อผู้เล่น) |
| ลานกว้าง (บอส/รวมพล) | ไม่มี | ลานกลาง 1 ลาน กว้าง 40 ม. + ลานย่อย 3–4 ลาน |
| ทางเดินหลัก | แคบ | กว้าง 8–12 ม. |

## 2. วิธีสร้างพื้น — ไม่ใช้ภาพเดียวยืดเต็มแผนที่อีก
ภาพเดียวขนาด 240 ม. จะชัดได้ต้องกว้างราว 7,680 px ซึ่ง ChatGPT/Gemini เจนไม่ได้ จึงแยกเป็น 3 ชั้น:
1. **ภาพผังรวม (overview)** 1 ภาพต่อทุ่ง ขนาด 1536 × 1024 ใช้เป็นแผนที่โลก แผนที่ย่อ และใช้ลากเส้นทางเดิน/ลาน/ขอบเขต (navigation plan)
2. **พื้นแบบลายต่อเนื่อง (seamless tile)** ภาพละ 1024 × 1024 ปูซ้ำได้ไม่เห็นรอยต่อ วัสดุละ 1 ภาพ เช่น หญ้าตาย ดินทางเดิน หินลาน เถ้า โคลน เกมจะผสมวัสดุตามผังในข้อ 1 ให้ชัดเท่ากันทั้งแผนที่
3. **ของประกอบฉาก (props)** ต้นไม้ หิน ซากกำแพง หลุมศพ เสาไฟ ทำเป็นภาพแยกพื้นหลังดำ เกมจะตัดพื้นหลังแล้ววางตามผังให้เอง ของประกอบฉากเป็นสิ่งกีดขวาง ตัวละครต้องเดินอ้อม

> ฝั่งเกมต้องเพิ่มตัววาดพื้นแบบผสมวัสดุ (splat ground) และตัววาง props ก่อน (ราว 1 รอบงาน) ภาพจากข้อ 1–3 เริ่มเจนเตรียมไว้ได้เลย

## 3. Prompt — ภาพผังรวมทุ่ง (1 ภาพต่อทุ่ง · 1536 × 1024)
แม่แบบ (เปลี่ยนเฉพาะ `[THEME]`):
```
Top-down isometric overview map of a large open dark-fantasy hunting field for an MMORPG, 2.5D painted style matching a gothic grimdark game (muted desaturated palette, warm torch-orange and cold teal accents).
The playable area is a single wide diamond (isometric square) filling the canvas edge to edge, pure black outside the diamond.
Layout: one large open central plaza (about one sixth of the width), 3–4 smaller clearings, wide dirt main roads (clearly lighter than the ground) connecting them, and 30 open grassy hunting pockets spread evenly across the whole area. Keep at least 60% of the area OPEN walkable ground.
Obstacles only as clusters at the edges and between pockets: [THEME].
A clearly visible gate/archway at the [GATE SIDE] corner where players enter.
No characters, no monsters, no text, no UI, no labels, no grid. Even lighting, readable from far away, crisp edges.
Landscape 1536x1024.
```
`[THEME]` และ `[GATE SIDE]` ของแต่ละทุ่ง:
| ทุ่ง | THEME | GATE SIDE |
|---|---|---|
| wild0 สุสานเถ้าถ่าน | ash-covered graveyard, broken tombstones, dead black trees, small ruined chapels, ember braziers | top |
| wild1 ทุ่งกระดูกเงียบ | pale bone-strewn plains, giant ribcages, cracked earth, lonely dead trees | right |
| wild2 หนองวิญญาณ | misty swamp with shallow teal water channels, twisted mangroves, wooden boardwalks, glowing will-o-wisps | left |
| wild3 เหมืองมรกตต้องสาป | abandoned emerald mine, mine carts and rails, rocky cliffs, glowing green crystal veins | bottom |
| wild4 สวนคำสาบาน | overgrown ruined oath garden, broken statues, thorn hedges, dry fountains | right |
| wild5 บันไดแห่งคำพิพากษา | wide stone terraces and stairways, fallen pillars, judgement statues, banners | bottom |
| wild6 คลองแสงดับ | dark canals with stone bridges, extinguished lanterns, collapsed warehouses | left |
| wild7 ทุ่งอรุณร้าง | abandoned dawn farmland, burned windmills, broken fences, haystacks | top |
| wild8 ป่าหนามอสูร | demon thorn forest, giant red-black thorn vines, bone totems | left |
| wild9 ช่องเขารากมังกร | mountain pass, huge dragon-root formations, cliffs, rope bridges | bottom |

ดันเจี้ยน (1 ภาพ · ใช้แม่แบบเดียวกัน แต่เปลี่ยนประโยคแรกเป็น `...overview map of a large dark-fantasy dungeon hall complex` และ THEME เป็น):
- dungeon1 ถ้ำมรกต: `cavern chambers with emerald crystal clusters and underground pools`
- dungeon2 มหาวิหารพิพากษา: `vast cathedral nave and side chapels, broken pews, stained glass light pools`
- dungeon3 ถ้ำมังกร: `volcanic dragon caves, lava cracks, giant bones, scorched rock`

## 4. Prompt — พื้นแบบต่อเนื่อง (seamless · 1024 × 1024)
```
Seamless tileable ground texture for a dark-fantasy isometric game, viewed straight from above, [MATERIAL].
Muted grimdark palette, painted (not photo), medium detail that still reads at small scale, no large single features, no shadows from off-tile objects, no text.
Must tile perfectly on all four edges. Square 1024x1024.
```
`[MATERIAL]` ชุดที่ต้องใช้:
1. `dead dry grass with patches of dark soil`
2. `packed light-brown dirt road with small pebbles and cart ruts`
3. `worn grey flagstone plaza with cracks and moss`
4. `grey volcanic ash with scattered cinders`
5. `wet dark mud with shallow puddles`
6. `rocky ground with scattered small stones`

ทุ่งแต่ละธีมใช้วัสดุเหล่านี้ 3–4 ชนิด และเติมโทนสีตามธีม (เช่น หนองใช้โคลนกับหญ้าอมเขียว)

## 5. Prompt — ของประกอบฉาก (props · ชุดละภาพ)
```
Sprite sheet of [N] separate dark-fantasy isometric props for a 2.5D game, each object isolated with generous empty space around it, on a pure black background, same isometric camera angle (about 30 degrees from above), soft top-left light, painted grimdark style, no ground plane, no shadows on the background, no text.
Objects: [LIST].
Grid [COLS]x[ROWS], equal cells. Landscape 1536x1024.
```
ตัวอย่าง `[LIST]` (ใส่ `[N]`=12, grid 4×3):
- สุสาน: `dead black tree (3 variants), broken tombstone (3 variants), stone sarcophagus, ruined chapel wall, iron fence segment, ember brazier, bone pile, stone angel statue`
- หนอง: `twisted mangrove (3), wooden boardwalk piece (2), rotten log, reed cluster (2), lantern post, mossy rock (3)`
- เหมือง: `mine cart, rail segment (2), wooden scaffold, green crystal cluster (3), boulder (3), lantern post, ore pile`

## 6. ส่งไฟล์ให้ผมอย่างไร
วางไฟล์ใน `C:\Users\user\Documents\SoulForge Online\soulforge-transfer\output\maps-v2\<field-id>\`
- `overview.png`
- `tile-<material>.png`
- `props-<n>.png`

แล้วบอกผม ผมจะทำต่อ:
- ลากผังทางเดินจากภาพผังรวม
- สร้างตัววาดพื้นแบบผสมวัสดุ
- ตัดและวาง props
- ขยายแผนที่เป็น 240 ม.
- เพิ่มจุดเกิดมอนสเตอร์เป็น ~30 กลุ่ม
- ทดสอบในเบราว์เซอร์และส่งภาพให้ดูก่อน

## 7. ข้อควรรู้เรื่องผู้เล่น 100 คน
ตอนนี้มอนสเตอร์ในทุ่งยังจำลองบนเครื่องของผู้เล่นแต่ละคน (server ดูแลแค่บอสโลก) ผู้เล่นในแชแนลเดียวกันจึง **ไม่ได้เห็นหรือแย่งมอนสเตอร์ตัวเดียวกัน**
ถ้าต้องการให้แย่งมอนสเตอร์กันจริงแบบ MMO ต้องย้ายการเกิดและการตายของมอนสเตอร์ไปไว้บน server (realm) ต่อแชแนล ซึ่งเป็นงานใหญ่อีกชิ้น ควรตัดสินใจก่อนเปิดเบต้าวงกว้าง
