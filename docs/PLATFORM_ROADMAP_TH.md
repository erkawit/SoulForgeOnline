# SoulForge Online — เส้นทางสู่ เว็บ → มือถือ → PC

เป้าหมาย: เล่นบนเว็บได้ก่อน (Closed Beta) แล้วใช้โค้ดชุดเดียวกันทำตัวติดตั้งมือถือและ PC ไม่ต้องเขียนเกมใหม่

## สถานะตอนนี้ (เว็บ)

| ส่วน | สถานะ | ไฟล์หลัก |
|---|---|---|
| สมัคร 2 ขั้น: กรอกโค้ดเชิญก่อน → ผ่านแล้วจึงแสดงฟอร์มบัญชี | ✅ | `app/api/auth/check-invite` (SQL `peek_invite`, 0007), `app/api/auth/register` |
| บัญชีแอดมิน (ชื่อผู้ใช้ + รหัสผ่าน) | ✅ | `scripts/create-admin.mjs` (`npm run admin:create`), SQL `bootstrap_admin` |
| หน้าเข้าสู่ระบบแสดง 5 อาชีพแบบมีชีวิต | ✅ | `components/auth/HeroLineup.tsx` |
| หน้าสร้างตัวละคร 5 อาชีพ · เลือกชาย/หญิง | ✅ | `components/auth/CharacterCreate.tsx`, SQL `create_character(name, class, gender)` |
| ตัวละคร 2.5D isometric จากภาพ compact-cast-v2 (หายใจ วิ่ง ผ้า/ผมตามแรง ท่าโจมตีจากภาพวาด) | ✅ | `game/sprites/*`, `public/art/sprites/*.webp`, `docs/SPRITES_2_5D_TH.md` |
| วิ่งอย่างเดียว ความเร็วตามพื้น (3.0 ม./วิ ที่ 1×) | ✅ | `characterModels.ts` |
| คอมโบโจมตี 3 จังหวะ · หลอดร่าย · เกจง้างธนู · ยกโล่ | ✅ | `useGameStore.ts` (attack / cast / beginCharge / releaseCharge) |
| เอฟเฟกต์สกิล + ออร่าแบบขอบเรือง (ไม่บังตัวละคร) + วงร่าย | ✅ | `fx/skillFx.ts` (`spawnChannelFx`, `fresnelMat`, `casterAura`) |
| ตัวเลขดาเมจตามธีม (คริ/สกิล/ฮีล/โดนตี/หลบ) | ✅ | `fx/damageText.ts`, `components/DamageLayer.tsx` |
| ต้นไม้ หิน หญ้า ลมพัด หญ้าแหวกเมื่อเดินผ่าน + ชนได้จริง | ✅ | `world/nature.ts`, `world/layout.ts`, `world/registry.ts` |
| ปาร์ตี้ที่เซิร์ฟเวอร์ + จองที่ 120 วิ + เชื่อมต่อใหม่อัตโนมัติ | ✅ | `apps/game-server/src/party.ts`, `lib/multiplayer/socket.ts`, SQL `parties` |
| แผนที่โลก · ตั้งค่า · กรอบปาร์ตี้มีรูปอาชีพ · ปุ่ม Codex | ✅ | `components/PlayOverlay.tsx` |
| เว็บข้อมูลเกม (ธีมมืด) สร้างจากข้อมูลจริง | ✅ | `game/guide/site.ts`, `app/guide/route.ts` |
| ติดตั้งเป็นแอปจากเบราว์เซอร์ (PWA) | ✅ manifest/ไอคอน | `public/manifest.webmanifest`, `app/layout.tsx` |
| จอยสัมผัส + ปุ่มโจมตีกดค้าง | ✅ | `PlayOverlay.tsx` (`TouchControls`) |

## เฟส 1 — เว็บ (Closed Beta 500 คน)
1. รัน migration `0006_play.sql` ต่อจาก 0001–0005 (ทดสอบแล้วบน PostgreSQL 16)
2. ตั้ง `NEXT_PUBLIC_CLOSED_BETA=true` และคีย์ Supabase ตาม `CLOSED_BETA_SETUP_TH.md`
3. Deploy เว็บ (Vercel) + game server (Node 22, WebSocket) แยกกัน ตั้ง `PARTY_GRACE_SECONDS=120`
4. เปิดหน้า `/guide` ให้ผู้ทดสอบอ่านกติกา

## เฟส 2 — มือถือ (Android / iOS) ด้วย Capacitor
- ใช้ Next build แบบ static export ของหน้าเกม แล้วห่อด้วย Capacitor (`npx cap add android ios`)
- สิ่งที่พร้อมแล้ว: จอยสัมผัส, ปุ่มกดค้าง, `viewport-fit=cover` + safe-area, คุณภาพกราฟิกต่ำ/กลาง/สูง (หญ้า 2,600–12,000 กอ)
- ต้องทำเพิ่ม: ล็อกแนวนอน (`@capacitor/screen-orientation`), สั่น (`@capacitor/haptics`) ตอนคริ, ปิดหน้าจอดับ (`keep-awake`), ทดสอบ GPU มือถือระดับกลาง (เป้าหมาย 45–60 fps ที่ "กลาง")
- การล็อกอินใช้ Supabase เหมือนเว็บ (deep link กลับเข้าแอปสำหรับลืมรหัสผ่าน)

## เฟส 3 — PC (Windows / macOS) ด้วย Tauri
- Tauri 2 เปิดหน้าเกมใน WebView ของระบบ ขนาดตัวติดตั้งเล็ก (~10 MB + โมเดล)
- เพิ่ม: เต็มจอ/หน้าต่าง, ตั้งปุ่มเอง, ตัวอัปเดตอัตโนมัติ (Tauri updater), เก็บโมเดลไว้ในเครื่องเพื่อโหลดเร็ว
- คุณภาพ "สูง" เปิดเงา 2048 + หญ้า 12,000 กอ

## สิ่งที่ยังต้องทำก่อนเปิดกว้าง (นอกเหนือ Closed Beta)
- ย้ายคอมโบ/คูลดาวน์/ดาเมจทั้งหมดไปคำนวณที่ game server (ตอนนี้โหมดออฟไลน์คำนวณในเครื่อง ส่วนโหมดออนไลน์ server ตัดสินบอส)
- ตลาดในเกมเวอร์ชันใหม่ (ฟิลเตอร์ อาชีพ ระดับ ประวัติการเผา) มีครบในหน้าเล่นตัวอย่างแล้ว ต้องย้าย UI นี้เข้า `Marketplace.tsx` ที่เชื่อม RPC `market_list / market_buy / market_cancel`
- เสียงประกอบและเพลง
