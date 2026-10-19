import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { Snapshot } from '@/lib/types';

export const runtime = 'nodejs';

async function authenticatedClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!url || !publishable) return { error: 'Supabase is not configured.', status: 503 } as const;
  if (!token) return { error: 'Authentication required.', status: 401 } as const;
  // Requests use the caller's JWT; all queries remain subject to PostgreSQL RLS.
  const supabase = createClient(url, publishable, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { error: 'Invalid session.', status: 401 } as const;
  return { supabase, user };
}

export async function GET(req: NextRequest) {
  const auth = await authenticatedClient(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase.from('player_snapshots')
    .select('snapshot').eq('user_id', auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ snapshot: data?.snapshot ?? null });
}

export async function POST(req: NextRequest) {
  const auth = await authenticatedClient(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const raw = await req.text();
  if (raw.length > 100_000) return NextResponse.json({ error: 'Save file too large.' }, { status: 413 });
  let snapshot: Snapshot;
  try { snapshot = JSON.parse(raw) as Snapshot; }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  if (snapshot.version !== 1 || !snapshot.player || !Array.isArray(snapshot.inventory) || snapshot.inventory.length !== 24 || !snapshot.equipment) {
    return NextResponse.json({ error: 'Invalid snapshot structure.' }, { status: 400 });
  }
  const { error } = await auth.supabase.from('player_snapshots')
    .upsert({ user_id: auth.user.id, snapshot, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
