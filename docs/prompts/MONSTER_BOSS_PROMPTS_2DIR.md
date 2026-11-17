# Prompt มอนสเตอร์ / Elite / บอส — Master Reference + หันขวา + หันซ้าย

สร้างจาก `scripts/sprites/monster_prompts.mjs` — แก้ที่สคริปต์แล้วรันใหม่

## ขั้นตอน (ทำตามลำดับ ห้ามข้าม)

1. **สร้าง Master Reference ก่อน 1 ภาพ** (prompt “MASTER” ของตัวนั้น) แนบภาพตัวเดิมในเกมเป็นแนวทางได้ เลือกภาพที่ดีที่สุดแล้วบันทึกเป็น `reference/sprites-2dir/<id>/master.png` — **ภาพนี้คือแบบเดียวที่ใช้ต่อทั้งหมด**
2. **ทุกเฟรมต่อจากนี้ แนบ master.png ภาพเดียว** (ห้ามแนบภาพอื่น) แล้วใช้ prompt ของท่านั้น
3. **สร้างทีละ 1 เฟรมต่อภาพ** — ใน prompt เหลือบรรทัด “frame k/n” แค่บรรทัดเดียวของเฟรมที่จะสร้าง ขนาดภาพ ขนาดตัว และเส้นเท้าต้องเท่ากับ master ทุกภาพ
4. บันทึก `reference/sprites-2dir/<id>/<right|left>/<idle|walk|attack|skill>/01.png, 02.png …`
5. รัน `python scripts/sprites/build_sheet_2dir.py <id>` — สคริปต์ตัดพื้นเขียว จัดเท้าให้ตรงกับ master เตือนถ้าขนาดตัวไม่เท่า master แล้ววางแต่ละเฟรมในช่อง **กว้าง 4 เท่า และสูง 4 เท่าของตัวใน master** (ตัวอยู่กลางช่อง เว้นทุกด้าน 1.5 เท่าของตัว) ได้ชีตตรวจ `sheet-right.png` / `sheet-left.png` และชีตเกม

| ประเภท | ขนาดภาพที่สร้าง | ความสูงตัว (เท่ากับ master ทุกภาพ) | ยืน | เดิน | โจมตี | สกิล |
|---|---|---|---|---|---|---|
| monster | 1024×1024 | 340 px | 4 | 6 | 6 | 6 |
| elite | 1024×1024 | 442 px | 4 | 6 | 6 | 6 |
| boss | 2048×2048 | 1020 px | 6 | 8 | 8 | 10 |

บอสสูง 1,020 px = 3 เท่าของมอนสเตอร์ทั่วไป (340 px). หันซ้ายสร้างแยกจริง — อาวุธ/ของในมือ **อยู่มือเดิม** (เช่น เคียวมือขวาเสมอ) ไม่สลับมือเหมือนการกลับภาพ

## บอส

