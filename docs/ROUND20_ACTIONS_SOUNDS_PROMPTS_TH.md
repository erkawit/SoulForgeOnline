# Round 20 — Prompt ท่าที่เหลือ (ChatGPT) + เสียงสกิล (ElevenLabs)

## A. ท่าตัวผู้ชายที่ยังขาด — attack / skill / buff / death (7 อาชีพ × 4 ท่า = 28 ภาพ)

ใช้ **แชทเดิมที่วาดตัวละคร** (ChatGPT จำหน้าตาได้) ถ้าเปิดแชทใหม่ ให้แนบภาพท่ายืนของอาชีพนั้นไปด้วยทุกครั้ง
ได้ภาพแล้วตั้งชื่อ `<Class>_<action>.png` เช่น `Paladin_attack.png` วางใน `Downloads\All Class\`

```
Same characters as before: same faces, outfits, colours, weapons and size. Same layout as the idle and walk sheets:
transparent background, exactly 5 rows (row 1 facing the camera / south, row 2 three-quarter front facing screen-left,
row 3 side view facing screen-left, row 4 three-quarter back facing screen-left, row 5 back to the camera / north),
frames left to right with clear empty space between them, nothing overlapping the next frame, feet on one baseline,
no ground shadow, no text. One image per reply; after each, tell me the file name and wait for "next".

Make these sheets in this order (file name in brackets):

ATTACK — 6 frames per row: wind-up, swing, the hit (frame 4 = the moment of contact), follow-through, recover.
 1. [Paladin_attack.png]      a horizontal sword slash, shield held in front
 2. [Hawkeye_attack.png]      draw the longbow and release an arrow (arrow leaves the bow on frame 4)
 3. [RuneMaster_attack.png]   a sword slash that throws a teal crescent of rune light forward on frame 4
 4. [Elementalist_attack.png] thrust the staff forward, a fire / frost spark bursts from the crystal on frame 4
 5. [Assassin_attack.png]     a fast double slash with both daggers (second dagger hits on frame 4)
 6. [HighPriest_attack.png]   raise the short staff, a beam of holy light shoots from the orb on frame 4
 7. [Inquisitor_attack.png]   an overhead hammer smash, blue sparks on impact on frame 4

SKILL — 6 frames per row: a big signature move with a glowing effect in the class colour (impact on frame 4).
 8. [Paladin_skill.png]       leap and drive the sword down, golden light bursts around him
 9. [Hawkeye_skill.png]       aim upward and loose a glowing green volley into the sky
10. [RuneMaster_skill.png]    plunge the rune sword into the ground, a teal rune pillar rises beside him
11. [Elementalist_skill.png]  raise the staff high with both hands, fire, frost and lightning swirl around the crystal
12. [Assassin_skill.png]      spin with both daggers, a purple blade whirl around him
13. [HighPriest_skill.png]    lift both arms, a golden halo of light expands from the orb
14. [Inquisitor_skill.png]    raise the hammer to the sky, lightning strikes it, slam it into the ground on frame 4

BUFF — 4 frames per row: power-up / blessing, a glow rising around the body (frame 3 = brightest).
15. [Paladin_buff.png] 16. [Hawkeye_buff.png] 17. [RuneMaster_buff.png] 18. [Elementalist_buff.png]
19. [Assassin_buff.png] 20. [HighPriest_buff.png] 21. [Inquisitor_buff.png]

DEATH — 5 frames per row: hit and stagger, knees buckle, fall, last frame lying still on the ground
(same lying size as the standing character, weapon dropped beside him).
22. [Paladin_death.png] 23. [Hawkeye_death.png] 24. [RuneMaster_death.png] 25. [Elementalist_death.png]
26. [Assassin_death.png] 27. [HighPriest_death.png] 28. [Inquisitor_death.png]

