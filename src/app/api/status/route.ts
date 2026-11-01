// Is login open (maintenance switch), the minimum client version, and the live patch notes — read by the title screen
// and the website's patch page. The client compares its GAME_VERSION with minClient (versionAtLeast) and asks for a reload.
import { anonDb } from '@/lib/server/supa';
import { GAME_VERSION } from '@/game/patches';
export const dynamic = 'force-dynamic';
export async function GET() {
  const db = anonDb(); if (!db) return Response.json({ loginOpen: true, message: '', minClient: GAME_VERSION, server: GAME_VERSION, patches: [] });
  const [{ data: st }, { data: patches }] = await Promise.all([db.rpc('game_status'), db.from('patches').select('version,title,notes,min_client,status,published_at').neq('status', 'draft').order('published_at', { ascending: false }).limit(20)]);
  const o = (st ?? {}) as { loginOpen?: boolean; message?: string; minClient?: string };
  return Response.json({ loginOpen: o.loginOpen !== false, message: o.message ?? '', minClient: o.minClient ?? '0.0.0', server: GAME_VERSION, patches: patches ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}
