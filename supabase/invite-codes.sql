-- SoulForge: สร้างโค้ดเชิญชุดแรก (รูปแบบ XXXX-XXXX-XXXX-XXXX · 1 โค้ดใช้สมัครได้ 1 บัญชี)
-- รันหลังติดตั้งฐานข้อมูลแล้ว: SQL Editor → วางไฟล์นี้ → Run → ผลลัพธ์คือรายการโค้ดที่สร้าง (คัดลอกไปแจกผู้ทดสอบ)
-- เปลี่ยนเลข 20 เป็นจำนวนที่ต้องการ · ภายหลังสร้างเพิ่มได้จากหน้า /admin (บัญชีแอดมิน)
select code from public.generate_invites_internal(20, 'closed-beta-1', null, 'ชุดแรก', null) as code;
-- ดูโค้ดทั้งหมดและจำนวนที่ใช้ไปแล้ว
select code, used_count, max_uses, created_at from public.invite_codes order by created_at desc;
