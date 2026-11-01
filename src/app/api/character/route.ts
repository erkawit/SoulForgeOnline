import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

/** Round 9: the realm server owns characters (supabase/migrations/202610250009_characters.sql). A save written by the
 *  browser can no longer become a character: offline play stays on this device, online progress is saved by the realm. */
export async function POST() {
  return NextResponse.json({ error: 'การบันทึกออนไลน์ย้ายไปที่เซิร์ฟเวอร์เกมแล้ว — เข้าเล่นแบบออนไลน์ ความคืบหน้าจะถูกบันทึกให้อัตโนมัติ' }, { status: 410 });
}