Start with sheet 1: Paladin_attack.png.
```

ถ้าตัวละครเพี้ยนไปจากเดิม ให้พิมพ์ `redo: keep the face, outfit and weapon exactly like the idle sheet` แล้วแนบภาพท่ายืนไปด้วย

## B. ตัวผู้หญิง (ทำหลัง A เสร็จ) — 7 อาชีพ × 6 ท่า = 42 ภาพ

เปิด **แชทใหม่** แนบภาพท่ายืนตัวผู้ชายของอาชีพนั้นไปด้วย

```
Make a FEMALE version of this character: same class, same outfit design, colours and weapon, adapted to a woman,
same chibi proportions and the same size as the male. Same sprite-sheet rules as before (transparent background,
5 rows: south, south-west, west, north-west, north — all facing screen-left — frames left to right, clear spacing,
feet on one baseline, no shadow, no text). One image per reply, then wait for "next".
For this class make, in order: idle (4 frames), walk (6), attack (6, contact on frame 4), skill (6, impact on frame 4),
buff (4), death (5, last frame lying still).
File names: <Class>-f.png, <Class>-f_walk.png, <Class>-f_attack.png, <Class>-f_skill.png, <Class>-f_buff.png, <Class>-f_death.png
Class: Paladin. Start with the idle sheet.
```
ทำครบหนึ่งอาชีพแล้ว พิมพ์ `Next class: Hawkeye` (ตามด้วย RuneMaster, Elementalist, Assassin, HighPriest, Inquisitor)

## C. เสียงสกิล — ElevenLabs (Sound Effects)

ElevenLabs → Sound Effects → วางคำบรรยาย (ภาษาอังกฤษ) → ตั้งความยาวตามตาราง → Generate → ดาวน์โหลด .mp3
ตั้งชื่อไฟล์ตามคอลัมน์แรก วางใน `Downloads\All Class\sfx\` (ไม่ชอบเสียงไหนกด Generate ใหม่ได้)

| ไฟล์ | วินาที | คำบรรยาย (copy ไปวาง) |
|---|---|---|
| paladin_shield_bash.mp3 | 0.8 | heavy steel shield bashing armor, metallic clang with a short holy shimmer |
| paladin_holy_dome.mp3 | 1.5 | a radiant holy shield dome forming, warm bright hum and a soft choir swell |
| paladin_crusade.mp3 | 2 | armored knight charging and slamming a sword down, holy explosion, triumphant |
| hawkeye_bow_shot.mp3 | 0.8 | longbow string release with a sharp twang and a fast arrow whoosh |
| hawkeye_arrow_rain.mp3 | 2 | dozens of arrows whistling down from the sky and thudding into the ground |
| rune_sword_wave.mp3 | 0.8 | magic sword slash releasing a whooshing wave of energy, crystalline shimmer |
| rune_pillar_rise.mp3 | 1.2 | a stone pillar grinding up out of the earth, glowing runes humming to life |
| rune_chains_bind.mp3 | 1.2 | magical chains snapping tight and locking with an echoing metallic clank |
| rune_heal.mp3 | 1.5 | gentle healing magic, soft rising chimes and a calm sparkle |
| rune_hex.mp3 | 1.2 | dark curse spell, low ominous whisper and a sinister magical pulse |
| rune_venom_burst.mp3 | 1 | bubbling poison erupting in a wet magical burst, hissing toxic gas |
| elemental_meteor.mp3 | 2 | a flaming meteor roaring down from the sky and exploding on impact |
| elemental_frost_nova.mp3 | 1 | ice spell blast, crackling frost spreading and shattering crystals |
| elemental_chain_lightning.mp3 | 1 | lightning bolt jumping between targets, sharp electric zaps |
| assassin_twin_slash.mp3 | 0.6 | two quick dagger slashes, sharp blade swishes |
| assassin_shadow_step.mp3 | 0.8 | a dark teleport whoosh, shadowy whisper and a sudden stab |
| assassin_death_lotus.mp3 | 2 | spinning blades whirling rapidly, continuous metallic slicing |
| priest_holy_light.mp3 | 1 | a beam of holy light, bright angelic tone |
| priest_divine_grace.mp3 | 2 | heavenly choir swell with bright bells, a wave of divine healing light |
| inquisitor_hammer_smite.mp3 | 0.8 | heavy war hammer impact with an electric lightning crack |
| inquisitor_thunderstorm.mp3 | 4 | dark storm clouds rumbling with repeated lightning strikes and thunder |
| inquisitor_shock_pillar.mp3 | 2 | crackling electric arcs buzzing from a metal pillar, continuous sparks |
| inquisitor_thunder_spike.mp3 | 1.5 | electricity charging up with a rising whine, then a big lightning explosion |
| inquisitor_lightning_burst.mp3 | 1 | an explosive burst of lightning in all directions, loud electric crack |
| inquisitor_thor_hammer.mp3 | 2.5 | a giant hammer swinging down with a deep whoosh, earth-shaking impact, massive thunderclap |

ได้ภาพหรือเสียงครบชุดไหน บอกผมได้เลย ผมจะใส่เกม ปรับจังหวะให้ตรงเฟรมที่โดน (เฟรม 4) แล้วผูกเสียงกับสกิล

## D. Berserker (และ Reaver ร่างเลื่อนขั้น Lv60) — เอฟเฟกต์ + เสียง

สถานะตอนนี้: Berserker มีท่าครบและไอคอนแล้ว แต่ **เอฟเฟกต์สกิลยังเป็นแบบโค้ดวาดเอง** (วงฟันสีแดง วงแหวนพื้น) ยังไม่มีภาพวาด
และ **เสียงเป็นเสียงกลาง** (ฟันหนัก ๆ เหมือนกันทุกสกิล, คำรามใช้เสียงบัฟทั่วไป)

### D1. เอฟเฟกต์ (ChatGPT แชทเดียวกับเอฟเฟกต์ Rune Master / Inquisitor) — 12 ภาพ
ใช้กติกาเดิม: พื้นดำสนิท 1536×1024, 6 เฟรม (3 คอลัมน์ × 2 แถว), ตั้งชื่อตามวงเล็บ วางใน `Downloads\All Class\effect_skill\Berserker\`

```
Same rules as the Rune Master and Inquisitor effects: pure black background, 1536x1024, exactly 6 frames in a 3x2 grid
(build-up, peak, fade), no characters, no text, glowing painted magic, camera about 30 degrees down.
Theme: BERSERKER — blood red and ember orange rage, dark smoke, sparks. One image per reply, then wait for "next".
 1. [Rending-Rush.png]       four fast crossing blood-red slash arcs, blood droplets spraying
 2. [Blood-Howl.png]         a roaring shockwave of red rage rising upward, ember sparks, red aura pillar
 3. [Carnage-Cyclone.png]    a spinning red tornado of greatsword slashes (loopable spin)
 4. [Bloodquake.png]         a greatsword slamming the ground, red cracks and molten ground burst
 5. [Execution-Frenzy.png]   two slashes then one huge downward execution slash glowing white-red
 6. [Whirlwind.png]          a wide continuous ring of spinning blades with red wind and sparks (loopable)
