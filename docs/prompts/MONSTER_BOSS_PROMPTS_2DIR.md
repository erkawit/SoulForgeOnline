# Prompt มอนสเตอร์ / Elite / บอส — หันขวาอย่างเดียว (เกมกลับภาพเป็นซ้ายเอง)

สร้างจาก `scripts/sprites/monster_prompts.mjs` — แก้ข้อความในสคริปต์แล้วรันใหม่ ไม่ต้องแก้ไฟล์นี้ตรง ๆ

วิธีใช้: แนบภาพปัจจุบันของตัวนั้นเป็นภาพอ้างอิง → สั่งทีละท่า (ทีละแถว) → ต่อแถวเป็นชีตเดียวเรียง ยืน / เดิน / โจมตี / สกิล → ตรวจใน `/inspector/sprites.html` (“ทดสอบชีตใหม่”) → ใส่เข้าเกมเป็นชีตไม่มี `dirs` (หันขวา, facesLeft ไม่ต้องใส่)

| ประเภท | ขนาดช่อง (กว้าง×สูง) | ความสูงตัว | สั่งต่อ 1 ภาพ | ยืน | เดิน | โจมตี | สกิล |
|---|---|---|---|---|---|---|---|
| monster | 640×512 | 400 px | 4 เฟรม | 4 | 6 | 6 | 6 |
| elite | 832×640 | 520 px | 3 เฟรม | 4 | 6 | 6 | 6 |
| boss | 1920×1408 | 1200 px | 2 เฟรม | 6 | 8 | 8 | 10 |

บอสวาดสูง 3 เท่าของมอนสเตอร์ทั่วไป/ตัวละคร ความละเอียดเท่ากันทุกพิกเซล — ห้ามย่อ ระยะห่างได้จากช่องที่กว้างกว่าตัว ไม่ใช่การวาดตัวเล็ก. ภาพใหญ่ให้สั่งทีละ “สั่งต่อ 1 ภาพ” เฟรม แล้วต่อกันเป็นแถว

## บอส

### Grave Marshal (จอมพลสุสาน) — `grave-marshal`

**ยืน — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: towering minotaur-like undead warlord: dark horned bull head, black iron armor with skull ornaments, torn crimson cape, giant cleaver axe.
ONE horizontal row of 6 frames, each cell 1920x1408 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: towering minotaur-like undead warlord: dark horned bull head, black iron armor with skull ornaments, torn crimson cape, giant cleaver axe.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: towering minotaur-like undead warlord: dark horned bull head, black iron armor with skull ornaments, torn crimson cape, giant cleaver axe.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — two-handed overhead cleaver chop; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 10 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: towering minotaur-like undead warlord: dark horned bull head, black iron armor with skull ornaments, torn crimson cape, giant cleaver axe.
ONE horizontal row of 10 frames, each cell 1920x1408 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises the cleaver and slams it into the ground, a cracking red shockwave and flying grave stones; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Drowned Hierophant (มหาปุโรหิตจมน้ำ) — `drowned-hierophant`

**ยืน — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade held in his RIGHT hand (the hand nearer the viewer, blade pointing forward to the right) and a glowing green soul-lantern on a chain held in his LEFT hand (the far hand), both items visible in every frame.
ONE horizontal row of 6 frames, each cell 1920x1408 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade held in his RIGHT hand (the hand nearer the viewer, blade pointing forward to the right) and a glowing green soul-lantern on a chain held in his LEFT hand (the far hand), both items visible in every frame.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): walking in place toward the right: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade held in his RIGHT hand (the hand nearer the viewer, blade pointing forward to the right) and a glowing green soul-lantern on a chain held in his LEFT hand (the far hand), both items visible in every frame.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — sweeps the scythe from back to front in a wide arc toward the right, leaving a ghostly green slash trail; the lantern stays in the left hand; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 10 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade held in his RIGHT hand (the hand nearer the viewer, blade pointing forward to the right) and a glowing green soul-lantern on a chain held in his LEFT hand (the far hand), both items visible in every frame.
ONE horizontal row of 10 frames, each cell 1920x1408 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises the lantern in the left hand while the right hand plants the scythe, a huge vortex of drowned green souls swirls up in front of him on the right side; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Worldroot Devourer (อสูรกลืนรากโลก) — `worldroot-devourer`

