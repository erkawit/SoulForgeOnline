// Create a cash-shop order (status pending). The player then pays with the chosen method; ONLY the payment provider's
// webhook (/api/cash/webhook, service role) marks it paid and mails the piece to the wardrobe.
// Payment providers need a merchant account: set PAYMENT_PROVIDER (e.g. omise / 2c2p / gbprimepay) and its keys.
// Without one the order is created and the response says payments are not live yet — nothing is ever granted for free.
import { userDb } from '@/lib/server/supa';
const METHODS = ['promptpay', 'truemoney', 'razergold', 'card', 'partner'] as const;
export async function POST(req: Request) {
  const db = userDb(req); if (!db) return Response.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  const b = await req.json().catch(() => null) as { item?: unknown; method?: unknown; partner?: unknown } | null;
  const item = typeof b?.item === 'string' ? b.item : '', method = METHODS.find(m => m === b?.method), partner = typeof b?.partner === 'string' && b.partner ? b.partner : null;
  if (!/^[a-z0-9-]{3,48}$/.test(item) || !method) return Response.json({ error: 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง' }, { status: 400 });
  if (method === 'partner' && !partner) return Response.json({ error: 'เลือกร้านพาร์ทเนอร์ก่อน' }, { status: 400 });
  const { data, error } = await db.rpc('cash_create_order', { p_item: item, p_method: method, p_partner: partner });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const live = !!process.env.PAYMENT_PROVIDER;
  return Response.json({ ok: true, order: data, live, message: live ? 'สร้างคำสั่งซื้อแล้ว — ดำเนินการชำระเงินต่อ' : 'สร้างคำสั่งซื้อแล้ว แต่ระบบรับชำระเงินยังไม่เปิดใช้งาน (ยังไม่ได้เชื่อมผู้ให้บริการชำระเงิน)' });
}
