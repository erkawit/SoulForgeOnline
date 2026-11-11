// An already-signed-in account without a beta profile (e.g. created before the closed beta) redeems an invite here.
// Only the code is needed: the character is created on the character-creation screen afterwards.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isInviteFormat, normalizeInvite } from '@/game/balance/invite';
import { secretKey } from '@/lib/server/envKey';

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, secret = secretKey();
  if (!url || !key || !secret) return NextResponse.json({ error: 'ระบบยังไม่ได้ตั้งค่า' }, { status: 503 });
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const { data, error } = await createClient(url, key, { auth: { persistSession: false } }).auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const code = normalizeInvite(String(body?.inviteCode ?? ''));
  if (!isInviteFormat(code)) return NextResponse.json({ error: 'รูปแบบโค้ดเชิญต้องเป็น XXXX-XXXX-XXXX-XXXX' }, { status: 400 });
  const r = await createClient(url, secret, { auth: { persistSession: false } }).rpc('claim_invite_account', { p_code: code, p_user: data.user.id });
  if (r.error) return NextResponse.json({ error: /BETA_FULL/.test(r.error.message) ? 'ช่วงทดสอบเต็มแล้ว' : /ALREADY_REGISTERED|duplicate/.test(r.error.message) ? 'บัญชีนี้ใช้โค้ดเชิญไปแล้ว' : 'โค้ดเชิญใช้ไม่ได้' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
