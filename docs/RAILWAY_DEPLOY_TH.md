# SoulForge Online — ขึ้น Railway

โปรเจกต์นี้แยกเป็น **2 service** ใน Railway project เดียวกัน (ใช้ repo เดียวกัน)

| Service | Root Directory | Build | Health check | ทำหน้าที่ |
|---|---|---|---|---|
| `web` | `/` | `Dockerfile` (Next.js standalone) | `/api/health` | เว็บไซต์ (`/`), Wiki, ตัวเกม (`/play`), API สมัครสมาชิก/Vault |
| `realm` | `apps/game-server` | `apps/game-server/Dockerfile` | `/health` | WebSocket server แบบ authoritative (บอส, ปาร์ตี้, ตลาด, raid dashboard) |

ทั้งสองมี `railway.json` ของตัวเองแล้ว Railway จะอ่านให้อัตโนมัติเมื่อกำหนด Root Directory ถูกต้อง
ฐานข้อมูลยังเป็น **Supabase** (ไม่ได้ย้ายมา Railway)

## 1. เตรียม Supabase

1. รัน migration ตามลำดับใน SQL editor (หรือ `supabase db push`):
   `0001_initial` → `0002_multiplayer` → `0003_marketplace` → `0004_catalog` → `0005_closed_beta` → `0006_play` → `0007_sprites_admin` → **`0008_craft_raid`** (ใหม่ใน Round 2)
2. Authentication → URL Configuration: ใส่โดเมนของ `web` ใน **Site URL** และ **Redirect URLs**
3. เก็บค่า: Project URL, Publishable key, Secret key (service role — ห้ามใส่ใน `NEXT_PUBLIC_*`)

## 2. สร้าง service `realm` ก่อน

1. New Service → GitHub repo → Settings → **Root Directory = `apps/game-server`**
2. Variables:

| ตัวแปร | ค่า |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `SUPABASE_SECRET_KEY` | Secret key |
| `ALLOWED_ORIGIN` | โดเมนของ web เช่น `https://soulforge.example.com,https://web-production-xxxx.up.railway.app` (คั่นด้วยจุลภาค)  **ต้องตั้ง** — ตั้งแต่รอบ 13 realm ไม่ยอมเปิดถ้าว่าง |
| `MAX_PLAYERS` | `200` (ค่าเริ่มต้น) |
| `CLOSED_BETA` | `true` ถ้าต้องการให้เข้าได้เฉพาะบัญชีที่ใช้ invite code แล้ว |

3. Settings → Networking → **Generate Domain** (หรือผูก custom domain เช่น `realm.example.com`)
   WebSocket ใช้พอร์ตเดียวกับ HTTP (`PORT` ที่ Railway กำหนด) — ไม่ต้องตั้งเอง
4. ตรวจ: เปิด `https://<realm-domain>/health` ต้องได้ `{"ok":true,"room":"hollow-reach-01",...}`

> **ต้องมี 1 replica เท่านั้น** (ตั้งไว้แล้วใน `railway.json`) เพราะสถานะโลก/บอสอยู่ในหน่วยความจำของ process เดียว
> เมื่อ deploy ใหม่ server จะปิด socket ด้วยรหัส 1012 และ client จะเชื่อมต่อใหม่เอง (ปาร์ตี้มี grace 120 วินาที)

## 3. สร้าง service `web`

1. New Service → repo เดิม → **Root Directory = `/`**
2. Variables (ต้องตั้ง **ก่อน** deploy ครั้งแรก เพราะ `NEXT_PUBLIC_*` ถูกฝังตอน build — Railway ส่งเข้าเป็น build args ให้อัตโนมัติ):

| ตัวแปร | ค่า |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `NEXT_PUBLIC_GAME_SERVER_URL` | `wss://<realm-domain>` (ต้องเป็น **wss://** ไม่ใช่ https://) |
| `NEXT_PUBLIC_CLOSED_BETA` | `true` / `false` |
| `SUPABASE_SECRET_KEY` | Secret key (ใช้ฝั่ง server เท่านั้น — `/api/auth/register`, Vault) |

3. Generate Domain / custom domain เช่น `soulforge.example.com`
4. ตรวจ: `https://<web-domain>/api/health` → `{"ok":true,"service":"soulforge-web",...}`
   `/` = หน้าเว็บไซต์ (ปุ่ม PLAY ตรงกลาง), `/wiki`, `/play` = ตัวเกม
5. กลับไปเพิ่มโดเมนนี้ใน `ALLOWED_ORIGIN` ของ `realm` ถ้ายังไม่ได้ใส่

ถ้าเปลี่ยน `NEXT_PUBLIC_*` ภายหลัง ต้อง **Redeploy** service `web` (ไม่ใช่แค่ restart)

## 4. หลัง deploy

- สร้างบัญชีแอดมิน (ครั้งเดียว จากเครื่องที่มี `.env.local` ชี้ไป Supabase ตัวจริง): `npm run admin:create -- admin "<รหัสผ่านใหม่>"`
- สร้าง invite code สำหรับ closed beta จากหน้า admin ในเกม
- ทดสอบ: เข้า `/play` สองเครื่อง → เห็นกันในเมือง, ชวนปาร์ตี้, ตีบอสแล้ว dashboard แสดง top 10

## 5. รันในเครื่อง (เหมือน production)

```bash
npm install && npm --prefix apps/game-server install
npm run realm:dev            # ws://localhost:3001  (health: http://localhost:3001/health)
npm run dev                  # http://localhost:3000
# ทดสอบ image:
docker build -t sf-web --build-arg NEXT_PUBLIC_GAME_SERVER_URL=ws://localhost:3001 .
docker build -t sf-realm apps/game-server
```

## ไฟล์ที่เกี่ยวข้อง

- `Dockerfile`, `railway.json`, `.dockerignore` (web) — `next.config.ts` ใช้ `output: 'standalone'`
- `apps/game-server/{Dockerfile,railway.json,package.json,tsconfig.json,.dockerignore}` (realm)
- `src/app/api/health/route.ts`, health + graceful shutdown ใน `apps/game-server/src/index.ts`
- `.env.example` — รายชื่อตัวแปรทั้งหมด

## สิ่งที่ยังไม่ได้ทดสอบจริง

- `docker build` / `next build` บน Railway (ตรวจแล้ว: realm คอมไพล์ผ่าน, `/health` และ WebSocket upgrade ทำงานบนพอร์ตเดียวกัน)
- ค่าใช้จ่าย: realm ต้องเปิดตลอด (ไม่ควรเปิด App Sleeping)
