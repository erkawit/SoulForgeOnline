# SoulForge Closed Beta — คู่มือติดตั้งและทำต่อ

เอกสารนี้อธิบายทุกส่วนที่เพิ่มสำหรับช่วงทดสอบปิด 500 คน: โค้ดเชิญ, ล็อกอิน/สมัคร, หน้าแอดมิน, ค่าสมดุลเกมที่ปรับได้, ออปชันไอเทม, ตลาด, ตีบวก, NPC, บัฟ และ Skill Tree

เอกสารที่เกี่ยวข้อง
- `docs/GAME_BALANCE_TH.md` ตัวเลขสมดุลทั้งหมด (สร้างจากโค้ดจริง)
- `docs/SKILL_SYSTEM_TH.md` ระบบสกิล, Skill Forge และต้นไม้ทั้ง 5 อาชีพ
- `docs/NPC_DESIGN_TH.md` ข้อมูลและดีไซน์ NPC
- `docs/CHIBI_STYLE_TH.md` โมเดลตัวละคร/มอนสเตอร์/บอส/NPC แบบ chibi-dark

---

## 1. ติดตั้งครั้งแรก (ทำตามลำดับ)

1. **ฐานข้อมูล** — Supabase → SQL Editor → รัน `supabase/migrations/202610230005_closed_beta.sql` (หลังไฟล์ 0001–0004)
   - สร้างตาราง: `invite_codes`, `invite_redemptions`, `player_profiles`, `admin_users`, `admin_audit_log`, `game_config`, `economy_ledger`, `npc_shop_items`
   - สร้าง **โค้ดเชิญชุดแรก 500 โค้ด** ให้อัตโนมัติ (ถ้าตารางยังว่าง)
   - ทดสอบแล้วกับ PostgreSQL 16 จำลอง Supabase (สมัคร, โค้ดซ้ำ, ชื่อซ้ำ, ราคาต่ำกว่าขั้นต่ำ, ซื้อขาย, ภาษี, ตีบวก, สิทธิ์แอดมิน) — ยังไม่ได้รันกับโปรเจกต์ Supabase จริงของคุณ
2. **ตั้งตัวเองเป็นแอดมินคนแรก** — สมัครบัญชีด้วยโค้ดเชิญ 1 โค้ด แล้วรันใน SQL Editor:
   ```sql
   insert into public.admin_users(user_id, role)
   select id, 'owner' from auth.users where email = 'อีเมลของคุณ'
   on conflict(user_id) do update set role = 'owner';
   ```
