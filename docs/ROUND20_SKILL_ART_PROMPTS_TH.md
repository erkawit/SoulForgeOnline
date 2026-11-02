# Round 20 — Prompt ChatGPT: ไอคอนสกิล + ภาพเอฟเฟกต์สกิล (7 อาชีพใหม่)

ใช้แชทใหม่แยกจากแชทวาดตัวละคร พิมพ์ `next` เพื่อทำภาพถัดไป, `redo: <ปัญหา>` เพื่อทำใหม่
วางไฟล์ใน `Downloads\All Class\icons\` และ `Downloads\All Class\fx\`

## 1. ไอคอนสกิล — อาชีพละ 1 ภาพ (9 ไอคอน ตาราง 3×3) รวม 7 ภาพ

```
You are making skill icons for my dark-fantasy MMORPG. One image per reply. After each image tell me the file name,
then wait. "next" = the next sheet in the queue, "redo: <problem>" = remake the same sheet.

=== EVERY SHEET ===
- Square image 1024x1024, a 3x3 grid of 9 square icons, equal size, separated by a thin straight black gutter.
- Order left to right, top to bottom, exactly as listed (6 active skills, then 3 passives).
- Each icon: painted dark-fantasy RPG skill icon, one strong readable symbol in the centre, dramatic lighting,
  dark background inside the icon, thin worn gold-and-iron border. Active skills glow in the class colour;
  the 3 passives use a calmer, darker version of the same colour.
- No text, no letters, no numbers anywhere. Every icon must be clearly different from the others.

=== QUEUE (file name: icons-<Class>.png) ===
1. Paladin (gold and blue holy knight, sword and shield):
   Shield Bash, Sacred Vow (holy oath light), Judgement Blade (sword of light striking down), Holy Cleave (circular holy slash),
   Bulwark of Dawn (glowing shield dome), Dawn Crusade (charging knight with sunburst) | passives: Plate Mastery, Stalwart, Aegis
2. Hawkeye (green ranger, longbow):
   Piercing Arrow, Eagle Eye, Arrow Rain, Twin Shot, Crippling Shot (arrow pinning a leg), Storm of Talons (sky full of arrows) |
   passives: Keen Sight, Quick Draw, Hunter Instinct
3. RuneMaster (teal rune swordsman, rune pillars):
   Venom Rune Burst (green poison rune explosion), Pillar of Valor (golden rune pillar, sword and shield aura),
   Binding Pillar (purple rune pillar with chains), Pillar of Renewal (green healing rune pillar),
   Pillar of Hexes (red cursed rune pillar, broken sword), Pillar of Ruin (giant teal rune pillar firing beams) |
   passives: Glyph Lore, Rune Edge (glowing rune blade), Swift Script
4. Elementalist (purple mage, fire / frost / lightning):
   Firebolt, Elemental Attunement, Chain Lightning, Frost Nova, Meteor, Cataclysm (fire, ice and lightning together) |
   passives: Arcane Focus, Mana Flow, Overload
5. Assassin (black and purple, dual daggers):
   Twin Fang, Shadow Veil, Shadow Step, Fan of Blades, Hamstring, Death Lotus (spinning blades flower) |
   passives: Lethality, Shadow Agility, Bloodletter
6. HighPriest (white and gold priest, holy orb):
   Holy Light, Blessing, Greater Heal, Sanctuary, Smite, Divine Grace (wings of light over a group) |
   passives: Devotion, Serenity, Grace
7. Inquisitor (red coat, hammer and shield, lightning magic, electric blue):
   Thunder Smite (hammer with lightning), Lightning Burst, Thunderstorm (dark cloud with lightning strikes),
   Shock Pillar (stone pillar shooting lightning), Thunder Spike (pillar exploding with lightning),
   Hammer of Thor (huge war hammer falling from storm clouds) | passives: Storm Conduit, Heretic Hunter, Iron Faith

Start with sheet 1: Paladin.
```

## 2. เอฟเฟกต์สกิล — สกิลละ 1 ภาพ (6 เฟรม) เริ่มจาก Rune Master กับ Inquisitor

ใช้ **พื้นดำสนิท** ไม่ใช่พื้นโปร่ง เพราะเกมซ้อนเอฟเฟกต์แบบเรืองแสง (สีดำจะหายไปเอง) และ ChatGPT ทำแสงบนพื้นดำได้สวยกว่า

```
You are making painted skill-effect animations (VFX flipbooks) for my dark-fantasy isometric MMORPG.
One image per reply. After each image tell me the file name, then wait. "next" = next effect, "redo: <problem>" = remake.

=== EVERY SHEET ===
- Image 1536x1024, pure solid black background (#000000) — no gradient, no vignette, no ground, no characters, no text.
- Exactly 6 frames in a 3-column x 2-row grid, read left to right, top to bottom: the effect from start to finish
  (build-up, peak, fade). Every frame the same size, the effect centred in its cell, nothing crossing into the next cell.
- Glowing painted magic: bright core, soft glow, sparks. Camera looks down about 30 degrees (isometric RPG view)
  unless the line says "top-down" (then seen from straight above, for effects lying on the ground).

=== QUEUE (file name: fx-<skill-id>.png) ===
1. fx-r2-sword-wave — a crescent wave of teal rune light flying sideways, rune symbols inside it (basic attack)
2. fx-r2-venom-burst — green poison rune exploding upward into toxic green smoke and droplets
3. fx-r2-pillar-valor — a stone obelisk with glowing GOLD runes rising out of the ground, golden aura
4. fx-r2-pillar-binding — a stone obelisk with glowing PURPLE runes, purple chains of light shooting out to the sides
5. fx-r2-pillar-renewal — a stone obelisk with glowing GREEN runes, green healing motes floating upward
6. fx-r2-pillar-hexes — a stone obelisk with glowing RED runes, dark red cursed smoke and skull-like wisps
7. fx-r2-pillar-ruin — a giant obelisk with blazing TEAL runes firing teal beams down into the ground around it
8. fx-r2-rune-circle — top-down: a teal magic circle with runes drawing itself on the ground, then fading
9. fx-i-thunder-smite — a single blue-white lightning bolt striking down from the top of the frame to the ground
10. fx-i-lightning-burst — a sphere of electric blue lightning exploding outward in all directions
11. fx-i-thunderstorm — a dark storm cloud at the top of each frame with blue lightning bolts striking down
12. fx-i-shock-pillar — a stone pillar crackling with blue lightning arcs jumping out to the sides
13. fx-i-thunder-spike — a pillar charging with blue light, then exploding into lightning and stone shards
14. fx-i-thor-hammer — a huge ornate war hammer (dark steel head, leather-wrapped handle, glowing blue runes) swinging
    down from the upper left at a 45-degree angle and smashing the ground: frame 1 raised high, frames 2-3 swinging down,
    frame 4 impact with a blinding flash, frames 5-6 lightning shockwave and debris
15. fx-i-impact-ring — top-down: a blue lightning shockwave ring with cracks spreading across the ground

Start with effect 1.
```

ทำ Rune Master กับ Inquisitor ให้ดีก่อน ถ้าเข้าเกมแล้วสวยค่อยทำเอฟเฟกต์ของอีก 5 อาชีพด้วยรูปแบบเดียวกัน
