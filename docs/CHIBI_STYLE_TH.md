# SoulForge Chibi-Dark v1

สไตล์: ตัวละครสัดส่วน chibi (หัวโต ~1.85 ม. ในเกม) โทนสีมืด ตาเรืองแสงสีวิญญาณของแต่ละอาชีพ low-poly ไม่ใช้ texture

## ไฟล์
- `public/models/characters/<class>.glb` — 5 อาชีพ, 23 bones ชื่อเดิม, 9 clips (Idle Walk Run Attack Skill Buff Special Hit Death)
- `public/models/monsters/<id>.glb` — grave-crawler, ash-hound, bone-sentinel, briar-wolf, thorn-spider, grave-marshal (boss)
- `src/game/fx/skillFx.ts` — เอฟเฟกต์สกิล 4 แบบ × 5 อาชีพ (three.js ล้วน)
- `src/components/SkillFxLayer.tsx` — เล่นเอฟเฟกต์ตาม action.stamp ของผู้เล่น
- `src/components/MonsterModel.tsx` — โหลด GLB มอนสเตอร์ (ถ้าไม่มีโมเดลจะใช้ MonsterBody แบบเดิม)
- `blender/chibi/*.py` — สคริปต์สร้างโมเดล (python3 + numpy): `python3 -c "import chibi_humans as C; C.build_class('Warrior','warrior.glb')"`

## ความเร็วเท้า
Walk 0.945 m/s, Run 2.78 m/s ที่ playback 1× — เกมปรับ timeScale ตามความเร็วจริง (สูงสุด 3×) เท้าจึงไม่ไถล

## Backup
- `blender/backup/warrior_ai_v3.glb` (AI sculpt ที่ rig ไว้ก่อนหน้า), `blender/backup/<class>_lowpoly_v1.glb`, `blender/backup/manifest_ai_v3.json`