3. **ตัวแปรแวดล้อม** (`.env.local` และ Vercel → Settings → Environment Variables)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...        # ฝั่งเซิร์ฟเวอร์เท่านั้น ใช้สร้างบัญชีตอนสมัคร
   NEXT_PUBLIC_CLOSED_BETA=true            # เปิดประตูล็อกอิน (false = โหมด guest เดิม)
   ```
4. **Supabase Auth** — Authentication → Providers → Email เปิดไว้ · ปิด “Allow new users to sign up” ได้เลย (การสมัครทำผ่าน API `/api/auth/register` ที่ตรวจโค้ดเชิญก่อนเสมอ)
5. **Game server (ออนไลน์)** — `apps/game-server/.env`
   ```env
   MAX_PLAYERS=500            # จำนวนคนต่อห้องพร้อมกัน
   CLOSED_BETA=true           # ต้องมี player_profiles และไม่ถูกแบน
   ENCHANTER_BUFF_RANGE=10
   ENCHANTER_BUFF_MINUTES=30
   ```
6. รัน `npm run typecheck` และ `npm test` แล้ว `npm run dev` → เปิด `/` (เกม) และ `/admin` (แอดมิน)

---

## 2. โค้ดเชิญ
- รูปแบบ `XXXX-XXXX-XXXX-XXXX` (16 ตัว ตัวอักษรผสมตัวเลข) สุ่มด้วย `pgcrypto.gen_random_bytes` จากตัวอักษร 32 ตัวที่ไม่มี I O 0 1 → 32¹⁶ ≈ 1.2×10²⁴ แบบ เดาไม่ได้
- เก็บในตารางแยก `invite_codes` (มีชุด, หมายเหตุ, ใช้ได้กี่ครั้ง, วันหมดอายุ, ยกเลิก) และประวัติการใช้ใน `invite_redemptions`
- ผู้เล่นเห็นโค้ดไม่ได้ (RLS) · แอดมินดู/สร้าง/ยกเลิก/คัดลอก/Export CSV ได้ที่ `/admin → โค้ดเชิญ`
- การใช้โค้ดเป็นธุรกรรมเดียวใน SQL `claim_invite` (ล็อกแถว → ตรวจ → ตัดสิทธิ์ → สร้างโปรไฟล์ + กระเป๋าเงิน) และตรวจเพดานผู้ทดสอบ `beta.maxPlayers` (ค่าเริ่ม 500)
- API สมัครจำกัด 8 ครั้ง / 10 นาที / IP (ต่ออินสแตนซ์) — ถ้ามีคนพยายามเดาโค้ดมาก ให้เปิด Vercel Firewall rate limit เพิ่ม

## 3. ล็อกอิน / สมัคร
- `src/components/auth/AuthGate.tsx` ครอบเกม เมื่อ `NEXT_PUBLIC_CLOSED_BETA=true`
  - แท็บ “เข้าสู่ระบบ” (อีเมล + รหัสผ่าน)
  - แท็บ “สมัครด้วยโค้ดเชิญ”: โค้ด (จัดรูปแบบให้อัตโนมัติขณะพิมพ์), อีเมล, รหัสผ่าน, ชื่อตัวละคร, เลือกอาชีพ (แสดงค่าพื้นฐาน 6 สเตตัส)
  - บัญชีเก่าที่ยังไม่มีโปรไฟล์ → หน้ากรอกโค้ด (`/api/auth/redeem`)
  - บัญชีถูกแบน → หน้าแจ้งระงับ
- อาชีพถูกล็อกตามโปรไฟล์ (เปลี่ยนอาชีพในสมุดบันทึกไม่ได้ระหว่าง beta)

## 4. หน้าแอดมิน `/admin`
| แท็บ | ทำอะไรได้ |
| --- | --- |
| ภาพรวม | ผู้ทดสอบ, โค้ดคงเหลือ, SoulGod หมุนเวียน, เงินที่ถูกเบิร์น 24 ชม./7 วัน แยกช่องทาง, ตลาด |
| โค้ดเชิญ | สร้าง N โค้ด (ชุด/วันหมดอายุ), ค้นหา, กรอง, ยกเลิก, คัดลอก, Export CSV |
| ผู้เล่น | รายชื่อ, อาชีพ, โค้ดที่ใช้, ระงับ/ปลดระงับ |
| ค่าพื้นฐานอาชีพ | STR INT DEX AGI WIS VIT ของทุกอาชีพ, การเติบโตต่อเลเวล, ตัวคูณดาเมจ/รักษารายอาชีพ, มูลค่าต่อแต้ม + ตารางตัวอย่างตามเลเวล |
| ดาเมจ | ดาเมจมอนสเตอร์ / Elite / บอส, HP บอส, PvP, คริพื้นฐาน + ตาราง |
| อัตราดรอป | โอกาส/จำนวนสุ่ม/น้ำหนักทุกระดับ แยก มอนทั่วไป · Elite · บอส · ฟาร์ม, เลเวลขั้นต่ำ, โบนัสตามเลเวล, ความยากต่อระดับ, อัตราดรอปรวม (อีเวนต์) + ตารางโอกาสจริงต่อการฆ่า |
| ออปชันไอเทม | จำนวนออปชัน, ช่วงค่า, ค่าพิเศษ God/Pre-arch/Arch |
| ตีบวก | โอกาสทุกขั้น, ค่าใช้จ่าย, ระดับปลอดภัย, คัมภีร์ป้องกัน |
| ตลาด & เศรษฐกิจ | ราคาขั้นต่ำทุกระดับ, ค่าลงขาย, ภาษี, จำกัดรายการ, คูลดาวน์, เงินเริ่มต้น, ค่าเดินทาง, ค่ารีเซ็ตสกิล, จำนวนผู้ทดสอบสูงสุด |
| บัฟ | บัฟมือใหม่ (เปิด/ปิด, ช่วงเลเวล, เพิ่มช่วง, ค่าแต่ละระดับ, ระยะเวลา), ระยะ/เวลาบัฟ Enchanter |
| Skill Forge | สร้าง/แก้สกิล, ต่อเอฟเฟกต์, วางในต้นไม้, ทดลองดาเมจ, เผยแพร่ |

การบันทึกใช้ RPC `admin_set_config` (ตรวจสิทธิ์แอดมิน + บันทึก audit log) ค่าถูกตรวจด้วย `validateConfig` ก่อนบันทึก

## 5. ไฟล์ที่เพิ่ม/แก้
| ไฟล์ | หน้าที่ |
| --- | --- |
| `src/game/balance/config.ts` | ค่าสมดุลทั้งหมด + merge/validate |
| `src/game/balance/stats.ts` | สูตรสเตตัส ดาเมจ มอนสเตอร์ |
| `src/game/balance/options.ts` | สุ่มออปชันตามระดับ |
| `src/game/balance/drops.ts` | ตารางดรอป |
| `src/game/balance/enhance.ts` | ตีบวก |
| `src/game/balance/market.ts` | ราคาขั้นต่ำ ค่าธรรมเนียม ภาษี |
| `src/game/balance/buffs.ts` | บัฟมือใหม่ + จารึก Enchanter |
| `src/game/balance/invite.ts` | รูปแบบ/สุ่มโค้ดเชิญ |
| `src/game/skills/engine.ts` `defaults.ts` `describe.ts` | ระบบสกิล, ต้นไม้เริ่มต้น, คำอธิบาย |
| `src/game/npcs.ts` | ข้อมูล NPC ร้านค้า ชุดเริ่มต้น คู่มือ |
| `src/store/useConfigStore.ts` | โหลดค่าที่แอดมินบันทึกมาทับค่าเริ่มต้น |
| `src/store/useGameStore.ts` | เขียนใหม่: 6 สเตตัส, สกิลจากต้นไม้, บัฟ, โล่, DoT, ดีบัฟ, ดรอปตามตาราง, ร้าน, ตีบวก, ชุดเริ่มต้น, บัฟมือใหม่, ค่าเดินทาง |
| `src/components/auth/AuthGate.tsx` | ประตูล็อกอิน/สมัคร |
| `src/app/api/auth/register` `redeem` | API สมัคร/ใช้โค้ด |
| `src/app/admin/page.tsx`, `src/components/admin/*` | หน้าแอดมิน + Skill Forge |
| `src/components/NpcLayer.tsx` `NpcDialog.tsx` | NPC 3D ในเมือง + หน้าต่างบริการ |
| `src/components/SkillTreePanel.tsx` `BuffStrip.tsx` | ต้นไม้สกิล (K) + แถบบัฟ |
| `src/styles/soulforge-beta.css` | สไตล์หน้าใหม่ทั้งหมด |
| `apps/game-server/src/*` | จำกัด 500 คน, ต้องมีโปรไฟล์ beta, บัฟ Enchanter ข้ามผู้เล่น, ส่งข้อมูลเฉพาะผู้เล่นใกล้ตัว |
| `public/models/npcs/*.glb` | NPC 9 ตัว |
| `tests/balance.test.ts` `tests/closed-beta.test.ts` | ทดสอบสมดุล, โค้ดเชิญ, สกิล, ร้าน, ตีบวก, ดรอป, เซฟ/โหลด |

## 6. ข้อจำกัดที่ต้องรู้ (สำคัญ)
- **การต่อสู้ในโลก PvE ยังคำนวณฝั่งเบราว์เซอร์** (เหมือนต้นแบบเดิม) ค่าที่แอดมินตั้งจึงมีผลทันทีกับผู้เล่นที่โหลดเกมใหม่ แต่ผู้เล่นที่แก้โค้ดในเบราว์เซอร์ยังโกงได้ ไอเทม/เงินในเซฟ guest จึง **ไม่ได้** ไหลเข้าตลาดออนไลน์
- เงินและไอเทมที่ **ปลอดภัย** คือฝั่งเซิร์ฟเวอร์: `player_wallets`, `inventory_items`, ตลาด, ตีบวกออนไลน์ (`enhance_item`), ร้าน NPC ออนไลน์ (`npc_shop_buy`) ทั้งหมดอยู่ใน SQL ที่ตรวจสิทธิ์
- ตีบวกออนไลน์ตรวจว่าผู้เรียกระบุ NPC Merchant แต่ยังตรวจตำแหน่งจริงไม่ได้ (ต้องให้ game-server เป็นคนเรียกพร้อมตำแหน่งผู้เล่นในอนาคต)
- เซฟในเบราว์เซอร์ใช้คีย์เดียวต่อเครื่อง ถ้าหลายบัญชีใช้เครื่องเดียวกันให้ใช้ Cloud Save ต่อบัญชี
- ขั้นต่อไปที่แนะนำ: ย้ายการฆ่ามอนสเตอร์ + ดรอปไปที่ game-server ให้เขียน `inventory_items` (พร้อม `options`, `class_lock`) โดยตรง แล้วเลิกใช้ snapshot เป็นแหล่งข้อมูลเศรษฐกิจ

## 7. รองรับ 500 คน
- Supabase: ผู้ใช้ 500 คนอยู่ในโควตา Auth ทุกแพ็กเกจ ตารางใหม่มี index ที่จำเป็นแล้ว
- Game server: ปฏิเสธการเชื่อมต่อเมื่อครบ `MAX_PLAYERS` และส่ง snapshot เฉพาะผู้เล่นในรัศมี 32 ม. (ไม่ใช่ทั้ง 500 คน) — 1 process รองรับได้ถ้า CPU เพียงพอ ควรทดสอบโหลดจริงก่อนเปิด
- หน้าเกมโหลดโมเดล GLB รวม ~5 MB (ตัวละคร 5 + มอนสเตอร์ 6 + NPC 9) โหลดครั้งเดียวแล้วแคช
