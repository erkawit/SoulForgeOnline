# Supabase SQL นำเข้าครั้งเดียว

1. Supabase Dashboard > SQL Editor > New query
2. เปิดไฟล์ `supabase-import-all.sql` แล้วคัดลอกทั้งหมดเพื่อ Run **กับโปรเจกต์ใหม่**
3. หรือรัน `migrations/202610190001_initial.sql` ก่อน แล้วตามด้วย `migrations/202610190002_multiplayer.sql` (ห้ามรันรวมซ้ำหลัง migrations)
4. เปิด Authentication > Providers > Email แล้วสร้างบัญชีเพื่อใช้โหมด Online
5. ตั้ง server environment `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (เก็บ secret ฝั่ง Game Server เท่านั้น)

**ข้อควรทราบ**: SQL ไม่ได้แจก Farm Cards ให้ทุกบัญชีโดยอัตโนมัติ หากต้องทดสอบ Vault ให้เพิ่มการ์ดด้วย SQL Editor เช่น

```sql
insert into public.farm_cards(player_id,card_type,quantity)
values ('REPLACE_WITH_AUTH_USER_UUID','bronze',3)
on conflict(player_id,card_type) do update set quantity=public.farm_cards.quantity+excluded.quantity;
```

ฟังก์ชันแจกและรับของใช้ `service_role` เท่านั้น ต้องเรียกผ่าน Backend ที่ตรวจสอบ JWT จริงและไม่รับ player_id จาก browser อย่างอิสระ

**หมายเหตุความเข้ากันได้:** snapshot save จาก Phase 1 เป็น guest/demo persistence ไม่ใช่ ledger เศรษฐกิจที่ปลอดภัย; server-controlled tables แยกจาก snapshots โดยตั้งใจ
