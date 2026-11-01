// Redeem a coupon (codes are made only in the back office). The reward goes to the realm mailbox; open it in game.
import { userDb } from '@/lib/server/supa';
const MSG: Record<string, string> = { OK: 'ใช้คูปองสำเร็จ — ของรางวัลส่งเข้าจดหมายในเกมแล้ว', LOGIN: 'กรุณาเข้าสู่ระบบก่อน', RATE: 'ลองบ่อยเกินไป กรุณารอ 1 นาที',
  INVALID: 'ไม่พบคูปองนี้ หรือถูกปิดแล้ว', EXPIRED: 'คูปองหมดอายุแล้ว', USED_UP: 'คูปองนี้ถูกใช้ครบจำนวนแล้ว', ALREADY: 'บัญชีนี้ใช้คูปองนี้ไปแล้ว' };
export async function POST(req: Request) {
  const db = userDb(req); if (!db) return Response.json({ error: MSG.LOGIN }, { status: 401 });
  const body = await req.json().catch(() => null) as { code?: unknown } | null, code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (!/^[A-Za-z0-9-]{4,20}$/.test(code)) return Response.json({ error: 'รูปแบบคูปองไม่ถูกต้อง' }, { status: 400 });
  const { data, error } = await db.rpc('redeem_coupon', { p_code: code });
  if (error) return Response.json({ error: 'ใช้คูปองไม่สำเร็จ ลองใหม่อีกครั้ง' }, { status: 500 });
  const r = String(data); return Response.json(r === 'OK' ? { ok: true, message: MSG.OK } : { error: MSG[r] ?? 'ใช้คูปองไม่ได้' }, { status: r === 'OK' ? 200 : 400 });
}
