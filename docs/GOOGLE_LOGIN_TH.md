# เข้าสู่ระบบด้วย Google (ทำไว้แล้ว · ปิดอยู่)

โค้ดมีปุ่ม "เข้าสู่ระบบด้วย Google" แล้ว แต่ **ซ่อนไว้** จนกว่าจะตั้ง `NEXT_PUBLIC_GOOGLE_LOGIN=true`
บัญชี Google ที่เข้ามาครั้งแรกยังต้อง **กรอกโค้ดเชิญ** ก่อนเล่น (หน้าใช้โค้ดเชิญขึ้นเองหลังล็อกอิน) — กติกา Closed Beta เหมือนเดิม

## เปิดใช้เมื่อพร้อม
1. **Google Cloud Console** → APIs & Services
   - OAuth consent screen: ประเภท External, ชื่อแอป SoulForge Online, อีเมลติดต่อ, โดเมน `soulforgeonline.netlify.app`
   - Credentials → Create credentials → OAuth client ID → Web application
     - Authorized JavaScript origins: `https://soulforgeonline.netlify.app`
     - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback` (คัดลอกจากหน้า Supabase ข้อ 2)
   - ได้ Client ID และ Client secret
2. **Supabase** → Authentication → Sign In / Providers → Google → เปิด → ใส่ Client ID + Client secret → Save
   (หน้านี้แสดง Callback URL ให้คัดลอกไปใส่ในข้อ 1)
3. **Supabase** → Authentication → URL Configuration → Redirect URLs เพิ่ม `https://soulforgeonline.netlify.app/play`
4. **Netlify** → Environment variables → `NEXT_PUBLIC_GOOGLE_LOGIN` = `true` → Trigger deploy
5. ทดสอบ: เปิด /play → เข้าสู่ระบบด้วย Google → เลือกบัญชี → กลับมาที่เกม → ขึ้นหน้ากรอกโค้ดเชิญ → กรอก → สร้างตัวละคร

ปิดอีกครั้ง: ตั้ง `NEXT_PUBLIC_GOOGLE_LOGIN=false` แล้ว deploy ใหม่ (บัญชี Google ที่สมัครไปแล้วยังอยู่)
