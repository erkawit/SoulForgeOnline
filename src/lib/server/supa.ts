// Server-side Supabase clients for the Next.js API routes (round 12).
//   anonDb()      — public reads (fashion catalog, live patches, game status)
//   userDb(req)   — acts AS the signed-in player (their JWT from "Authorization: Bearer …"), so RLS and is_admin() apply
//   serviceDb()   — the service role; only for the payment webhook. Never reachable from a browser request.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
export function anonDb(): SupabaseClient | null { const u = url(), k = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; return u && k ? createClient(u, k, opts) : null; }
export function userDb(req: Request): SupabaseClient | null {
  const u = url(), k = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!u || !k || !token) return null;
  return createClient(u, k, { ...opts, global: { headers: { Authorization: `Bearer ${token}` } } });
}
export function serviceDb(): SupabaseClient | null { const u = url(), k = process.env.SUPABASE_SECRET_KEY; return u && k ? createClient(u, k, opts) : null; }