### Grave Marshal (จอมพลสุสาน) — `grave-marshal`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: towering minotaur-like undead warlord: dark horned bull head, black iron armor with skull ornaments, torn crimson cape, giant cleaver axe.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 2048x2048 px square canvas. The character is exactly 1020 px tall (a boss: three times the height of a normal monster or a hero), feet on a horizontal line 1597 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/8: contact: front foot just touching down, back foot behind
  frame 2/8: down: weight on the front foot, body at its lowest
  frame 3/8: passing: back foot passing under the body
  frame 4/8: up: body at its highest, pushing off
  frame 5/8: contact with the other foot in front
  frame 6/8: down on the other foot
  frame 7/8: passing the other foot
  frame 8/8: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/8: contact: front foot just touching down, back foot behind
  frame 2/8: down: weight on the front foot, body at its lowest
  frame 3/8: passing: back foot passing under the body
  frame 4/8: up: body at its highest, pushing off
  frame 5/8: contact with the other foot in front
  frame 6/8: down on the other foot
  frame 7/8: passing the other foot
  frame 8/8: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — two-handed overhead cleaver chop; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — two-handed overhead cleaver chop; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises the cleaver and slams it into the ground, a cracking red shockwave and flying grave stones; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises the cleaver and slams it into the ground, a cracking red shockwave and flying grave stones; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Drowned Hierophant (มหาปุโรหิตจมน้ำ) — `drowned-hierophant`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade always held in his RIGHT hand and a glowing green soul-lantern on a chain always held in his LEFT hand, both items visible in every frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 2048x2048 px square canvas. The character is exactly 1020 px tall (a boss: three times the height of a normal monster or a hero), feet on a horizontal line 1597 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/8: body at its lowest point of the bob, trailing parts streaming back
  frame 2/8: rising, trailing parts curling
  frame 3/8: rising, trailing parts curling
  frame 4/8: highest point of the bob
  frame 5/8: starting to sink, trailing parts lifting
  frame 6/8: sinking
  frame 7/8: sinking
  frame 8/8: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/8: body at its lowest point of the bob, trailing parts streaming back
  frame 2/8: rising, trailing parts curling
  frame 3/8: rising, trailing parts curling
  frame 4/8: highest point of the bob
  frame 5/8: starting to sink, trailing parts lifting
  frame 6/8: sinking
  frame 7/8: sinking
  frame 8/8: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — sweeps the scythe from back to front in a wide arc toward the right, leaving a ghostly green slash trail; the lantern stays in the left hand; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — sweeps the scythe from back to front in a wide arc toward the left, leaving a ghostly green slash trail; the lantern stays in the left hand; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises the lantern in the left hand while the right hand plants the scythe, a huge vortex of drowned green souls swirls up in front of him on the right side; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises the lantern in the left hand while the right hand plants the scythe, a huge vortex of drowned green souls swirls up in front of him on the left side; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Worldroot Devourer (อสูรกลืนรากโลก) — `worldroot-devourer`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 2048x2048 px square canvas. The character is exactly 1020 px tall (a boss: three times the height of a normal monster or a hero), feet on a horizontal line 1597 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running.
Frame to draw (replace with one line per image):
  frame 1/8: contact: front foot just touching down, back foot behind
  frame 2/8: down: weight on the front foot, body at its lowest
  frame 3/8: passing: back foot passing under the body
  frame 4/8: up: body at its highest, pushing off
  frame 5/8: contact with the other foot in front
  frame 6/8: down on the other foot
  frame 7/8: passing the other foot
  frame 8/8: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running.
