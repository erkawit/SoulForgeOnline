# ขึ้นเว็บ SoulForge บน Netlify + Supabase

Netlify รันได้เฉพาะ **เว็บ** (`/`, `/play`, `/admin`, `/shop/cash`, `/partner`, API ใน `src/app/api/*`)
**Realm (apps/game-server) วางบน Netlify ไม่ได้** เพราะเป็น WebSocket ที่ต้องรันต่อเนื่อง ให้วางบน Railway / Render / Fly.io (ดู `RAILWAY_DEPLOY_TH.md`)

## 1. Supabase
- **โปรเจกต์ใหม่:** SQL Editor → วาง `database/soulforge-supabase-full-install.sql` ทั้งไฟล์ → Run
- **โปรเจกต์เดิม:** รันไฟล์ใน `project/supabase/migrations` ที่ยังไม่เคยรัน ตามลำดับเลขไฟล์ จนถึง `202610260012_berserker.sql`
  (0012 เปลี่ยนตัวละครและไอเทมเดิมทั้งหมดเป็น Berserker — โค้ดชุดนี้เป็น Berserker อาชีพเดียวแล้ว ดู `ROUND13_BERSERKER_TH.md`)
- Authentication → URL Configuration: ใส่โดเมน Netlify ใน Site URL และ Redirect URLs

## 2. Realm (แยก service)
ตั้ง env ตาม `RAILWAY_DEPLOY_TH.md` โดย **ต้องตั้ง** `ALLOWED_ORIGIN=https://<โดเมน netlify ของคุณ>`
(ตั้งแต่รอบแก้ไข 2026-10-27 realm จะไม่ยอมเปิดถ้าไม่ได้ตั้งค่านี้ นอกจากโหมดทดสอบ `REALM_MEMORY=1`)

## 3. Netlify
1. Add new site → Import จาก Git → Base directory = `project` (โฟลเดอร์ที่มี `netlify.toml`)
2. Build command และ publish อ่านจาก `netlify.toml` อยู่แล้ว (`npm run build`, `.next`, Node 22)
3. Site settings → Environment variables:

| ตัวแปร | ค่า | หมายเหตุ |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL โปรเจกต์ | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key | |
| `SUPABASE_SECRET_KEY` | secret key | **ฝั่งเซิร์ฟเวอร์เท่านั้น** ห้ามตั้งชื่อขึ้นต้น `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_GAME_SERVER_URL` | `wss://<realm host>` | |
| `NEXT_PUBLIC_CLOSED_BETA` | `true` | |
| `PAYMENT_PROVIDER`, `PAYMENT_WEBHOOK_SECRET` | เว้นว่างจนกว่าจะมีบัญชี merchant | ระหว่างนี้คำสั่งซื้อค้าง "รอชำระ" ไม่มีของแจกฟรี |

4. ตัวแปร `NEXT_PUBLIC_*` ถูกฝังตอน build → แก้แล้วต้อง **Trigger deploy ใหม่**
5. Netlify ตรวจเจอ Next.js และใช้ runtime ของ Next ให้เอง ถ้า build แจ้งว่าหา `@netlify/plugin-nextjs` ไม่เจอ ให้ติดตั้งจากหน้า Plugins ของ Netlify หรือเพิ่มใน devDependencies แล้ว `npm install` เพื่ออัปเดต lockfile

## 4. หลัง deploy
- สร้างแอดมิน: ในเครื่อง `npm run admin:create` (ใช้ env เดียวกับ production)
- ตรวจ `https://<site>/api/health` และ `https://<site>/api/status`
- ลองสมัครด้วยโค้ดเชิญ → สร้างตัวละคร → เข้า `/play` แล้วดูว่า realm ต่อติด