Theme for 7-12: REAVER — darker crimson and violet soul fire, black smoke, ghostly skull wisps.
 7. [Savage-Rend.png]        six savage crimson-violet claw slashes, soul sparks
 8. [Dread-Howl.png]         a dark violet roar shockwave with screaming ghostly skulls rising
 9. [Reaping-Cyclone.png]    a spinning scythe-like crimson-violet vortex (loopable)
10. [Ruinbreaker.png]        an axe smash cracking the ground, violet soul fire bursting from the cracks
11. [Soul-Reave.png]         a ghostly violet soul ripped out in a spiral, then a crimson finishing slash
12. [Cataclysm-Descent.png]  a falling blast from the sky: a crimson meteor-like impact, huge violet-red explosion ring
Start with effect 1.
```

### D2. เสียง (ElevenLabs) — วางใน `Downloads\All Class\sfx\`

| ไฟล์ | วินาที | คำบรรยาย |
|---|---|---|
| berserker_swing.mp3 | 0.7 | a huge greatsword swinging through the air with a deep heavy whoosh |
| berserker_hit.mp3 | 0.6 | a greatsword cleaving armor, brutal metal crunch with a wet slash |
| berserker_rending_rush.mp3 | 1.2 | four rapid brutal sword slashes in a row, blood splatter |
| berserker_blood_howl.mp3 | 1.5 | a savage warrior battle roar, deep and furious, echoing |
| berserker_cyclone.mp3 | 2.5 | a greatsword spinning rapidly, continuous heavy whooshing blades, loopable |
| berserker_bloodquake.mp3 | 1.5 | a giant sword slamming the ground three times, earth cracking, rocks flying |
| berserker_execution.mp3 | 1.5 | two quick slashes then one massive executioner strike with a deep impact boom |
| berserker_whirlwind.mp3 | 6 | a long whirlwind of spinning blades and rushing wind, intense and continuous |
| reaver_dread_howl.mp3 | 1.5 | a demonic roar mixed with ghostly screams, dark and terrifying |
| reaver_soul_reave.mp3 | 1.5 | a ghostly soul being torn out with an eerie wail, then a heavy slash |
| reaver_cataclysm.mp3 | 2.5 | a warrior leaping and crashing down from the sky, huge dark explosion, deep rumble |
