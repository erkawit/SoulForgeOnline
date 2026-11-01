# SoulForge Online — รอบ 7: เว็บไซต์ใช้ชุดภาพ free-texture

## ที่มาของภาพ
- ชีต `reference/compact-cast-v2/sprit-model/uxui/website/free-texture/website1` และ `website2`
- `blender/sprites/cut_webkit.py <โฟลเดอร์ free-texture> public/art/web` ตัดเป็น 58 ไฟล์ webp และเขียน `webkit.json`
  - ปุ่ม "เข้าเกมส์" 4 สถานะ: play, play-hover, play-down, play-off
  - แผ่นป้าย (plate-*), ชิป (chip-*), แท็บ (tab-*), ช่องค้นหา, ช่องกรอก, เมนู, แถวเมนูที่เลือก
  - ไอคอน 12 อัน, ลูกแก้ว (green/amber/red), ระฆัง, แถบความคืบหน้า, กล่องข้อความ
  - กรอบ 9-slice: `frame` (128², slice 44) และ `frame-wide` (160², slice 66) สร้างใหม่จากมุม + ขอบเรียบ ส่วนอัญมณียอดกรอบแยกเป็น `crest` / `crest-b`
  - ตราสัญลักษณ์ `emblem`, ป้ายหัวเรื่อง `title-plate`, ผิวหนังเข้ม `tex-dark`, เส้นคั่น `divider` / `divider-thin`, ลวดลาย `ornament`
  - กรอบความหายาก `rf-common/uncommon/rare/epic/legend/gold` และกล่องแจ้งเตือน `alert-info/warn/danger`

## ใช้ที่ไหนในเว็บ (`src/game/wiki/site.ts` → `kitCss(art)`)
- หัวเว็บ: ผิวหนังเข้ม มีเส้นอัญมณี `divider-thin` ด้านล่าง ตราสัญลักษณ์ข้างชื่อเกม
- เมนูบน: ไอคอนต่อลิงก์ วางบนชิป — ปกติสีเข้ม, ชี้แล้วสีทอง, หน้าปัจจุบันสีแดง
- ปุ่มเข้าเกม: ใช้ภาพวาดทั้งปุ่ม เปลี่ยนภาพตอนชี้และตอนกด (ข้อความซ่อนไว้ มี `aria-label`)
- หัวข้อแต่ละส่วนมีเส้นคั่น การ์ดข่าว/อาชีพ/บอสใช้กรอบ 9-slice บนผิวหนังเข้มทับไล่สีให้มืดลง พร้อมอัญมณียอดกรอบ
- มอนสเตอร์ธรรมดาใช้กรอบ common, elite ใช้ gold, บอสใช้ legend
- เลขขั้นตอนอยู่บนลูกแก้วอำพัน, หมายเหตุเรด ใช้กล่อง alert-danger
- Wiki: สารบัญเป็นรายการในกรอบ ส่วนที่กำลังอ่านไฮไลต์ด้วย `menu-row-on`, หัวตารางเป็นผิวหนัง
- CTA ท้ายหน้าอยู่ในกรอบกว้าง หัวเรื่องบนป้าย `title-plate`, ส่วนท้ายมีเส้นคั่น, scrollbar ปรับสี
- มีกฎสำหรับมือถือแยก (ตรวจที่ 1440 และ 390 px)

## ข้อจำกัด
- ตรวจผ่านพรีวิว (หน้าแรก + wiki) เท่านั้น ยังไม่ได้ build Next จริง — path ภาพคือ `/art/web/*` ตรงกับ `public/art/web`
