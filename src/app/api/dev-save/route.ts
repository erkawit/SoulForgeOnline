// dev only: saves a PNG data URL posted by /dev-mannequin into soulforge-transfer/output/tpose-ref
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'dev only' }, { status: 404 });
  const { name, data } = await req.json() as { name: string; data: string };
  if (!/^[\w.-]+\.png$/.test(name) || !data?.startsWith('data:image/png;base64,')) return NextResponse.json({ error: 'bad' }, { status: 400 });
  const dir = path.resolve(process.cwd(), '..', 'soulforge-transfer', 'output', 'tpose-ref'); await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(data.slice(22), 'base64'));
  return NextResponse.json({ ok: true });
}
