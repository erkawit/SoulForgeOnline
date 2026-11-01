# สร้าง ../database/soulforge-supabase-full-install.sql ใหม่จาก supabase/migrations ทั้งหมด (0001–0012)
# รันในโฟลเดอร์ project:  python scripts/build-full-install.py
# ทุก "create policy" / "create trigger" จะได้ "drop ... if exists" นำหน้า เพื่อให้รันซ้ำบนฐานเดิมได้
import glob, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # = project/
OUT = os.path.join(ROOT, '..', 'database', 'soulforge-supabase-full-install.sql')
SKIP = ()  # ชื่อไฟล์ที่ไม่ต้องการรวม (Round 13: รวม 0012_berserker แล้ว เพราะโค้ดเป็น Berserker อาชีพเดียว)

migrations = [f for f in sorted(glob.glob(os.path.join(ROOT, 'supabase', 'migrations', '*.sql')))
              if not any(s in f for s in SKIP)]
head = '''-- SOULFORGE — ติดตั้งฐานข้อมูลใหม่ทั้งชุด (Supabase โปรเจกต์ใหม่) · สร้างจาก supabase/migrations 0001–0012
-- เปิด Supabase → SQL Editor → วางทั้งไฟล์ → Run · รันซ้ำบนฐานเดิมได้ (policy เดิมถูกแทนที่)
-- รวม 0012_berserker แล้ว: อาชีพเดียว Berserker (เลื่อนขั้น Reaver Lv60 เก็บในสถานะตัวละครของ realm)
-- เป็นโครงสร้าง + ข้อมูลตั้งต้นเท่านั้น ไม่ใช่ backup ข้อมูลผู้เล่น
-- สร้างใหม่ได้ด้วย: python scripts/build-full-install.py (อย่าแก้ไฟล์นี้ตรงๆ)
'''
pol = re.compile(r'(?im)^(\s*)create policy\s+("[^"]+"|\w+)\s+on\s+([\w.]+)')
trg = re.compile(r'(?im)^(\s*)create trigger\s+(\w+)\s+(?:before|after)[^;]*?\s+on\s+([\w.]+)')
out = [head]
for f in migrations:
    s = open(f, encoding='utf-8').read()
    s = pol.sub(lambda x: f'{x.group(1)}drop policy if exists {x.group(2)} on {x.group(3)};\n{x.group(0)}', s)
    s = trg.sub(lambda x: f'{x.group(1)}drop trigger if exists {x.group(2)} on {x.group(3)};\n{x.group(0)}', s)
    out.append(f'\n-- ============================================================ {os.path.basename(f)}\n' + s.rstrip() + '\n')
with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(''.join(out))
print('wrote', os.path.normpath(OUT), 'from', len(migrations), 'migrations')