**ยืน — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings.
ONE horizontal row of 6 frames, each cell 1920x1408 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): walking in place toward the right: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — massive bite and claw rake forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 10 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings.
ONE horizontal row of 10 frames, each cell 1920x1408 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — violet root-fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the violet-black fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell; on the strongest frames small dark roots burst from the ground under the end of the flame, in front of the dragon; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Abyssal Forge Titan (ไททันเตาหลอมนรก) — `abyssal-forge-titan`

**ยืน — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms.
ONE horizontal row of 6 frames, each cell 1920x1408 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 8 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms.
ONE horizontal row of 8 frames, each cell 1920x1408 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — giant hammer-arm smash forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 10 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms.
ONE horizontal row of 10 frames, each cell 1920x1408 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — slams both arms down, a ring of magma bursts outward and lava geysers erupt forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 1200 px tall in every frame (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects); never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 384 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

## Elite

### Oathscar Aurochs (กระทิงตราคำสาบาน) — `oathscar-aurochs`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive brown aurochs bull with shaggy shoulders, wide curved horns and glowing scar runes on the flank.
ONE horizontal row of 4 frames, each cell 832x640 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive brown aurochs bull with shaggy shoulders, wide curved horns and glowing scar runes on the flank.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive brown aurochs bull with shaggy shoulders, wide curved horns and glowing scar runes on the flank.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — horn thrust forward with a heavy head swing; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive brown aurochs bull with shaggy shoulders, wide curved horns and glowing scar runes on the flank.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — stamps the ground, runes flare red and a quaking shockwave ring spreads forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Tide Wraith (วิญญาณน้ำขึ้น) — `tide-wraith`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hooded sea-green wraith of tattered robes and seaweed, glowing teal eyes, holding a coral-and-driftwood staff.
ONE horizontal row of 4 frames, each cell 832x640 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hooded sea-green wraith of tattered robes and seaweed, glowing teal eyes, holding a coral-and-driftwood staff.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): walking in place toward the right: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hooded sea-green wraith of tattered robes and seaweed, glowing teal eyes, holding a coral-and-driftwood staff.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — swipes the staff forward releasing a splash of dark water; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hooded sea-green wraith of tattered robes and seaweed, glowing teal eyes, holding a coral-and-driftwood staff.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises the staff, a swirling whirlpool of teal water erupts in front of it; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Root Reaper (เคียวรากไม้) — `root-reaper`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark thorny root creature on six spindly root legs, purple glowing core, two scythe-like root claws.
ONE horizontal row of 4 frames, each cell 832x640 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark thorny root creature on six spindly root legs, purple glowing core, two scythe-like root claws.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): walking in place toward the right: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark thorny root creature on six spindly root legs, purple glowing core, two scythe-like root claws.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — slashes forward with both root scythes; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark thorny root creature on six spindly root legs, purple glowing core, two scythe-like root claws.
ONE horizontal row of 6 frames, each cell 832x640 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — stabs its legs into the ground, purple thorn roots burst up in a line in front of it; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 520 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 166 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

## มอนสเตอร์ทั่วไป

