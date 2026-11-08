-- SoulForge: ให้สิทธิ์แอดมิน (owner) กับบัญชีที่สร้างไว้แล้ว และเปิดให้บัญชีนี้เข้าเล่นได้โดยไม่ต้องใช้โค้ดเชิญ
-- ขั้นตอน: 1) Authentication → Users → Add user → Create new user: ใส่อีเมลกับรหัสผ่าน ติ๊ก Auto Confirm User
--          2) SQL Editor → วางไฟล์นี้ → Run (ไฟล์นี้ไม่มีรหัสผ่าน รหัสผ่านอยู่ใน Supabase Auth เท่านั้น)
select public.bootstrap_admin(u.id, 'owner') from auth.users u where lower(u.email) = 'playchofficial1987a@gmail.com';
insert into public.player_profiles (user_id) select u.id from auth.users u where lower(u.email) = 'playchofficial1987a@gmail.com'
  on conflict (user_id) do nothing;
-- ตรวจผล: ต้องได้ 1 แถว role = owner
select a.role, u.email from public.admin_users a join auth.users u on u.id = a.user_id where lower(u.email) = 'playchofficial1987a@gmail.com';
