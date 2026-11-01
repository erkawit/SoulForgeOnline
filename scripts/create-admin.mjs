// Creates (or resets) the SoulForge system administrator account.
//   node scripts/create-admin.mjs [username] [password]
// Defaults: username "admin" (signs in as admin@soulforge.local). The password comes from the 2nd argument or
// ADMIN_PASSWORD; it is never stored in the repo. Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY (.env.local).
// After it succeeds: open the game, sign in with the username + password, then go to /admin and change the password.
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const f of ['.env.local', '.env']) if (existsSync(f)) for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const user = (process.argv[2] ?? 'admin').trim().toLowerCase();
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;
const email = user.includes('@') ? user : `${user}@soulforge.local`;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) { console.error('ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SECRET_KEY ใน .env.local ก่อน'); process.exit(1); }
if (!password || password.length < 12) { console.error('ใส่รหัสผ่านอย่างน้อย 12 ตัว: node scripts/create-admin.mjs admin "รหัสผ่าน"'); process.exit(1); }

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
let id;
const made = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username: user, role: 'admin' } });
if (made.data?.user) id = made.data.user.id;
else {
  // already exists → find it and reset the password
  for (let page = 1; !id && page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 }); if (error) throw error;
    id = data.users.find(u => u.email?.toLowerCase() === email)?.id; if (data.users.length < 200) break;
  }
  if (!id) { console.error('สร้างผู้ใช้ไม่สำเร็จ:', made.error?.message); process.exit(1); }
  const { error } = await db.auth.admin.updateUserById(id, { password, email_confirm: true }); if (error) throw error;
}
const { error } = await db.rpc('bootstrap_admin', { p_user: id, p_role: 'owner' });
if (error) { console.error('เพิ่มสิทธิ์แอดมินไม่สำเร็จ (รัน migration 0007 แล้วหรือยัง?):', error.message); process.exit(1); }
console.log(`✓ แอดมินพร้อมใช้งาน\n  ชื่อผู้ใช้: ${user}\n  อีเมลล็อกอิน: ${email}\n  สิทธิ์: owner\n  เข้าเกม → ล็อกอิน → เปิด /admin`);
