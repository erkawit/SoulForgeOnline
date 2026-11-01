# PRE-LAUNCH — SoulForge Online (เว็บ + เกม + เซิร์ฟเวอร์เกม)

โฟลเดอร์นี้คัดมาจาก `soulforge-transfer/project` (2026-11-01) เพื่อเตรียมขึ้น GitHub
`https://github.com/erkawit/SoulForgeOnline`

## มีอะไรบ้าง
| โฟลเดอร์ | คือ |
|---|---|
| `src/app/site` + `src/game/guide`, `src/game/wiki` | หน้าเว็บเกม (`/` ปุ่มเข้าเกม, `/wiki`, `/guide`) |
| `src/app/play` + `src/components`, `src/game`, `src/store`, `src/styles` | ตัวเกม (`/play` → หน้าล็อกอิน → เกม) |
| `src/app/ui-review` | หน้าตรวจ UI (ร้านค้า คราฟ แชแนล ตัวเลขดาเมจ) |
| `apps/game-server` | เซิร์ฟเวอร์เกมออนไลน์ (realm: ปาร์ตี้ แชแนล บอสโลก ตลาด) |
| `public` | asset ที่เกมและเว็บใช้จริง (ภาพ สไปรต์ เสียง โมเดลเมือง) |
| `supabase` | migration ฐานข้อมูล |
| `tests`, `scripts`, `docs` | ชุดทดสอบ สคริปต์ เอกสาร |

## ไม่ได้ใส่ (อยู่ที่ `soulforge-transfer/project` เดิม)
- `node_modules`, `.next` — สร้างใหม่ด้วย `npm install` / `npm run build`
- `.env*` จริง — มีแค่ `.env.example` (ห้ามขึ้น GitHub)
- `blender/` (237 MB งานเรนเดอร์), `scratch/`, `_patches/`, `reference/`, ไฟล์ log
- asset ที่โค้ดไม่เรียกใช้: `public/art/3dmodel/*.glb` (โมเดล 5 อาชีพเก่า 456 MB — ไฟล์ mage 111 MB เกินลิมิต 100 MB ของ GitHub),
  `public/art/wiki/*`, `public/art/loot/*` (ใช้ atlas `items-loot.webp` แทน), `art/ground/hollow/compass-plaza.webp`,
  `art/fx-world/anchors.json`, `art/city/thornwatch/hay.webp`

## รันในเครื่อง
```
npm install
copy .env.example .env.local
npm run dev            # http://localhost:3002
npm run realm:dev      # (ถ้าจะทดสอบออนไลน์) เซิร์ฟเวอร์เกม ws://localhost:3001
```

## ขึ้น GitHub (ครั้งแรก)
```
cd "C:\Users\user\Documents\SoulForge Online\pre_launch"
git init
git add .
git commit -m "SoulForge Online pre-launch"
git branch -M main
git remote add origin https://github.com/erkawit/SoulForgeOnline.git
git push -u origin main
```
หมายเหตุ (ตรวจ 2026-11-01):
- repo `erkawit/SoulForgeOnline` เป็น **public** — ทุกไฟล์ที่ push ทุกคนเห็นได้
- branch `main` ตอนนี้เป็นเว็บ static (index.html, app.js, home.html, wiki.html, guide.html, art/, audio/) — ถ้าใช้ GitHub Pages อยู่ การ push ทับ `main` จะทำให้เว็บนั้นหาย
- แนะนำ push เป็น branch ใหม่ก่อน: `git push -u origin pre-launch` แล้วค่อยตัดสินใจรวมเข้า `main`
