// Closed-beta sign-up: invite code (XXXX-XXXX-XXXX-XXXX) + e-mail + password → the account exists immediately.
// The character (name + class) is created afterwards on the character-creation screen (RPC create_character).
// The invite is consumed atomically in SQL (`claim_invite_account`); if anything fails the new auth user is deleted again.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isInviteFormat, normalizeInvite } from '@/game/balance/invite';

// Best-effort per-instance limiter: 8 attempts / 10 minutes / IP. Put Vercel Firewall or Cloudflare in front for real abuse protection.
const attempts = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), list = (attempts.get(ip) ?? []).filter(t => now - t < 600_000); list.push(now); attempts.set(ip, list);
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.every(t => now - t > 600_000)) attempts.delete(k);
  return list.length > 8;
}
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const MESSAGES: Record<string, string> = {
  INVITE_INVALID: 'โค้ดเชิญไม่ถูกต้อง ถูกใช้แล้ว หมดอายุ หรือถูกยกเลิก',
  BETA_FULL: 'ช่วงทดสอบเต็มแล้ว (ครบจำนวนผู้ทดสอบ)',
  ALREADY_REGISTERED: 'บัญชีนี้ใช้โค้ดเชิญไปแล้ว',
};

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return fail('ระบบสมัครยังไม่ได้ตั้งค่า (SUPABASE_SECRET_KEY)', 503);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) return fail('ลองหลายครั้งเกินไป กรุณารอ 10 นาที', 429);
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const code = normalizeInvite(typeof body?.inviteCode === 'string' ? body.inviteCode : '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return fail('อีเมลไม่ถูกต้อง');
  if (password.length < 8 || password.length > 72) return fail('รหัสผ่านต้องยาว 8–72 ตัวอักษร');
  if (!isInviteFormat(code)) return fail('รูปแบบโค้ดเชิญต้องเป็น XXXX-XXXX-XXXX-XXXX');

  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  // round 13: check the invite (read-only peek_invite) BEFORE touching auth, so without a live invite this endpoint
  // never reveals whether an e-mail already has an account and never creates/deletes auth users
  const peek = await admin.rpc('peek_invite', { p_code: code });
  if (peek.error) return fail('ตรวจโค้ดเชิญไม่สำเร็จ ลองใหม่อีกครั้ง', 500);
  if (peek.data !== 'OK') return fail(peek.data === 'BETA_FULL' ? MESSAGES.BETA_FULL : MESSAGES.INVITE_INVALID, peek.data === 'BETA_FULL' ? 403 : 400);
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) return fail(/already|registered|exists/i.test(created.error?.message ?? '') ? 'อีเมลนี้สมัครแล้ว ลองเข้าสู่ระบบ' : 'สร้างบัญชีไม่สำเร็จ', 409);
  const { error } = await admin.rpc('claim_invite_account', { p_code: code, p_user: created.data.user.id });
  if (error) {
    await admin.auth.admin.deleteUser(created.data.user.id);
    const key = Object.keys(MESSAGES).find(k => error.message.includes(k));
    return fail(key ? MESSAGES[key] : 'ใช้โค้ดเชิญไม่สำเร็จ', key === 'BETA_FULL' ? 403 : 400);
  }
  return NextResponse.json({ ok: true });
}
