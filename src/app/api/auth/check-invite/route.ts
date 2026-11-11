// Step 1 of sign-up: the account form is shown only after the invite code passes this check.
// Read-only (SQL `peek_invite` never consumes the code); the code is consumed later, atomically, by /api/auth/register.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isInviteFormat, normalizeInvite } from '@/game/balance/invite';
import { secretKey } from '@/lib/server/envKey';

// 12 checks / 10 minutes / IP so codes cannot be brute-forced through this endpoint (best effort per instance)
const attempts = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), list = (attempts.get(ip) ?? []).filter(t => now - t < 600_000); list.push(now); attempts.set(ip, list);
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.every(t => now - t > 600_000)) attempts.delete(k);
  return list.length > 12;
}
const MESSAGES: Record<string, string> = {
  INVITE_INVALID: 'ไม่พบโค้ดเชิญนี้ หรือถูกยกเลิกแล้ว', INVITE_EXPIRED: 'โค้ดเชิญนี้หมดอายุแล้ว', INVITE_USED: 'โค้ดเชิญนี้ถูกใช้ครบแล้ว',
  BETA_FULL: 'ช่วงทดสอบเต็มแล้ว (ครบจำนวนผู้ทดสอบ)',
};
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, secret = secretKey();
  if (!url || !secret) return NextResponse.json({ error: 'ระบบสมัครยังไม่ได้ตั้งค่า (SUPABASE_SECRET_KEY)' }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) return NextResponse.json({ error: 'ตรวจโค้ดหลายครั้งเกินไป กรุณารอ 10 นาที' }, { status: 429 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const code = normalizeInvite(typeof body?.inviteCode === 'string' ? body.inviteCode : '');
  if (!isInviteFormat(code)) return NextResponse.json({ error: 'รูปแบบโค้ดเชิญต้องเป็น XXXX-XXXX-XXXX-XXXX' }, { status: 400 });
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.rpc('peek_invite', { p_code: code });
  if (error) return NextResponse.json({ error: 'ตรวจโค้ดไม่สำเร็จ ลองใหม่อีกครั้ง' }, { status: 500 });
  if (data !== 'OK') return NextResponse.json({ error: MESSAGES[String(data)] ?? 'โค้ดเชิญใช้ไม่ได้' }, { status: data === 'BETA_FULL' ? 403 : 400 });
  return NextResponse.json({ ok: true, code });
}