### Grave Crawler (แบดเจอร์สุสาน) — `grave-crawler`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: stocky badger with grey-black fur and a pale stripe down the back, short legs, long claws, snarling.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: stocky badger with grey-black fur and a pale stripe down the back, short legs, long claws, snarling.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: stocky badger with grey-black fur and a pale stripe down the back, short legs, long claws, snarling.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — lunges forward and rakes with both front claws; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: stocky badger with grey-black fur and a pale stripe down the back, short legs, long claws, snarling.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — rears up and slams down, a burst of grave dust and bone shards; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Ash Hound (สุนัขเถ้า) — `ash-hound`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: lean grey wolf-hound with ash-streaked fur, bristling mane, bared fangs, smoky embers in the fur.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: lean grey wolf-hound with ash-streaked fur, bristling mane, bared fangs, smoky embers in the fur.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: lean grey wolf-hound with ash-streaked fur, bristling mane, bared fangs, smoky embers in the fur.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — snapping bite forward with a quick head lunge; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: lean grey wolf-hound with ash-streaked fur, bristling mane, bared fangs, smoky embers in the fur.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — howls, then leaps forward trailing a short cone of glowing ash; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Bone Sentinel (หมูป่ากระดูก) — `bone-sentinel`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking dark wild boar with coarse black bristles, scarred hide and long pale tusks.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking dark wild boar with coarse black bristles, scarred hide and long pale tusks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking dark wild boar with coarse black bristles, scarred hide and long pale tusks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — tusk gore: head drops and sweeps up; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hulking dark wild boar with coarse black bristles, scarred hide and long pale tusks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — paws the ground and charges a short distance, dust cloud and shockwave at the end; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Briar Wolf (หมาป่าหนามไม้) — `briar-wolf`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: green-brown wolf with mossy fur and thorny briar growing along its back, amber eyes.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: green-brown wolf with mossy fur and thorny briar growing along its back, amber eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: green-brown wolf with mossy fur and thorny briar growing along its back, amber eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — quick bite and claw swipe forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: green-brown wolf with mossy fur and thorny briar growing along its back, amber eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — snarls, thorn spikes burst from its back and fly forward in a short fan; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Thorn Spider (แมงมุมหนาม) — `thorn-spider`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown hairy spider with thorny spines on its abdomen and legs, many small glinting eyes.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown hairy spider with thorny spines on its abdomen and legs, many small glinting eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown hairy spider with thorny spines on its abdomen and legs, many small glinting eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — rears up and strikes forward with front legs and fangs; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown hairy spider with thorny spines on its abdomen and legs, many small glinting eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — sprays a web of sticky thorned silk forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Bark Guardian (หมีเปลือกไม้) — `bark-guardian`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown bear with bark-like plates on the shoulders and back, small moss tufts.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown bear with bark-like plates on the shoulders and back, small moss tufts.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown bear with bark-like plates on the shoulders and back, small moss tufts.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — heavy paw swipe forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large brown bear with bark-like plates on the shoulders and back, small moss tufts.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — stands up on hind legs and slams both paws down, bark splinters and a ground shockwave; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Reed Stalker (จระเข้กกน้ำ) — `reed-stalker`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: long olive-green crocodile with ridged armored back, low to the ground, reeds caught on its scales.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: long olive-green crocodile with ridged armored back, low to the ground, reeds caught on its scales.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: long olive-green crocodile with ridged armored back, low to the ground, reeds caught on its scales.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — jaw snap forward with a head lunge; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: long olive-green crocodile with ridged armored back, low to the ground, reeds caught on its scales.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — death-roll lunge: twists forward with a splash of muddy water; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Tide Crab (ปูน้ำขึ้น) — `tide-crab`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: big rust-red armored crab covered in barnacles, two huge pincers raised, many legs.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: big rust-red armored crab covered in barnacles, two huge pincers raised, many legs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: big rust-red armored crab covered in barnacles, two huge pincers raised, many legs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — pincer snap forward with one big claw; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: big rust-red armored crab covered in barnacles, two huge pincers raised, many legs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises both pincers and hammers the ground, a spray of sea foam and pebbles; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Fen Maw Otter (นากปากบึง) — `fen-maw-otter`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark brown giant otter with sleek wet fur, long body, oversized jaws and a long tail.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark brown giant otter with sleek wet fur, long body, oversized jaws and a long tail.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark brown giant otter with sleek wet fur, long body, oversized jaws and a long tail.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — lunging bite forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark brown giant otter with sleek wet fur, long body, oversized jaws and a long tail.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — spins and lashes the tail, throwing an arc of muddy fen water forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Cinder Beetle (ด้วงถ่านเพลิง) — `cinder-beetle`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large dark red-black rhinoceros beetle with a glossy shell, one long curved horn, six legs, glowing ember cracks.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large dark red-black rhinoceros beetle with a glossy shell, one long curved horn, six legs, glowing ember cracks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large dark red-black rhinoceros beetle with a glossy shell, one long curved horn, six legs, glowing ember cracks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — horn jab forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: large dark red-black rhinoceros beetle with a glossy shell, one long curved horn, six legs, glowing ember cracks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — shell splits open and sprays a cone of burning cinders forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Ironhide Rhino (แรดหนังเหล็ก) — `ironhide-rhino`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: grey armored rhinoceros with iron-plated wrinkled hide and a large front horn.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: grey armored rhinoceros with iron-plated wrinkled hide and a large front horn.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: grey armored rhinoceros with iron-plated wrinkled hide and a large front horn.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — horn thrust with a head swing forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: grey armored rhinoceros with iron-plated wrinkled hide and a large front horn.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — lowers its head and charges a short distance, sparks and dust at the impact; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Slag Hound (ไฮยีนาตะกรัน) — `slag-hound`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: spotted orange-brown hyena-like beast with molten slag in its spots, hunched back, wide jaws.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: spotted orange-brown hyena-like beast with molten slag in its spots, hunched back, wide jaws.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: spotted orange-brown hyena-like beast with molten slag in its spots, hunched back, wide jaws.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — snapping bite forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: spotted orange-brown hyena-like beast with molten slag in its spots, hunched back, wide jaws.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — opens its jaws and spits a glob of molten slag forward that splashes on the ground; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Moon Moth (ผีเสื้อจันทรา) — `moon-moth`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: giant purple moth with crescent-moon patterns on its wings, fluffy white body, glowing eyes.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: giant purple moth with crescent-moon patterns on its wings, fluffy white body, glowing eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow hovering glide: wings beat calmly in a loop, body bobs gently up and down, feet never touch the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: giant purple moth with crescent-moon patterns on its wings, fluffy white body, glowing eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — darts forward and slaps with its wings; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: giant purple moth with crescent-moon patterns on its wings, fluffy white body, glowing eyes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — beats the wings hard, releasing a shimmering cloud of glowing moon-dust forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Root Weaver (แมงมุมทอราก) — `root-weaver`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: orange-brown spider with a bark-textured body, root-like legs and amber glowing sacs.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: orange-brown spider with a bark-textured body, root-like legs and amber glowing sacs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: orange-brown spider with a bark-textured body, root-like legs and amber glowing sacs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — front legs stab forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: orange-brown spider with a bark-textured body, root-like legs and amber glowing sacs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — weaves a net of glowing roots that shoots forward and wraps the ground; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Ancient Treant (พฤกษาโบราณ) — `ancient-treant`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: huge walking tree with gnarled bark body, root feet, branch arms, moss and a glowing amber face hollow.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: huge walking tree with gnarled bark body, root feet, branch arms, moss and a glowing amber face hollow.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: huge walking tree with gnarled bark body, root feet, branch arms, moss and a glowing amber face hollow.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — heavy branch-arm swing forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: huge walking tree with gnarled bark body, root feet, branch arms, moss and a glowing amber face hollow.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — slams its root-feet down, roots erupt from the ground in front of it; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Frost Wraith (วิญญาณน้ำแข็ง) — `frost-wraith`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: pale icy-blue hooded wraith of frozen tattered robes and icicles, no legs, dark empty hood with cold glow.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: pale icy-blue hooded wraith of frozen tattered robes and icicles, no legs, dark empty hood with cold glow.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: pale icy-blue hooded wraith of frozen tattered robes and icicles, no legs, dark empty hood with cold glow.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — claws forward with an icy hand, frost shards burst; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: pale icy-blue hooded wraith of frozen tattered robes and icicles, no legs, dark empty hood with cold glow.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises both arms, a ring of ice spikes erupts in front of it; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Crystal Golem (โกเลมคริสตัล) — `crystal-golem`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive golem of dark rock with large glowing blue crystals growing from shoulders and back.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive golem of dark rock with large glowing blue crystals growing from shoulders and back.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive golem of dark rock with large glowing blue crystals growing from shoulders and back.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — heavy crystal fist punch forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: massive golem of dark rock with large glowing blue crystals growing from shoulders and back.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — smashes both fists into the ground, blue crystal spikes burst forward in a line; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Rime Serpent (งูน้ำค้างแข็ง) — `rime-serpent`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — quick strike forward with open fangs; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — frost breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the freezing white-blue mist pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Anvil Guard (องครักษ์ทั่ง) — `anvil-guard`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — hammer smash forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises the shield and bashes forward, a bright orange forge-spark shockwave; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Furnace Golem (โกเลมเตาหลอม) — `furnace-golem`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — heavy stone fist punch forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — belly grate opens and blasts a wave of fire forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Ember Drake (มังกรเพลิงอ่อน) — `ember-drake`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — claw swipe and bite forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the orange fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Venom Spider (แมงมุมพิษ) — `venom-spider`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — fang strike forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — spits a glob of toxic green venom forward that splashes into a poison puddle; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Spore Beast (อสูรสปอร์) — `spore-beast`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — heavy forward headbutt with mushroom cap; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — shakes violently, releasing a thick cloud of glowing green spores forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Thorn Hydra (ไฮดราหนาม) — `thorn-hydra`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — the three heads bite forward one after another; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — all three heads rear back and spit thorn barbs forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Astral Wraith (วิญญาณดวงดาว) — `astral-wraith`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — claws forward leaving a purple star-trail; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — opens its arms and fires a beam of violet starlight forward; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Prism Sentinel (ผู้พิทักษ์ปริซึม) — `prism-sentinel`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — crystal blade-arm slash forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — core flares and fires a prism beam forward that splits into rainbow shards; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Halo Seraph (เทวทูตรัศมี) — `halo-seraph`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — spear thrust forward with a golden flash; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — raises the spear, golden light pillars fall in front of it; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Void Reaper (เคียวความว่าง) — `void-reaper`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — wide scythe sweep forward with a violet arc; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — vanishes into smoke and reappears mid-slash, leaving a dark void rift; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Eclipse Drake (มังกรสุริยคราส) — `eclipse-drake`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — claw swipe and bite forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — eclipse fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the dark violet eclipse fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

### Crown Colossus (ยักษ์มงกุฎหิน) — `crown-colossus`

**ยืน — 4 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks.
ONE horizontal row of 4 frames, each cell 640x512 px (wider than tall): idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**เดิน (ช้า) — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): walking in place toward the right: slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running, loops seamlessly, the body stays centred in its cell.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**โจมตี — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — slow massive stone fist slam forward; the strike and any slash or splash point to the RIGHT.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```

**สกิล — 6 เฟรม**

```
2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).
Creature: colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks.
ONE horizontal row of 6 frames, each cell 640x512 px (wider than tall): special skill toward the right: gather power, big release, effect fades, back to stance — stamps, stone pillars and rubble erupt from the ground in front of it; every effect goes to the RIGHT, nothing behind the body.
SIZE AND DETAIL: draw the creature LARGE and fully detailed — about 400 px tall in every frame; never shrink it to make room and never lower the detail or resolution.
SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; neighbouring frames are separated by a clear gap of at least 128 px. Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.
Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.
```