Frame to draw (replace with one line per image):
  frame 1/8: contact: front foot just touching down, back foot behind
  frame 2/8: down: weight on the front foot, body at its lowest
  frame 3/8: passing: back foot passing under the body
  frame 4/8: up: body at its highest, pushing off
  frame 5/8: contact with the other foot in front
  frame 6/8: down on the other foot
  frame 7/8: passing the other foot
  frame 8/8: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — massive bite and claw rake forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — massive bite and claw rake forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — violet root-fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the violet-black fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; on the strongest frames small dark roots burst from the ground under the end of the flame, in front of the dragon; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — violet root-fire breath — the head and neck stretch FORWARD toward the left and the jaws open wide; the violet-black fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the left edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; on the strongest frames small dark roots burst from the ground under the end of the flame, in front of the dragon; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Abyssal Forge Titan (ไททันเตาหลอมนรก) — `abyssal-forge-titan`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 2048x2048 px square canvas. The character is exactly 1020 px tall (a boss: three times the height of a normal monster or a hero), feet on a horizontal line 1597 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/6: neutral ready stance
  frame 2/6: breathing in, chest slightly raised
  frame 3/6: top of the breath, cloth / fur / wisps lifted a little
  frame 4/6: breathing out, settling
  frame 5/6: back down, almost the neutral stance
  frame 6/6: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/8: contact: front foot just touching down, back foot behind
  frame 2/8: down: weight on the front foot, body at its lowest
  frame 3/8: passing: back foot passing under the body
  frame 4/8: up: body at its highest, pushing off
  frame 5/8: contact with the other foot in front
  frame 6/8: down on the other foot
  frame 7/8: passing the other foot
  frame 8/8: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/8: contact: front foot just touching down, back foot behind
  frame 2/8: down: weight on the front foot, body at its lowest
  frame 3/8: passing: back foot passing under the body
  frame 4/8: up: body at its highest, pushing off
  frame 5/8: contact with the other foot in front
  frame 6/8: down on the other foot
  frame 7/8: passing the other foot
  frame 8/8: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — giant hammer-arm smash forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 8 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — giant hammer-arm smash forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/8: ready stance
  frame 2/8: wind-up: weapon / claws / head pulled back
  frame 3/8: start of the strike moving forward
  frame 4/8: strike: full reach forward, motion trail
  frame 5/8: impact: hit effect at the end of the reach
  frame 6/8: follow-through
  frame 7/8: recovering
  frame 8/8: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — slams both arms down, a ring of magma bursts outward and lava geysers erupt forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 10 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — slams both arms down, a ring of magma bursts outward and lava geysers erupt forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/10: ready stance
  frame 2/10: gathering power, first glow
  frame 3/10: power building, pose tightens
  frame 4/10: peak of the wind-up
  frame 5/10: release begins
  frame 6/10: full release: strongest effect
  frame 7/10: effect at its widest
  frame 8/10: effect fading
  frame 9/10: recovering
  frame 10/10: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 1020 px tall on the same 2048x2048 px canvas, feet on the same line 1597 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

## Elite

### Oathscar Aurochs (กระทิงตราคำสาบาน) — `oathscar-aurochs`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: massive brown aurochs bull with shaggy shoulders, wide curved horns and glowing scar runes on the flank.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 442 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — horn thrust forward with a heavy head swing; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — horn thrust forward with a heavy head swing; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — stamps the ground, runes flare red and a quaking shockwave ring spreads forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — stamps the ground, runes flare red and a quaking shockwave ring spreads forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Tide Wraith (วิญญาณน้ำขึ้น) — `tide-wraith`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: hooded sea-green wraith of tattered robes and seaweed, glowing teal eyes, holding a coral-and-driftwood staff.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 442 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — swipes the staff forward releasing a splash of dark water; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — swipes the staff forward releasing a splash of dark water; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises the staff, a swirling whirlpool of teal water erupts in front of it; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises the staff, a swirling whirlpool of teal water erupts in front of it; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Root Reaper (เคียวรากไม้) — `root-reaper`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: dark thorny root creature on six spindly root legs, purple glowing core, two scythe-like root claws.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 442 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — slashes forward with both root scythes; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — slashes forward with both root scythes; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — stabs its legs into the ground, purple thorn roots burst up in a line in front of it; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — stabs its legs into the ground, purple thorn roots burst up in a line in front of it; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 442 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

## มอนสเตอร์ทั่วไป

