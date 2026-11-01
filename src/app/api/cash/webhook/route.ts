// Payment provider → "this order is paid". Verified with an HMAC-SHA256 of the raw body (header x-sf-signature, hex)
// using PAYMENT_WEBHOOK_SECRET. Adapt the body parsing to the provider you sign up with; the grant itself is
// cash_mark_paid (amount must match, exactly once, the piece goes out by realm mail).
import { serviceDb } from '@/lib/server/supa';
export async function POST(req: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET, db = serviceDb(); if (!secret || !db) return Response.json({ error: 'not configured' }, { status: 503 });
  const raw = await req.text(), sig = (req.headers.get('x-sf-signature') ?? '').toLowerCase(), want = await hmacHex(secret, raw);
  if (!sameText(sig, want)) return Response.json({ error: 'bad signature' }, { status: 401 });
  const b = JSON.parse(raw) as { order?: string; ref?: string; amount?: number };
  if (!b.order || !b.ref || !Number.isInteger(b.amount)) return Response.json({ error: 'bad body' }, { status: 400 });
  const { data, error } = await db.rpc('cash_mark_paid', { p_order: b.order, p_ref: b.ref, p_amount: b.amount });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ result: data });
}

async function hmacHex(secret: string, body: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(body)))].map(b => b.toString(16).padStart(2, '0')).join('');
}
/** constant-time comparison */
function sameText(a: string, b: string) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
