# Prompt เพลงเกม SoulForge สำหรับ ElevenLabs Music

ตอนนี้เกมมีเพลงแค่ 2 ไฟล์ (`public/audio/music/title.mp3` หน้าแรก และ `field.mp3` ที่เล่นวนทั้งเกม ทั้งในเมือง ทุ่งล่า และดันเจี้ยน)
เพลงเดียวยาวราว 1 นาทีวนซ้ำตลอดเวลาเล่น คือเหตุผลหลักที่ฟังแล้วรำคาญ แนวทางใหม่:

- **ยาว 2.5–3 นาที** ต่อเพลง วนแล้วไม่จำได้ง่าย
- **ไม่มีเสียงร้อง ไม่มีกลองหนักตลอดเพลง ไม่มีทำนองเด่นแหลม ๆ** — เพลงพื้นหลังต้องอยู่ข้างหลังเสียงต่อสู้ ไม่แย่งหู
- **ต้นกับท้ายเพลงเงียบลงและคีย์เดียวกัน** ให้เกมวนต่อได้เนียน (เกม crossfade 2.5 วินาทีให้อยู่แล้ว)
- ไฟล์ mp3 192 kbps, ปรับความดังเพลงให้เบากว่ามาสเตอร์ปกติ (~ -18 LUFS)

ใน ElevenLabs: เลือก **Music** → วาง prompt → ตั้งความยาว → เลือก **Instrumental** (ไม่มีเสียงร้อง) → สร้าง 3–4 รอบแล้วเลือกที่ฟังสบายที่สุด

---

## 1. `title.mp3` — หน้าแรก / เลือกอาชีพ (2:30)

```
Dark fantasy RPG main menu theme, instrumental, no vocals. Slow tempo around 70 BPM, D minor.
Opens with a soft low cello drone and a distant solo horn, then a gentle string ensemble and choir pad ("ooh", no words)
build a noble, melancholic melody. Light harp arpeggios, soft timpani swells only at the peak, no constant drums.
Cinematic but calm and spacious, wide reverb, warm and not harsh, no high piercing leads.
Ends by fading back to the same low drone so it loops seamlessly.
```

## 2. `field.mp3` — ทุ่งล่า / สำรวจ (เล่นนานที่สุด ต้องเบาที่สุด) (3:00)

```
Calm ambient exploration music for a dark fantasy open-world RPG, instrumental, no vocals. 80 BPM, A minor, very relaxed.
Warm low strings and a soft felt piano play sparse, slow phrases with lots of space between them;
a quiet wooden flute or duduk answers occasionally. Subtle wind and nature ambience underneath.
No drums or only very soft hand percussion, no build-ups, no loud moments, no repetitive short motif.
Background music that stays behind gameplay sound effects and never gets tiring after an hour.
Starts and ends softly in the same key so it loops seamlessly.
```

---

## เพลงเพิ่ม (ถ้าอยากให้แต่ละที่ไม่ซ้ำกัน — ต้องเพิ่มโค้ดเลือกเพลงตามแมพ)

### `town.mp3` — ในเมือง (3:00)
```
Peaceful medieval dark-fantasy town music, instrumental, no vocals. 90 BPM, G dorian.
Lute and acoustic guitar fingerpicking, soft hurdy-gurdy, light frame drum and tambourine kept quiet,
warm cello bass. Cozy, safe, a little bittersweet, like a lantern-lit market at dusk.
No loud melodies, gentle and unobtrusive, ends softly in the same key for a seamless loop.
```

### `dungeon.mp3` — ดันเจี้ยน (3:00)
```
Dark ambient dungeon music for a fantasy RPG, instrumental, no vocals. Slow, 60 BPM, C minor.
Deep low drones, distant metallic scrapes, soft dissonant string clusters, occasional low taiko hit far away,
quiet whispering choir pad without words. Tense and mysterious but not loud or noisy,
lots of silence and space, no melody that repeats, loops seamlessly.
```

### `boss.mp3` — สู้บอส (2:00)
```
Epic dark fantasy boss battle music, instrumental, no vocals. 140 BPM, E minor.
Driving taiko and orchestral percussion, aggressive low brass ostinato, fast staccato strings,
powerful choir chants ("ah", no words), heavy and dramatic but clean mix, not distorted, not shrill.
Keeps a steady intense energy without long breaks, ends on a sustained chord that loops back to the start.
```