### Grave Crawler (แบดเจอร์สุสาน) — `grave-crawler`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: stocky badger with grey-black fur and a pale stripe down the back, short legs, long claws, snarling.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — lunges forward and rakes with both front claws; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — lunges forward and rakes with both front claws; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — rears up and slams down, a burst of grave dust and bone shards; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — rears up and slams down, a burst of grave dust and bone shards; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Ash Hound (สุนัขเถ้า) — `ash-hound`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: lean grey wolf-hound with ash-streaked fur, bristling mane, bared fangs, smoky embers in the fur.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — snapping bite forward with a quick head lunge; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — snapping bite forward with a quick head lunge; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — howls, then leaps forward trailing a short cone of glowing ash; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — howls, then leaps forward trailing a short cone of glowing ash; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Bone Sentinel (หมูป่ากระดูก) — `bone-sentinel`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: hulking dark wild boar with coarse black bristles, scarred hide and long pale tusks.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — tusk gore: head drops and sweeps up; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — tusk gore: head drops and sweeps up; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — paws the ground and charges a short distance, dust cloud and shockwave at the end; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — paws the ground and charges a short distance, dust cloud and shockwave at the end; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Briar Wolf (หมาป่าหนามไม้) — `briar-wolf`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: green-brown wolf with mossy fur and thorny briar growing along its back, amber eyes.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — quick bite and claw swipe forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — quick bite and claw swipe forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — snarls, thorn spikes burst from its back and fly forward in a short fan; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — snarls, thorn spikes burst from its back and fly forward in a short fan; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Thorn Spider (แมงมุมหนาม) — `thorn-spider`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: large brown hairy spider with thorny spines on its abdomen and legs, many small glinting eyes.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — rears up and strikes forward with front legs and fangs; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — rears up and strikes forward with front legs and fangs; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — sprays a web of sticky thorned silk forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — sprays a web of sticky thorned silk forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Bark Guardian (หมีเปลือกไม้) — `bark-guardian`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: large brown bear with bark-like plates on the shoulders and back, small moss tufts.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — heavy paw swipe forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — heavy paw swipe forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — stands up on hind legs and slams both paws down, bark splinters and a ground shockwave; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — stands up on hind legs and slams both paws down, bark splinters and a ground shockwave; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Reed Stalker (จระเข้กกน้ำ) — `reed-stalker`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: long olive-green crocodile with ridged armored back, low to the ground, reeds caught on its scales.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — jaw snap forward with a head lunge; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — jaw snap forward with a head lunge; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — death-roll lunge: twists forward with a splash of muddy water; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — death-roll lunge: twists forward with a splash of muddy water; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Tide Crab (ปูน้ำขึ้น) — `tide-crab`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: big rust-red armored crab covered in barnacles, two huge pincers raised, many legs.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — pincer snap forward with one big claw; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — pincer snap forward with one big claw; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises both pincers and hammers the ground, a spray of sea foam and pebbles; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises both pincers and hammers the ground, a spray of sea foam and pebbles; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Fen Maw Otter (นากปากบึง) — `fen-maw-otter`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: dark brown giant otter with sleek wet fur, long body, oversized jaws and a long tail.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — lunging bite forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — lunging bite forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — spins and lashes the tail, throwing an arc of muddy fen water forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — spins and lashes the tail, throwing an arc of muddy fen water forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Cinder Beetle (ด้วงถ่านเพลิง) — `cinder-beetle`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: large dark red-black rhinoceros beetle with a glossy shell, one long curved horn, six legs, glowing ember cracks.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — horn jab forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — horn jab forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — shell splits open and sprays a cone of burning cinders forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — shell splits open and sprays a cone of burning cinders forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Ironhide Rhino (แรดหนังเหล็ก) — `ironhide-rhino`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: grey armored rhinoceros with iron-plated wrinkled hide and a large front horn.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — horn thrust with a head swing forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — horn thrust with a head swing forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — lowers its head and charges a short distance, sparks and dust at the impact; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — lowers its head and charges a short distance, sparks and dust at the impact; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Slag Hound (ไฮยีนาตะกรัน) — `slag-hound`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: spotted orange-brown hyena-like beast with molten slag in its spots, hunched back, wide jaws.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — snapping bite forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — snapping bite forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — opens its jaws and spits a glob of molten slag forward that splashes on the ground; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — opens its jaws and spits a glob of molten slag forward that splashes on the ground; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Moon Moth (ผีเสื้อจันทรา) — `moon-moth`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: giant purple moth with crescent-moon patterns on its wings, fluffy white body, glowing eyes.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow hovering glide: wings beat calmly in a loop, body bobs gently up and down, feet never touch the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow hovering glide: wings beat calmly in a loop, body bobs gently up and down, feet never touch the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — darts forward and slaps with its wings; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — darts forward and slaps with its wings; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — beats the wings hard, releasing a shimmering cloud of glowing moon-dust forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — beats the wings hard, releasing a shimmering cloud of glowing moon-dust forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Root Weaver (แมงมุมทอราก) — `root-weaver`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: orange-brown spider with a bark-textured body, root-like legs and amber glowing sacs.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — front legs stab forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — front legs stab forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — weaves a net of glowing roots that shoots forward and wraps the ground; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — weaves a net of glowing roots that shoots forward and wraps the ground; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Ancient Treant (พฤกษาโบราณ) — `ancient-treant`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: huge walking tree with gnarled bark body, root feet, branch arms, moss and a glowing amber face hollow.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — heavy branch-arm swing forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — heavy branch-arm swing forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — slams its root-feet down, roots erupt from the ground in front of it; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — slams its root-feet down, roots erupt from the ground in front of it; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Frost Wraith (วิญญาณน้ำแข็ง) — `frost-wraith`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: pale icy-blue hooded wraith of frozen tattered robes and icicles, no legs, dark empty hood with cold glow.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — claws forward with an icy hand, frost shards burst; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — claws forward with an icy hand, frost shards burst; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises both arms, a ring of ice spikes erupts in front of it; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises both arms, a ring of ice spikes erupts in front of it; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Crystal Golem (โกเลมคริสตัล) — `crystal-golem`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: massive golem of dark rock with large glowing blue crystals growing from shoulders and back.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — heavy crystal fist punch forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — heavy crystal fist punch forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — smashes both fists into the ground, blue crystal spikes burst forward in a line; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — smashes both fists into the ground, blue crystal spikes burst forward in a line; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Rime Serpent (งูน้ำค้างแข็ง) — `rime-serpent`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — quick strike forward with open fangs; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — quick strike forward with open fangs; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — frost breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the freezing white-blue mist pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — frost breath — the head and neck stretch FORWARD toward the left and the jaws open wide; the freezing white-blue mist pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the left edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Anvil Guard (องครักษ์ทั่ง) — `anvil-guard`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — hammer smash forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — hammer smash forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises the shield and bashes forward, a bright orange forge-spark shockwave; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises the shield and bashes forward, a bright orange forge-spark shockwave; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Furnace Golem (โกเลมเตาหลอม) — `furnace-golem`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — heavy stone fist punch forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — heavy stone fist punch forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — belly grate opens and blasts a wave of fire forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — belly grate opens and blasts a wave of fire forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Ember Drake (มังกรเพลิงอ่อน) — `ember-drake`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — claw swipe and bite forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — claw swipe and bite forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the orange fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — fire breath — the head and neck stretch FORWARD toward the left and the jaws open wide; the orange fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the left edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Venom Spider (แมงมุมพิษ) — `venom-spider`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — fang strike forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — fang strike forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — spits a glob of toxic green venom forward that splashes into a poison puddle; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — spits a glob of toxic green venom forward that splashes into a poison puddle; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Spore Beast (อสูรสปอร์) — `spore-beast`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — heavy forward headbutt with mushroom cap; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — heavy forward headbutt with mushroom cap; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — shakes violently, releasing a thick cloud of glowing green spores forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — shakes violently, releasing a thick cloud of glowing green spores forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Thorn Hydra (ไฮดราหนาม) — `thorn-hydra`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — the three heads bite forward one after another; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — the three heads bite forward one after another; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — all three heads rear back and spit thorn barbs forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — all three heads rear back and spit thorn barbs forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Astral Wraith (วิญญาณดวงดาว) — `astral-wraith`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — claws forward leaving a purple star-trail; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — claws forward leaving a purple star-trail; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — opens its arms and fires a beam of violet starlight forward; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — opens its arms and fires a beam of violet starlight forward; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Prism Sentinel (ผู้พิทักษ์ปริซึม) — `prism-sentinel`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — crystal blade-arm slash forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — crystal blade-arm slash forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — core flares and fires a prism beam forward that splits into rainbow shards; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — core flares and fires a prism beam forward that splits into rainbow shards; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Halo Seraph (เทวทูตรัศมี) — `halo-seraph`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — spear thrust forward with a golden flash; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — spear thrust forward with a golden flash; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — raises the spear, golden light pillars fall in front of it; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — raises the spear, golden light pillars fall in front of it; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Void Reaper (เคียวความว่าง) — `void-reaper`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground.
Frame to draw (replace with one line per image):
  frame 1/6: body at its lowest point of the bob, trailing parts streaming back
  frame 2/6: rising, trailing parts curling
  frame 3/6: highest point of the bob
  frame 4/6: starting to sink, trailing parts lifting
  frame 5/6: sinking
  frame 6/6: lowest point again (loop)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — wide scythe sweep forward with a violet arc; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — wide scythe sweep forward with a violet arc; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — vanishes into smoke and reappears mid-slash, leaving a dark void rift; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — vanishes into smoke and reappears mid-slash, leaving a dark void rift; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Eclipse Drake (มังกรสุริยคราส) — `eclipse-drake`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — claw swipe and bite forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — claw swipe and bite forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — eclipse fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the dark violet eclipse fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — eclipse fire breath — the head and neck stretch FORWARD toward the left and the jaws open wide; the dark violet eclipse fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the left edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

### Crown Colossus (ยักษ์มงกุฎหิน) — `crown-colossus`

**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**

```
MASTER REFERENCE — 2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.
Character: colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.
ONE character only, centred, on a 1024x1024 px square canvas. The character is exactly 340 px tall, feet on a horizontal line 799 px from the top, with wide empty space on every side.
Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**ยืน — 4 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: standing idle in a ready stance (no stepping, no attack).
Frame to draw (replace with one line per image):
  frame 1/4: neutral ready stance
  frame 2/4: top of the breath, cloth / fur / wisps lifted a little
  frame 3/4: breathing out, settling
  frame 4/4: neutral ready stance (same as frame 1, loop point)
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the RIGHT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**เดิน (ช้า) — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: walking in place toward the LEFT: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running.
Frame to draw (replace with one line per image):
  frame 1/6: contact: front foot just touching down, back foot behind
  frame 2/6: down: weight on the front foot, body at its lowest
  frame 3/6: up: body at its highest, pushing off
  frame 4/6: contact with the other foot in front
  frame 5/6: passing the other foot
  frame 6/6: up on the other foot
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the RIGHT — slow massive stone fist slam forward; the strike and any slash or splash point to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**โจมตี — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: basic attack toward the LEFT — slow massive stone fist slam forward; the strike and any slash or splash point to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: wind-up: weapon / claws / head pulled back
  frame 3/6: strike: full reach forward, motion trail
  frame 4/6: impact: hit effect at the end of the reach
  frame 5/6: recovering
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันขวา**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the RIGHT — stamps, stone pillars and rubble erupt from the ground in front of it; every effect goes to the RIGHT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```

**สกิล — 6 เฟรม · หันซ้าย**

```
2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light. Image = ONE single animation frame (generate one image per frame).
REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.
Pose: special skill toward the LEFT — stamps, stone pillars and rubble erupt from the ground in front of it; every effect goes to the LEFT, nothing behind the body.
Frame to draw (replace with one line per image):
  frame 1/6: ready stance
  frame 2/6: power building, pose tightens
  frame 3/6: release begins
  frame 4/6: full release: strongest effect
  frame 5/6: effect fading
  frame 6/6: back to ready stance
Three-quarter view facing LEFT (body turned to the left edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.
SIZE: exactly the same size as the MASTER REFERENCE — 340 px tall on the same 1024x1024 px canvas, feet on the same line 799 px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.
ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.
Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.
```
